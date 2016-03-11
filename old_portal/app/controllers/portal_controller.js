/*
 * Copyright (c) 2014, Rev Software, Inc.
 * All Rights Reserved.
 *
 * This code is confidential and proprietary to Rev Software, Inc
 * and may only be used under a license from Rev Software Inc.
 *
 * Author: <Haranath Gorantla>
 */

/**
 * Added the services for checking the i/p request.
 */
load('application');
before(use('validateRequest'), {
  only: ['distribution_graph', 'compare_graph', 'cmp_timeRange_graph']
});

//Loading the requires modules
var revportal = require("revportal");
var log = require("co-logger");
var WebSocket = require('ws');
var WebSocketClient = require('websocket').client;
var revlogger = require('rev-logger');

//Broswer delcaration
var AC = "android-chrome";
var AD = "android";
var AF = "android-firefox";
var CH = "chrome";
var FF = "firefox";
var IE = "ie";
var SF = "safari";
var IC = "ios-chrome";
var IS = "ios-safari";
var WP = "windows-phone";
var OT = "others";

//Browsers array declaration
var browsers = [AC, AD, AF, CH, FF, IE, SF, IC, IS, WP, OT];

action('area_graph', function() {
  //console.log("Came in to the area graph--->>>>");
  data = req.body;
  if (data && data.email && data.email != undefined) {
    User.findOne({
      where: {
        email: data.email
      }
    }, function(err, user) {
      if (err) {
        send({
          status: false,
          response: user.errors
        });
      } else {
        if (user) {
          Domain.findOne({
            where: {
              name: data.domainName
            }
          }, function(err, domain) {
            if (err) {
              send({
                status: false,
                response: "Please send a valid user"
              });
            } else {
              if (domain && domain.status) {
                var params = {
                  cube_url: domain.cube_url,
                  domain_name: domain.name
                };
                if (req.body.filter) {
                  if (req.body.filter.hasOwnProperty("device")) {
                    params.device = req.body.filter.device;
                  }
                  if (req.body.filter.hasOwnProperty("geography")) {
                    params.geography = req.body.filter.geography;
                  }
                  if (req.body.filter.hasOwnProperty("time_range")) {
                    params.time_range = req.body.filter.time_range;
                  }
                  if (req.body.filter.hasOwnProperty("network")) {
                    params.network = req.body.filter.network;
                  }
                  if (req.body.filter.hasOwnProperty("domain")) {
                    params.domain = req.body.filter.domain;
                  }
                }
                var res_total = {};

                revlogger.audit('Received RUM report request area_graph for domain '+ req.body.domainName);

                revportal.area_graph.networkTime(params, "nrml", function(opt) {
                  if (opt.status) {
                    res_total.networkTime = opt.response;
                    revportal.area_graph.browserTime(params, "nrml", function(opt) {
                      if (opt.status) {
                        res_total.browserTime = opt.response;
                        revportal.area_graph.backendTime(params, "nrml", function(opt) {
                          if (opt.status) {
                            res_total.backendTime = opt.response;
                            //revportal.distribution_graph.pageLoadTime(params,function(opt){
                            revportal.area_graph.pageLoadTime(params, "nrml", function(opt) {
                              if (opt.status) {
                                res_total.pageLoadTime = opt.response;
                                revportal.area_graph.resourseNetworkTime(params, "nrml", function(opt) {
                                  if (opt.status) {
                                    res_total.resourseNetworkTime = opt.response;
                                    send({
                                      status: true,
                                      response: res_total
                                    });
                                  } else {

                                  }
                                });
                              } else {
                                //res_total.pageLoadTime = [];
                                //send(opt);
                              }
                            });
                          } else {
                            //res_total.backendTime = [];
                            //send(opt);
                          }
                        });
                      } else {
                        //res_total.browserTime = [];
                        //send(opt);
                      }
                    });
                  } else {
                    //res_total.networkTime = [];
                    //send(opt);
                    var respJson = {};
                    respJson.status = false;
                    respJson.response = "Unable to retreive latest data. Please try again later.";
                    send(respJson);
                  }
                });

              } else {
                send({
                  status: false,
                  response: revportal.prepare_deleted_domain_json()
                });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "Please send valid user"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Please send a valid JSON"
    });
  }
});

action('compare_graph', function() {
  //console.log("Came in to the compare graph--->>>>");
  data = req.body;
  if (data && data.email && data.email != undefined) {
    User.findOne({
      where: {
        email: data.email
      }
    }, function(err, user) {
      if (err) {
        send({
          status: false,
          response: user.errors
        });
      } else {
        if (user && user.status) {
          var dom_arr = user.domain.split(',');
          var req_dom_arr = req.body.domain.split(',');
          var d_len = 0;
          var data_arr = [];
          //var rem_arr = [];

          revlogger.audit('Received request for RUM compare_graph report for domain '+ req.body.domainName);

          get_eachDomain_data();

          function get_eachDomain_data() {
            if (d_len < req_dom_arr.length) {
              if (dom_arr.indexOf(req_dom_arr[d_len]) != -1) {
                get_eachDomain_graph_data(req_dom_arr[d_len], data.filter, function(sts, resp_arr) {
                  var d_obj = {};
                  if (sts) {
                    d_obj[req_dom_arr[d_len]] = resp_arr;
                    data_arr.push(d_obj);
                  }
                  d_len++;
                  get_eachDomain_data();
                });
              } else {
                //rem_arr.push(req_dom_arr[d_len]);
                d_len++;
                get_eachDomain_data();
              }
            } else {
              //if(rem_arr.length==0){
              send({
                status: true,
                response: data_arr
              });
              /*}else{
              	send({status:false, response:{"isDomainExist":false,"message":"One of the domains has been deleted.","domainName":req_dom_arr[d_len]}});
              }*/
            }
          }
        } else {
          send({
            status: false,
            response: "Please send a valid user"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "invalid json"
    });
  }
});

/**
 * 
 */
function get_eachDomain_graph_data(d_name, _filter, callback) {
  Domain.findOne({
    where: {
      name: d_name
    }
  }, function(err, domain) {
    if (err) {
      send({
        status: false,
        response: domain.errors
      });
    } else {
      if (domain && domain.status) {
        var params = {
            cube_url: domain.cube_url,
            domain_name: domain.name,
            is_multi_domain_compare: true
          },
          service = "";
        if (_filter) {
          if (_filter.hasOwnProperty("device")) {
            params.device = _filter.device;
          }
          if (_filter.hasOwnProperty("geography")) {
            params.geography = _filter.geography;
          }
          if (_filter.hasOwnProperty("time_range")) {
            params.time_range = _filter.time_range;
          }
          if (_filter.hasOwnProperty("load_time") && _filter.load_time != "") {
            service = _filter.load_time;
          } else {
            service = "pageLoadTime";
          }
        } else {
          service = "pageLoadTime";
        }

        revportal.area_graph[service](params, "cmp", function(opt) {
          callback(opt.status, opt.response);
        });
      }
    }
  });
}


/**
 * Service for running the corn job for every one hour to evaluate the area graph data(registered domains)
 */
action("eval_graphs_cron", function() {
  //console.log("GRAPHS CRON JOB <>>>>>>>>>>>>>>>>>>>>");
  Domain.all({
    where: {
      status: true
    }
  }, function(err, domains) {
    if (err) {
      console.log("errors--->>>>");
    } else {
      var j = 0;
      for (domain in domains) {
        var i = 0;
        graphMetric();

        function graphMetric() {
          if (i < domains.length) {
            if (domains[i].name.length > 0) {
              var params = {};
              params.cube_url = domains[i].cube_url;
              params.domain_name = domains[i].name;
              //console.log("DOMAIN",domains[i].name);

              Filter.findOne(function(err, filter) {
                delete filter.geography['title'];

                for (key in filter.geography) {
                  params.geography = key;
                  //console.log("PARAMS",params.domain_name,"BROWSER",browsers[0]);

                  for (browser in browsers) {
                    params.device = browsers[browser];

                    metric_graph_data(params);
                    i++;
                    graphMetric();
                  }
                }
              });
            }
          }
        }

      }
    }
  });
});

/**
 * Calcualting  graph metrics for each one hour.
 */
var metric_graph_data = function(params) {
  //console.log("Came in to metric_graph_data-->>>");
  var eval_url = "ws://" + params.cube_url.split('//')[1].split('/')[0] + "/1.0/metric/get";
  //var js = generateEvalGraphQuery(params,"browserTime");
  //console.log("eval_url",eval_url, "JS",js);
  //console.log("GRAPH JSON",eval_url);

  var ews = new WebSocket(eval_url);
  ews.on("open", function() {
    //console.log("METRIC GRAPH CONNECTION OPEN");
    ews.send(generateEvalGraphQuery(params, "browserTime"));
    ews.send(generateEvalGraphQuery(params, "pageloadTime"));
    ews.send(generateEvalGraphQuery(params, "backendTime"));

    //for closing websocket connection
    setInterval(function() {
      ews.close();
    }, 10000);
  });

  ews.on("error", function(error) {
    console.log("METRIC GRAPH  WS Connection Error: ");
  });

};

/**
 * Preparing the query for graph metric
 */
var generateEvalGraphQuery = function(params, info) {
  var json = {};
  if (params.domain_name && params.device && params.geography) {
    json.expression = "median(pl_info(" + info + ").eq(domain,'" + params.domain_name + "').eq(device,'" + params.device + "').eq(geography,'" + params.geography + "'))";
  } else if (params.domain_name && params.device) {
    json.expression = "median(pl_info(" + info + ").eq(domain,'" + params.domain_name + "').eq(device,'" + params.device + "'))";
  } else if (params.domain_name && params.geography) {
    json.expression = "median(pl_info(" + info + ").eq(domain,'" + params.domain_name + "').eq(geography,'" + params.geography + "'))";
  }

  json.stop = new Date().toISOString();

  var ed = new Date().getTime() - 1 * 60 * 60 * 1000;
  json.start = new Date(ed).toISOString();
  json.step = 3e5;

  //console.log("MAP JSON",JSON.stringify(json));
  return JSON.stringify(json);
};

/**
 * 
 */
var time = function(data) {
  switch (data) {
    case "6hours":
      return 6 * 60 * 60 * 1000;
      break;
    case "12hours":
      return 12 * 60 * 60 * 1000;
      break;
    case "24hours":
      return 24 * 60 * 60 * 1000;
      break;
    case "1day":
      return 24 * 60 * 60 * 1000;
      break;
    case "15days":
      return 15 * 24 * 60 * 60 * 1000;
      break;
    case "30days":
      return 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      return 6 * 60 * 60 * 1000;
      break;
  }
};

/**
 * 
 */
action('distribution_graph', function() {
  //console.log("Came in to the domain graph");
  data = req.body;
  if (data && data.email && data.email != undefined) {
    User.findOne({
      where: {
        email: data.email
      }
    }, function(err, user) {
      if (err) {
        send({
          status: false,
          response: user.errors
        });
      } else {
        if (user) {
          Domain.findOne({
            where: {
              name: data.domainName
            }
          }, function(err, domain) {
            if (err) {
              send({
                status: false,
                response: "Please send a valid user"
              });
            } else {
              if (domain && domain.status) {
                var res_total = {};
                var params = {
                  cube_url: domain.cube_url,
                  domain_name: domain.name
                };

                if (req.body.filter) {
                  if (req.body.filter.hasOwnProperty("device")) {
                    params.device = req.body.filter.device;
                  }
                  if (req.body.filter.hasOwnProperty("geography")) {
                    params.geography = req.body.filter.geography;
                  }
                  if (req.body.filter.hasOwnProperty("time_range")) {
                    params.time_range = req.body.filter.time_range;
                  }
                  if (req.body.filter.hasOwnProperty("network")) {
                    params.network = req.body.filter.network;
                  }
                  if (req.body.filter.hasOwnProperty("domain")) {
                    params.domain = req.body.filter.domain;
                  }
                }

                revlogger.audit('Received request for RUM distribution_graph for domain '+ req.body.domainName);

                revportal.distribution_graph.pageLoadTime(params, "nrml", function(opt) {
                  if (opt.status) {
                    res_total.pageLoadTimes = opt.response;
                    send({
                      status: true,
                      response: res_total
                    });
                  } else {
                    //send(opt);
                    var respJson = {};
                    respJson.status = false;
                    respJson.response = "Unable to retreive latest data. Please try again later.";
                    send(respJson);
                  }
                });
              } else {
                //To handle the domain not existance functionality
                send({
                  status: false,
                  response: revportal.prepare_deleted_domain_json()
                });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "Please send a valid user"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Please send a valid JSON"
    });
  }
});

action('cmp_timeRange_graph', function() {
  //console.log("Came in to the cmp_timeRange graph--->>>>");
  data = req.body;
  if (data && data.email && data.email != undefined) {
    User.findOne({
      where: {
        email: data.email
      }
    }, function(err, user) {
      if (err) {
        send({
          status: false,
          response: user.errors
        });
      } else {
        if (user) {
          Domain.findOne({
            where: {
              name: data.domainName
            }
          }, function(err, domain) {
            if (err) {
              send({
                status: false,
                response: "Please send a valid user"
              });
            } else {
              if (domain && domain.status) {
                var params = {
                  cube_url: domain.cube_url,
                  domain_name: domain.name
                };

                if (req.body.filter) {
                  if (req.body.filter.hasOwnProperty("device")) {
                    params.device = req.body.filter.device;
                  }
                  if (req.body.filter.hasOwnProperty("geography")) {
                    params.geography = req.body.filter.geography;
                  }
                  if (req.body.filter.hasOwnProperty("fromL")) {
                    params.from_range = req.body.filter.fromL;
                  }
                  if (req.body.filter.hasOwnProperty("toL")) {
                    params.to_range = req.body.filter.toL;
                  }
                  if (req.body.filter.hasOwnProperty("time_diff")) {
                    params.t_diff = req.body.filter.time_diff;
                  }
                  if (req.body.filter.hasOwnProperty("domain")) {
                    params.domain = req.body.filter.domain;
                  }

                  revlogger.audit('Received RUM report request cmp_timeRange_graph for domain '+ req.body.domainName);

                  var res_total = {};
                  res_total.pageLoadTime = [];
                  revportal[req.body.filter.service].pageLoadTime(params, "cmp", function(opt) {
                    if (opt.status) {
                      res_total.pageLoadTime.push(opt.response);
                      if (req.body.filter.hasOwnProperty("fromR")) {
                        params.from_range = req.body.filter.fromR;
                      }
                      if (req.body.filter.hasOwnProperty("toR")) {
                        params.to_range = req.body.filter.toR;
                      }

                      revportal[req.body.filter.service].pageLoadTime(params, "cmp", function(optnd) {
                        if (optnd.status) {
                          res_total.pageLoadTime.push(optnd.response);
                          send({
                            status: true,
                            response: res_total
                          });
                        } else {
                          var respJson = {};
                          respJson.status = false;
                          respJson.response = "Unable to retreive latest data. Please try again later.";
                          send(respJson);
                        }
                      });
                    } else {
                      var respJson = {};
                      respJson.status = false;
                      respJson.response = "Unable to retreive latest data. Please try again later.";
                      send(respJson);
                    }
                  });
                } else {
                  send({
                    status: false,
                    response: "Please send a valid JSON"
                  });
                }
              } else {
                send({
                  status: false,
                  response: revportal.prepare_deleted_domain_json()
                });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "Please send valid user"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Please send a valid JSON"
    });
  }
});

action('pgt_analytics', function() {
  //console.log("Came in to the pgt_analytics graph");
  data = req.body;
  //console.log("data",data)
  if (data && data.email && data.email != undefined) {
    User.findOne({
      where: {
        email: data.email
      }
    }, function(err, user) {
      if (err) {
        send({
          status: false,
          response: user.errors
        });
      } else {
        if (user) {
          Domain.findOne({
            where: {
              name: data.domainName
            }
          }, function(err, domain) {
            if (err) {
              send({
                status: false,
                response: "Please send a valid user"
              });
            } else {
              if (domain && domain.status) {
                var res_total = {};
                var params = {
                  cube_url: domain.cube_url,
                  domain_name: domain.name
                };

                if (req.body.filter) {

                  if (req.body.filter.hasOwnProperty("time_range")) {

                    params.time_range = req.body.filter.time_range;
                  }

                  if (req.body.filter.hasOwnProperty("domain")) {
                    params.domain = req.body.filter.domain;
                  }
                }

                revportal.analytics_graph.pageLoadTime(params, function(opt) {
                  if (opt.status) {
                    res_total.pageLoadTimes = opt.response;
                    send({
                      status: true,
                      response: res_total
                    });
                  } else {
                    var respJson = {};
                    respJson.status = false;
                    respJson.response = "Unable to retreive latest data. Please try again later.";
                    send(respJson);
                  }
                });
              } else {
                send({
                  status: false,
                  response: revportal.prepare_deleted_domain_json()
                });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "Please send a valid user"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Please send a valid JSON"
    });
  }
});
