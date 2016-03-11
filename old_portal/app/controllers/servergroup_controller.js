load('application');
before(use('validateRequest'), {
  only: ['new', 'list', 'update']
});

//Loading the required modules
var log = require("co-logger");
var WebSocket = require('ws');
var WebSocketClient = require('websocket').client;
var connection = null;
var revportal = require("revportal");
var revlogger = require("rev-logger");

action('list', function() {
  //console.log("for getting the list of server groups",req.body);
  if (req.body && req.body.email != undefined && req.body.email != "") {
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
        if (user) {
          //if(user.role=="revadmin") {
          ServerGroup.all({
            where: {},
            order: 'groupName:ASC'
          }, function(err, groups) {
            if (req.body.type == "group") {
              var groupArr = [];
              for (var i = 0; i < groups.length; i++) {
                var groupJson = {};
                groupJson.groupName = groups[i].groupName;
                groupJson.groupType = groups[i].groupType;
                groupJson.servers = groups[i].servers;
                groupJson.co_cnames = groups[i].co_cnames;
                groupJson.serverType = groups[i].serverType;
                groupJson.publicName = groups[i].publicName;

                groupArr.push(groupJson);
                if (i == groups.length - 1) {
                  send({
                    status: true,
                    response: groupArr
                  });
                }
              }
            } else {
              send({
                status: true,
                response: groups
              });
            }
          });
          /*} else {
          	send({ status:false,response: "This user doe n't permitted to perform this action"});
          }*/
        } else {
          send({
            status: false,
            response: "User does n't exists. Please send valid user details"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Email can not be empty"
    });
  }
});

action('new', function() {
  //console.log("Calling Server group controller new()---->>>",req.body);
  if (req.body && req.body.email != undefined && req.body.email != "") {
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
        if (user) {
          if (user.role == "revadmin") {
            if (req.body.groupName != "" && req.body.groupType != "") {
              //console.log("SERVERS",req.body.servers);
              ServerGroup.findOne({
                where: {
                  groupName: req.body.groupName,
                  groupType: req.body.groupType
                }
              }, function(err, groupObjOne) {
                if (groupObjOne) {
                  send({
                    status: false,
                    response: "This group name already exists for this group type"
                  });
                } else {
                  ServerGroup.findOne({
                    where: {
                      publicName: req.body.publicName,
                      groupType: req.body.groupType
                    }
                  }, function(err, groupObj) {
                    if (groupObj) {
                      send({
                        status: false,
                        response: "This group public name already exists for this group type"
                      });
                    } else {
                      var serverGroup = new ServerGroup();
                      serverGroup.groupName = req.body.groupName;
                      serverGroup.groupType = req.body.groupType;
                      serverGroup.publicName = req.body.publicName;
                      if (req.body.servers && req.body.servers != undefined && req.body.servers != "") {
                        serverGroup.servers = req.body.servers.replace(/\s/g, "");
                      }
                      if (req.body.co_cnames && req.body.co_cnames != undefined && req.body.co_cnames != "") {
                        serverGroup.co_cnames = req.body.co_cnames;
                      }
                      if (req.body.serverType && req.body.serverType != undefined && req.body.serverType != "") {
                        serverGroup.serverType = req.body.serverType;
                      }
                      //console.log("server group",serverGroup);

                      serverGroup.save(function(err, res) {
                        if (err) {
                          send({
                            status: false,
                            response: "Unable to save Server Group Details"
                          });
                        } else {
                          revlogger.audit('Successfully added new ServerGroup, type: ' + req.body.groupType + ', name: ' + req.body.groupName);
                          send({
                            status: true,
                            response: "Server Group details added successfully"
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
                response: "Please send valid data"
              });
            }
          } else {
            send({
              status: false,
              response: "This user doe n't permitted to perform this action"
            });
          }
        } else {
          send({
            status: false,
            response: "User does n't exists. Please send valid user details"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Email can not be empty"
    });
  }
});

/*function diffArray(a, b) {
  var seen = [], diff = [];
  for ( var i = 0; i < b.length; i++)
      seen[b[i]] = true;
  for ( var i = 0; i < a.length; i++)
      if (!seen[a[i]])
          diff.push(a[i]);
  return diff;
}*/

function diffArray(a, b) {
  var diff = [];
  for (var i = 0; i < b.length; i++) {
    var bb = b[i].replace(/\s/g, "").toString();
    if (a.indexOf(bb) > -1) {

    } else {
      diff.push(b[i]);
    }
  }
  return diff;
}

action('force_push_config', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    var whereConStr = "";

    var groupType = req.body.groupType;
    var groupName = req.body.groupName;

    if (groupType == "BP") {
      whereConStr = {
        BPGroup: groupName
      };
    } else if (groupType == "CO") {
      whereConStr = {
        COGroup: groupName
      };
    }

    if (req.body.serverName != "" && req.body.serverName != undefined) {
      req.body.serverName = req.body.serverName.replace(/\s/g, "");
    }

    Domain.all({
      where: whereConStr,
      order: 'name:ASC'
    }, function(err, domains) {
      console.log("LENGTH", domains.length);

      if (err) {
        send({
          status: true,
          response: "Error while getting domains list"
        });
      } else {
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          if (i < domains.length) {
            MasterConfiguration.findOne({
              where: {
                domainName: domains[i].name
              }
            }, function(err, masterConfigObj) {
              if (err) {
                console.log("MASTER CONFIG ERR BLK", masterConfigObj.errors);
                i++;
                iterateDomains();
              } else {
                if (masterConfigObj) {
                  //console.log("SERVER NAME",req.body.serverName);
                  //console.log("M CONFIG",masterConfigObj.configurationJson);

                  sendMasterConfigDataToPolicy(req.body.serverName, masterConfigObj.configurationJson, function(stat) {
                    i++;
                    iterateDomains();
                  });
                } else {
                  console.log("Master Configure details doesn't exists for the domain", domains[i].name)
                  i++;
                  iterateDomains();
                }
              }
            });
          } else {
            send({
              status: true,
              response: "Sent Master Configuration to " + req.body.serverName
            });
            console.log("Sent All Domains Master Config to newly added servers");
          }
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

action('update', function() {
  //console.log("Calling Server group controller update()---->>>",req.body);
  if (req.body && req.body.email != undefined && req.body.email != "") {
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
        if (user) {
          if (user.role == "revadmin") {
            ServerGroup.findOne({
              where: {
                groupName: req.body.groupName,
                groupType: req.body.groupType
              }
            }, function(err, groupObj) {
              if (groupObj) {
                var serversList = groupObj.servers.replace(/\s/g, "").split(",");
                var newServersList = req.body.servers.replace(/\s/g, "").split(",");

                //To check the removed ips
                var difArr = diffArray(serversList, newServersList);

                //To get the newly added ips
                //var AddeddiffArr = diffArray(newServersList,serversList);
                var AddeddiffArr = diffArray(serversList, newServersList);

                //console.log("DIFF ARRAY",difArr,"DDDD",AddeddiffArr);

                newServersList = newServersList.filter(function(item, index, inputArray) {
                  return inputArray.indexOf(item) == index;
                });

                //groupObj.servers = req.body.servers;
                groupObj.servers = newServersList;
                groupObj.co_cnames = req.body.co_cnames;
                groupObj.serverType = req.body.serverType;
                groupObj.publicName = req.body.publicName;

                ServerGroup.findOne({
                  where: {
                    publicName: req.body.publicName,
                    groupType: req.body.groupType
                  }
                }, function(err, groupObjOne) {
                  if (groupObjOne) {
                    if (groupObjOne.id.toString() != groupObj.id.toString()) {
                      send({
                        status: false,
                        response: "This group public name already exists for this group type"
                      });
                    } else {
                      groupObj.updateAttributes(groupObj, function(err, group) {
                        if (err) {
                          send({
                            status: false,
                            response: "Unable to edit server group details"
                          });
                        } else {
                          if (AddeddiffArr.length > 0) {
                            getDomainsToSendConfig(AddeddiffArr, req.body.groupName, req.body.groupType, req.body.servers, req.body.co_cnames, true);
                          } else {
                            getDomainsToSendConfig(AddeddiffArr, req.body.groupName, req.body.groupType, req.body.servers, req.body.co_cnames, false);
                          }
                          send({
                            status: true,
                            response: "Server Group Details updated successfully"
                          });
                        }
                      });
                    }
                  } else {
                    /*var serversList = groupObj.servers.split(",");
                    var newServersList = req.body.servers.split(",");*/

                    groupObj.updateAttributes(groupObj, function(err, group) {
                      if (err) {
                        send({
                          status: false,
                          response: "Unable to edit server group details"
                        });
                      } else {
                        if (AddeddiffArr.length > 0) {
                          getDomainsToSendConfig(AddeddiffArr, req.body.groupName, req.body.groupType, req.body.servers, req.body.co_cnames, true);
                        } else {
                          getDomainsToSendConfig(AddeddiffArr, req.body.groupName, req.body.groupType, req.body.servers, req.body.co_cnames, false);
                        }
                        send({
                          status: true,
                          response: "Server Group Details updated successfully"
                        });
                      }
                    });
                  }
                });
              } else {
                send({
                  status: false,
                  response: "Invalid server group, Please send a valid group details"
                });
              }
            });

          } else {
            send({
              status: false,
              response: "This user doe n't permitted to perform this action"
            });
          }
        } else {
          send({
            status: false,
            response: "User does n't exists. Please send valid user details"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Email can not be empty"
    });
  }
});

/**
 * This function is used to get the list of domains by server group
 */
var getDomainsToSendConfig = function(servers, groupName, groupType, newserverlist, codnsnames, sendConf) {
  var whereConStr = "";
  if (groupType == "BP") {
    whereConStr = {
      BPGroup: groupName
    };
  } else if (groupType == "CO") {
    whereConStr = {
      COGroup: groupName
    };
  }

  if (newserverlist != "" && newserverlist != undefined) {
    newserverlist = newserverlist.replace(/\s/g, "");
  }

  Domain.all({
    where: whereConStr,
    order: 'name:ASC'
  }, function(err, domains) {
    if (err) {
      //send({ status: false, response: domains.errors });
      console.log("Unable to get the dmains list");
    } else {
      //console.log("LL",domains.length);
      var i = 0;
      iterateDomains();

      function iterateDomains() {
        if (i < domains.length) {
          MasterConfiguration.findOne({
            where: {
              domainName: domains[i].name
            }
          }, function(err, masterConfigObj) {
            if (err) {
              console.log("MASTER CONFIG ERR BLK", masterConfigObj.errors);
              i++;
              iterateDomains();
            } else {
              if (masterConfigObj) {
                masterConfigObj.configurationJson.operation = "add";

                Domain.findOne({
                  where: {
                    name: domains[i].name
                  }
                }, function(err, updomain) {
                  if (err) {
                    console.log("Domain ERR BLK", updomain.errors);
                  } else {
                    if (updomain) {
                      if (groupType == "BP") {
                        //updomain.stats_url = newserverlist;
                        var bp_array = [];
                        if (newserverlist != "" && newserverlist != undefined) {
                          bp_array = newserverlist.split(",");
                        }

                        for (var bp = 0; bp < bp_array.length; bp++) {
                          bp_array[bp] = bp_array[bp] + ":8001";
                        }
                        var bp_urls = bp_array.join(",");
                        bp_urls = bp_urls.replace(/\s/g, "");
                        //  console.log("BP URLS",bp_urls);
                        updomain.stats_url = bp_urls;

                      } else if (groupType == "CO") {
                        var co_array = [];
                        if (newserverlist != "" && newserverlist != undefined) {
                          co_array = newserverlist.split(",");
                        }

                        for (var co = 0; co < co_array.length; co++) {
                          co_array[co] = co_array[co] + ":8000";
                        }
                        var co_urls = co_array.join(",");
                        co_urls = co_urls.replace(/\s/g, "");
                        updomain.config_url = co_urls;
                        updomain.co_cnames = codnsnames;

                        //updomain.config_url = newserverlist;
                      }

                      updomain.updateAttributes(updomain, function(err, updatedDomain) {
                        if (err) {
                          console.log("Domain update ERR BLK");
                        } else {
                          console.log("Domain updated successfully");
                        }
                      });
                    }
                  }
                });

                if (groupType == "BP") {
                  masterConfigObj.configurationJson.bp_list = newserverlist.split(",");
                } else if (groupType == "CO") {
                  masterConfigObj.configurationJson.co_list = newserverlist.split(",");
                }

                masterConfigObj.updateAttributes(masterConfigObj, function(err, updatedmasterConfigObj) {
                  if (err) {
                    console.log("masterConfigObj update ERR BLK");
                  } else {
                    console.log("masterConfigObj updated successfully");
                  }
                });

                if (sendConf) {
                  sendMasterConfigDataToPolicy(servers.join(","), masterConfigObj.configurationJson, function(stat) {
                    i++;
                    iterateDomains();
                  });
                } else {
                  i++;
                  iterateDomains();
                }
              } else {
                console.log("Master Configure details doesn't exists for the domain", domains[i].name)
                i++;
                iterateDomains();
              }
            }
          });
        } else {
          console.log("Sent All Domains Master Config to newly added servers");
        }
      }
    }
  });
};

function sendMasterConfigDataToPolicy(configUrls, configWSJson, callback) {
  var configArray = new Array();
  if (configUrls && configUrls.trim() != ",") {
    configArray = configUrls.split(",");
  }

  var ip = 0;

  sendMasterConfigData();

  function sendMasterConfigData() {
    if (ip < configArray.length) {
      if (configArray[ip].toString()) {
        var wsUrl = "ws://" + configArray[ip] + ":8000";
        wsUrl = wsUrl.replace(/\s/g, "");
        //console.log("WS URL",wsUrl,"CONFIG",configWSJson);				

        var client = new WebSocketClient();
        client.connect(wsUrl, 'collector-bridge');

        client.on('connectFailed', function(error) {
          console.log('Config WS WSConnect Failed:');

          addSyncFailed(configWSJson.domain_name, configArray[ip] + ":8000", configWSJson, configWSJson.operation);

          //timer to close the connection
          setInterval(function() {
            if (connection) connection.close();
          }, 10000);

          ip++;
          sendMasterConfigData();
        });

        client.on("connect", function(connection) {
          connection.on("error", function(error) {
            console.log("Connection Error: ");
            addSyncFailed(configWSJson.domain_name, configArray[ip] + ":8000", configWSJson, configWSJson.operation);

            ip++;
            sendMasterConfigData();

            //timer to close the connection
            setInterval(function() {
              if (connection) connection.close();
            }, 10000);
          });

          connection.on('message', function(message) {
            //console.log("DATA",message);
            //console.log("TYPE",typeof message.utf8Data);

            if (message && message.utf8Data && typeof message.utf8Data == "string" && JSON.parse(message.utf8Data).status && JSON.parse(message.utf8Data).status != 'success') {
              addSyncFailed(configWSJson.domain_name, configArray[ip] + ":8000", configWSJson, configWSJson.operation);
            }

            ip++;
            sendMasterConfigData();
            setInterval(function() {
              if (connection) connection.close();
            }, 10000);
          });

          connection.on('close', function() {
            console.log('Websocket Connection Closed');
          });
          if (connection.connected) {
            connection.send(JSON.stringify(configWSJson));
          } else {
            addSyncFailed(configWSJson.domain_name, configArray[ip] + ":8000", configWSJson, configWSJson.operation);

            ip++;
            sendMasterConfigData();

            //timer to close the connection
            setInterval(function() {
              if (connection) connection.close();
            }, 10000);
            console.log('Not able to establish the connection');
          }
        });
      }
    } else {
      //console.log("CON ELS BBLLLKK");
      callback(true);
    }
  }
};

/**
 * This function is used to insert sync failed details
 */
var addSyncFailed = function(domain, ip, configJson, operation) {
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
            ip: ip,
            operation: operation
          }
        }, function(err, syncFail) {
          if (err) {
            console.log("Unable to add Sync Failed Details");
          } else {
            if (syncFail) {
              syncFail.domainName = domain;
              syncFail.ip = ip;
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
              syncFailed.ip = ip;
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

action('setGroupForExistingDomains', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
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
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          if (i < domains.length) {
            Domain.findOne({
              where: {
                name: domains[i].name
              }
            }, function(err, domainObj) {
              if (err) {
                i++;
                iterateDomains();
              } else {
                if (domainObj) {
                  domainObj.BPGroup = "Manual";
                  domainObj.COGroup = "Manual";

                  domainObj.updateAttributes(domainObj, function(err, res) {
                    if (err) {
                      i++;
                      iterateDomains();
                    } else {
                      i++;
                      iterateDomains();
                    }
                  });
                } else {
                  i++;
                  iterateDomains();
                }
              }
            });
          } else {
            send({
              status: true,
              response: "Group details updated for the existing domains"
            });
          }
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

action('addRumDetails', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    var rumDetails = new RumDetail();
    //rumDetails.rum_url = "https://boom.revsw.net/service";
    //rumDetails.evalutor_url = "http://boom.revsw.net:1081/";
    rumDetails.rum_url = revportal.default_details.default_rum_url;
    rumDetails.evalutor_url = revportal.default_details.default_evalutor_url;

    rumDetails.save(function(err, res) {
      if (err) {
        send({
          status: false,
          response: "Unable to save Rum Details"
        });
      } else {
        send({
          status: true,
          response: "Rum details added successfully"
        });
      }
    });
  } else {
    send({
      status: true,
      response: "You dont have permission to perform this operation"
    });
  }
});

action('addDefaultServerGroup', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    for (var i = 0; i < 2; i++) {
      var serverGroup = new ServerGroup();

      if (i == 0) {
        serverGroup.groupName = "Default";
        serverGroup.groupType = "BP";
        serverGroup.servers = revportal.default_details.default_bp_servers;
      }
      if (i == 1) {
        serverGroup.groupName = "Default";
        serverGroup.groupType = "CO";
        serverGroup.servers = revportal.default_details.default_co_servers;
      }

      serverGroup.save(function(err, res) {
        if (err) {
          //send({ status:false,response: "Unable to save Server Group Details"});
        } else {
          if (i == 1)
            send({
              status: true,
              response: "Server Group details added successfully"
            });
        }
      });
    }
  } else {
    send({
      status: true,
      response: "You dont have permission to perform this operation"
    });
  }
});

action('setServerGroupsStatus', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    ServerGroup.all({
      where: {
        groupType: "CO"
      },
      order: 'groupName:ASC'
    }, function(err, groups) {
      if (err) {
        send({
          status: false,
          response: groups.errors
        });
      } else {
        var i = 0;
        iterateServerGroups();

        function iterateServerGroups() {
          if (i < groups.length) {
            ServerGroup.findOne({
              where: {
                groupName: groups[i].groupName,
                groupType: groups[i].groupType
              }
            }, function(err, groupObj) {
              if (err) {
                i++;
                iterateServerGroups();
              } else {
                if (groupObj) {
                  //groupObj.co_cnames=groups[i].servers;
                  groupObj.serverType = "private";
                  groupObj.publicName = groups[i].groupName;
                  groupObj.updateAttributes(groupObj, function(err, res) {
                    if (err) {
                      i++;
                      iterateServerGroups();
                    } else {
                      i++;
                      iterateServerGroups();
                    }
                  });
                } else {
                  i++;
                  iterateServerGroups();
                }
              }
            });
          } else {
            send({
              status: true,
              response: "Server Group details updated successfully"
            });
          }
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
