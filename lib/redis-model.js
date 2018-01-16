var redis = require('redis'),
    base58 = require('base58'),
    crypto = require('crypto');

var RedisModel = module.exports = function (config, client) {
      if (config === null && client) {
        this.db = client;
      } else {
        var options = {
          host: config.host,
          port: config.port,
          db: config.db
        };

        this.db = redis.createClient(options);

        if (config.pass) {
          this.db.auth(config.pass);
        }
      }
    };

var getRandomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    };

// General prefix
RedisModel._prefix_ = 'nus:';

// Keys

// nus:counter
RedisModel.prototype.kCounter = function () {
  return RedisModel._prefix_ + 'counter';
};

// nus:url:<long_url> <short_url>
RedisModel.prototype.kUrl = function (url) {
  return RedisModel._prefix_ + 'url:' + this.md5(url);
};

// nus:hash:<id> url <long_url>
// nus:hash:<id> hash <short_url>
// nus:hash:<id> clicks <clicks>
RedisModel.prototype.kHash = function (hash) {
  return RedisModel._prefix_ + 'hash:' + hash;
};

// Helpers
RedisModel.prototype.md5 = function (url) {
  return crypto.createHash('md5').update(url).digest('hex');
};

/**
 * Generate unique hash
 */
RedisModel.prototype.uniqId = function (callback) {
  this.db.incr(this.kCounter(), function (err, reply) {
    var hash = base58.encode(getRandomInt(9999, 999999) + reply.toString());
    if (typeof callback === 'function') {
      callback(err, hash);
    }
  });
};

/**
 * Returns hash associated with a URL
 */
RedisModel.prototype.findUrl = function (long_url, callback) {
  this.db.get(this.kUrl(long_url), function (err, reply) {
    if (typeof callback === 'function') {
      callback(err, reply);
    }
  });
};

RedisModel.prototype.findHash = function (short_url, callback) {
  this.db.hgetall(this.kHash(short_url), function (err, reply) {
    if (typeof callback === 'function') {
      callback(err, reply);
    }
  });
};

RedisModel.prototype.clickLink = function (short_url, callback) {
  this.db.hincrby(this.kHash(short_url), 'clicks', 1, function (err, reply) {
    if (typeof callback === 'function') {
      callback(err, reply);
    }
  });
};

/**
 * create a redirect record
 * TODO: support option to recall existing link using findUrl method
 */
RedisModel.prototype.set = function (opts, callback) {
    var self = this, alias = opts.alias, long_url = opts.long_url;

    if(!alias) {
        // alias doesn't exist, generate one (old method)
        this.findUrl(long_url, function (err, reply) {
            if (err) {
                callback(500);
                self.db.quit();
            } else if (reply) {
                callback(null, {
                    'hash' : reply,
                    'long_url' : long_url
                });
                self.db.quit();
            } else {
                self.uniqId(function (err, hash) {
                    if (err) {
                        callback(500);
                        self.db.quit();
                    } else {
                        self._setDBRecord(hash, long_url, callback);
                    }
                });
            }
        });
    } else {
        // replace anything that's not number or letter with underscore
        alias = alias.replace(/[^a-z0-9]/gi, '_');
        self._setDBRecord(alias, long_url, callback);
    }

};


/**
 * Associate URL with a hash/alias
 * TODO: prevent overwrite (or put it behind a forced flag)
 */
RedisModel.prototype._setDBRecord = function(hash, long_url, callback) {
    var self = this;
    var response = {
        'hash'     : hash,
        'long_url' : long_url
    };

    self.db.multi([
        ['set', self.kUrl(long_url), hash],
        ['hmset', self.kHash(hash),
            'url', long_url,
            'hash', hash,
            'clicks', 0
        ]
    ]).exec(function (err, replies) {
        if (err) {
            callback(503);
        } else {
            callback(null, response);
        }
        self.db.quit();
    });
};


// Get record
RedisModel.prototype.get = function (short_url, callback, click) {
  var self = this;

  this.findHash(short_url, function (err, reply) {
    if (err) {
      callback(500);
    } else if (reply && 'url' in reply) {
      if (click) {
        self.clickLink(reply.hash);
      }

      callback(null, {
        'hash' : reply.hash,
        'long_url' : reply.url,
        'clicks' : reply.clicks || 0
      });
    } else {
      callback(404);
    }
    self.db.quit();
  });
};
