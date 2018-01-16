var opts = require('./config/opts');
var nus = require('./lib.nus')(opts);


// express app
module.exports = function(express, app) {
    // Common options
    app.set('nus-opts', opts);
    app.set('__dirname', __dirname);
    app.set('x-powered-by', false);

    // Load express configuration
    require('./config/env')(express, app);

    // Load routes
    require('./routes')(app, nus);
};

