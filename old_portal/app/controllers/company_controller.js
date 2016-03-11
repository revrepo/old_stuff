load('application');

//Loading the required modules
var log = require("co-logger");
var WebSocketClient = require('websocket').client;
var WebSocket = require('ws');

action('new', function() {
  //console.log("Creating the Company---->>>");
  if (req.body && req.body.cmp_name != undefined && req.body.cmp_name != "") {
    Company.findOne({
      where: {
        companyName: req.body.cmp_name
      }
    }, function(err, company) {
      if (err) {
        send({
          status: false,
          response: company.errors
        });
      } else {
        if (company) {
          send({
            status: false,
            response: "Company already exists"
          });
        } else {
          var company = Company();
          company.companyName = req.body.cmp_name;
          if (req.body.createdBy && req.body.createdBy != undefined) {
            company.createdBy = req.body.createdBy;
          } else {
            if (req.body.role == "revadmin") {
              company.createdBy = "revadmin";
            } else {
              company.createdBy = req.body.email;
            }
          }

          company.save(function(err, res) {
            if (err) {
              send({
                status: false,
                response: res.errors
              });
            } else {
              if (req.body.role == "reseller") {
                var res_obj = {};
                res_obj.message = "Company created successfully";
                res_obj.comp_id = res.id;

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
                      if (user.companyId) {
                        user.companyId = user.companyId + "," + res.id;
                      } else {
                        user.companyId = res.id;
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

                send({
                  status: true,
                  response: res_obj
                });
              } else {
                send({
                  status: true,
                  response: "Company created successfully"
                });
              }
            }
          });
        }
      }
    });

  } else {
    send({
      status: false,
      response: "Please send valid JSON"
    });
  }
});

/**
 * Service to returning the companies list
 */
action('list', function() {
  Company.all({
    where: {
      status: true
    },
    order: 'companyName:ASC'
  }, function(err, companies) {
    if (err) {
      send({
        status: false,
        response: companies.errors
      });
    } else {
      if (req.body.role == "revadmin") {
        if (req.body.sel_role == "reseller") {
          User.all({
            where: {
              role: "reseller",
              status: true
            }
          }, function(err, re_sellers) {
            if (err) {
              send({
                status: false,
                response: re_sellers.errors
              });
            } else {
              if (re_sellers.length > 0) {
                var re_len = 0,
                  res_arr = [];
                getcmpIds();

                function getcmpIds() {
                  if (re_len < re_sellers.length) {
                    if (re_sellers[re_len].companyId && res_arr.indexOf() == -1) {
                      if (re_sellers[re_len].companyId.indexOf(",") > 0) {
                        var companyIdsArray = re_sellers[re_len].companyId.split(",");
                        for (var i = 0; i < companyIdsArray.length; i++) {
                          if (!in_array(companyIdsArray[i], res_arr)) {
                            res_arr.push(companyIdsArray[i]);
                          }
                        }
                      } else {
                        if (!in_array(re_sellers[re_len].companyId, res_arr)) {
                          res_arr.push(re_sellers[re_len].companyId);
                        }
                      }
                    }
                    re_len++;
                    getcmpIds();
                  } else {
                    var re_cmp_len = 0,
                      comp_list_res = [],
                      curr_cmp_list = [];
                    getcmps_for_resellers();

                    function getcmps_for_resellers() {
                      if (re_cmp_len < companies.length) {
                        if (req.body.curr_companyId) {
                          if (req.body.curr_companyId.indexOf(",") > 0) {
                            var companyIdsArray = req.body.curr_companyId.split(",");
                            for (var i = 0; i < companyIdsArray.length; i++) {
                              if (!in_array(companyIdsArray[i], curr_cmp_list)) {
                                curr_cmp_list.push(companyIdsArray[i]);
                              }
                            }
                          } else {
                            if (!in_array(req.body.curr_companyId, curr_cmp_list)) {
                              curr_cmp_list.push(req.body.curr_companyId);
                            }
                          }
                          if (companies[re_cmp_len].createdBy == "superadmin") {
                            comp_list_res.push(companies[re_cmp_len]);
                          } else {
                            if (!in_array(companies[re_cmp_len].id.toString(), res_arr) || in_array(companies[re_cmp_len].id.toString(), curr_cmp_list)) {
                              if (companies[re_cmp_len].createdBy == "superadmin" || companies[re_cmp_len].createdBy == "revadmin" || companies[re_cmp_len].createdBy == req.body.sel_email) {
                                comp_list_res.push(companies[re_cmp_len]);
                              }
                            }
                          }
                        } else {
                          if (companies[re_cmp_len].createdBy == "superadmin") {
                            comp_list_res.push(companies[re_cmp_len]);
                          } else {
                            if (!in_array(companies[re_cmp_len].id.toString(), res_arr)) {
                              if (companies[re_cmp_len].createdBy == "superadmin" || companies[re_cmp_len].createdBy == "revadmin" || companies[re_cmp_len].createdBy == req.body.sel_email) {
                                comp_list_res.push(companies[re_cmp_len]);
                              }
                            }
                          }
                        }
                        re_cmp_len++;
                        getcmps_for_resellers();
                      } else {
                        send({
                          status: true,
                          response: comp_list_res
                        });
                      }
                    }
                  }
                }
              } else {
                send({
                  status: true,
                  response: companies
                });
              }
            }
          });
        } else {
          send({
            status: true,
            response: companies
          });
        }
      } else {
        var c_len = 0,
          comp_res = [],
          comp_id = [];
        if (req.body.email) {
          //console.log("inside reseller specific");
          User.findOne({
            where: {
              email: req.body.email,
              status: true
            }
          }, function(err, users) {
            if (err) {
              send({
                status: false,
                response: re_sellers.errors
              });
            } else {
              if (users.companyId) {
                var cIdArr = users.companyId.split(',');
                getPar_companies();

                function getPar_companies() {
                  if (c_len < companies.length) {
                    if (cIdArr.indexOf(companies[c_len].id.toString()) != -1) {
                      if (!in_array(companies[c_len].id.toString(), comp_id)) {
                        comp_res.push(companies[c_len]);
                        comp_id.push(companies[c_len].id);
                      }
                    }
                    if (companies[c_len].createdBy == req.body.email) {
                      if (!in_array(companies[c_len].id.toString(), comp_id)) {
                        comp_res.push(companies[c_len]);
                        comp_id.push(companies[c_len].id);
                      }
                    }
                    c_len++;
                    getPar_companies();
                  } else {
                    send({
                      status: true,
                      response: comp_res
                    });
                  }
                }
              } else {
                getres_companies();

                function getres_companies() {
                  if (c_len < companies.length) {
                    if (companies[c_len].createdBy == req.body.email) {
                      if (!in_array(companies[c_len].id.toString(), comp_id)) {
                        comp_res.push(companies[c_len]);
                        comp_id.push(companies[c_len].id);
                      }
                    }
                    c_len++;
                    getres_companies();
                  } else {
                    send({
                      status: true,
                      response: comp_res
                    });
                  }
                }
              }
            }
          });
        } else {
          send({
            status: true,
            response: comp_res
          });
        }
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
 * Service for the update the company
 */
action('update', function() {
  //console.log("Updating the company");
  if (req.body && req.body.cmp_id != undefined && req.body.cmp_id != "" && req.body.cmp_name != undefined && req.body.cmp_name != "") {
    var comp_id = req.body.cmp_id;
    Company.findOne({
      where: {
        id: comp_id
      }
    }, function(err, company) {
      if (err) {
        send({
          status: false,
          response: company.errors
        });
      } else {
        if (company && company.status) {
          company.companyName = req.body.cmp_name;
          company.updateAttributes(company, function(err, record) {
            if (err) {
              send({
                status: false,
                response: record.errors
              });
            } else {
              send({
                status: true,
                response: "Company updated successfully"
              });
            }
          });
        } else {
          //send({status:false,response:"Please send a valid company"});
          send({
            status: true,
            response: "This company has been deleted by some other user"
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
 * Service for the update the company
 */
action('delete', function() {
  //console.log("deleting the company");
  if (req.body && req.body.cmp_id) {
    Company.findOne({
      where: {
        id: req.body.cmp_id
      }
    }, function(err, company) {
      if (err) {
        send({
          status: false,
          response: company.errors
        });
      } else {
        if (company && company.status) {
          delete_user(company.id, function(stat) {
            delete_domain(company.id, function(stat) {
              company.destroy(function(err, res) {
                if (err) {
                  send({
                    status: false,
                    response: res.errors
                  });
                } else {
                  send({
                    status: true,
                    response: "Company deleted successfully."
                  });
                }
              });
            });
          });
        } else {
          //send({ status:false, response : "Unable to find the company." });
          send({
            status: true,
            response: "This company has been deleted by some other user"
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

var delete_user = function(companyId, callback) {
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
      var u_len = 0;
      if (u_len == 0) {
        get_users_list_comp();

        function get_users_list_comp() {
          if (u_len < users.length) {
            if (users[u_len].role != 'revadmin') {
              if (users[u_len].companyId) {
                comp_array = users[u_len].companyId.split(",");
                if (in_array(companyId, comp_array) && comp_array.length > 0) {
                  if (users[u_len].role != 'reseller') {
                    users[u_len].destroy(function(err, res) {
                      if (err) {
                        callback(false);
                      } else {
                        callback(true);
                      }
                    });
                  } else {
                    User.findOne({
                      where: {
                        email: users[u_len].email
                      }
                    }, function(err, user) {
                      if (err) {
                        console.log("Unable to update reseller");
                      } else {
                        var cmp_arr = [];
                        if (user.companyId) {
                          cmp_arr = user.companyId.split(',');
                          if (cmp_arr.indexOf(companyId.toString()) > -1) {
                            cmp_arr.splice(cmp_arr.indexOf(companyId.toString()), 1);
                            user.companyId = cmp_arr.join(',');
                            DomainsArray(companyId.toString(), function(delDomList) {
                              var userDomians = diffArray(user.domain.split(","), delDomList);
                              if (userDomians.length > 0) {
                                user.domain = userDomians;
                              } else {
                                user.domain = "";
                              }
                            });
                            user.updateAttributes(user, function(err, resellerUpdated) {
                              if (err) {
                                callback(false);
                              } else {
                                callback(true);
                              }
                            });
                          }
                        } else {
                          callback(true);
                        }
                      }
                    });
                  }
                } else {
                  //console.log("in call back");
                  //callback(true);
                }
              } else {
                //console.log("in last call back");
                //callback(true);
              }
            }
            u_len++;
            get_users_list_comp();
          } else {
            callback(true);
          }
        }
      }
    }
  });
};

var delete_domain = function(companyId, callback) {
  Domain.all({
    where: {
      status: true
    }
  }, function(err, domains) {
    if (err) {
      send({
        status: false,
        response: domains.errors
      });
    } else {
      var u_len = 0;
      if (u_len == 0) {
        get_domains_list_comp();

        function get_domains_list_comp() {
          if (u_len < domains.length) {
            if (domains[u_len].companyId) {
              if (domains[u_len].companyId == companyId) {
                domains[u_len].destroy(function(err, res) {
                  if (err) {
                    callback(false);
                  } else {
                    callback(true);
                  }
                });
              } else {
                callback(true);
              }

            } else {
              callback(true);
            }
            u_len++;
            get_domains_list_comp();
          }
        }
      }
    }
  });
};

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

/*
 *get company names with id
 */
action('getCompanyName', function() {
  if (req.body && req.body.companyId != undefined && req.body.companyId != "") {
    var comp_array = req.body.companyId.split(",");
    Company.all({
      where: {
        status: true
      }
    }, function(err, company) {
      if (err) {
        send({
          status: false,
          response: company.errors
        });
      } else {
        var u_len = 0,
          companyNameList = '';
        if (u_len == 0) {
          get_company_names_list();

          function get_company_names_list() {
            if (u_len < company.length) {
              if (in_array(company[u_len].id, comp_array) && comp_array.length > 0) {
                if (companyNameList) {
                  companyNameList += "," + company[u_len].companyName;
                } else {
                  companyNameList = company[u_len].companyName;
                }
              }
              u_len++;
              get_company_names_list();
            } else {
              send({
                status: true,
                response: companyNameList
              });
            }
          }
        } else {
          companyNameList.substring(0, companyNameList.length - 1);
          send({
            status: true,
            response: companyNameList
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

/*
 *Migration----
 *
 */
action('setCompanyId', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    Company.findOne({
      where: {
        companyName: "Rev Software"
      }
    }, function(err, company) {
      if (err) {
        send({
          status: false,
          response: company.errors
        });
      } else {
        var com_id = company.id;
        Domain.all({
          where: {
            status: true
          }
        }, function(err, domains) {
          if (err) {
            send({
              status: false,
              response: domains.errors
            });
          } else {
            var d_len = 0;
            addc_id_indomains();

            function addc_id_indomains() {
              if (d_len < domains.length) {
                var dom_name = domains[d_len].name;
                setforeachDomain(com_id, dom_name, function() {
                  d_len++;
                  addc_id_indomains();
                });
              } else {
                User.all({
                  where: {
                    status: true
                  }
                }, function(err, users) {
                  var u_len = 0;
                  addc_id_inusers();

                  function addc_id_inusers() {
                    if (u_len < users.length) {
                      var usr_email = users[u_len].email;
                      setforeachUser(com_id, usr_email, function() {
                        u_len++;
                        addc_id_inusers();
                      });
                    } else {
                      send({
                        status: true,
                        response: "Updation successfull"
                      });
                    }
                  }
                });
              }
            }
          }
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

var setforeachDomain = function(com_id, dom_name, callback) {
  Domain.findOne({
    where: {
      name: dom_name
    }
  }, function(err, domain) {
    if (err) {
      console.log("err");
      callback();
    } else {
      if (domain) {
        if (!domain.companyId) {
          domain.companyId = com_id;
          domain.updateAttributes(domain, function(err, record) {
            if (err) {
              console.log("domain updated errors");
              callback();
            } else {
              console.log("domain updated successfully");
              callback();
            }
          });
        } else {
          callback();
        }
      }
    }
  });
};

var setforeachUser = function(com_id, u_email, callback) {
  User.findOne({
    where: {
      email: u_email
    }
  }, function(err, user) {
    if (err) {
      console.log("err");
      callback();
    } else {
      if (user && user.role != 'admin') {
        if (!user.companyId) {
          user.companyId = com_id;
          user.updateAttributes(user, function(err, record) {
            if (err) {
              console.log("user updated errors");
              callback();
            } else {
              console.log("user updated successfully");
              callback();
            }
          });
        } else {
          callback();
        }
      } else {
        if (user) {
          user.role = "revadmin";
          user.updateAttributes(user, function(err, record) {
            if (err) {
              console.log("user updated errors");
              callback();
            } else {
              console.log("user updated successfully");
              callback();
            }
          });
        } else {
          callback();
        }
      }
    }
  });
};

function diffArray(a, b) {
  var seen = [],
    diff = [];
  for (var i = 0; i < b.length; i++)
    seen[b[i]] = true;
  for (var i = 0; i < a.length; i++)
    if (!seen[a[i]])
      diff.push(a[i]);
  return diff;
}

var DomainsArray = function(companyId, callback) {
  //Retrieving the all domains names list 
  Domain.all({
    where: {
      status: true
    },
    order: 'name:ASC'
  }, function(err, domains) {
    var dn_len = 0,
      dnameList = [];

    if (err) {
      callback(dnameList);
    } else {
      var domainNames = [];
      if (domains.length > 0) {
        get_domainNames_list_comp();

        function get_domainNames_list_comp() {
          if (dn_len < domains.length) {
            if (companyId) {
              comp_array = companyId.split(",");
              if (in_array(domains[dn_len].companyId, comp_array)) {
                dnameList.push(domains[dn_len].name);
              }
            } else {
              dnameList.push(domains[dn_len].name);
            }
            dn_len++;
            get_domainNames_list_comp();
          } else {
            callback(dnameList);
          }
        }
      } else {
        callback(dnameList);
      }
    }
  });
}

action('setDefault_createdBy', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    if (req.body && req.body.cmp_id) {
      Company.all({
        where: {
          status: true
        }
      }, function(err, companies) {
        if (err) {
          send({
            status: false,
            response: companies.errors
          });
        } else {
          if (companies && companies.length > 0) {
            var c_len = 0;
            setCreatedBy();

            function setCreatedBy() {
              if (c_len < companies.length) {
                Company.findOne({
                  where: {
                    id: companies[c_len].id
                  }
                }, function(err, company) {
                  if (err) {
                    c_len++;
                    setCreatedBy();
                  } else {
                    if (company.id.toString() == req.body.cmp_id) {
                      company.createdBy = "default";
                    } else {
                      company.createdBy = "";
                    }

                    company.updateAttributes(company, function(err, res_rec) {
                      if (err) {
                        c_len++;
                        setCreatedBy();
                      } else {
                        c_len++;
                        setCreatedBy();
                      }
                    });
                  }
                });
              } else {
                send({
                  status: true,
                  response: "Company is set to default."
                });
              }
            }
          }
        }
      });
    } else {
      send({
        status: false,
        response: "Please send company id."
      });
    }
  } else {
    send({
      status: true,
      response: "You dont have permission to perform this operation"
    });
  }
});
action('setCompany_createdBy', function() {
  if (req.body && req.body.accessToken != undefined && req.body.accessToken == "AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP") {
    Company.all({
      where: {
        status: true
      }
    }, function(err, companies) {
      if (err) {
        send({
          status: false,
          response: companies.errors
        });
      } else {
        if (companies && companies.length > 0) {
          var c_len = 0;
          setCreatedBy();

          function setCreatedBy() {
            if (c_len < companies.length) {
              Company.findOne({
                where: {
                  id: companies[c_len].id
                }
              }, function(err, company) {
                if (err) {
                  c_len++;
                  setCreatedBy();
                } else {
                  if (company.createdBy == "") {
                    company.createdBy = "revadmin";
                  } else if (company.createdBy == "default") {
                    company.createdBy = "superadmin";
                  }

                  company.updateAttributes(company, function(err, res_rec) {
                    if (err) {
                      c_len++;
                      setCreatedBy();
                    } else {
                      c_len++;
                      setCreatedBy();
                    }
                  });
                }
              });
            } else {
              send({
                status: true,
                response: "Updated CreatedBy for existing Companies"
              });
            }
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
