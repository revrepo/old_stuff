#!/usr/bin/env node

/*************************************************************************
 *
 * REV SOFTWARE CONFIDENTIAL
 *
 * [2013] - [2015] Rev Software, Inc.
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Rev Software, Inc. and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Rev Software, Inc.
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Rev Software, Inc.
 */


/**
 * Server module exports method returning new instance of app.
 *
 * @param {Object} params - compound/express webserver initialization params.
 * @returns CompoundJS powered express webserver
 */
var app = module.exports = function getServerInstance(params) {
  params = params || {};
  // specify current dir as default root of server
  params.root = params.root || __dirname;
  return require('compound').createServer(params);
};

var settings = require('./config/config');
var revlogger = require('rev-logger');
var expressHTTP = require('express');

//for cluster
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

revlogger.log('info', 'Starting Rev Portal service..');

if (!module.parent || module.parent.isApplicationLoader) {
  var port = process.env.PORT || 443;
  var host = process.env.HOST || '0.0.0.0';

  var server = app();

  if (cluster.isMaster) {

    // set up plain http server
    var http = expressHTTP.createServer();
    // set up a route to redirect http to https
    http.get('*',function(req,res){  
      res.redirect('https://' + req.headers.host + req.url);
    });
    http.listen(80);


    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
      //    console.log('worker ' + worker.process.pid + ' died');
      cluster.fork();
    });
  } else {
    server.listen(port, host, function() {
      revlogger.log('info', 'Compound server listening on '+ host + ':' + port);
    });
  }
}

// Test for Konstantin

