var express = require('express')
  , app = express()
  , opts = require('./config/opts')
  , nus = require('./lib/nus')(opts);


// Gotta Catch 'Em All
process.addListener('uncaughtException', function (err, stack) {
  console.log('Caught exception: ' + err + '\n' + err.stack);
  console.log('\u0007'); // Terminal bell
});

require('./index')(express, app);
require('./routes/handler')(app, nus);

// Start HTTP server
app.listen(opts.port, function () {
  console.log('Express server listening on port %d in %s mode',
    opts.port, app.settings.env
  );
  console.log('Running on %s (Press CTRL+C to quit)', opts.url);
});
