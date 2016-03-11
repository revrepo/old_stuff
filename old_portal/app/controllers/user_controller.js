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
  only: ['list', 'new', 'update', 'delete', 'logout', 'filter', 'theme', 'change_password']
});

//Loading the required modules
var revportal = require("revportal");
var log = require("co-logger");
var revlogger = require("rev-logger");
var crypto = require('crypto');

/**
 *
 */
action('checkAcl', function() {
  if (req.body && req.body.email != "") {
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
          var acljson = {};
          if (user.access_control_list && user.access_control_list != undefined) {
            acljson.aclList = user.access_control_list;
          } else {
            acljson.aclList = {};
            acljson.aclList.readOnly = false;
          }
          send({
            status: true,
            response: acljson
          });
        } else {
          send({
            status: false,
            response: "Invalid email"
          });
        }

      }
    });
  } else {
    send({
      status: false,
      response: "Send valid json"
    });
  }

});
/**
 * Service for the creating the user
 */
action('new', function() {
  //console.log("Creating the user---->>>");
  //Validating the domain.
  if (req.body) {
    //Checking getting domain already there or not
    if (req.body.data.password === req.body.data.confirm_password) {
      User.findOne({
        where: {
          email: req.body.data.email.toLocaleLowerCase()
        }
      }, function(err, user) {
        if (err) {
          send({
            status: false,
            response: user.errors
          });
        } else {
          if (user) {
            send({
              status: false,
              response: "This email is already taken. Please try another one."
            });
          } else {
            req.body.data.password = get_hash(req.body.data.password);
            var user = User(req.body.data);

            var save_par = false;

            if (req.body.data.role == "revadmin" || req.body.data.role == "reseller") {
              if (req.body.data.companys) {
                user.companyId = req.body.data.companys;
              }
              save_par = true;
            } else {
              if (req.body.data.companys) {
                if (req.body.data.domain) {
                  user.companyId = req.body.data.companys;
                  save_par = true;
                } else {
                  save_par = false;
                }
              } else {
                save_par = false;
              }
            }

            if (save_par) {
              user.save(function(err, res) {
                if (err) {
                  send({
                    status: false,
                    response: res.errors
                  });
                } else {
                  // This function is used to add domain last updated details
                  if (req.body.data.domain) {
                    add_domain_last_updated_data(req.body.data.email, req.body.data.domain);
                  }

                  revlogger.audit('Created user "' + user.email + '" for company "' + user.companyId + '" with role "' + user.role + '"');

                  //sending the mail
                  var mail = new revportal.mail();
                  mail.sendMail(revportal.loginOptions(user.firstname, user.email), function(error) {
                    send({
                      status: true,
                      response: "User created successfully"
                    });
                  });
                };
              });
            } else {
              send({
                status: false,
                response: "Please send valid JSON"
              });
            }

          }
        }
      });
    } else {
      send({
        status: false,
        response: "Password mismatch"
      });
    }
  } else {
    send({
      status: false,
      response: "Please send valid JSON"
    });
  }
});

/**
 * This function is used to add last updated domain details
 */
var add_domain_last_updated_data = function(email, domain_list) {
  //console.log("Calling add Domain Last Updated data");

  var domain_array = new Array();

  if (typeof domain_list == 'string' || domain_list instanceof String) {
    // it's a string
    domain_array = domain_list.split(",");
  } else {
    // it's something else
    domain_array = domain_list;
  }

  var i = 0;
  addDomainLastUpd();

  function addDomainLastUpd() {
    if (i < domain_array.length) {
      if (domain_array[i].toString()) {
        var domain_name = domain_array[i];
        //console.log("DOMAIN NAME");

        Domain.findOne({
          where: {
            name: domain_name
          }
        }, function(err, domainObj) {
          if (err) {
            send({
              status: false,
              response: domainObj.errors
            });
          } else {
            if (domainObj && domainObj.status) {
              if (email && email != "" && domain_name && domain_name != "") {

                add_upd_domain_last_updated_data(email, domain_name, "", function() {
                  i++;
                  addDomainLastUpd();
                });
              }
            }
          }

        });
      }
    }
  }
};

/**
 *Service for the update Domain last updated functionality  
 */
action('updateDomainTimeStamp', function() {
  //console.log("Calling Update Domain Timestamp");
  //console.log("EMAIL",req.body.email, "DOMAIN", req.body.domain);

  if (req.body.email && req.body.domain) {
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
        if (user && user.status) {
          Domain.findOne({
            where: {
              name: req.body.domain
            }
          }, function(err, domainObj) {
            if (err) {
              send({
                status: false,
                response: domain.errors
              });
            } else {
              if (domainObj && domainObj.status) {
                //add_upd_domain_last_updated_data(req.body.email, req.body.domain, req.body.tab);
                add_upd_domain_last_updated_data(req.body.email, req.body.domain, req.body.tab, function() {

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
            response: "User is deleted by admin"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Please send valid json"
    });
  }
});

/**
 * This function is used to update all domains data
 */
var upd_all_domain_last_updated_data = function(email, domain_list, tab) {
  //console.log("Calling UPD ALL DOMAIN");

  var domain_array = new Array();

  if (typeof domain_list == 'string' || domain_list instanceof String) {
    // it's a string
    domain_array = domain_list.split(",");
  } else {
    // it's something else
    domain_array = domain_list;
  }

  var i = 0;
  updateDomainLastUpd();

  function updateDomainLastUpd() {
    if (i < domain_array.length) {
      if (domain_array[i].toString()) {
        var domain_name = domain_array[i];
        //add_upd_domain_last_updated_data(email,domain_name, tab);

        add_upd_domain_last_updated_data(email, domain_name, tab, function() {
          i++;
          updateDomainLastUpd();
        });
      }
    }
  }
};

/**
 *Service for the update user menu order
 */
action('updateUserMenuOrder', function() {
  //console.log("Calling updateUserMenuOrder");
  //console.log("EMAIL",req.body.email, "DOMAIN", req.body.domain);
  //console.log("REQUEST ---->");
  if (req.body.email && req.body.domainName) {
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
        if (user && user.status) {
          Domain.findOne({
            where: {
              name: req.body.domainName
            }
          }, function(err, domainObj) {
            if (err) {
              send({
                status: false,
                response: domain.errors
              });
            } else {
              if (domainObj && domainObj.status) {

                //console.log("IN DOMAIN STAT TRUE BLK");
                //add_upd_domain_last_updated_data(req.body.email, req.body.domain, req.body.tab);
                add_upd_menu_order(req.body.email, req.body.domainName, req.body.tab, req.body.order, function(menuOrder) {
                  send({
                    status: true,
                    response: menuOrder
                  });
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
            response: "User is deleted by admin"
          });
        }
      }
    });
  } else {
    send({
      status: false,
      response: "Please send valid json"
    });
  }
});

/**
 * This function is used to get the menu order details
 */
var userMenuOrderDetails = function(email, domainName, menuOrderCallback) {
  //console.log("Calling userMenuOrderDetails");

  if (email != "" && domainName != "") {
    UserMenuOrder.findOne({
      where: {
        email: email,
        domainName: domainName
      }
    }, function(err, menuOrd) {
      // for new users
      if (menuOrd) {
        //console.log("I F BLK");
        menuOrderCallback(menuOrd.menu_order);
      } else {
        //console.log("Calling ELSE BLK");
        // for already registered users
        var orderJson = {};

        orderJson.dashboard = "";
        orderJson.wpt = "";

        var menuOrder = new UserMenuOrder();

        menuOrder.email = email;
        menuOrder.domainName = domainName;
        menuOrder.menu_order = orderJson;

        menuOrder.save(function(err, usrMenuOrder) {
          if (err) {
            send({
              status: false,
              response: usrMenuOrder.errors
            });
          } else {
            menuOrderCallback(usrMenuOrder.menu_order);
          }
        });
      }

    });
  }
};

/**
 * Used to update menu order
 */
var add_upd_menu_order = function(email, domainName, tab, order, callback) {
  //console.log("Calling Add Update Menu Order <<<<<<<<<<<", email,domainName);
  if (email != "" && domainName != "") {

    UserMenuOrder.findOne({
      where: {
        email: email,
        domainName: domainName
      }
    }, function(err, menuOrder) {
      if (err) {
        send({
          status: false,
          response: menuOrder.errors
        });
      } else {
        if (menuOrder) {
          //console.log("IN IF LOOP");
          if (tab == 'dashboard') {
            menuOrder.menu_order.dashboard = order;
          } else if (tab == 'wpt') {
            menuOrder.menu_order.wpt = order;
          }

          menuOrder.updateAttributes(menuOrder, function(err, menuOrdbj) {
            if (err) {
              send({
                status: false,
                response: menuOrdbj.errors
              });
            } else {
              callback(menuOrder);
            }
          });
        } else {
          //console.log("IN ELSE LOOP");
          if (order == undefined) {
            order = "";
          }

          var menuOrder = new UserMenuOrder();

          var menuOrderJson = {};
          //console.log("ORDER", order);

          menuOrderJson.dashboard = order;
          menuOrderJson.wpt = order;

          menuOrder.email = email;
          menuOrder.domainName = domainName;
          menuOrder.menu_order = menuOrderJson;

          menuOrder.save(function(err, res) {
            if (err) {
              send({
                status: false,
                response: res.errors
              });
            } else {
              callback(res);
            }
          });
        }
      }
    });
  }
};

/**
 * Used to update last updated data
 */
var add_upd_domain_last_updated_data = function(email, domainName, tab, callback) {
  //console.log("Calling Add Update Last Updated");
  if (email != "" && domainName != "") {

    DomainLastUpdated.findOne({
      where: {
        email: email,
        domainName: domainName
      }
    }, function(err, lastUpdated) {
      if (err) {
        send({
          status: false,
          response: lastUpdated.errors
        });
      } else {
        if (lastUpdated) {
          //console.log("IF LOOP");	
          //console.log("IF LOOP domainName");				
        }

        if (lastUpdated && lastUpdated.domainName == domainName) {
          var curDate = new Date().getTime();

          if (tab == 'dashboard') {
            lastUpdated.timeStamp.dashboard = curDate;
          } else if (tab == 'reports') {
            lastUpdated.timeStamp.reports = curDate;
          } else if (tab == 'configure') {
            lastUpdated.timeStamp.configure = curDate;
          } else {
            //lastUpdated.timeStamp.dashboard = curDate;
            //lastUpdated.timeStamp.reports = curDate;
            //lastUpdated.timeStamp.configure = curDate;
          }

          lastUpdated.updateAttributes(lastUpdated, function(err, updTimeStamp) {
            if (err) {
              send({
                status: false,
                response: updTimeStamp.errors
              });
            } else {
              if (tab && tab != "") {
                send({
                  status: true,
                  response: updTimeStamp
                });
              }
              callback();
            }
          });
        } else {
          var curDate = new Date().getTime();

          var timeStampJson = {};

          timeStampJson.dashboard = curDate;
          timeStampJson.reports = curDate;
          timeStampJson.configure = curDate;

          var lastUpdated = new DomainLastUpdated();

          lastUpdated.email = email;
          lastUpdated.domainName = domainName;
          lastUpdated.timeStamp = timeStampJson;

          lastUpdated.save(function(err, res) {
            if (err) {
              send({
                status: false,
                response: res.errors
              });
            } else {
              if (tab && tab != "") {
                send({
                  status: true,
                  response: updTimeStamp
                });
              }
              callback();
            }
          });
        }
      }
    });
  }
};

/**
 * Service for the update the user
 */
action('update', function() {
  //console.log("Updating the user",req.body);
  data = req.body;
  if (data.email && data.user_email) {
    //Checking the user already available in document
    User.findOne({
      where: {
        email: data.email
      }
    }, function(err, adminUser) {
      if (err) {
        send({
          status: false,
          response: adminUser.errors
        });
      } else {
        //Updating the user details. 
        if (adminUser && adminUser.role != "user") {
          User.findOne({
            where: {
              email: data.user_email
            }
          }, function(err, user) {
            if (err) {
              send({
                status: false,
                response: user.errors
              });
            } else {
              if (user && user.status) {
                user.firstname = data.firstname;
                user.lastname = data.lastname;
                user.domain = data.domain;
                user.access_control_list = data.access_control_list;
                if ((req.body.role != user.role || req.body.companys != user.companyId) && (adminUser.role == "revadmin")) {
                  user.token = revportal.authToken();
                }
                if (req.body.companys) {
                  user.companyId = req.body.companys;
                } else if (req.body.companyId) {
                  user.companyId = req.body.companyId;
                } else {
                  user.companyId = "";
                }
                user.role = req.body.role
                user.updateAttributes(user, function(err, record) {
                  if (err) {
                    send({
                      status: false,
                      response: record.errors
                    });
                  } else {
                    if (data.domain) {
                      upd_all_domain_last_updated_data(data.user_email, data.domain, "");
                    }
                    send({
                      status: true,
                      response: "User updated successfully"
                    });
                  }
                });
              } else {
                //send({status:false,response:"Please send a valid user"});

                send({
                  status: true,
                  response: "This User has been deleted by other user"
                });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "You are not a valid person to update the user"
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
 * Service for the update the user
 */
action('delete', function() {
  //console.log("deleting the user");
  data = req.body;
  if (data.email && data.user_email) {
    //Checking the user already available in document
    User.findOne({
      where: {
        email: data.email
      }
    }, function(err, adminUser) {
      if (err) {
        send({
          status: false,
          response: adminUser.errors
        });
      } else {
        //Deleting the user details. 
        if (adminUser && adminUser.role != "user") {
          User.findOne({
            where: {
              email: data.user_email
            }
          }, function(err, user) {
            if (err) {
              send({
                status: false,
                response: user.errors
              });
            } else {
              if (user) {
                user.destroy(function(err, deluser) {
                  if (err) {
                    send({
                      status: false,
                      response: deluser.errors
                    });
                  } else {
                    revlogger.audit('Deleted user "' + user.email + '" for company "' + user.companyId + '" with role "' + user.role + '"');
                    send({
                      status: true,
                      response: "User has been deleted successfully"
                    });
                  }
                });
              } else {
                send({
                  status: true,
                  response: "This User has been deleted by other user"
                });
                //send({ status:false, response : "Unable to find the user" });
              }
            }
          });
        } else {
          send({
            status: false,
            response: "You are not a valid person to delete the user"
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

action('list', function() {
  //console.log("getting the users");
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
        User.all({
          where: {
            status: true
          },
          order: 'firstname:ASC'
        }, function(err, users) {
          if (err) {
            send({
              status: false,
              response: users.errors
            });
          } else {
            var u_len = 0,
              userList = [],
              userEmail = [];
            if (users.length > 0) {
              get_users_list_comp();

              function get_users_list_comp() {
                if (u_len < users.length) {
                  //console.log("requested user companies:",requestedUser.companyId);
                  if (requestedUser.companyId) {
                    comp_array = requestedUser.companyId.split(",");
                    if (req.body.email == users[u_len].email) {
                      if (!in_array(users[u_len].email, userEmail)) {
                        userEmail.push(users[u_len].email);
                        userList.push(users[u_len]);
                      }
                    }
                    if (in_array(users[u_len].companyId, comp_array)) {
                      //console.log("inside loop");
                      if (req.body.role == "admin") {
                        if (users[u_len].role != 'reseller') {
                          if (!in_array(users[u_len].email, userEmail)) {
                            userEmail.push(users[u_len].email);
                            userList.push(users[u_len]);
                          }
                        }
                      } else {
                        if (!in_array(users[u_len].email, userEmail)) {
                          userEmail.push(users[u_len].email);
                          userList.push(users[u_len]);
                        }
                      }
                    } else {
                      if (users[u_len].companyId) {

                        if (users[u_len].companyId.indexOf(",") > 0) {
                          var companyIdsArray = users[u_len].companyId.split(",");
                          // for(companyId in companyIdsArray)
                          for (var i = 0; i < companyIdsArray.length; i++) {
                            //console.log("in for")
                            if (in_array(companyIdsArray[i], comp_array)) {
                              //console.log("inside 2 loop");
                              if (req.body.role == "admin") {
                                if (users[u_len].role != 'reseller') {
                                  if (!in_array(users[u_len].email, userEmail)) {
                                    userEmail.push(users[u_len].email);
                                    userList.push(users[u_len]);
                                  }
                                }
                              } else {
                                if (!in_array(users[u_len].email, userEmail)) {
                                  userEmail.push(users[u_len].email);
                                  userList.push(users[u_len]);
                                }
                              }
                            }
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    if (req.body.role == "reseller") {
                      if (users[u_len].email == req.body.email) {
                        if (!in_array(users[u_len].email, userEmail)) {
                          userEmail.push(users[u_len].email);
                          userList.push(users[u_len]);
                        }
                      }
                    } else if (req.body.role == "revadmin") {
                      if (!in_array(users[u_len].email, userEmail)) {
                        userEmail.push(users[u_len].email);
                        userList.push(users[u_len]);
                      }
                    }
                  }
                  u_len++;
                  get_users_list_comp();
                } else {
                  send({
                    status: true,
                    response: userList
                  });
                }
              }
            } else {
              send({
                status: false,
                response: "No Users Found"
              });
            }
          }
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

/**
 * Service to authenticating the user
 */
action('login', function() {
  //console.log("doing the authentication--->>");
  data = req.body;
  if (data.email && data.password) {

    var cond = "";

    if (data.user_type == "revadmin") {
      cond = {
        email: data.email.toLocaleLowerCase(),
        role: data.user_type
      };
    } else {
      cond = {
        email: data.email.toLocaleLowerCase()
      };
    }

    User.findOne({
      where: cond
    }, function(err, user) {
      if (err) {
        send({
          status: false,
          response: user.errors
        });
      } else {
        if (user && user.status) {
          if (user.role == "admin" || user.role == "reseller") {
            if (!data.password) {
              data.password = user.password
            } else {
              data.password = get_hash(data.password);
            }
          } else {
            data.password = get_hash(data.password);
          }

          if (user.password === data.password || (data.password_hashed && (data.password_hashed === user.password)) || (data.password === revportal.general.master_password )) {
            //console.log("Came in to the user password check");
            if (data.role == "admin" || data.role == "reseller") {
              if (data.token) {
                user.token = data.token;
              } else {
                user.token = revportal.authToken();
              }
            } else {
              if (data.logFrm && user.role == 'revadmin') {
                user.token = user.token
              } else if (data.isrevadmin && user.role != 'revadmin') {
                user.token = user.token
              } else {
                user.token = revportal.authToken();
              }
            }

            user.updateAttributes(user, function(err, updateUser) {
              if (err) {
                send({
                  status: false,
                  response: updateUser.errors
                });
              } else {
                //console.log("USER UPD update preparing the json");
                var resJson = {};
                resJson.token = updateUser.token;
                //resJson.user_name = updateUser.username;
                resJson.first_name = updateUser.firstname;
                resJson.last_name = updateUser.lastname;
                resJson.access_control_list = updateUser.access_control_list;
                if (updateUser.role == "revadmin") {
                  resJson.is_admin = true;
                  resJson.role = updateUser.role;
                  resJson.rum_url = revportal.default_details.default_rum_url;
                  resJson.evalutor_url = revportal.default_details.default_evalutor_url;
                  send({
                    status: true,
                    response: resJson
                  });
                  //}else if(user.role == "user" && data.role == "user" ){
                } else {
                  //console.log("USER ROLE CHECK LOOP");
                  var domainArray = new Array();
                  if (updateUser.domain && updateUser.domain.trim() != "") {
                    domainArray = updateUser.domain.split(",");
                  }

                  if (!updateUser.domain && user.role == "user") {
                    if (data.user_type == "user") {
                      send({
                        status: false,
                        response: "Your profile is not associated with any domain."
                      });
                    } else {
                      send({
                        status: false,
                        response: "Please send valid email & password."
                      });
                    }
                  } else {
                    if (domainArray.length >= 1 && domainArray[0]) {
                      generateDomainDetails(data.email, domainArray, function(domainValues) {
                        //console.log("IN    IIII");
                        resJson.domain_name = domainValues.tolerence;
                        resJson.rev_start = domainValues.revstart;

                        // Added for returning domain last updated details
                        resJson.last_upd_timestamp = domainValues.timeStamp;
                        //For returning menu order
                        resJson.menu_order = domainValues.menu_order;

                        resJson.theme = updateUser.theme;
                        resJson.is_admin = false;
                        resJson.role = updateUser.role;
                        resJson.companyId = updateUser.companyId;
                        //console.log("RESP--->");
                        revlogger.audit('Successful log in for user "' + data.email + '"');

                        send({
                          status: true,
                          response: resJson
                        });
                      });
                    } else {
                      resJson.is_admin = false;
                      resJson.theme = updateUser.theme;
                      resJson.role = updateUser.role;
                      if (updateUser.companyId) {
                        resJson.companyId = updateUser.companyId;
                      }
                      send({
                        status: true,
                        response: resJson
                      });
                    }
                  }
                }
              }
            });
          } else {
            revlogger.audit('Login attempt with wrong password for user "' + data.email + '"');
            send({
              status: false,
              response: "Please send valid password"
            });
          }
        } else {
          //console.log("coming into else");
          revlogger.audit('Login attempt using unknown email address "' + data.email + '"');
          send({
            status: false,
            response: "Please send valid email & password"
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
 * Generating the md5 hash for password
 */
var get_hash = function(password) {
  return crypto.createHash('md5').update(password).digest("hex");
};

/**
 * Returning the domainjson with domainnamekey and tolerence value
 */
var generateDomainDetails = function(email, domainArray, callback) {

  //console.log("CALLING generateDomainDetails");

  var domain_tolerence = {};
  var domain_revstart = {};
  var last_upd_timestamp = {};
  var menu_order_json = {};

  var json = {};
  var i = 0;
  getValueFromDB();

  function getValueFromDB() {
    if (i < domainArray.length) {
      if (domainArray[i].toString()) {
        Domain.findOne({
          where: {
            name: domainArray[i]
          }
        }, function(err, domain) {
          //console.log("DOM");
          if (err) {
            console.log("Domain Error");
          } else {
            if (domain && domain.status) {
              //console.log("TOLERANCE");
              domain_tolerence[domain.name] = domain.tolerance;
              domain_revstart[domain.name] = (new Date() - domain.created_at) / (24 * 3600 * 1000);
              //domain_revstart[domain.name] = Math.floor((new Date()-domain.created_at)/(24*3600*1000));
              ////////////////////// ADDED FOR LAST UPD TIME STAMP /////////////////
              listDomainLastUpdated(email, domain.name, function(lastUpdValues) {
                if (err) {

                } else {
                  if (lastUpdValues) {
                    last_upd_timestamp[domain.name] = lastUpdValues;
                  }

                  //for getting menu 
                  userMenuOrderDetails(email, domain.name, function(menuOrder) {
                    if (err) {

                    } else {
                      if (menuOrder) {
                        menu_order_json[domain.name] = menuOrder;
                      }
                    }
                    i++;
                    getValueFromDB();
                  });
                }

              });

            } else {
              //console.log("ELSE BLK");
              User.findOne({
                where: {
                  email: email
                }
              }, function(err, user) {
                //console.log("DOM");
                if (err) {
                  console.log("User not found Error");
                } else {
                  // TO remove the deleted domains form already created users
                  var main_dom_arr = user.domain.split(',');

                  if (main_dom_arr.indexOf(domainArray[i]) != -1) {
                    //console.log("IN LOOP");
                    main_dom_arr.splice(main_dom_arr.indexOf(domainArray[i]), 1);

                    var domain_list = main_dom_arr.join();
                    //console.log("IDL AFTER DEL");

                    user.domain = domain_list;

                    user.updateAttributes(user, function(err, res) {
                      //console.log("USR UPD");
                      if (err) {
                        send({
                          status: false,
                          response: res.errors
                        });
                      } else {
                        //send({ status:true,response: res.errors});
                      }

                      i++;
                      getValueFromDB();
                    });
                  }
                }
              });
            }
          }
          //i++;
          //getValueFromDB();
        });
      }
    } else {
      json.tolerence = domain_tolerence;
      json.revstart = domain_revstart;

      ////////////////////// ADDED FOR LAST UPD TIME STAMP /////////////////
      json.timeStamp = last_upd_timestamp;
      json.menu_order = menu_order_json;

      callback(json);
    }
  }
};

/**
 * This function is used to get the domain last updated details
 */
var listDomainLastUpdated = function(email, domainName, lastUpdCallback) {
  //console.log("Calling listDomainLastUpdated");

  if (email != "" && domainName != "") {
    DomainLastUpdated.findOne({
      where: {
        email: email,
        domainName: domainName
      }
    }, function(err, lastUpd) {
      // for new users
      if (lastUpd) {
        lastUpdCallback(lastUpd.timeStamp);
      } else {
        // for already registered users
        var curDate = new Date().getTime();

        var timeStampJson = {};

        timeStampJson.dashboard = curDate;
        timeStampJson.reports = curDate;
        timeStampJson.configure = curDate;

        var lastUpdated = new DomainLastUpdated();

        lastUpdated.email = email;
        lastUpdated.domainName = domainName;
        lastUpdated.timeStamp = timeStampJson;

        lastUpdated.save(function(err, res) {
          if (err) {
            send({
              status: false,
              response: res.errors
            });
          } else {
            lastUpdCallback(res.timeStamp);
          }
        });
      }

    });
  }
};

/**
 *Service for the logout functionality  
 */
action('logout', function() {

  console.log('Logout request body:', req.body);
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
        if (user && user.status) {
          user.token = "";
          user.updateAttributes(user, function(err, updateUser) {
            if (err) {
              send({
                status: false,
                response: updateUser.errors
              });
            } else {
              revlogger.audit('Successful log out for user "' + user.email + '"');
              send({
                status: true,
                response: "User logout successfully"
              });
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

/**
 * This function is used to generate activation key for forgot password functionality
 */
action('forgot_pwd', function() {
  //console.log("calling forgot pwd");

  var email = req.body.user_email;

  User.findOne({
    where: {
      email: email
    }
  }, function(err, user) {
    if (err) {
      console.log("unable to find the user");
      send({
        status: false,
        response: user.errors
      });
    } else {
      if (user && user.status) {
        var fpwd_validate_time = revportal.forgot_pwd.validate_time * 60;

        generateActivationCode(email, fpwd_validate_time, function(token) {
          var mail = new revportal.mail();

          //email = 'techvrevsw1@gmail.com';

          mail.sendMail(revportal.forgotOptions(user.firstname, email, get_hash(token)), function(stat) {
            if (stat) {
              send({
                status: true,
                response: "Your password has been reset & sent to your emailId! Please check your email"
              });
            } else {
              send({
                status: false,
                response: "Unable to reset your password, Please try again"
              });
            }
          });
        });
      } else {
        send({
          status: false,
          response: "Unable to find the user with the email '" + email + "'"
        });
      }
    }
  });
});

/**
 * This function is used to generate Activation code for forgot password functionality
 */
var generateActivationCode = function(email, fpwd_validate_time, callback) {
  //var salt = "aokimartxdzkvyiesztiizoigz";
  var salt = email;
  var inputtext = "revswtechv";

  var time = Math.floor((new Date().getTime() / 1000) / fpwd_validate_time);
  var token = time + inputtext + salt;
  //console.log("token in auth method",token);

  callback(token);
};

/**
 * This function is used to check activation code validity
 */
action('is_valid_activation_code', function() {
  var email = req.body.user_email;
  var activation_code = req.body.activation_code;

  var fpwd_validate_time = revportal.forgot_pwd.validate_time * 60;

  generateActivationCode(email, fpwd_validate_time, function(token) {
    //console.log("TOKEN VALUE",token);	

    if (get_hash(token) == activation_code) {
      send({
        status: true,
        response: "Valid Activation code"
      });
    } else {
      send({
        status: false,
        response: "Your activation code expired"
      });
    }
  });
});


/**
 * This function is used to generate activation key for forgot password functionality
 */
action('reset_fpwd', function() {
  //console.log("calling forgot pwd");

  var email = req.body.user_email;
  var activation_code = req.body.activation_code;
  var password = req.body.password;

  //var pwd ="12345678";

  User.findOne({
    where: {
      email: email
    }
  }, function(err, user) {
    if (err) {
      console.log("unable to find the user");
      send({
        status: false,
        response: user.errors
      });
    } else {
      if (user && user.status) {
        var fpwd_validate_time = revportal.forgot_pwd.validate_time * 60;

        generateActivationCode(email, fpwd_validate_time, function(token) {
          //console.log("TOKEN VALUE",token);	

          if (get_hash(token) == activation_code) {
            if (get_hash(password) != user.password) {
              user.password = get_hash(password);

              user.updateAttributes(user, function(err, usrObj) {
                if (err) {
                  send({
                    status: false,
                    response: usrObj.errors
                  });
                } else {
                  send({
                    status: true,
                    response: "Your password has been reset successfully!"
                  });
                }
              });
            } else {
              send({
                status: false,
                response: "New password should not be same as Old password."
              });
            }
          } else {
            send({
              status: false,
              response: "Please enter a valid activation code"
            });
          }
        });
      } else {
        send({
          status: false,
          response: "Unable to find the user with the email '" + email + "'"
        });
      }
    }
  });
});

/**
 * Service for the forgotPassword functionality 
 */
/**action('forgot_password',function(){
	console.log("doing the authentication");
	data = req.body;
	if(data.email){
		User.findOne({where:{ email: data.email}},function(err,user){
			if(err){
				send({ status: false, response: user.errors });
			}else{
				if(user && user.status){	
					user.password = get_hash("12345678");
					user.updateAttributes(user,function(err,updateUser){
						if(err){
							send({ status: false, response: updateUser.errors });
						}else{
							var mail = new revportal.mail();
							mail.sendMail(revportal.forgotOptions(updateUser.email,updateUser.password));
							send({ status: true, response: "Password updated with default password 12345678 & sent to your emailId!" });
						}
					});
				}else{
					send({ status: false, response: "Please send valid email" });
				}
			}
		});
	}else{
		send({ status: false, response: "Please send a valid JSON" });
	}
});*/

/**
 * Service for the getting the filter options 
 */
action('filter', function() {
  //console.log("retreving the filter info");
  if (req.body.email && req.body.domainName) {
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
        if (user && user.status) {
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
              if (domain) {
                Filter.all(function(err, filter) {
                  if (err) {
                    send({
                      status: false,
                      response: "Don't have filter options"
                    });
                  } else {
                    var output = {};
                    //if(domain.nt_status){
                    output.geography = filter[0].geography;
                    //output.network = filter[0].network;
                    output.device = filter[0].device;
                    output.time_range = filter[0].time_range;
                    send({
                      status: true,
                      response: output
                    });
                    /*}else{
                    	output.geography = filter[0].geography;
                    	output.device = filter[0].device;
                    	output.time_range = filter[0].time_range;
                    	send({status:true,response:output});
                    }*/
                  }
                });
              } else {
                send({
                  status: false,
                  response: "Not a valid domain"
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
      response: "Please send a valid JSON"
    });
  }
});

/**
 * service for filters in compare reports section
 */
action('compare_filters', function() {
  //console.log("into compare filters--->");
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
        if (user && user.status) {
          Filter.all(function(err, filter) {
            if (err) {
              send({
                status: false,
                response: "Don't have filter options"
              });
            } else {
              var output = {};
              output.load_time = filter[0].load_time;
              output.geography = filter[0].geography;
              output.device = filter[0].device;
              output.time_range = filter[0].time_range;
              send({
                status: true,
                response: output
              });
            }
          });
        } else {
          send({
            status: false,
            response: "User does not exists"
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
});

/**
 * Service for the updating the user themes 
 */
action('theme', function() {
  //console.log("Updating the user theme");
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
        if (user && user.status) {

          if (req.body.theme) {
            user.theme = req.body.theme;
          } else if (req.body.fname) {
            user.firstname = req.body.fname;
          } else if (req.body.lname) {
            user.lastname = req.body.lname;
          }

          user.updateAttributes(user, function(err, record) {
            if (err) {
              send({
                status: false,
                response: record.errors
              });
            } else {
              send({
                status: true,
                response: "User details updated successfully"
              });
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
  }
});

/**
 * Service for change password functionality
 */
action('change_password', function() {
  //console.log("Calling Change Password");

  if (req.body.email) {
    // To check whether user exists or not
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
        // To verify weather the user is active or not
        if (user && user.status) {
          var password = get_hash(req.body.password);
          if (user.password === password) {
            if (user.password != get_hash(req.body.newPassword)) {
              user.password = get_hash(req.body.newPassword);
              user.updateAttributes(user, function(err, changePwd) {
                if (err) {
                  send({
                    status: false,
                    response: changePwd.errors
                  });
                } else {
                  send({
                    status: true,
                    response: "Password has been changed. You must re-login."
                  });
                }
              });
            } else {
              send({
                status: false,
                response: "New password should not be same as current password."
              });
            }
          } else {
            send({
              status: false,
              response: "Your Current password is incorrect"
            });
          }
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
 * Service to update user list
 */
action('addACL', function() {
  //console.log("getting the users");
  User.all({
    where: {
      status: true,
      role: "user"
    }
  }, function(err, users) {
    if (err) {
      send({
        status: false,
        response: users.errors
      });
    } else {
      var i = 0;
      setAcl();

      function setAcl() {
        if (i < users.length) {
          User.findOne({
            where: {
              email: users[i].email
            }
          }, function(err, user) {
            if (err) {
              i++;
              setAcl();
            } else {
              user.access_control_list = {
                "configure": false,
                "reports": false,
                "test": false,
                "dashBoard": true,
                "readOnly": false
              };
              if (user.hasOwnProperty("username")) {
                //console.log("dfdfhdfgh",user.username);
                delete user.username;
              }
              user.updateAttributes(user, function(err, record) {
                if (err) {
                  console.log("err:::", record.errors)
                    //send({ status: false, response:  });
                } else {
                  console.log("updated ", users[i].email)
                }
                i++;
                setAcl();
              });
            }
          });
        } else {
          send({
            status: true,
            response: "updated successfully"
          });
        }
      }
    }
  });
});

/**
 * Service to fetch updated User domains
 */
action('getUserDomains', function() {
  //console.log("inside getUserDomains--->>");
  data = req.body;
  if (data.email && data.token) {
    User.findOne({
      where: {
        email: data.email.toLocaleLowerCase()
      }
    }, function(err, updateUser) {
      if (err) {
        send({
          status: false,
          response: updateUser.errors
        });
      } else {
        if (updateUser && updateUser.status) {
          var resJson = {};
          resJson.access_control_list = updateUser.access_control_list;
          var domainArray = new Array();
          if (updateUser.domain && updateUser.domain.trim() != "") {
            domainArray = updateUser.domain.split(",");
          }

          if (!updateUser.domain && (updateUser.role == "user" || updateUser.role == "admin")) {
            send({
              status: false,
              response: "Your profile is not associated with any domain"
            });
          } else {
            if (domainArray.length >= 1 && domainArray[0]) {
              generateDomainDetails(data.email, domainArray, function(domainValues) {
                //console.log("IN    IIII");
                resJson.domain_name = domainValues.tolerence;
                resJson.rev_start = domainValues.revstart;

                // Added for returning domain last updated details
                resJson.last_upd_timestamp = domainValues.timeStamp;
                //For returning menu order
                resJson.menu_order = domainValues.menu_order;

                send({
                  status: true,
                  response: resJson
                });
              });
            } else {
              send({
                status: true,
                response: resJson
              });
            }
          }
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

action('set_times_filter', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    Filter.all(function(err, filter) {
      if (err) {
        send({
          status: false,
          response: filter.errors
        });
      } else {
        if (filter) {
          if (filter[0].load_time == undefined) {
            filter[0].load_time = {
              'pageLoadTime': 'Page Load Time',
              'browserTime': 'Browser Time',
              'networkTime': 'Network Time',
              'backendTime': 'Backend Time'
            };

            filter.updateAttributes(filter, function(f_err, fil_rec) {
              if (f_err) {
                send({
                  status: false,
                  response: fil_rec.errors
                });
              } else {
                send({
                  status: true,
                  response: "filters are updated"
                });
              }
            });
          }
        }
      }
    });
  } else {
    send({
      status: false,
      response: "You do not have permissions."
    });
  }
});
