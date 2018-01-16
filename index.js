var opts = require('./config/opts');
var nus = require('./lib/nus')(opts);
opts['__dirname'] = __dirname;

// express app
module.exports = function(app) {
    // Load express configuration
    require('./config/env')(app, opts);

    // Load routes
    require('./routes')(app, nus, opts);
};

