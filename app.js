var express = require('express')
  , app = express()
  , opts = require('./config/opts');


// Gotta Catch 'Em All
process.addListener('uncaughtException', function (err, stack) {
  console.log('Caught exception: ' + err + '\n' + err.stack);
  console.log('\u0007'); // Terminal bell
});

// app.set('nus-namespace', 'r');
app.set('x-powered-by', false);

require('./index')(app);
require('./routes/handler')(app);

// Start HTTP server
app.listen(opts.port, function () {
  console.log('Express server listening on port %d in %s mode',
    opts.port, app.settings.env
  );
  console.log('Running on %s (Press CTRL+C to quit)', opts.url);
});
