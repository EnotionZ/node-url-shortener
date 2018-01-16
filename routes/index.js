module.exports = function (app, nus, opts) {
    var api = require('./api.js')(app, nus, opts);

    var ns = opts.namespace;
    opts.namespace = ns = !!ns ? '/' + ns : '';

    // api routes
    app.use(ns + '/api/v1', api);

    // index route
    app.route(ns + '/').all(function (req, res) {
        res.render('index', {namespace: ns});
    });

    // shorten route
    var shortenedRoute = new RegExp('^' + ns + '\/([\\w=]+)$');
    app.get(shortenedRoute, function (req, res, next){
        nus.expand(req.params[0], function (err, reply) {
            if (err) {
                next();
            } else {
                res.redirect(301, reply.long_url);
            }
        }, true);
    });
};
