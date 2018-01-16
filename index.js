var config = require('./config/opts');
var nus = require('./lib/nus')(config);
config['__dirname'] = __dirname;

// express app
module.exports = function(app, opts) {
    opts = Object.assign(config, opts);

    // Load express configuration
    require('./config/env')(app, opts);

    // Load routes
    require('./routes')(app, nus, opts);
};

