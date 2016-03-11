/*
 * Copyright (c) 2014, Rev Software, Inc.
 * All Rights Reserved.
 *
 * This code is confidential and proprietary to Rev Software, Inc
 * and may only be used under a license from Rev Software Inc.
 *m
 * Author: <Haranath Gorantla>
 */

/**
 * Added  the services for checking the i/p request.
 */
load('application');
before(use('validateRequest'), {
  only: ['list', 'new', 'update', 'purgeDomains', 'purge', 'delete', 'names', 'settings', 'getSettings', 'configure', 'updateConfigure', 'getMasterConfigDomain']
});

//Loading the required modules
var log = require("co-logger");
var WebSocket = require('ws');
var WebSocketClient = require('websocket').client;
var util = require('util');
var exec = require('child_process').exec;
var dns = require('dns');
var revlogger = require("rev-logger");

var revportal = require("revportal");

var connection = null;

var config = require('././config/config');
//for loading mongo client
var MongoClient = require('mongodb').MongoClient;

var upd_domain_in_user_list = function(domainName) {
  if (domainName != undefined) {
    User.all({
      where: {
        status: true
      }
    }, function(err, users) {
      if (err) {
        send({
          status: false,
          response: users.errors
        });
      } else {
        for (var i = 0; i < users.length; i++) {
          var usr = users[i];
          var main_dom_arr = [];

          if (usr.domain) {
            main_dom_arr = usr.domain.split(',');
          }

          if (main_dom_arr.indexOf(domainName) != -1) {

            main_dom_arr.splice(main_dom_arr.indexOf(domainName), 1);

            var domain_list = main_dom_arr.join();

            usr.domain = domain_list;

            usr.updateAttributes(usr, function(err, res) {
              if (err) {
                send({
                  status: false,
                  response: res.errors
                });
              } else {
                //send({ status:true,response: res.errors});
              }
            });
          }
        }
      }
    });
  }
};
/**
 * This function is used to get the BP or CO servers list
 */
var getServerUrls = function(groupName, type, callback) {
  console.log("Calling getServerUrls");
  ServerGroup.findOne({
    where: {
      groupName: groupName,
      groupType: type
    }
  }, function(err, groupObj) {
    if (groupObj) {
      if (type == "CO") {
        callback(groupObj.servers, groupObj.co_cnames);
      } else {
        callback(groupObj.servers);
      }
    } else {
      callback("");
    }
  });
};


action('getServers', function() {
  /*getServerUrls("BP",function(serverUrls) {
      console.log("URLS",serverUrls);
  });*/
  getRumDetails(function(rumDet) {
    //console.log(rumDet.rum_url,"EVAL",rumDet.evalutor_url);
  });
});

/**
 * This function is used to get the Rum Details
 */
var getRumDetails = function(callback) {
  revlogger.log('debug', "Calling getRumDetails");
  RumDetail.all({}, function(err, rumDet) {
    if (rumDet[0]) {
      //console.log("rumDet[0]----",rumDet[0]);
      callback(rumDet[0]);
    } else {
      callback("");
    }
  });
};
/**
 * Service for the creating the domain
 */
action('new', function() {
  console.log("Came in to the domain new webservice-->");
  if (req.body.email && req.body.name && (req.body.companyId || req.body.companys)) {
    if (req.body.companys) {
      req.body.companys = req.body.companyId;
    }
    var dname = req.body.name.replace(/\s/g, "");
    var creds = revportal.dns_api.usr_pwd;
    var dnsUrl = revportal.dns_api.url;
    var command = 'curl -k --user ' + creds + ' -X PUT -v ' + dnsUrl + '/cname/' + dname + '.revdn.net'
    child = exec(command, function(error, stdout, stderr) {
      if (JSON.parse(stdout).status == 0) {
        console.log("cname entry success resp");
        if (req.body.role && (req.body.role == "reseller" || req.body.role == "admin")) {
          req.body.BPGroup = "Default";
          req.body.COGroup = "Default";
          if (req.body.config_url_type != '' && req.body.config_url_type != 'undefined') {
            req.body.COGroup = req.body.config_url_type;
          }
          req.body.config_command_options = "  ";
          req.body.bp_apache_custom_config = "";
          req.body.bp_apache_fe_custom_config = "";

          console.log('Configured new URLs...');

          getRumDetails(function(urls) {

            console.log('urls variable is:', urls);

            req.body.cube_url = urls.evalutor_url;
            req.body.cube_url = req.body.cube_url.replace(/\s/g, "");
            req.body.rum_beacon_url = urls.rum_url;
            req.body.rum_beacon_url = req.body.rum_beacon_url.replace(/\s/g, "");
            getServerUrls(req.body.BPGroup, "BP", function(urls) {
            console.log('urls 2 variable is:', urls);
              req.body.stats_url = urls;
              req.body.stats_url = req.body.stats_url.replace(/\s/g, "");
              getServerUrls(req.body.COGroup, "CO", function(urls, cnames) {
                req.body.config_url = urls;
                req.body.config_url = req.body.config_url.replace(/\s/g, "");
                req.body.co_cnames = cnames;

                console.log('New domain req.body:', req.body);

                new_domain_extension(req.body);
              });
            });
          });
        } else {
          req.body.cube_url = req.body.cube_url.replace(/\s/g, "");
          req.body.rum_beacon_url = req.body.rum_beacon_url.replace(/\s/g, "");
          req.body.stats_url = req.body.stats_url.replace(/\s/g, "");
          req.body.config_url = req.body.config_url.replace(/\s/g, "");
          new_domain_extension(req.body);
        }
      } else {
        console.log("failure resp-->");
        if (JSON.parse(stdout).status == 1200) {
          send({
            status: false,
            response: "The domain cname record already exists. Please select a different domain name"
          });
        } else {
          send({
            status: false,
            response: "There was an error generating cname entry"
          });
        }
      }

    });
  } else {
    send({
      status: false,
      response: "Please send valid details"
    });
  }
});

var addDomainsHeatMapJobDetails = function(domain) {
  HeatMapJobDetail.findOne({
    where: {
      domainName: domain
    }
  }, function(err, heatMapJobDetail) {
    if (err) {
      console.log("Error while getting heat map job details");
      //send({status: false, response: heatMapJobDetail.errors});
    } else {
      if (!heatMapJobDetail) {
        var heatMapJobDetail = new HeatMapJobDetail();
        heatMapJobDetail.domainName = domain;

        var isoStart = new Date().toISOString();

        //var endDate =  (new Date().getTime()) + (10*10000);
        var isoEnd = new Date().toISOString();

        var st = new Date(isoStart);
        var ed = new Date(isoEnd);

        heatMapJobDetail.jobStartTime = st;
        heatMapJobDetail.jobEndTime = ed;

        heatMapJobDetail.save(function(err, res) {
          if (err) {
            console.log("Unable to save heatmap job details");
          } else {
            console.log("heatmap job details added successfully");
          }
        });
      }
    }
  });
}

var new_domain_extension = function(data) {
  var req = {};
  req.body = data;

  var evalUrl = validateCubeUrl(req.body.cube_url);
  if (evalUrl == 'false') {
    send({
      status: false,
      response: "Please enter a valid Evaluator URL"
    });
  } else {
    req.body.cube_url = evalUrl;
    req.body.name = req.body.name.replace(/\s/g, "");
    req.body.origin_domain = req.body.origin_domain.replace(/\s/g, "");
    req.body.origin_server = req.body.origin_server.replace(/\s/g, "");

    if (req.body.webpagetest_url) {
      req.body.webpagetest_url = req.body.webpagetest_url.replace(/\s/g, "");
    } else {
      req.body.webpagetest_url = "";
    }

    req.body.rum_beacon_url = req.body.rum_beacon_url.replace(/\s/g, "");

    if (req.body.stats_url) {
      req.body.stats_url = req.body.stats_url.replace(/\s/g, "");
    } else {
      req.body.stats_url = "";
    }

    if (req.body.config_url) {
      req.body.config_url = req.body.config_url.replace(/\s/g, "");
    } else {
      req.body.config_url = "";
    }

    req.body.tolerance = req.body.tolerance.replace(/\s/g, "");

    if (req.body.co_cnames) {
      req.body.co_cnames = req.body.co_cnames.replace(/\s/g, "");
    } else {
      req.body.co_cnames = "";
    }



    User.findOne({
      where: {
        email: req.body.email
      }
    }, function(err, user) {
      if (err) {
        console.log("unable to find the user");
        send({
          status: false,
          response: user.errors
        });
      } else {
        if (user && user.role != "user") {
          Domain.findOne({
            where: {
              name: req.body.name
            }
          }, function(err, domainObj) {
            if (err) {
              send({
                status: false,
                response: domainObj.errors
              });
            } else {
              if (domainObj && !domainObj.status) {
                domainObj.companyId = req.body.companyId;
                domainObj.origin_domain = req.body.origin_domain;
                //domainObj.webpagetest_url  = req.body.webpagetest_url;
                domainObj.rum_beacon_url = req.body.rum_beacon_url;
                domainObj.cube_url = req.body.cube_url;

                //if(req.body.origin_server){
                domainObj.origin_server = req.body.origin_server != undefined ? req.body.origin_server : "";
                //}

                //if(req.body.config_command_options){
                domainObj.config_command_options = req.body.config_command_options != undefined ? req.body.config_command_options : "";
                //}

                //if(req.body.co_apache_custom_config){
                domainObj.co_apache_custom_config = req.body.co_apache_custom_config != undefined ? req.body.co_apache_custom_config : "";
                //}

                //if(req.body.bp_apache_custom_config){
                domainObj.bp_apache_custom_config = req.body.bp_apache_custom_config != undefined ? req.body.bp_apache_custom_config : "";
                //}
                domainObj.bp_apache_fe_custom_config = req.body.bp_apache_fe_custom_config != undefined ? req.body.bp_apache_fe_custom_config : "";

                //domainObj.stats_url  = req.body.stats_url;
                //domainObj.config_url  = req.body.config_url;
                domainObj.stats_url = "";

                if (req.body.stats_url) {
                  var stat_init = req.body.stats_url;

                  var bp_urls = "";
                  var bp_array = new Array();
                  if (req.body.stats_url != "") {
                    bp_array = req.body.stats_url.split(",");

                    for (var bp = 0; bp < bp_array.length; bp++) {
                      bp_array[bp] = bp_array[bp] + ":8001";
                    }
                    bp_urls = bp_array.join();
                  }
                  domainObj.stats_url = bp_urls;
                }

                domainObj.config_url = "";

                if (req.body.config_url) {
                  var conf_init = req.body.config_url;

                  var co_urls = "";
                  var co_array = new Array();

                  if (req.body.config_url != "") {
                    co_array = req.body.config_url.split(",");

                    for (var co = 0; co < co_array.length; co++) {
                      co_array[co] = co_array[co] + ":8000";
                    }
                    co_urls = co_array.join();
                  }

                  domainObj.config_url = co_urls;
                }

                domainObj.co_cnames = "";

                if (req.body.co_cnames) {
                  domainObj.co_cnames = req.body.co_cnames;
                }

                domainObj.tolerance = req.body.tolerance;
                domainObj.status = true;

                domainObj.updateAttributes(domainObj, function(err, updateDomainObj) {
                  if (err) {
                    send({
                      status: false,
                      response: updateDomainObj.errors
                    });
                  } else {
                    var isEmptyBPPolicyUrl = false;
                    var isEmptyCOPolicyUrl = false;

                    //Creating the updateDomainObj configuration
                    if (conf_init == "") {
                      isEmptyCOPolicyUrl = true;
                    } else {
                      isEmptyCOPolicyUrl = false;
                    }

                    if (stat_init == "") {
                      isEmptyBPPolicyUrl = true;
                    } else {
                      isEmptyBPPolicyUrl = false;
                    }

                    addDomainsHeatMapJobDetails(req.body.name);
                    if (!isEmptyBPPolicyUrl || !isEmptyCOPolicyUrl) {
                      //console.log("came in for masterConfigureSave save----->");

                      masterConfigureSave(req.body, "add", req.body.stats_url, req.body.config_url, function(stat) {
                        //editDomainStatus(req.body.name,true,"");
                        if (stat) {
                          revlogger.audit('Successfully created new domain "' + req.body.name + '" by user "' + user.email + '"');
                          send({
                            status: true,
                            response: "Domain has been created successfully"
                          });
                        } else {
                          send({
                            status: true,
                            response: "Unable to connect with Policy Controller. Will retry later."
                          });
                        }
                      });
                    }

                    if (!isEmptyBPPolicyUrl) {
                      //Creating the domain stats
                      domainStatsSave(req.body);
                    }

                    if (isEmptyBPPolicyUrl && isEmptyCOPolicyUrl) {
                      editDomainStatus(req.body.name, true, "Success");
                      masterConfigureSave(req.body, "add", req.body.stats_url, req.body.config_url, function(stat) {
                        //editDomainStatus(req.body.name,true,"");
                        if (stat) {
                          revlogger.audit('Successfully created new domain "' + req.body.name + '" by user "' + user.email + '"');
                          send({
                            status: true,
                            response: "Domain has been created successfully"
                          });
                        } else {
                          send({
                            status: true,
                            response: "Unable to connect with Policy Controller. Will retry later."
                          });
                        }
                      });
                      //send({ status:true,response:"Domain has been created successfully" });
                    }

                  }
                });
              } else {
                // Added to check domain duplicate
                if (domainObj && domainObj.status) {
                  send({
                    status: false,
                    response: "Domain already exists"
                  });
                } else {
                  var domain = Domain(req.body);
                  domain.status = true;

                  if (req.body.stats_url) {
                    var stat_init = req.body.stats_url;
                    var bp_urls = "";
                    var bp_array = new Array();

                    if (req.body.stats_url != "") {
                      bp_array = req.body.stats_url.split(",");

                      for (var bp = 0; bp < bp_array.length; bp++) {
                        bp_array[bp] = bp_array[bp] + ":8001";
                      }
                      bp_urls = bp_array.join();
                    }
                    domain.stats_url = bp_urls;
                  } else {
                    domain.stats_url = "";
                  }

                  if (req.body.config_url) {
                    var conf_init = req.body.config_url;

                    var co_urls = "";
                    var co_array = new Array();
                    if (req.body.config_url != "") {
                      co_array = req.body.config_url.split(",");

                      for (var co = 0; co < co_array.length; co++) {
                        co_array[co] = co_array[co] + ":8000";
                      }
                      co_urls = co_array.join();
                    }

                    domain.config_url = co_urls;
                  } else {
                    domain.config_url = "";
                  }

                  //Creating the new domain
                  domain.save(function(err, res) {
                    if (err) {
                      send({
                        status: false,
                        response: res.errors
                      });
                    } else {
                      User.findOne({
                        where: {
                          email: req.body.email
                        }
                      }, function(err, user) {
                        if (err) {
                          send({
                            status: false,
                            response: user.errors
                          });
                        } else {
                          if (user && user.role != "revadmin") {
                            if (user.domain) {
                              user.domain = user.domain + "," + res.name;
                            } else {
                              user.domain = res.name;
                            }

                            user.updateAttributes(user, function(err, record) {
                              if (err) {
                                console.log("errors----")
                              } else {
                                console.log("saved details----")
                              }
                            });
                          }
                        }
                      });
                      console.log("DOMAIN CREATE SUCCESS LOOP");
                      var isEmptyBPPolicyUrl = false;
                      var isEmptyCOPolicyUrl = false;

                      //Creating the new stats
                      //statsSave(req.body.name);

                      if (stat_init == "") {
                        isEmptyBPPolicyUrl = true;
                      } else {
                        isEmptyBPPolicyUrl = false;
                      }

                      //Creating the updateDomainObj configuration
                      if (conf_init == "") {
                        isEmptyCOPolicyUrl = true;
                      } else {
                        isEmptyCOPolicyUrl = false;

                        //Creating the new configuration
                      }
                      addDomainsHeatMapJobDetails(req.body.name);
                      //Creating the new stats
                      statsSave(req.body.name);

                      if (!isEmptyBPPolicyUrl || !isEmptyCOPolicyUrl) {

                        masterConfigureSave(req.body, "add", req.body.stats_url, req.body.config_url, function(stat) {
                          //editDomainStatus(domain.name,true,"");
                          if (stat) {
                            revlogger.audit('Successfully created new domain "' + req.body.name + '" by user "' + user.email + '"');
                            send({
                              status: true,
                              response: "Domain created successfully"
                            });
                          } else {
                            send({
                              status: true,
                              response: "Unable to connect with Policy Controller. Will retry later."
                            });
                          }
                        });
                      }

                      if (!isEmptyBPPolicyUrl) {
                        //Creating the domain stats
                        domainStatsSave(req.body);
                      }

                      if (isEmptyBPPolicyUrl && isEmptyCOPolicyUrl) {
                        editDomainStatus(req.body.name, true, "Success");
                        masterConfigureSave(req.body, "add", req.body.stats_url, req.body.config_url, function(stat) {
                          //editDomainStatus(domain.name,true,"");
                          if (stat) {
                            send({
                              status: true,
                              response: "Domain created successfully"
                            });
                          } else {
                            send({
                              status: true,
                              response: "Unable to connect with Policy Controller. Will retry later."
                            });
                          }
                        });
                        //send({ status:true,response:"Domain has been created successfully" });
                      }

                    }
                  });
                  //send({ status:true,response:"Domain created successfully" });                             
                }
              }
            }
          });
        } else {
          send({
            status: false,
            response: "Please send a valid user to create the domain"
          });
        }
      }
    });
  }
};

function validateCubeUrl(url) {
  var evalutoryUrl = url;

  // for checking url contains
  var regex = /^http([s]?):\/\/.*/;

  if (!(regex.test(url))) {
    evalutoryUrl = "http://" + evalutoryUrl;
  }

  //for checking url contains port number
  var arr = new Array();
  arr = evalutoryUrl.split(":");

  if (arr.length > 2) {} else {
    //error block
    //return "false";
  }

  // for checking url contains slash
  if (evalutoryUrl.slice(-1) != '/') {
    evalutoryUrl += "/";
  }
  return evalutoryUrl;
}

/**
 * This function is used to get the Policy Urls list(with ports)
 */
var getPolicyUrls = function(stats_url, co_urls, callback) {
  var configUrls = "";
  var bp_list = new Array();
  var co_list = new Array();

  if (stats_url && stats_url != "") {
    bp_list = stats_url.split(",");
  }

  if (co_urls && co_urls != "") {
    co_list = co_urls.split(",");
  }

  for (var bp = 0; bp < bp_list.length; bp++) {
    if (bp_list[bp].indexOf(":8001") != -1) {
      bp_list[bp] = bp_list[bp].replace(":8001", "");
      bp_list[bp] = bp_list[bp] + ":8000";
    } else {
      bp_list[bp] = bp_list[bp] + ":8000";
    }
  }

  for (var co = 0; co < co_list.length; co++) {
    if (co_list[co].indexOf(":8000") == -1) {
      co_list[co] = co_list[co] + ":8000";
    }
  }

  if (co_urls != "" && stats_url != "") {
    configUrls = co_list.join() + "," + bp_list.join();
  } else {
    if (co_urls == "" && stats_url == "") {
      configUrls = "";
    } else {
      if (co_urls == "") {
        configUrls = bp_list.join();
      } else if (stats_url == "") {
        configUrls = co_list.join();
      }
    }
  }

  callback(configUrls);
};

/**
 * This function is used to get the bp & Co's list(with out ports)
 */
var getBpCoList = function(stats_url, co_urls, callback) {
  var bp_array = new Array();

  if (stats_url && stats_url != "") {
    bp_array = stats_url.split(",");
    for (var bp = 0; bp < bp_array.length; bp++) {
      bp_array[bp] = bp_array[bp].replace(/\s/g, "");
      bp_array[bp] = (bp_array[bp].split(":"))[0];
      /*if (bp_array[bp].indexOf(":8001") !=-1) {
          
      }*/
    }
  }
  //console.log("AAAAAAAAAA");
  var co_array = new Array();
  if (co_urls && co_urls != "") {
    co_array = co_urls.split(",");
    co_list = co_urls.split(",");

    for (var co = 0; co < co_array.length; co++) {
      co_array[co] = co_array[co].replace(/\s/g, "");
      co_array[co] = (co_array[co].split(":"))[0];
      /*              if (co_array[co].indexOf("8000") !=-1) {
                          co_array[co]=(co_array[co].split(":"))[0] //replace(":8000","");
                      }*/
      /*if (co_array[co].indexOf("8001") !=-1) {
          co_array[co]=co_array[co].replace(":8001","");
      }*/
    }
  }
  //console.log("STATS ASRRRRRR",bp_array, "CONF URL",co_array);
  callback(bp_array, co_array);
};

/**
 * Saving Master Configuration details
 */
var masterConfigureSave = function(req, oper, stats_url, co_urls, callback) {
  //console.log("Calling masterConfigureSave",req);
  var version = "1.0.5";

  var configJson = {};
  configJson.domain_name = req.name;
  configJson.version = version;

  if (req.origin_domain) {
    configJson.origin_domain = req.origin_domain;
  }
  configJson.operation = oper;

  if (oper != "delete") {
    console.log("masterConfigureSave non del");
    MasterConfiguration.findOne({
      where: {
        domainName: req.name
      }
    }, function(err, masterConfigObj) {
      //console.log("IN MAS CONF");

      if (err) {
        console.log("MASTER CONFIG ERR BLK", masterConfigObj.errors);
      }
      if (masterConfigObj) {
        console.log("masterConfigureSave update block");
        //for update domain
        var updConfigJson = {};
        updConfigJson = masterConfigObj.configurationJson;

        updConfigJson.version = version;
        if (req.origin_domain) {
          updConfigJson.origin_domain = req.origin_domain;
        }

        updConfigJson.origin_server = req.origin_server;
        updConfigJson.operation = oper;
        if (req.rum_beacon_url) {
          updConfigJson.rev_component_co.rum_beacon_url = req.rum_beacon_url;
        }

        //if(req.config_command_options && req.config_command_options!=""){
        updConfigJson.config_command_options = req.config_command_options;
        //}

        //if(req.co_apache_custom_config && req.co_apache_custom_config!=""){
        var keep_alive = updConfigJson.rev_component_co.co_apache_custom_config.split(" ");
        //updConfigJson.rev_component_co.co_apache_custom_config = keep_alive[0]+" "+keep_alive[1]+" "+"\n"+req.co_apache_custom_config;
        var cust_config = req.co_apache_custom_config != undefined ? " " + "\n" + req.co_apache_custom_config : "";
        updConfigJson.rev_component_co.co_apache_custom_config = keep_alive[0] + " " + keep_alive[1] + cust_config;
        //}

        //if(req.bp_apache_custom_config && req.bp_apache_custom_config!=""){

        updConfigJson.rev_component_bp.bp_apache_custom_config = req.bp_apache_custom_config;
        //}
        updConfigJson.rev_component_bp.bp_apache_fe_custom_config = req.bp_apache_fe_custom_config;


        if (updConfigJson.rev_component_bp.cache_bypass_locations == undefined) {
          updConfigJson.rev_component_bp.cache_bypass_locations = [];
        }

        if (updConfigJson.rev_component_bp.acl == undefined) {
          updConfigJson.rev_component_bp.acl = {
            "enabled": false,
            "action": "deny_except",
            "acl_rules": [{
              "host_name": "",
              "subnet_mask": "",
              "country_code": "",
              "header_name": "",
              "header_value": ""
            }]
          };
        }

        if (updConfigJson.rev_component_co.rev_custom_json == undefined) {
          updConfigJson.rev_component_co.rev_custom_json = {};
        }

        if (updConfigJson.rev_component_bp.rev_custom_json == undefined) {
          updConfigJson.rev_component_bp.rev_custom_json = {};
        }

        if (updConfigJson.rev_custom_json == undefined) {
          updConfigJson.rev_custom_json = {};
        }

        getBpCoList(stats_url, co_urls, function(bp_array, co_array) {
          updConfigJson.bp_list = bp_array;
          updConfigJson.co_list = co_array;
          //if(req.role=="revadmin") {
          if (req.co_cnames && req.co_cnames != undefined) {
            updConfigJson.co_cnames = req.co_cnames.split(",");
          } else {
            updConfigJson.co_cnames = [];
          }
          //}

          masterConfigObj.updateAttributes(updConfigJson, function(err, config) {
            if (err) {
              console.log("Unable to update master config details");
              callback(false);
            } else {
              console.log("configure json updated successfully");

              getPolicyUrls(stats_url, co_urls, function(configUrls) {
                if (configUrls == "") {
                  callback(true);
                } else {
                  //console.log("configUrls is ",configUrls);
                  if (configUrls && configUrls != "" && configUrls != undefined) {
                    configureWS(configUrls, updConfigJson, function(stat) {
                      callback(stat);
                    });
                  } else {
                    callback(true);
                  }
                }
              });
            }
          });
        });
        /**/
      } else {
        //console.log("masterConfigureSave add block");
        //for add domain
        //configJson.domain_name = req.name;
        //configJson.origin_domain = req.origin_domain;
        configJson.origin_server = req.origin_server;
        configJson.origin_protocol = "https-only";

        //configJson.operation = req.oper;
        configJson.config_command_options = req.config_command_options;
        configJson["3rd_party_rewrite"] = {
            "enable_3rd_party_rewrite": false,
            "3rd_party_urls": "",
            "enable_3rd_party_runtime_rewrite": false,
            "3rd_party_runtime_domains": "",
            "enable_3rd_party_root_rewrite": false,
            "3rd_party_root_rewrite_domains": ""
          }
          //for revcomponents
        var rev_component = {};
        if (req.co_apache_custom_config) {
          rev_component.co_apache_custom_config = "ProxyTimeout 300 \n" + req.co_apache_custom_config;
        } else {
          rev_component.co_apache_custom_config = "ProxyTimeout 300";
        }
        rev_component.enable_rum = true;
        rev_component.rum_beacon_url = req.rum_beacon_url;
        rev_component.enable_optimization = false;
        rev_component.mode = 'moderate';
        rev_component.img_choice = 'medium';
        rev_component.js_choice = 'medium';
        rev_component.css_choice = 'medium';
        configJson.rev_component_co = rev_component;

        //for rev trafic manager
        var rev_traffic_mgr = {};
        rev_traffic_mgr.tier = "SILVER";
        rev_traffic_mgr.page_views = "40M";
        rev_traffic_mgr.transfer_size = "160 TB";
        rev_traffic_mgr.overage = 30;
        rev_traffic_mgr.apdex_threshold_ms = 2000;
        configJson.rev_traffic_mgr = rev_traffic_mgr;

        //for rev component bp
        var rev_component_bp = {};

        if (req.bp_apache_custom_config) {
          rev_component_bp.bp_apache_custom_config = req.bp_apache_custom_config;
        } else {
          rev_component_bp.bp_apache_custom_config = "";
        }

        if (req.bp_apache_fe_custom_config) {
          rev_component_bp.bp_apache_fe_custom_config = req.bp_apache_fe_custom_config;
        } else {
          rev_component_bp.bp_apache_fe_custom_config = "";
        }
        //rev_component_bp.bp_apache_custom_config = req.bp_apache_custom_config;

        rev_component_bp.enable_cache = true;
        rev_component_bp.block_crawlers = false;

        rev_component_bp.cache_opt_choice = "Rev CDN";
        rev_component_bp.cdn_overlay_urls = [];

        //for default caching rule          
        var default_caching_rule = {};
        default_caching_rule.version = 1;
        default_caching_rule.url = {
          "is_wildcard": true,
          "value": "**"
        };
        default_caching_rule.edge_caching = {
          "override_origin": false,
          "new_ttl": 0,
          "override_no_cc": false
        };
        default_caching_rule.browser_caching = {
          "override_edge": false,
          "new_ttl": 0,
          "force_revalidate": false
        };

        default_caching_rule.cookies = {
          "override": false,
          "ignore_all": false,
          "list_is_keep": false,
          "keep_or_ignore_list": [],
          "remove_ignored_from_request": false,
          "remove_ignored_from_response": false
        };
        //rev_component_bp.default_caching_rule = default_caching_rule;

        //for caching rules     
        var caching_rules = [];
        caching_rules[0] = default_caching_rule;
        rev_component_bp.caching_rules = caching_rules;
        rev_component_bp.enable_security = true;
        rev_component_bp.web_app_firewall = "off";
        rev_component_bp.ssl_certificates = "rev_certs";
        rev_component_bp.certificate_urls = [];
        rev_component_bp.acl = {
          "enabled": false,
          "action": "deny_except",
          "acl_rules": [{
            "host_name": "",
            "subnet_mask": "",
            "country_code": "",
            "header_name": "",
            "header_value": ""
          }],
        };
        rev_component_bp.cache_bypass_locations = [];

        configJson.rev_component_bp = rev_component_bp;

        //console.log("$$$$$$$$$$$$###########");
        getBpCoList(stats_url, co_urls, function(bp_array, co_array) {
          configJson.bp_list = bp_array;
          configJson.co_list = co_array;
          configJson.co_cnames = "";
          if (req.co_cnames && req.co_cnames != undefined) {
            configJson.co_cnames = req.co_cnames.split(",");
          }

          //console.log("masterConfigureSave add block json", configJson);

          var masterConfig = new MasterConfiguration();

          masterConfig.domainName = req.name;
          masterConfig.configurationJson = configJson;

          masterConfig.save(function(err, config) {
            if (err) {
              console.log("Unable to save master config details");
              callback(false);
            } else {
              console.log("configure json saved successfully");

              getPolicyUrls(stats_url, co_urls, function(configUrls) {
                if (configUrls == "") {
                  callback(true);
                } else {
                  //console.log("configUrls is ",configUrls);
                  if (configUrls && configUrls != "" && configUrls != undefined) {
                    configureWS(configUrls, configJson, function(stat) {
                      callback(stat);
                    });
                  } else {
                    callback(true);
                  }
                }
              });
            }
          });
        });
      }
    });
  } else {
    //for delete domain
    MasterConfiguration.findOne({
      where: {
        domainName: req.name
      }
    }, function(err, masterConfObj) {
      if (err) {
        console.log("Unable to find Config details");
        callback(false);
      } else {
        if (masterConfObj) {
          masterConfObj.destroy(function(err, res) {
            if (err) {
              console.log("Unable to remove Config details");
              callback(false);
            } else {
              //console.log("Config details deleted successfully");
              getPolicyUrls(stats_url, co_urls, function(configUrls) {
                if (configUrls == "") {
                  callback(true);
                } else {
                  configureWS(configUrls, configJson, function(stat) {
                    callback(stat);
                  });
                }
              });
            }
          });
        } else {
          callback(false);
        }
      }
    });
  }
};

/**
 * Saving the domain configure details
 */
var configureSave = function(req, oper, callback) {
  //console.log("Calling configureSave >>>>>");
  Configure.findOne({
    where: {
      domainName: req.name
    }
  }, function(err, configObj) {
    if (configObj) {
      //console.log("Configure ***********");
      configObj.operation = oper;
      if (req.origin_domain) {
        configObj.origin_domain = req.origin_domain;
      }
      if (req.rum_beacon_url) {
        configObj.rum_beacon_url = req.rum_beacon_url;
      }
      prepareWSConfigJson(req.config_url, req.stats_url, req.co_cnames, configObj, function(stat) {
        callback(stat);
      });
    } else {
      //console.log("Configure ELSE ***********");
      var configure = new Configure();
      configure.domainName = req.name;

      var tfJson = {};
      tfJson.tier = "SILVER";
      configure.traffic = trafficJson(true, tfJson);

      var cnJson = {};
      cnJson.enable_optimization = true;
      configure.content = contentJson(true, cnJson);

      var ccJson = {};
      ccJson.enable_cache = true;
      configure.cache = cacheJson(true, ccJson);

      var scJson = {};
      scJson.enable_security = true;
      configure.security = securityJson(true, scJson);
      //console.log("CONFIG OBJ",configure);

      configure.save(function(err, config) {
        if (err) {
          console.log("domain configure creation errors");
        } else {
          console.log("configure created successfully");

          config.operation = "add";
          if (req.origin_domain) {
            config.origin_domain = req.origin_domain;
          }
          if (req.rum_beacon_url) {
            config.rum_beacon_url = req.rum_beacon_url;
          }
          prepareWSConfigJson(req.config_url, req.stats_url, req.co_cnames, config, function(stat) {
            callback(stat);
          });
        }
      });
    }
  });
};

/**
 *Saving the domain stats details 
 */
var statsSave = function(domainName) {
  //console.log("Came in to the Stats Save",domainName);
  if (domainName) {
    var stats = new Stats();
    stats.domain_name = domainName;
    var revComponent = {};
    revComponent.node_info = "85";
    revComponent.page_count = "2";
    revComponent.bytes_count = "80";
    revComponent.attack_count = "260";
    revComponent.time_stamp = "150";
    revComponent.page_load_time = "150";
    revComponent.system_health = "150";
    stats.rev_component = revComponent;
    stats.save(function(err, res) {
      if (err) {
        console.log("domain stats creation errors");
        console.log("ERR", res.errors);
      } else {
        console.log("stats created successfully");
      }
    });
  }
};

/**
 *Storing the stats url with domains for doing the cron job 
 */
var domainStatsSave = function(data) {
  console.log("calling domainStatsSave >>>>");
  var stats_array = new Array();
  if (data.stats_url) {
    stats_array = data.stats_url.split(",");
  }
  var i = 0;
  storeData();

  function storeData() {
    if (i < stats_array.length) {
      if (stats_array[i].indexOf(":8001") != -1) {
        stats_array[i] = stats_array[i];
      } else {
        stats_array[i] = stats_array[i] + ":8001";
      }
      checkDomainStats(stats_array[i], data.name, function(value) {
        if (value) {
          var domainStats = new DomainStats();
          domainStats.stats_url = stats_array[i];
          var domainArray = [];
          domainArray.push(data.name);
          domainStats.domains = domainArray;
          domainStats.save(function(err, res) {
            if (err) {
              console.log("Domain Stats error");
            } else {
              console.log("Domain Stats Created");
              i++;
              storeData();
            }
          });
        } else {
          i++;
          console.log("came into checkdomainSattus");
          storeData();
        }
      });
    }
  }
};

/**
 *Checking the domain is available or not. If there updating the domains array with new domainName. 
 */
var checkDomainStats = function(statsIp, domainName, callback) {
  DomainStats.findOne({
    where: {
      stats_url: statsIp
    }
  }, function(err, domainStatsObj) {
    if (err) {
      callback(false);
    } else if (domainStatsObj) {
      if (domainStatsObj.domains.indexOf(domainName) == -1) {
        domainStatsObj.domains.push(domainName);
      }
      domainStatsObj.updateAttributes(domainStatsObj, function(err, record) {
        if (err) {
          console.log("domain stats updated errors");
        } else {
          console.log("domain stats updated successfully");
        }
      });
      callback(false);
    } else {
      callback(true);
    }
  });
};

/**
 * Removing the domain values from old stats array
 */
var removeStatsDomainData = function(old_stats_array, new_stats_array, domainName) {
  //console.log("Came in to the removeStatsDomainData--->>>");
  getOldArray(old_stats_array, new_stats_array, function(array) {
    //console.log("array--->>>");
    if (array.length > 0) {
      var i = 0;
      removeDomain();

      function removeDomain() {
        if (i < array.length) {
          //console.log("each array--->>>>");
          DomainStats.findOne({
            where: {
              stats_url: array[i]
            }
          }, function(err, domainStatsObj) {
            //console.log("domainStatsObj--->>>");
            if (domainStatsObj) {
              var val = domainStatsObj.domains.indexOf(domainName);
              if (val != -1) {
                domainStatsObj.domains.splice(val, 1);
              }

              domainStatsObj.updateAttributes(domainStatsObj, function(err, record) {
                if (err) {
                  console.log("domain stats updated errors");
                } else {
                  console.log("domain stats updated successfully");
                }
                i++;
                removeDomain();
              });
            } else {
              i++;
              removeDomain();
            }
          });
        }
      }
    }
  });
};

var getOldArray = function(old_stats_array, new_stats_array, callback) {
  //console.log("getOldArray");
  for (var i = 0; i < new_stats_array.length; i++) {
    for (var j = 0; j < old_stats_array.length; j++) {
      if (old_stats_array[j] == new_stats_array[i]) {
        var val = old_stats_array.indexOf(new_stats_array[i]);
        if (val != -1) {
          old_stats_array.splice(val, 1);
        }
      }
    }
  }
  callback(old_stats_array);
};

/**
 * Service used to update the domain details
 */
action('update', function() {
  data = req.body;
  Domain.findOne({
    where: {
      name: data.name
    }
  }, function(err, dom) {
    if (dom) {
      if (data.name && (req.body.companys || req.body.companyId)) {
        if (req.body.companys) {
          data.companyId = req.body.companys;
        }

        if (req.body.role && (req.body.role == "reseller" || req.body.role == "admin")) {
          req.body.BPGroup = dom.BPGroup;
          req.body.COGroup = dom.COGroup;
          req.body.config_url = dom.config_url.replace(":8000", "");
          req.body.co_cnames = dom.co_cnames;
          req.body.config_command_options = dom.config_command_options;
          req.body.bp_apache_custom_config = dom.bp_apache_custom_config;
          req.body.bp_apache_fe_custom_config = dom.bp_apache_fe_custom_config;
          req.body.co_apache_custom_config = dom.co_apache_custom_config;

          req.body.cube_url = dom.cube_url;
          req.body.rum_beacon_url = dom.rum_beacon_url;
          req.body.stats_url = dom.stats_url.replace(":8001", "");
          if (req.body.config_url_type != '' && req.body.config_url_type != 'undefined') {
            req.body.COGroup = req.body.config_url_type;
            getServerUrls(req.body.COGroup, "CO", function(urls, cnames) {
              req.body.config_url = urls;
              req.body.config_url = req.body.config_url.replace(/\s/g, "");
              req.body.co_cnames = cnames;
              update_domain_extension(req.body);
            });
          } else {
            update_domain_extension(req.body);
          }


          /**getRumDetails(function(urls){
              req.body.cube_url = urls.evalutor_url;
              req.body.cube_url = req.body.cube_url.replace(/\s/g, "");
              req.body.rum_beacon_url = urls.rum_url;
              req.body.rum_beacon_url = req.body.rum_beacon_url.replace(/\s/g, "");
              getServerUrls("BP",function(urls){
                  req.body.stats_url = urls;
                  req.body.stats_url = req.body.stats_url.replace(/\s/g, "");
                  getServerUrls("CO",function(urls){
                      req.body.config_url = urls;
                      req.body.config_url = req.body.config_url.replace(/\s/g, "");
                      update_domain_extension(req.body);
                  });
              });
          });*/
        } else {
          req.body.cube_url = req.body.cube_url.replace(/\s/g, "");
          req.body.rum_beacon_url = req.body.rum_beacon_url.replace(/\s/g, "");
          req.body.stats_url = req.body.stats_url.replace(/\s/g, "");
          req.body.config_url = req.body.config_url.replace(/\s/g, "");
          update_domain_extension(req.body);
        }
      } else {
        send({
          status: false,
          response: "Please send valid details"
        });
      }
    } else {
      send({
        status: true,
        response: "This domain has been deleted by someother user."
      });
    }
  });
});

var update_domain_extension = function(data) {
  var req = {};
  req.body = data;

  var evalUrl = validateCubeUrl(req.body.cube_url);
  if (evalUrl == 'false') {
    send({
      status: false,
      response: "Please Enter valid Evalutor Url"
    });
  } else {
    req.body.cube_url = evalUrl;

    req.body.name = req.body.name.replace(/\s/g, "");

    req.body.origin_domain = req.body.origin_domain.replace(/\s/g, "");

    if (req.body.webpagetest_url) {
      req.body.webpagetest_url = req.body.webpagetest_url.replace(/\s/g, "");
    }

    req.body.rum_beacon_url = req.body.rum_beacon_url.replace(/\s/g, "");

    if (req.body.stats_url) {
      req.body.stats_url = req.body.stats_url.replace(/\s/g, "");
    }

    if (req.body.config_url) {
      req.body.config_url = req.body.config_url.replace(/\s/g, "");
    }

    req.body.tolerance = req.body.tolerance.replace(/\s/g, "");

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
        if (user && user.role != "user") {
          //Checking the domain already in the collection or not
          Domain.findOne({
            where: {
              name: data.name
            }
          }, function(err, domain) {
            if (err) {
              send({
                status: false,
                response: domain.errors
              });
            } else {
              var old_stats_array = new Array();
              old_stats_array = domain.stats_url.split(",");
              if (domain && domain.status) {

                if (req.body.stats_url) {
                  var stat_init = req.body.stats_url;

                  var new_stats_array = new Array();
                  new_stats_array = req.body.stats_url.split(",");
                  removeStatsDomainData(old_stats_array, new_stats_array, data.name);

                  var bp_urls = "";
                  var bp_array = new Array();
                  bp_array = req.body.stats_url.split(",");

                  if (req.body.stats_url != "") {
                    for (var bp = 0; bp < bp_array.length; bp++) {
                      bp_array[bp] = bp_array[bp] + ":8001";
                    }
                  }

                  bp_urls = bp_array.join();

                  data.stats_url = bp_urls;
                }


                if (req.body.config_url) {
                  var conf_init = req.body.config_url;

                  var co_urls = "";
                  var co_array = new Array();
                  co_array = req.body.config_url.split(",");

                  if (req.body.config_url != "") {
                    for (var co = 0; co < co_array.length; co++) {
                      co_array[co] = co_array[co] + ":8000";
                    }
                  }

                  co_urls = co_array.join();
                  data.config_url = co_urls;
                }

                if (req.body.co_cnames) {
                  data.co_cnames = req.body.co_cnames;
                }

                domain.updateAttributes(data, function(err, record) {
                  if (err) {
                    send({
                      status: false,
                      response: record.errors
                    });
                  } else {
                    var isEmptyBPPolicyUrl = false;
                    var isEmptyCOPolicyUrl = false;

                    if (stat_init == "") {
                      isEmptyBPPolicyUrl = true;
                    } else {
                      isEmptyBPPolicyUrl = false;
                      //domainStatsSave(req.body);
                    }
                    if (conf_init == "") {
                      isEmptyCOPolicyUrl = true;
                    } else {
                      isEmptyCOPolicyUrl = false;
                      //console.log("configure else block----->");
                      //Need to call configure
                    }

                    if (!isEmptyBPPolicyUrl || !isEmptyCOPolicyUrl) {
                      masterConfigureSave(req.body, "add", req.body.stats_url, req.body.config_url, function(stat) {
                        if (stat) {
                          revlogger.audit('Successfully updated domain "' + domain.name + '" by user "' + user.email + '"');
                          send({
                            status: true,
                            response: "Domain has been updated successfully"
                          });
                        } else {
                          send({
                            status: true,
                            response: "Unable to connect with Policy Controller. Will retry later."
                          });
                        }
                      });
                    }

                    if (!isEmptyBPPolicyUrl) {
                      //Creating the domain stats
                      domainStatsSave(req.body);
                    }

                    if (isEmptyBPPolicyUrl && isEmptyCOPolicyUrl) {
                      masterConfigureSave(req.body, "add", req.body.stats_url, req.body.config_url, function(stat) {
                        if (stat) {
                          revlogger.audit('Successfully updated domain "' + domain.name + '" by user "' + user.email + '"');
                          send({
                            status: true,
                            response: "Domain has been updated successfully"
                          });
                        } else {
                          send({
                            status: true,
                            response: "Unable to connect with Policy Controller. Will retry later."
                          });
                        }
                      });
                      //send({ status:true, response : "Domain has been updated successfully" });
                    }

                    //send({ status:true, response : "Domain has been updated successfully" });
                  }
                });
              } else {
                //send({ status:false, response : "Please send a valid domain to update" });

                send({
                  status: true,
                  response: "This domain has been deleted by some other user"
                });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "Please send a valid user to update the domain"
          });
        }
      }
    });

  }
};

action('list', function() {
  //console.log("getting the all domains");
  //Retrieving the all domains list 
  Domain.all({
    where: {
      status: true
    },
    order: 'name:ASC'
  }, function(err, domains) {
    if (err) {
      send({
        status: false,
        response: domains.errors
      });
    } else {
      if (domains.length > 0) {
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          if (i < domains.length) {
            if (domains[i].name.toString()) {

              var bp_arr = new Array();
              if (domains[i].stats_url)
                bp_arr = domains[i].stats_url.split(",");

              var co_arr = new Array();
              if (domains[i].config_url)
                co_arr = domains[i].config_url.split(",");

              var bp = 0;
              var co = 0;
              if (domains[i].stats_url == "") {
                removePortFromConfig();
              } else {
                removePortFromStats();
              }

              function removePortFromStats() {
                if (domains[i].stats_url != "" && bp < bp_arr.length) {
                  if (bp_arr[bp].toString()) {
                    bp_arr[bp] = bp_arr[bp].replace(":8001/", "");
                    bp_arr[bp] = bp_arr[bp].replace(":8001", "");
                    bp++;
                    removePortFromStats();
                  }
                } else {
                  domains[i].stats_url = bp_arr.join();
                  removePortFromConfig();
                }
              }

              function removePortFromConfig() {
                if (domains[i].config_url != "" && co < co_arr.length) {
                  if (co_arr[co].toString()) {
                    co_arr[co] = co_arr[co].replace(":8000/", "");
                    co_arr[co] = co_arr[co].replace(":8000", "");
                    co++;
                    removePortFromConfig();
                  }
                } else {
                  domains[i].config_url = co_arr.join();
                  if (domains[i].sync_status && domains[i].sync_status == "Sync Failed") {
                    getSyncFailedIps();
                  } else {
                    domains[i].sync_failed_ips = "";
                    i++;
                    iterateDomains();
                  }
                }
              }

              function getSyncFailedIps() {
                SyncFailed.all({
                  where: {
                    domainName: domains[i].name
                  }
                }, function(err, sync) {
                  if (err) {
                    i++;
                    iterateDomains();
                    //send({ status: false, response: sync.errors });
                  } else {
                    //domains[i].sync_status="Failed : 1234";
                    //domains[i].sync_failed_ips="1234";

                    if (sync.length > 0) {
                      var ips = [];
                      for (var sf = 0; sf < sync.length; sf++) {
                        //ips.push(sync[sf].ip);
                        ips.push(sync[sf].ip.split(":")[0]);
                      }
                      ips = uniqueArr(ips);

                      domains[i].sync_failed_ips = ips.join(",");
                    }
                    i++;
                    iterateDomains();
                  }
                });
              }
            }
          } else {
            User.findOne({
              where: {
                email: req.body.email.toLocaleLowerCase()
              }
            }, function(err, requestedUser) {
              if (err) {
                send({
                  status: false,
                  response: requestedUser.errors
                });
              } else {
                if (requestedUser && requestedUser.status) {
                  if (requestedUser.companyId) {
                    var u_len = 0,
                      domainsList = [];
                    get_domains_list_comp();

                    function get_domains_list_comp() {
                      if (u_len < domains.length) {
                        comp_array = requestedUser.companyId.split(",");
                        if (in_array(domains[u_len].companyId, comp_array)) {
                          domainsList.push(domains[u_len]);
                        }
                        u_len++;
                        get_domains_list_comp();
                      } else {
                        send({
                          status: true,
                          response: domainsList
                        });
                      }
                    }
                  } else {
                    if (req.body.role == "reseller") {
                      send({
                        status: true,
                        response: []
                      });
                    } else {
                      send({
                        status: true,
                        response: domains
                      });
                    }
                  }
                }
              }
            });

          }
        }
      } else {
        send({
          status: false,
          response: "No Domains Exist"
        });
      }
    }
  });
});

var in_array = function(needle, haystack, argStrict) {
  var key = '',
    strict = !!argStrict;

  if (strict) {
    for (key in haystack) {
      if (haystack[key] === needle) {
        return true;
      }
    }
  } else {
    for (key in haystack) {
      if (haystack[key] == needle) {
        return true;
      }
    }
  }
  return false;
}

function uniqueArr(a) {
  return a.sort().filter(function(item, pos) {
    return !pos || item != a[pos - 1];
  })
}

action('names', function() {
  console.log("getting the all domain names");
  //Retrieving the all domains names list 
  Domain.all({
    where: {
      status: true
    },
    order: 'name:ASC'
  }, function(err, domains) {
    //Domain.all({where:{status:true}},function(err,domains){
    if (err) {
      send({
        status: false,
        response: domains.errors
      });
    } else {
      var domainNames = [];
      if (domains.length > 0) {
        //for(var i=0; i<domains.length; i++){
        // domainNames.push(domains[i].name);
        //}
        var dn_len = 0,
          dnameList = [];
        get_domainNames_list_comp();

        function get_domainNames_list_comp() {
          if (dn_len < domains.length) {
            if (req.body.companyId) {
              comp_array = req.body.companyId.split(",");
              if (in_array(domains[dn_len].companyId, comp_array)) {
                dnameList.push(domains[dn_len].name);
              }
            } else {
              if (req.body.companyId == "")
                dnameList.push(domains[dn_len].name);
            }
            dn_len++;
            get_domainNames_list_comp();
          } else {
            send({
              status: true,
              response: dnameList
            });
          }
        }
      } else {
        send({
          status: false,
          response: "No Domains Exist"
        });
      }
    }
  });
});


/**
 * Service used to delete the domain 
 */
action("delete", function() {
  data = req.body;
  if (data.name) {
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
        if (user && user.role != "user") {
          Domain.findOne({
            where: {
              name: data.name
            }
          }, function(err, domain) {
            if (err) {
              send({
                status: false,
                response: domain.errors
              });
            } else {
              if (domain && domain.status) {
                domain.status = false;
                domain.updateAttributes(data, function(err, result) {
                  if (err) {
                    send({
                      status: false,
                      response: result.errors
                    });
                  } else {
                    //For deleting domain from users list
                    upd_domain_in_user_list(data.name);

                    // For deleting domain from heatMapJobDetails list
                    rem_domain_in_heatmapJobDet(data.name);

                    //For removing domain from DomainStats
                    var stats_array = new Array();
                    if (domain.stats_url && domain.stats_url != "" && domain.stats_url != undefined) {
                      stats_array = domain.stats_url.split(",");
                    }

                    if (domain.stats_url == "") {} else {
                      removeDomainFromStatsDomain(stats_array, domain.name);
                    }

                    var config = {};
                    config.domainName = domain.name;
                    config.operation = "delete";
                    if (domain.origin_domain) {
                      config.origin_domain = domain.origin_domain;
                    }
                    if (domain.rum_beacon_url) {
                      config.rum_beacon_url = domain.rum_beacon_url;
                    }

                    var isEmptyBPPolicyUrl = false;
                    var isEmptyCOPolicyUrl = false;

                    if (domain.stats_url == "") {
                      isEmptyBPPolicyUrl = true;
                    } else {
                      isEmptyBPPolicyUrl = false;
                    }

                    if (domain.config_url == "") {
                      isEmptyCOPolicyUrl = true;
                    } else {
                      isEmptyCOPolicyUrl = false;
                    }

                    if (!isEmptyBPPolicyUrl || !isEmptyCOPolicyUrl) {
                      /**prepareWSConfigJson(domain.config_url,domain.stats_url,domain.co_cnames,config,function(stat) {
                       if(stat) {
                        send({status:true, response:"Domain deleted successfully"});
                       } else {
                        //editDomainStatus( domain.name,true);
                        send({ status:true, response : "Unable to connect with Policy Controller. Will retry later." });
                       }
                      });*/

                      masterConfigureSave(domain, "delete", domain.stats_url, domain.config_url, function(stat) {
                        if (stat) {
                          domain.destroy(function(err, res) {
                            if (err) {
                              send({
                                status: false,
                                response: res.errors
                              });
                            } else {
                              revlogger.audit('Successfully deleted domain "' + domain.name + '" by user "' + user.email + '"');
                              send({
                                status: true,
                                response: "Domain deleted successfully"
                              });
                            }
                          });
                        } else {
                          //editDomainStatus( domain.name,true);
                          send({
                            status: true,
                            response: "Unable to connect with Policy Controller. Will retry later."
                          });
                        }
                      });
                    }

                    if (isEmptyBPPolicyUrl && isEmptyCOPolicyUrl) {
                      domain.destroy(function(err, res) {
                        if (err) {
                          send({
                            status: false,
                            response: res.errors
                          });
                        } else {
                          send({
                            status: true,
                            response: "Domain deleted successfully"
                          });
                        }
                      });
                    }
                  }
                });
              } else {
                //send({status:false,response:"Unable to find the domain"});
                send({
                  status: true,
                  response: "This domain has been deleted by some other user"
                });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "Please send a valid user to delete domain"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Please send the valid details"
    });
  }
});

/**
 * This function is used to delete the domain from DomainStats
 */
var removeDomainFromStatsDomain = function(stats_array, domainName) {
  //console.log("Came in to the removeDomainFromStatsDomain <<<--->>>");

  if (stats_array.length > 0) {
    var i = 0;
    removeDomain();

    function removeDomain() {
      if (i < stats_array.length) {
        //console.log("each array--->>>>");
        DomainStats.findOne({
          where: {
            stats_url: stats_array[i]
          }
        }, function(err, domainStatsObj) {
          //console.log("domainStatsObj--->>>");
          var val = domainStatsObj.domains.indexOf(domainName);
          if (val != -1) {
            domainStatsObj.domains.splice(val, 1);
          }
          domainStatsObj.updateAttributes(domainStatsObj, function(err, record) {
            if (err) {
              console.log("domain stats updated errors");
            } else {
              console.log("domain stats updated successfully");
            }
            i++;
            removeDomain();
          });
        });
      }
    }
  }
};

/*
 *function to removedomain record form heatmapjobdetails collection
 */
var rem_domain_in_heatmapJobDet = function(d_name) {
  HeatMapJobDetail.findOne({
    where: {
      domainName: d_name
    }
  }, function(err, heat_dom) {
    if (err) {
      console.log("Could not find record with the domain name", heat_dom.errors);
    } else {
      heat_dom.destroy(function(err, h_det) {
        if (err) {
          console.log("Unable to find the doamin in the collection.");
        } else {
          console.log("Domain successfully removed from heatMap JobDetails collection.");
        }
      });
    }
  });
};

/**
 * Service used to update the domain network settings 
 */
action('settings', function() {
  //console.log("Came in to the domain settings");
  data = req.body;
  if (data.email && data.domain && data.hasOwnProperty("network")) {
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
        if (user && user.role === "revadmin") {
          Domain.findOne({
            where: {
              name: data.domain
            }
          }, function(err, domain) {
            if (err) {
              send({
                status: false,
                response: domain.errors
              });
            } else {
              if (domain && domain.status) {
                domain.nt_status = data.network;
                domain.updateAttributes(domain, function(err, result) {
                  if (err) {
                    send({
                      status: false,
                      response: result.errors
                    });
                  } else {
                    send({
                      status: true,
                      response: "Settings updated successfully"
                    });
                  }
                });
              } else {
                send({
                  status: false,
                  response: "Unable to find the domain"
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
      response: "Please send valid details"
    });
  }
});


/**
 * Service used to sending the domains network settings 
 */
action('getSettings', function() {
  //console.log("getting the all domain names");
  //Retrieving the all domains names list 
  if (req.body.email) {
    User.findOne({
      where: {
        email: req.body.email
      }
    }, function(err, user) {
      if (err) {
        send({
          status: false,
          response: user.errors
        });
      } else {
        // && user.role === "revadmin"
        if (user) {
          Domain.findOne({
            where: {
              name: req.body.domain
            }
          }, function(err, domain) {
            if (err) {
              send({
                status: false,
                response: domains.errors
              });
            } else {
              if (domain && domain.status && (user.role === "user" || user.role === "admin")) {
                var settings = {};
                settings.network = domain.nt_status;
                send({
                  status: true,
                  response: settings
                });
              } else {
                send({
                  status: false,
                  response: "No Domains exist"
                });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "Please send a vaild user"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Please send valid details"
    });
  }
});

action('accordian_refresh', function() {
  if (req.body.domainName) {
    send({
      status: true,
      response: "validating the req"
    });
  } else {
    send({
      status: false,
      response: "Please send valid details"
    });
  }
});

/**
 * Service used to send he domain configuration settings 
 */
action('configure', function() {
  //console.log("Came in to the configure service");
  //console.log("body::",req.body);
  if (req.body.domainName) {
    Domain.findOne({
      where: {
        name: req.body.domainName
      }
    }, function(err, domain) {
      if (err) {
        send({
          status: false,
          response: domain.errors
        });
      } else {
        if (domain && domain.status) {
          MasterConfiguration.findOne({
            where: {
              domainName: req.body.domainName
            }
          }, function(err, config) {
            if (err) {
              send({
                status: false,
                response: config.errors
              });
            } else {
              send({
                status: true,
                response: config
              });
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
      response: "Please send valid details"
    });
  }
});

/**
 * Service used to update the domain configuration settings 
 */
action('updateConfigure', function() {
  //console.log("Came in to the update configuration service");
  if (req.body.domainName) {
    Domain.findOne({
      where: {
        name: req.body.domainName
      }
    }, function(err, domain) {
      if (err) {
        send({
          status: false,
          response: domai.enrrors
        });
      } else {
        if (domain && domain.status) {
          MasterConfiguration.findOne({
            where: {
              domainName: req.body.domainName
            }
          }, function(err, config) {
            if (err) {
              send({
                status: false,
                response: config.errors
              });
            } else {
              if (config) {
                config.domainName = req.body.domainName;

                // Fix for RP - 720 
                if (req.body.actType && req.body.actType != "domJson") {
                  /*req.body.configurationJson.origin_domain = config.configurationJson.origin_domain;
                  req.body.configurationJson.origin_server = config.configurationJson.origin_server;*/
                  req.body.configurationJson.config_command_options = config.configurationJson.config_command_options;

                  //req.body.configurationJson.rev_component_co.co_apache_custom_config = config.configurationJson.rev_component_co.co_apache_custom_config;
                  req.body.configurationJson.rev_component_co.rum_beacon_url = config.configurationJson.rev_component_co.rum_beacon_url;

                  req.body.configurationJson.rev_component_bp.bp_apache_custom_config = config.configurationJson.rev_component_bp.bp_apache_custom_config;
                  req.body.configurationJson.rev_component_bp.bp_apache_fe_custom_config = config.configurationJson.rev_component_bp.bp_apache_fe_custom_config;
                  req.body.configurationJson.bp_list = config.configurationJson.bp_list;
                  req.body.configurationJson.co_list = config.configurationJson.co_list;
                  req.body.configurationJson.co_cnames = config.configurationJson.co_cnames;
                }
                config.configurationJson = req.body.configurationJson;

                //Updating the config database with latest values 
                config.updateAttributes(config, function(err, result) {
                  if (err) {
                    console.log("config update error");
                    send({
                      status: false,
                      response: result.errors
                    });
                  } else {
                    console.log("Config details updated successfully");
                    req.body.configurationJson.operation = 'update';
                    getPolicyUrls(domain.stats_url, domain.config_url, function(configUrls) {

                      var masterConfJson = {};
                      if (configUrls == "") {
                        masterConfJson.response = "Configuration updated successfully";
                        masterConfJson.configurationJson = config.configurationJson;

                        send({
                          status: true,
                          response: masterConfJson
                        });
                      } else {
                        configureWS(configUrls, req.body.configurationJson, function(stat) {

                          if (stat) {
                            masterConfJson.response = "Configuration updated successfully";
                            masterConfJson.configurationJson = config.configurationJson;

                            send({
                              status: true,
                              response: masterConfJson
                            });
                          } else {
                            masterConfJson.response = "Unable to connect with Policy Controller. Will retry later.";
                            masterConfJson.configurationJson = config.configurationJson;
                            send({
                              status: true,
                              response: masterConfJson
                            });
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                send({
                  status: false,
                  response: "Unable to find the configuration"
                });
              }
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
      response: "Please send valid details"
    });
  }
});


/**
 * Method is used to send the prepare config json and sending to configureWS method
 * @param configUrls
 * @param config
 */
function prepareWSConfigJson(configUrls, statUrls, coNames, config, callback) {
  //console.log("Came in to the prepareWSConfigJson");
  var configWSJson = {};
  configWSJson.domain_name = config.domainName;
  if (config.origin_domain) {
    configWSJson.origin_domain = config.origin_domain;
  }
  configWSJson.operation = config.operation;
  if (config.operation != "delete") {
    var co = {};
    if (config.rum_beacon_url) {
      co.rum_beacon_url = config.rum_beacon_url;
    }
    co.enable_optimization = config.content.enable_optimization;
    co.mode = config.content.mode;
    co.img_choice = config.content.custom_img_choice;
    co.js_choice = config.content.custom_js_choice;
    co.css_choice = config.content.custom_css_choice;
    configWSJson.rev_component_co = co;
    var tfmgr = {};
    tfmgr.teir = config.traffic.tier;
    tfmgr.page_views = config.traffic.page_views;
    tfmgr.transfer_size = config.traffic.transfer_size;
    tfmgr.overage = config.traffic.overage;
    configWSJson.rev_traffic_mgr = tfmgr;
    var bp = {};
    bp.enable_cache = config.cache.enable_cache;
    bp.cache_opt_choice = config.cache.cache_opt_choice;
    bp.cdn_overlay_urls = config.cache.cdn_overlay_urls;
    bp.cache_life_months = config.cache.cache_life_months;
    bp.cache_life_days = config.cache.cache_life_days;
    bp.cache_life_hours = config.cache.cache_life_hours;
    bp.purge_now = config.cache.purge_now;
    bp.purge_reg_expression = config.cache.purge_reg_expression;
    bp.enable_security = config.security.enable_security;
    bp.web_app_firewall = config.security.web_app_firewall;
    bp.ssl_certificates = config.security.ssl_certificates;
    bp.certificate_urls = config.security.certificate_urls;
    configWSJson.rev_component_bp = bp;

    var co_list = new Array();
    var co_arr = new Array();

    if (configUrls && configUrls != "") {
      co_list = configUrls.split(",");
      co_arr = configUrls.split(",");

      for (var co = 0; co < co_list.length; co++) {
        if (co_list[co].indexOf(":8000") != -1) {
          co_list[co] = co_list[co].replace(":8000", "");
        }
      }

      for (var co = 0; co < co_arr.length; co++) {
        if (co_arr[co].indexOf(":8000") == -1) {
          co_arr[co] = co_arr[co] + ":8000";
        }
      }
    }

    configWSJson.co_list = co_list;

    var bp_list = new Array();
    var bp_arr = new Array();

    if (statUrls && statUrls != "") {
      bp_list = statUrls.split(",");
      bp_arr = statUrls.split(",");

      for (var bp = 0; bp < bp_list.length; bp++) {
        if (bp_list[bp].indexOf(":8001") != -1) {
          bp_list[bp] = bp_list[bp].replace(":8001", "");
        }
      }

      for (var bp = 0; bp < bp_arr.length; bp++) {
        if (bp_arr[bp].indexOf(":8001") != -1) {
          bp_arr[bp] = bp_arr[bp].replace(":8001", "");
          bp_arr[bp] = bp_arr[bp] + ":8000";
        } else {
          bp_arr[bp] = bp_arr[bp] + ":8000";
        }
      }
    }
    configWSJson.bp_list = bp_list;

    var co_names = new Array();

    if (coNames && coNames != "") {
      co_names = coNames.split(",");
    }

    configWSJson.co_cnames = co_names;

    if (configUrls != "" && statUrls != "") {
      configUrls = co_arr.join() + "," + bp_arr.join();
    } else {
      if (configUrls == "" && statUrls == "") {
        configUrls = "";
      } else {
        if (configUrls == "") {
          configUrls = bp_arr.join();
        } else if (statUrls == "") {
          configUrls = co_arr.join();
        }
      }
    }
  } else {
    var co_arr = new Array();

    if (configUrls && configUrls != "") {
      co_arr = configUrls.split(",");

      for (var co = 0; co < co_arr.length; co++) {
        if (co_arr[co].indexOf(":8000") == -1) {
          co_arr[co] = co_arr[co] + ":8000";
        }
      }
    }

    var bp_arr = new Array();

    if (statUrls && statUrls != "") {
      bp_arr = statUrls.split(",");

      for (var bp = 0; bp < bp_arr.length; bp++) {
        if (bp_arr[bp].indexOf(":8001") != -1) {
          bp_arr[bp] = bp_arr[bp].replace(":8001", "");
          bp_arr[bp] = bp_arr[bp] + ":8000";
        } else {
          bp_arr[bp] = bp_arr[bp] + ":8000";
        }
      }
    }
    if (configUrls != "" && statUrls != "") {
      configUrls = co_arr.join() + "," + bp_arr.join();
    } else {
      if (configUrls == "" && statUrls == "") {
        configUrls = "";
      } else {
        if (configUrls == "") {
          configUrls = bp_arr.join();
        } else if (statUrls == "") {
          configUrls = co_arr.join();
        }
      }
    }
  }
  //console.log("CONFIG URL",configUrls);
  //console.log("configWSJson---->>>",configWSJson);
  // Sending the data to policy controller

  configureWS(configUrls, configWSJson, function(stat) {
    callback(stat);
  });
}

/**
 * Service for running the corn job for every twenty minutes to resend the domain config data to BP & CO
 */
action("sync_failed_cron", function() {
  //console.log("SYNC FAILED CRON JOB <>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

  SyncFailed.all({
    where: {
      status: "connectFailed"
    }
  }, function(err, synFail) {
    //SyncFailed.all(function(err,synFail){
    if (err) {
      console.log("errors--->>>>");
    } else {

      var i = 0;
      sendConfigToPolicy();

      function sendConfigToPolicy() {
        if (i < synFail.length) {
          if (synFail[i].domainName.length > 0 && synFail[i].ip) {

            sendFailedConfigToPolicy(synFail[i].ip, synFail[i].configJson, synFail[i].operation, function(stat) {
              if (stat) {
                i++;
                sendConfigToPolicy();
              }
            });
          }
        }
      }
    }
  });
});

/**
 * This function is used to check the whether any instance picked the request or not
 */
var checkSyncFailedJobStatus = function(domain, ip, callback) {
  //connect away
  var mngoUrl = "";

  var url = "";
  if (config.portalMongo.full_connection_string && config.portalMongo.full_connection_string != "" && config.portalMongo.full_connection_string != undefined) {
    mngoUrl = config.portalMongo.full_connection_string;
  } else {
    if (config.portalMongo.is_replica_set) {
      var host = "";
      for (val in config.portalMongo.url) {
        var port = (config.portalMongo.port[val] == "" || config.portalMongo.port[val] == undefined) ? 27017 : config.portalMongo.port[val];
        if (host == "") {
          host = config.portalMongo.url[val] + ":" + port;
        } else {
          host = host + "," + config.portalMongo.url[val] + ":" + port;
        }
      }
      //url = host+"/"+config.portalMongo.database+"?replicaSet="+config.portalMongo.replica_set_name+"&"+config.portalMongo.aditional_params;
      /**url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name;

            if(revportal.mongo.aditional_params && revportal.mongo.aditional_params!="")
            url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name+"&"+revportal.mongo.aditional_params;
		*/
      url = host + "/" + config.portalMongo.database + "?replicaSet=" + config.portalMongo.replica_set_name;

      if (config.portalMongo.aditional_params && config.portalMongo.aditional_params != "")
        url = host + "/" + config.portalMongo.database + "?replicaSet=" + config.portalMongo.replica_set_name + "&" + config.portalMongo.aditional_params;

    } else {
      var port = (config.portalMongo.port[0] == "" || config.portalMongo.port[0] == undefined) ? 27017 : config.portalMongo.port[0];
      url = config.portalMongo.url[0] + ":" + port + "/" + config.portalMongo.database;
    }

    if (config.portalMongo.is_auth_required) {
      mngoUrl = "mongodb://" + config.portalMongo.username + ":" + config.portalMongo.password + "@" + url;
    } else {
      mngoUrl = "mongodb://" + url;
    }
  }
  //console.log("mngoUrl",mngoUrl);

  MongoClient.connect(mngoUrl, function(err, db) {
    if (err) {
      console.log(Date() + " : checkSyncFailedJobStatus() - Error while connecting to db");
      callback(false);
    } else {
      var collection = db.collection("SyncFailed");

      if (collection) {
        var isoStart = new Date().toISOString();
        var st = new Date(isoStart);
        var diff = 1 * 60 * 1000;
        //console.log("ISO DATE",st,"DOMAIN",domain,"IP",ip);

        //var query = {status:"connectFailed",domainName:domain,ip:ip.toLocaleLowerCase(),$or:[ { $where: "(new ISODate() - this.updated_at) >"+diff}]};
        var query = {
          $and: [{
            status: "connectFailed",
            domainName: domain,
            ip: ip.toLocaleLowerCase()
          }, {
            $or: [{
              $where: "(new ISODate() - this.updated_at) >" + diff
            }]
          }]
        };
        // var query = {status:"connectFailed",domainName:domain,ip:ip.toLocaleLowerCase()};
        // console.log("QUERY",query);

        var sort = [];
        var operator = {
          $set: {
            "updated_at": st
          }
        };
        var options = {
          'new': true
        };
        //	collection.findAndModify({$and:[{status:"connectFailed",domainName:domain,ip:ip.toLocaleLowerCase()}, {'{$subtract:[ new ISODate(), "$updated_at" ]}':{$gt:1000 * 60 * 1}}]},{'$set':{updated_at: st}},function(err,synFail){
        collection.findAndModify(query, sort, operator, options, function(err, synFail) {
          if (err) {
            console.log(Date() + " : checkSyncFailedJobStatus() - Error while getting  purge data by req_id", err);
            db.close();
            callback(false);
          } else {
            // console.log("DOM",domain,"SYNC FAIL OBJ",synFail);
            if (synFail) {
              db.close();
              callback(true);

            } else {
              db.close();
              callback(false);
            }
          }
        });
      } else {
        console.log(Date() + " : checkSyncFailedJobStatus() - Error while getting db object");

        db.close();
        callback(false);
      }
    }
  });
};

/**
 * This function is used to send the failed configs to BP & CO
 */
var sendFailedConfigToPolicy = function(ip, configJson, operation, callback) {
  //console.log("CALLING sendFailedConfigToPolicy");

  checkSyncFailedJobStatus(configJson.domain_name, ip, function(checkReqStat) {
    //console.log("DOMAIN",configJson.domain_name,"IP",ip,"SYNC STATUS",checkReqStat);
    if (checkReqStat) {
      var wsUrl = "ws://" + ip;

      if (wsUrl.indexOf(":8000") == -1) {
        wsUrl = wsUrl + ":8000";
      }

      var client = new WebSocketClient();
      client.connect(wsUrl, 'collector-bridge');

      client.on('connectFailed', function(error) {
        console.log("Connection Failed: ");

        //timer to close the connection
        //  setInterval(function(){connection.close();},120000);
        callback(true);
      });

      client.on("connect", function(connection) {
        connection.on("error", function(error) {
          console.log("Connection Error: ");

          //timer to close the connection
          //  setInterval(function(){connection.close();},120000);
          callback(true);
        });

        connection.on('message', function(message) {
          console.log(" SYNC FAILED iSTAT MSG >>>>>>>>>>>>>>>>>>>>>>>>", message);
          //console.log("SYNC FAILED STATUS",JSON.parse(message.utf8Data).status);
          //console.log("SYNC FAIL OBJ TYPE",typeof message.utf8Data);

          if (message && message.utf8Data && typeof message.utf8Data == "string" && JSON.parse(message.utf8Data).status && JSON.parse(message.utf8Data).status == 'success') {

            //for removing row from sync failed collection
            removeSyncFailed(configJson.domain_name, ip, operation, configJson, function(stat) {
              if (stat) {
                //for editing domain status if policy receives data succesfully
                editDomainSyncStatus(configJson.domain_name, "success");
              }
            });

          }

          callback(true);
          if (connection) {
            connection.close();
          }

        });

        connection.on('close', function() {
          console.log('Websocket Connection Closed');
        });
        if (connection.connected) {
          connection.send(JSON.stringify(configJson));
          //connection.close();
        } else {
          //timer to close the connection
          //  setInterval(function(){connection.close();},120000);
          console.log('Not able to establish the connection');
          callback(true);
        }
      });
    } else {
      callback(true);
    }
  });
};

/**
 * This function is used to send the failed configs to BP & CO
 */
/**var sendFailedConfigToPolicy = function(ip,configJson,operation, callback){
    //console.log("CALLING sendFailedConfigToPolicy");

    //for editing domain status if policy receives data succesfully
    //editDomainStatus(configJson.domain_name,"success");

    //for removing row from sync failed collection
    //removeSyncFailed(configJson.domain_name,ip,operation, configJson);

    //callback(true);

    var wsUrl = "ws://"+ip;
    
    if (wsUrl.indexOf(":8000") ==-1) {
	    wsUrl=wsUrl+":8000";
    }
    
    var client = new WebSocketClient();
    client.connect(wsUrl,'collector-bridge');

    client.on('connectFailed', function(error) {
        console.log("Connection Failed: ");

        //timer to close the connection
    //  setInterval(function(){connection.close();},120000);
        callback(true);
    });

    client.on("connect", function(connection){
        connection.on("error", function(error){
            console.log("Connection Error: ");

            //timer to close the connection
        //  setInterval(function(){connection.close();},120000);
            callback(true);
        });
        
        connection.on('message', function(message) {
            console.log(" SYNC FAILED iSTAT MSG >>>>>>>>>>>>>>>>>>>>>>>>",message);
            //console.log("SYNC FAILED STATUS",JSON.parse(message.utf8Data).status);
            //console.log("SYNC FAIL OBJ TYPE",typeof message.utf8Data);

            if(message && message.utf8Data && typeof message.utf8Data=="string" && JSON.parse(message.utf8Data).status && JSON.parse(message.utf8Data).status=='success') {
    
                //for removing row from sync failed collection
                removeSyncFailed(configJson.domain_name,ip,operation,configJson,function(stat) {
                    if(stat) {
                        //for editing domain status if policy receives data succesfully
                        editDomainSyncStatus(configJson.domain_name,"success");
                    }
                });
                
            }

            callback(true);
            if(connection) {
                connection.close();
            }
                        
                });

        connection.on('close', function() {
            console.log('Websocket Connection Closed');
        });
        if(connection.connected){
            connection.send(JSON.stringify(configJson));
            //connection.close();
        }else{
            //timer to close the connection
        //  setInterval(function(){connection.close();},120000);
            console.log('Not able to establish the connection');
            callback(true);
        }
    });
};
*/

/**
 * This function is used to remove sync details from collections(After sending config details to policy need to remove from filed collection)
 */
var removeSyncFailed = function(domain, ip, operation, configJson, callback) {
  //console.log("Calling removeSyncFailed");
  SyncFailed.findOne({
    where: {
      domainName: domain,
      ip: ip.toLocaleLowerCase()
    }
  }, function(err, syncFail) {
    if (err) {
      console.log("Unable to add Sync Failed Details");
      callback(false);
    } else {
      if (syncFail) {

        syncFail.destroy(function(err, res) {
          if (err) {
            console.log("Unable to remove Sync Failed details AA");
            callback(false);
          } else {
            callback(true);
            console.log("Sync failed details removed successfully");
          }
        });
      } else {
        callback(false);
      }

    }
  });
};

/**
 * This function is used to change the sync status of the domain(if BP/ CO machines fails to respond)
 */
var editDomainStatus = function(domain, stat, sync_status) {
  if (domain) {
    Domain.findOne({
      where: {
        name: domain
      }
    }, function(err, dom) {
      if (err) {
        send({
          status: false,
          response: dom.errors
        });
      } else {
        dom.status = stat;
        if (sync_status && sync_status != "") {
          dom.sync_status = sync_status;
        }

        dom.updateAttributes(dom, function(err, updDomain) {
          if (err) {
            console.log("Unable to modify Domain Status");
          } else {
            console.log("Domain Status Updated Successfully");
          }
        });
      }
    });
  }
};

/**
 * This function is used to change the sync status of the domain(if BP/ CO machines fails to respond)
 */

var editDomainSyncStatus = function(domain, syns_status) {
  if (domain) {
    Domain.findOne({
      where: {
        name: domain
      }
    }, function(err, dom) {
      if (err) {
        send({
          status: false,
          response: dom.errors
        });
      } else {
        dom.sync_status = syns_status;

        if (syns_status == "success") {
          SyncFailed.all({
            where: {
              domainName: domain
            }
          }, function(err, syn) {
            if (err) {} else {
              if (syn.length == 0) {
                dom.updateAttributes(dom, function(err, updDomain) {
                  if (err) {
                    console.log("Unable to modify Domain Sync Status");
                  } else {
                    console.log("Domain Sync Status Updated Successfully");
                  }
                });
              }
            }
          });
        } else {
          dom.updateAttributes(dom, function(err, updDomain) {
            if (err) {
              console.log("Unable to modify Domain Sync Status");
            } else {
              console.log("Domain Sync Status Updated Successfully");
            }
          });
        }
      }
    });
  }
};

/**
 * This function is used to insert sync failed details
 */
/**
 * This function is used to insert sync failed details
 */
var addSyncFailed = function(domain, ip, configJson, operation, status) {
  if (domain) {
    Domain.findOne({
      where: {
        name: domain
      }
    }, function(err, dom) {
      if (err) {
        send({
          status: false,
          response: dom.errors
        });
      } else {
        //console.log("domain",domain,"IP",ip,"configJson",configJson);
        SyncFailed.findOne({
          where: {
            domainName: domain,
            ip: ip.toLocaleLowerCase()
          }
        }, function(err, syncFail) {
          if (err) {
            console.log("Unable to add Sync Failed Details");
          } else {
            if (syncFail) {
              syncFail.domainName = domain;
              syncFail.ip = ip.toLocaleLowerCase();
              syncFail.status = status;
              syncFail.configJson = configJson;
              syncFail.operation = operation;

              syncFail.updateAttributes(syncFail, function(err, updSync) {
                if (err) {
                  console.log("Unable to modify Sync Failed details");
                } else {
                  console.log("Sync failed details updated successfully");
                }
              });
            } else {
              var syncFailed = new SyncFailed();
              syncFailed.domainName = domain;
              syncFailed.ip = ip.toLocaleLowerCase();
              syncFailed.status = status;
              syncFailed.configJson = configJson;
              syncFailed.operation = operation;

              syncFailed.save(function(err, res) {
                if (err) {
                  console.log("Unable to add Sync Failed details");
                } else {
                  console.log("Sync failed details added successfully");
                }
              });
            }

          }
        });
      }
    });
  }
};

/**var addSyncFailed = function(domain,ip,configJson,operation){
    if(domain){
        Domain.findOne({where:{name:domain}},function(err,dom){
            if(err){
                send({status:false,response:dom.errors});
            }else{
                //console.log("domain",domain,"IP",ip,"configJson",configJson);
                SyncFailed.findOne({where:{domainName:domain,ip:ip,operation:operation}},function(err,syncFail){
                    if(err) {
                        console.log("Unable to add Sync Failed Details");
                    } else {
                        if(syncFail) {
                            syncFail.domainName  = domain;
                            syncFail.ip = ip;
                            syncFail.configJson = configJson;
                            syncFail.operation = operation;

                            syncFail.updateAttributes(syncFail,function(err,updSync){
                                if(err){
                                    console.log("Unable to modify Sync Failed details");
                                }else{
                                    console.log("Sync failed details updated successfully");
                                }
                            });
                        } else {
                            var syncFailed = new SyncFailed();
                            syncFailed.domainName  = domain;
                            syncFailed.ip = ip;
                            syncFailed.configJson = configJson;
                            syncFailed.operation = operation;

                            syncFailed.save(function(err,res){
                                if(err){
                                    console.log("Unable to add Sync Failed details");
                                }else{
                                    console.log("Sync failed details added successfully");
                                }
                            });
                        }
        
                    }
                });
            }
        });
    }
};
*/

function checkHostExistance(host) {
  dns.resolve4(host, function(err, addresses) {
    if (err) {
      console.log("DNS ERR BLK");
    } else {
      console.log('addresses: ' + JSON.stringify(addresses));

      addresses.forEach(function(a) {
        dns.reverse(a, function(err, domains) {
          if (err) {
            console.log('reverse for ' + a + ' failed: ' +
              err.message);
          } else {
            console.log('reverse for ' + a + ': ' +
              JSON.stringify(domains));
          }
        });
      });
    }
  });
}

/**
function configureWS(configUrls,configWSJson,callback){
    console.log("CALLING CONFIG WS");
    var configArray = new Array();
    if(configUrls && configUrls.trim()!=","){
        configArray = configUrls.split(",");
    }

    var ip=0;
    var respCount=0;    
    var syncStat=true; 

    //console.log("configUrls",configUrls,"configWSJson",configWSJson);
    configWS();
    function configWS(){
        console.log("IP",ip,"LENGTH",configArray.length);

        if(ip<configArray.length){
            if(configArray[ip].toString()){
                var wsUrl = "ws://"+configArray[ip];
                console.log("WS URL",wsUrl,"CONFIG",configWSJson);              
                //var aa = configArray[ip].split(":");
                //checkHostExistance(aa[0]);

                console.log("CONFIG WS URL",wsUrl);

                removeSyncFailed(configWSJson.domain_name,configArray[ip],"add", configWSJson,function(rsyncStat) {
                     var client = new WebSocketClient();
                    client.connect(wsUrl,'collector-bridge');
                    
                    client.on('connectFailed', function(error) {
                    console.log('Config WS WSConnect Failed:');
                        
                        syncStat = false;

                        //for editing domain status if BP & CO fails to receive json
                        editDomainSyncStatus(configWSJson.domain_name,"Sync Failed");

                        //if(configWSJson.operation !='add') {
                            addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson,configWSJson.operation,"connectFailed");
                        //} 

                        //timer to close the connection
                        setInterval(function(){ if(connection) connection.close();},120000);

                        ip++;
                        configWS();
                    });

                    client.on("connect", function(connection){
                        connection.on("error", function(error){
                            console.log("Connection Error: ");
                            //for editing domain status if BP & CO fails to receive json
                            editDomainSyncStatus(configWSJson.domain_name,"Sync Failed");
                            //if(configWSJson.operation !='add') {
                                addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson,configWSJson.operation,"connectFailed");
                            //} 

                            ip++;
                            configWS();

                            //timer to close the connection
                            setInterval(function(){  if(connection) connection.close();},120000);
                            console.log("Connection Error: " + error.toString());
                        });
                        
                        connection.on('message', function(message) {

                            if(message && message.utf8Data && typeof message.utf8Data=="string" && JSON.parse(message.utf8Data).status && JSON.parse(message.utf8Data).status!='success') {
                                //for editing domain status if BP & CO fails to receive json
                                editDomainSyncStatus(configWSJson.domain_name,"Sync Failed");
                                //if(configWSJson.operation !='add') {
                                addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson,configWSJson.operation,"error");
                                //} 
                            } 
                        
                            // editDomainStatus(configWSJson.domain_name,true); 
                            ip++;
                            respCount++;
                            console.log("RESP COUNT",respCount,"LENGTH",configArray.length);
        
                            if(respCount==configArray.length) {
                            //  editDomainSyncStatus(configWSJson.domain_name,"success");
                                if(configWSJson.operation !='delete') { 
                                    editDomainStatus(configWSJson.domain_name,true,"Success");
                                }
                            }   
                            configWS();

                            setInterval(function(){ if(connection) connection.close();},120000);
                                                    //connection.close();
                                            });

                        connection.on('close', function() {
                            console.log('Websocket Connection Closed');
                        });
                        if(connection.connected){
                            console.log("CONFIG WS CONNECTED");
                            connection.send(JSON.stringify(configWSJson));
                            //connection.close();
                        }else{
                            console.log("CONFIG WS NOT CONNECTED");
                            //for editing domain status if BP & CO fails to receive json
                            editDomainSyncStatus(configWSJson.domain_name,"Sync Failed");
                            //if(configWSJson.operation !='add') {
                                addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson,configWSJson.operation,"connectFailed");
                            //} 

                            ip++;
                            configWS();

                            //timer to close the connection
                            setInterval(function(){  if(connection) connection.close();},120000);
                            console.log('Not able to establish the connection');
                        }
                    });

                });

                //ip++;
                //configWS();
            }
        } else {
            console.log("CON ELS BBLLLKK");
            callback(syncStat);
        }
    }
};*/

function configureWS(configUrls, configWSJson, callback) {
  //console.log("CALLING CONFIG WS");
  var configArray = new Array();

  if (configUrls && configUrls.trim() != ",") {
    configArray = configUrls.split(",");
  }

  var ip = 0;
  var respCount = 0;
  var reqCount = 0;
  var syncStat = true;

  //console.log("configUrls",configUrls,"configWSJson",configWSJson);
  configWS();

  function configWS() {
    //console.log("IP",ip,"LENGTH",configArray.length);

    if (ip < configArray.length) {
      if (configArray[ip].toString()) {
        var wsUrl = "ws://" + configArray[ip];
        //console.log("WS URL",wsUrl,"CONFIG",configWSJson);              
        //var aa = configArray[ip].split(":");
        //checkHostExistance(aa[0]);

        // console.log("CONFIG WS URL",wsUrl);
        var iconfIp = configArray[ip];
        iconfIp = iconfIp.replace(":8000", "");

        removeSyncFailed(configWSJson.domain_name, iconfIp, "add", configWSJson, function(rsyncStat) {
          var client = new WebSocketClient();
          client.connect(wsUrl, 'collector-bridge');

          client.on('connectFailed', function(error) {
            console.log('Config WS WSConnect Failed:');

            syncStat = false;

            //for editing domain status if BP & CO fails to receive json
            editDomainSyncStatus(configWSJson.domain_name, "Sync Failed");
            //console.log("Connect Failed for BP",client.url.hostname);
            //console.log("Connect Failed for BP",configArray[ip]);
            //if(configWSJson.operation !='add') {
            addSyncFailed(configWSJson.domain_name, client.url.hostname, configWSJson, configWSJson.operation, "connectFailed");
            //} 

            //timer to close the connection
            setInterval(function() {
              if (connection) connection.close();
            }, 120000);
            reqCount++;
            //console.log("REQ COUNT",reqCount); 
            if (reqCount == configArray.length) {
              callback(syncStat);
            }

            if (reqCount < configArray.length) {
              ip++;
              configWS();
            }

            //ip++;
            //configWS();
          });

          client.on("connect", function(connection) {
            connection.on("error", function(error) {
              syncStat = false;

              console.log("Connection Error: ");
              //console.log("Connect Error for BP",configArray[ip]);
              //for editing domain status if BP & CO fails to receive json
              editDomainSyncStatus(configWSJson.domain_name, "Sync Failed");
              //if(configWSJson.operation !='add') {
              addSyncFailed(configWSJson.domain_name, client.url.hostname, configWSJson, configWSJson.operation, "connectFailed");
              //} 

              reqCount++;

              if (reqCount == configArray.length) {
                callback(syncStat);
              }
              if (reqCount < configArray.length) {
                ip++;
                configWS();
              }
              //ip++;
              //configWS();

              //timer to close the connection
              setInterval(function() {
                if (connection) connection.close();
              }, 120000);
              console.log("Connection Error: " + error.toString());
            });

            connection.on('message', function(message) {
              console.log("RESPONSE FROM POLICY", message);

              if (message && message.utf8Data && typeof message.utf8Data == "string" && JSON.parse(message.utf8Data).status && JSON.parse(message.utf8Data).status != 'success') {
                syncStat = false;

                //for editing domain status if BP & CO fails to receive json
                editDomainSyncStatus(configWSJson.domain_name, "Sync Failed");
                //if(configWSJson.operation !='add') {
                addSyncFailed(configWSJson.domain_name, JSON.parse(message.utf8Data).host_name, configWSJson, configWSJson.operation, "error");
                //} 
              }
              /**else {
                                             //removeSyncFailed = function(domain,ip,operation,configJson,callback){
                                             removeSyncFailed(configWSJson.domain_name,configArray[ip],"add", "",function(rsyncStat) {
                                                 
                                             });
                                         }*/

              /**else if(typeof message.utf8Data!="string" && JSON.parse(message.utf8Data).status && JSON.parse(message.utf8Data).status=='success') {
                  editDomainStatus(configWSJson.domain_name,true);
              }*/
              // editDomainStatus(configWSJson.domain_name,true); 
              //ip++;
              respCount++;
              reqCount++;

              //console.log("RESP COUNT",respCount,"LENGTH",configArray.length);

              if (respCount == configArray.length && syncStat == true) {
                //  editDomainSyncStatus(configWSJson.domain_name,"success");
                if (configWSJson.operation != 'delete') {
                  editDomainStatus(configWSJson.domain_name, true, "Success");
                }
              }

              if (reqCount == configArray.length) {
                callback(syncStat);
              }

              //configWS();

              setInterval(function() {
                if (connection) connection.close();
              }, 120000);
              //connection.close();
            });

            connection.on('close', function() {
              console.log('Websocket Connection Closed');
            });
            if (connection.connected) {
              //console.log("Configurations sending to IP",configArray[ip]);
              connection.send(JSON.stringify(configWSJson));

              ip++;
              configWS();

              //connection.close();
            } else {
              //console.log("CONFIG WS NOT CONNECTED");
              //for editing domain status if BP & CO fails to receive json
              editDomainSyncStatus(configWSJson.domain_name, "Sync Failed");
              //if(configWSJson.operation !='add') {
              addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson, configWSJson.operation, "connectFailed");
              //} 
              reqCount++;
              syncStat = false;

              if (reqCount == configArray.length) {
                callback(syncStat);
              }

              ip++;
              configWS();

              //timer to close the connection
              setInterval(function() {
                if (connection) connection.close();
              }, 120000);
              console.log('Not able to establish the connection');
            }
          });

        });

        //ip++;
        //configWS();
      }
    } else {
      console.log("CON ELS BBLLLKK");
      //callback(syncStat);
    }
  }
};

/**function configureWS1(configUrls,configWSJson,callback){
    console.log("CALLING CONFIG WS");
    var configArray = new Array();

    if(configUrls && configUrls.trim()!=","){
        configArray = configUrls.split(",");
    }

    var ip=0;
    var respCount=0; 
    var reqCount=0;       
    var syncStat=true; 

    //console.log("configUrls",configUrls,"configWSJson",configWSJson);
    configWS();
    function configWS(){
        console.log("IP",ip,"LENGTH",configArray.length);

        if(ip<configArray.length){
            if(configArray[ip].toString()){
                var wsUrl = "ws://"+configArray[ip];
                //console.log("WS URL",wsUrl,"CONFIG",configWSJson);              
                //var aa = configArray[ip].split(":");
                //checkHostExistance(aa[0]);

                console.log("CONFIG WS URL",wsUrl);

                removeSyncFailed(configWSJson.domain_name,configArray[ip],"add", configWSJson,function(rsyncStat) {
                     var client = new WebSocketClient();
                    client.connect(wsUrl,'collector-bridge');
                    
                    client.on('connectFailed', function(error) {
                    console.log('Config WS WSConnect Failed:');
                        
                        syncStat = false;

                        //for editing domain status if BP & CO fails to receive json
                        editDomainSyncStatus(configWSJson.domain_name,"Sync Failed");

                        //if(configWSJson.operation !='add') {
                            addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson,configWSJson.operation,"connectFailed");
                        //} 

                        //timer to close the connection
                        setInterval(function(){ if(connection) connection.close();},120000);
                        reqCount++;
                        
                        if(reqCount==configArray.length) {
                            callback(syncStat);
                        }
                        //ip++;
                        //configWS();
                    });

                    client.on("connect", function(connection){
                        connection.on("error", function(error){
                            syncStat = false;

                            console.log("Connection Error: ");
                            //for editing domain status if BP & CO fails to receive json
                            editDomainSyncStatus(configWSJson.domain_name,"Sync Failed");
                            //if(configWSJson.operation !='add') {
                                addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson,configWSJson.operation,"connectFailed");
                            //} 

                            reqCount++;
                            
                            if(reqCount==configArray.length) {
                                callback(syncStat);
                            }

                            //ip++;
                            //configWS();

                            //timer to close the connection
                            setInterval(function(){  if(connection) connection.close();},120000);
                            console.log("Connection Error: " + error.toString());
                        });
                        
                        connection.on('message', function(message) {
                            console.log("RESPONSE FROM POLICY",message);

                            if(message && message.utf8Data && typeof message.utf8Data=="string" && JSON.parse(message.utf8Data).status && JSON.parse(message.utf8Data).status!='success') {
                                //for editing domain status if BP & CO fails to receive json
                                editDomainSyncStatus(configWSJson.domain_name,"Sync Failed");
                                //if(configWSJson.operation !='add') {
                                addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson,configWSJson.operation,"error");
                                //} 
                            } 

                            // editDomainStatus(configWSJson.domain_name,true); 
                            //ip++;
                            respCount++;
                            reqCount++;

                            console.log("RESP COUNT",respCount,"LENGTH",configArray.length);
        
                            if(respCount==configArray.length) {
                            //  editDomainSyncStatus(configWSJson.domain_name,"success");
                                if(configWSJson.operation !='delete') { 
                                    editDomainStatus(configWSJson.domain_name,true,"Success");
                                }
                            }  

                            if(reqCount==configArray.length) {
                                callback(syncStat);
                            }
 
                            //configWS();

                            setInterval(function(){ if(connection) connection.close();},120000);
                                                    //connection.close();
                                            });

                        connection.on('close', function() {
                            console.log('Websocket Connection Closed');
                        });
                        if(connection.connected){
                            console.log("CONFIG WS CONNECTED");
                            connection.send(JSON.stringify(configWSJson));

                            ip++;
                            configWS();

                            //connection.close();
                        }else{
                            console.log("CONFIG WS NOT CONNECTED");
                            //for editing domain status if BP & CO fails to receive json
                            editDomainSyncStatus(configWSJson.domain_name,"Sync Failed");
                            //if(configWSJson.operation !='add') {
                                addSyncFailed(configWSJson.domain_name, configArray[ip], configWSJson,configWSJson.operation,"connectFailed");
                            //} 
                            reqCount++;
                            syncStat = false;

                            if(reqCount==configArray.length) {
                                callback(syncStat);
                            }

                            ip++;
                            configWS();

                            //timer to close the connection
                            setInterval(function(){  if(connection) connection.close();},120000);
                            console.log('Not able to establish the connection');
                        }
                    });

                });

                //ip++;
                //configWS();
            }
        } else {
            console.log("CON ELS BBLLLKK");
            //callback(syncStat);
        }
    }
};*/



process.on('uncaughtException', function(err) {
  console.log('Caught exception In Domain COntroller: ' + err);
});


/**
 * Preparing the traffic json
 */
var trafficJson = function(value, jsonObj) {
  var json = {};
  if (value) {
    if (jsonObj && jsonObj.tier && jsonObj.tier != undefined) {
      tier = jsonObj.tier;
    }
    json.use_this_component = true;
    if (tier == "GOLD") {
      json.tier = tier;
      json.page_views = "60M";
      json.transfer_size = "400 GB";
      json.overage = 50;
    } else if (tier == "SILVER") {
      json.tier = tier;
      json.page_views = "15M";
      json.transfer_size = "100 GB";
      json.overage = 30;
    } else {
      json.tier = "BRONZE";
      json.page_views = "3M";
      json.transfer_size = "20 GB";
      json.overage = 10;
    }
  } else {
    json.use_this_component = false;
  }
  return json;
};

/**
 *Preparing the  content json
 */
var contentJson = function(value, jsonObj) {
  var json = {};
  if (value) {
    //console.log("contentJson---->>>",jsonObj);
    if (jsonObj) {
      json.use_this_component = true;
      if (jsonObj.enable_optimization && jsonObj.enable_optimization != undefined) {
        json.enable_optimization = true;
      } else {
        json.enable_optimization = false;
      }
      if (jsonObj.mode && jsonObj.mode != undefined) {
        json.mode = jsonObj.mode;
      } else {
        json.mode = "moderate";
      }
      if (jsonObj.custom_img_choice && jsonObj.custom_img_choice != undefined) {
        json.custom_img_choice = jsonObj.custom_img_choice;
      } else {
        json.custom_img_choice = "medium";
      }
      if (jsonObj.custom_js_choice && jsonObj.custom_js_choice != undefined) {
        json.custom_js_choice = jsonObj.custom_js_choice;
      } else {
        json.custom_js_choice = "medium";
      }
      if (jsonObj.custom_css_choice && jsonObj.custom_css_choice != undefined) {
        json.custom_css_choice = jsonObj.custom_css_choice;
      } else {
        json.custom_css_choice = "medium";
      }
    }
  }
  //console.log("retutn json--->>>",json);
  return json;
};

/**
 *Preparing the  cache json
 */
var cacheJson = function(value, jsonObj) {
  var json = {};
  if (value) {
    if (jsonObj) {
      json.use_this_component = true;
      if (jsonObj.enable_cache && jsonObj.enable_cache != undefined) {
        json.enable_cache = true;
      } else {
        json.enable_cache = false;
      }
      if (jsonObj.cache_opt_choice && jsonObj.cache_opt_choice != undefined) {
        json.cache_opt_choice = jsonObj.cache_opt_choice;
      } else {
        json.cache_opt_choice = "Rev CDN";
      }
      if (jsonObj.cdn_overlay_urls && jsonObj.cdn_overlay_urls != undefined) {
        json.cdn_overlay_urls = jsonObj.cdn_overlay_urls;
      } else {
        json.cdn_overlay_urls = [];
      }
      if (jsonObj.cache_life_months != undefined) {
        json.cache_life_months = jsonObj.cache_life_months;
      } else {
        json.cache_life_months = 1;
      }
      if (jsonObj.cache_life_days != undefined) {
        json.cache_life_days = jsonObj.cache_life_days;
      } else {
        json.cache_life_days = 15;
      }
      if (jsonObj.cache_life_hours != undefined) {
        json.cache_life_hours = jsonObj.cache_life_hours;
      } else {
        json.cache_life_hours = 6;
      }
      if (jsonObj.purge_now && jsonObj.purge_now != undefined) {
        json.purge_now = jsonObj.purge_now;
      } else {
        json.purge_now = true;
      }
      if (jsonObj.purge_reg_expression && jsonObj.purge_reg_expression != undefined) {
        json.purge_reg_expression = jsonObj.purge_reg_expression;
      } else {
        json.purge_reg_expression = "Need to give the expression";
      }
    }
  }
  return json;
};

/**
 *Preparing the  security json
 */
var securityJson = function(value, jsonObj) {
  var json = {};
  if (value) {
    if (jsonObj) {
      json.use_this_component = true;
      if (jsonObj.enable_security && jsonObj.enable_security != undefined) {
        json.enable_security = true;
      } else {
        json.enable_security = false;
      }
      if (jsonObj.web_app_firewall && jsonObj.web_app_firewall != undefined) {
        json.web_app_firewall = jsonObj.web_app_firewall;
      } else {
        json.web_app_firewall = "off";
      }
      if (jsonObj.ssl_certificates && jsonObj.ssl_certificates != undefined) {
        json.ssl_certificates = jsonObj.ssl_certificates;
      } else {
        json.ssl_certificates = "rev_certs";
      }
      if (jsonObj.certificate_urls && jsonObj.certificate_urls != undefined) {
        json.certificate_urls = jsonObj.certificate_urls;
      } else {
        json.certificate_urls = [];
      }
    }
  } else {
    json.use_this_component = false;
    json.enable_security = false;
  }
  return json;
};

/**
 * Service used to returning the domains names
 */
action('purgeDomains', function() {
  //console.log("getting the all purgeDomains domain names");
  //Retrieving the all domains names list 
  Domain.all({
    where: {
      status: true
    },
    order: 'name:ASC'
  }, function(err, domains) {
    if (err) {
      send({
        status: false,
        response: domains.errors
      });
    } else {
      var domainNames = [];
      if (domains.length > 0) {
        var count = 0;
        for (var i = 0; i < domains.length; i++) {
          var obj = {
            "domainName": "",
            "bpUrl": ""
          };
          obj.domainName = domains[i].name;
          var bp_arr = new Array();
          bp_arr = domains[i].stats_url.split(",");

          var bp = 0;
          if (domains[i].stats_url != "") {
            removePortFromStats();
          }

          function removePortFromStats() {
            if (bp < bp_arr.length) {
              if (bp_arr[bp].toString()) {
                bp_arr[bp] = bp_arr[bp].replace(":8001", "");
                bp++;
                removePortFromStats();
              }
            }
          }
          count++;
          obj.bpUrl = bp_arr
          domainNames.push(obj);
        }
        if (count == domains.length) {
          //send({ status: true, response: domainNames});
          if (req.body.companyId) {
            var u_len = 0,
              domainsList = [];
            get_domains_list_comp();

            function get_domains_list_comp() {
              if (u_len < domains.length) {
                comp_array = req.body.companyId.split(",");
                if (in_array(domains[u_len].companyId, comp_array)) {
                  domainsList.push(domainNames[u_len]);
                }
                u_len++;
                get_domains_list_comp();
              } else {
                send({
                  status: true,
                  response: domainsList
                });
              }
            }
          } else {
            send({
              status: true,
              response: domainNames
            });
          }
        }

      } else {
        send({
          status: false,
          response: "No Domains Exist"
        });
      }
    }
  });
});

/**
 * Service used to purge cache
 */
action('purge', function() {
  //console.log("purge request Came");
  if (req.body && req.body.stats_url && req.body.inputJson) {
    //Retrieving the all domains names list 
    //console.log('purge  request ::::::::: ',req.body);
    //console.log("purge JSON :::::",JSON.stringify(req.body.inputJson));
    //send({ status: true, response: "Purge request has been sent"});

    var purgObj = {}
    purgObj.inputJson = req.body.inputJson
    purgObj.stats_url = req.body.stats_url
    purgeCacheWS(purgObj.stats_url, purgObj.inputJson, function(val) {
      if (val) {
        send({
          status: true,
          response: "Purge request has been sent"
        });
      } else {
        send({
          status: false,
          response: "There was an error sending the JSON..."
        });
      }

    });

  } else {
    send({
      status: false,
      response: "Invalid request"
    });
  }
});

//web socket communiction for Purge
function purgeCacheWS(purgeUrls, purgeWSJson, callback) {
  //console.log("CALLING purge WS");
  var purgeArray = new Array();
  purgeArray = purgeUrls.split(",");
  var ip = 0;
  var respCount = 0;
  purgeWS();

  function purgeWS() {
    if (ip < purgeArray.length) {
      if (purgeArray[ip].toString()) {
        var wsUrl = "ws://" + purgeArray[ip] + ":8002";
        //console.log("WS URL",wsUrl,"purge",purgeWSJson);                
        var client = new WebSocketClient();
        client.connect(wsUrl, 'collector-bridge');

        client.on('connectFailed', function(error) {
          //console.log('purge WS WSConnect Failed:');
          //timer to close the connection
          setInterval(function() {
            if (connection) connection.close();
          }, 120000);
          ip++;
          purgeWS();
        });

        client.on("connect", function(connection) {
          connection.on("error", function(error) {
            console.log("Connection Error: ");
            ip++;
            purgeWS();
            //timer to close the connection
            setInterval(function() {
              if (connection) connection.close();
            }, 120000);
            console.log("Connection Error: " + error.toString());
          });

          connection.on('message', function(message) {
            //console.log('PURGE RES :::::::::',message)
            //console.log(typeof message.utf8Data);
            if (message && message.utf8Data && typeof message.utf8Data == "string" && JSON.parse(message.utf8Data).status && JSON.parse(message.utf8Data).status == "success") {
              console.log("SUCCESS")
              respCount++;
            }
            ip++;
            //console.log("PURGE RES COUNT:",respCount,"PURGE ARR COUNT:",purgeArray.length);
            purgeWS();
            setInterval(function() {
              if (connection) connection.close();
            }, 120000);
          });
          connection.on('close', function() {
            console.log('Websocket Connection Closed');
          });
          if (connection.connected) {
            console.log("purge WS CONNECTED");
            connection.send(JSON.stringify(purgeWSJson));
          } else {
            console.log("purge WS NOT CONNECTED");
            ip++;
            purgeWS();
            //timer to close the connection
            setInterval(function() {
              if (connection) connection.close();
            }, 120000);
            console.log('Not able to establish the connection');
          }
        });
      }
    } else {
      console.log("PURGE PROCESS COMPLETED");
      if (respCount == ip) {
        callback(true);
      } else {
        callback(false);
      }
    }
  }
};

function updateMasterConfigData(configObj, callback) {
  //console.log("configObj:::::::::::::",configObj)
  var configJson = {

  };
  //configJson = configObj;
  //get Configure data
  MasterConfiguration.findOne({
    where: {
      domainName: configObj.domainName
    }
  }, function(err, masterConfigObj) {
    if (err) {
      console.log("Unable to find master config details");
      callback(false);
    } else {
      console.log("found successfully", masterConfigObj.configurationJson);

      configJson = masterConfigObj.configurationJson;

      //version change
      if (configJson.version) {
        configJson.version = "1.0.5";
      }

      if (configJson.rev_component_bp && !configJson.rev_component_bp.bp_apache_fe_custom_config) {
        configJson.rev_component_bp.bp_apache_fe_custom_config = "";
      }

      if (configJson["rev_component_bp"] && !configJson["rev_component_bp"]["cache_bypass_locations"]) {
        configJson["rev_component_bp"]["cache_bypass_locations"] = [];
      }

      if (configJson["rev_component_bp"] && !configJson["rev_component_bp"]["acl"]) {
        configJson["rev_component_bp"]["acl"] = {
          "enabled": false,
          "action": "deny_except",
          "acl_rules": [{
            "host_name": "",
            "subnet_mask": "",
            "country_code": "",
            "header_name": "",
            "header_value": ""
          }]
        };
      }

      if (configJson["3rd_party_rewrite"]) {
        if (configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] != undefined) {
          if (configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] == true || configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] == "true") {
            configJson["3rd_party_rewrite"]["enable_3rd_party_runtime_rewrite"] = true;
            configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] == true;
          } else if (configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] == false || configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] == "false") {
            configJson["3rd_party_rewrite"]["enable_3rd_party_runtime_rewrite"] = false;
            configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] == false;
          } else {
            configJson["3rd_party_rewrite"]["enable_3rd_party_runtime_rewrite"] = false;
            configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] == false;
          }
        } else {
          configJson["3rd_party_rewrite"]["enable_3rd_party_runtime_rewrite"] = false;
          configJson["3rd_party_rewrite"]["enable_3rd_party_rewrite"] == false;
        }
        configJson["3rd_party_rewrite"]["3rd_party_runtime_domains"] = configJson["3rd_party_rewrite"]["3rd_party_urls"] != undefined ? configJson["3rd_party_rewrite"]["3rd_party_urls"] : "";
        configJson["3rd_party_rewrite"]["enable_3rd_party_root_rewrite"] = false;
        configJson["3rd_party_rewrite"]["3rd_party_root_rewrite_domains"] = "";
      }

      //console.log("OUT", configJson);

      masterConfigObj.configurationJson = configJson;

      masterConfigObj.updateAttributes(masterConfigObj, function(err, config) {
        if (err) {
          console.log("Unable to update master config details");
          callback(false);
        } else {
          console.log("configure updated  successfully");
          callback(true);
        }
      });
    }
  });
}

action('setMasterConfig', function() {
  //console.log("set master config");

  /**MasterConfiguration.destroyAll(function(err,res){
      
  });*/
  //Configure.all(function(confifErr,configObj){
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    MasterConfiguration.all(function(confifErr, configObj) {
      if (confifErr) {
        console.log("error in Configure unable to get data");
      } else {
        var configCount = configObj.length;
        if (configCount > 0) {
          var count = 0;
          setMaterConfig();

          function setMaterConfig() {
            if (count < configCount) {
              //console.log('domainName'+configObj[count].domainName)
              updateMasterConfigData(configObj[count], function(status) {
                count++;
                setMaterConfig();
              });
            } else {
              send({
                status: true,
                response: "Config details updated successfully"
              });
            }
          }
        }
      }
    });
  } else {
    send({
      status: true,
      response: "You dont have permission to perform this operation."
    });
  }
});

action('getMasterConfigDomain', function() {
  //console.log("get Master Config Data");
  //console.log("req.body",req.body)
  if (req.body && req.body.domainName) {
    MasterConfiguration.findOne({
      where: {
        domainName: req.body.domainName
      }
    }, function(err, masterConfigObj) {
      if (err) {
        console.log("Unable to find master config details");
        send({
          status: false,
          response: "Configuration details not found"
        });
      } else {
        console.log("found successfully");
        var obj = {};
        /*
                        obj.cache = masterConfigObj.configurationJson.cache;
                        obj.content = masterConfigObj.configurationJson.content;
                        obj.security = masterConfigObj.configurationJson.security;
                        obj.traffic = masterConfigObj.configurationJson.traffic;*/
        send({
          status: true,
          response: masterConfigObj.configurationJson
        });
      }
    });
  } else {
    send({
      status: false,
      response: "Invalid Request"
    });
  }
});

/**
 * migration script
 */
action('addAllDomainsHeatMapJobDetails', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    var inputJson = {
      status: true
    };
    Domain.all({
      where: inputJson
    }, function(err, domains) {
      var j = 0;
      iterateDomains();

      function iterateDomains() {
        if (j < domains.length) {
          HeatMapJobDetail.findOne({
            where: {
              domainName: domains[j].name
            }
          }, function(err, heatMapJobDetail) {
            if (err) {
              j++;
              iterateDomains();
              console.log("Error while getting heat map job details");
              //send({status: false, response: heatMapJobDetail.errors});
            } else {
              if (!heatMapJobDetail) {
                //console.log("HEAT MAP JOB DETAILS",heatMapJobDetail);

                //console.log("DOM NAME",domains[j].name);

                var heatMapJobDetail = new HeatMapJobDetail();
                heatMapJobDetail.domainName = domains[j].name;

                //var isoStart = new Date().toISOString();
                //var isoEnd = new Date().toISOString();

                var dt = new Date().getTime() - 10 * 60 * 60 * 1000;
                var isoStart = new Date(dt).toISOString();
                var isoEnd = new Date(dt).toISOString();

                var st = new Date(isoStart);
                var ed = new Date(isoEnd);


                heatMapJobDetail.jobStartTime = st;
                heatMapJobDetail.jobEndTime = ed;

                heatMapJobDetail.save(function(err, res) {
                  if (err) {
                    //console.log("Unable to save heatmap job details");
                    j++;
                    iterateDomains();
                  } else {
                    // console.log("heatmap job details added successfully");
                    j++;
                    iterateDomains();
                  }
                });
              } else {
                j++;
                iterateDomains();
              }
            }
          });
        } else {
          //console.log("heatmap job details added successfully");
          send({
            status: true,
            response: "Added Job detais for all the domains"
          });
        }
      }
    });
  } else {
    send({
      status: true,
      response: "You dont have permission to perform this operation"
    });
  }
});
