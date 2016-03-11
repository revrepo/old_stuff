load('application');

//Loading the required modules
var log = require("co-logger");
var http = require('http');
var https = require('https');
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;
var units = require('node-units');
var revlogger = require('rev-logger');

var es = require('elasticsearch');

action('bandwidth_reports', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for ES bandwidth_reports for domain '+ req.body.domainName);
    es.traffic_page.bandwidth_reports(req.body, function(bandwidth) {
      send(bandwidth);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }
});

action('traffic_count', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for ES traffic_count for domain '+ req.body.domainName);
    es.traffic_page.traffic_count(req.body, function(traffic_bytes) {
      send(traffic_bytes);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }

});

action('bandwidth_graph', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for bandwidth_graph ES for domain '+ req.body.domainName);
    es.traffic_page.bandwidth_graph(req.body, function(bytes_transfered) {
      send(bytes_transfered);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }

});

action('pages_accelerated', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for pages_accelerated ES for domain '+ req.body.domainName);
    es.traffic_page.num_pages(req.body, function(pages_cnt) {
      send(pages_cnt);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }

});

action('num_attacks_blocked', function() {
  es.traffic_page.num_attacks_blocked(req.body, function(attacks_cnt) {
    send(attacks_cnt);
  });
});

action('top_countries', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for ES top_countries for domain '+ req.body.domainName);
    es.traffic_page.top_countries(req.body, function(countries_list) {
      send(countries_list);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }
});

action('cache_efficiency', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for ES cache_efficiency for domain '+ req.body.domainName);
    es.traffic_page.cache_efficiency(req.body, function(cached_data) {
      send(cached_data);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }
});

action('cache_timeline', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for ES cache_timeline for domain '+ req.body.domainName);
    es.traffic_page.cache_timeline(req.body, function(cached_data) {
      send(cached_data);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }
});

action('top_response', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for ES top_response for domain '+ req.body.domainName);
    es.traffic_page.top_response(req.body, function(cached_data) {
      send(cached_data);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }
});

action('topresponse_time', function() {
  if (req.body && req.body.domainName != undefined && req.body.domainName != "") {
    revlogger.audit('Received request for ES topresponse_time for domain '+ req.body.domainName);
    es.traffic_page.topresponse_time(req.body, function(cached_data) {
      send(cached_data);
    });
  } else {
    send({
      status: false,
      response: "Please send valid params"
    });
  }
});
