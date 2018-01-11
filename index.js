var path = require('path')
  , opts = require(path.join(__dirname, 'config', 'opts.js'))
  , nus = require(path.join(__dirname, 'lib', 'nus.js'))(opts);


// express app
module.exports = function(express, app) {
    app.set('nus-opts', opts);
    app.set('__dirname', __dirname);
    app.set('x-powered-by', false);

    // Load express configuration
    require(path.join(__dirname, 'config', 'env.js'))(express, app);

    // Load routes
    require(path.join(__dirname, 'routes'))(app, nus);
};

