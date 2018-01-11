var express = require('express') , app = express();
var path = require('path');
var opts = require(path.join(__dirname, '../', 'config', 'opts.js'));

app.set('nus-namespace', 'r');
require('../index')(express, app);

// Gotta Catch 'Em All
process.addListener('uncaughtException', function (err, stack) {
  console.log('Caught exception: ' + err + '\n' + err.stack);
  console.log('\u0007'); // Terminal bell
});

// Start HTTP server
app.listen(opts.port, function () {
  console.log('Express server listening on port %d in %s mode',
    opts.port, app.settings.env
  );
  console.log('Running on %s (Press CTRL+C to quit)', opts.url);
});

