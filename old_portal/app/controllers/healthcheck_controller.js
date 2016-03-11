load('application');

// Loading the required modules
var log = require('co-logger');
var WebSocketClient = require('websocket').client;
var WebSocket = require('ws');
var revlogger = require('rev-logger');
var fs = require('fs');

var versionApp = fs.readFileSync('./version.txt', {encoding: 'utf8'});

action('check',function(){

  // Checking that the user database is available
  var msg;
  var status = true;

  User.findOne( {} ,function(err, result) {
  	if(err) {
      errorMsg = 'ERROR: Failed to read a user';
      msg = (msg) ? errorMsg : msg + '; ' + errorMsg;
      status = false;
    }
  });

  var statusMessage = {
    status: status,
    version: versionApp.trim(),
    message: (!msg) ? 'OK: Everything is great' : msg
  };
  revlogger.audit('Responding with health check message ' + JSON.stringify(statusMessage));
	send(statusMessage);
});

