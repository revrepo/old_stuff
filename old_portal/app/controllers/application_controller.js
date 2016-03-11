/*
 * Copyright (c) 2014, Rev Software, Inc.
 * All Rights Reserved.
 *
 * This code is confidential and proprietary to Rev Software, Inc
 * and may only be used under a license from Rev Software Inc.
 *
 * Author: <Haranath Gorantla>
 */
/**before('protect from forgery', function () {
  protectFromForgery('1c57de021b95bbd6f20b9536420c425a963f843a');
});
*/

var log = require("co-logger");

/**
 * Validating the each request before going to the other controllers
 * I/P: email,token
 * O/P: If token is valid sending the request to specified service.
 *      otherwise returning the error message with status false.
 */
publish("validateRequest", function() {
  try {
    //console.log("Application Controller validateRequest Method");
    var data = req.body;
    data.email = data.email.toLocaleLowerCase();
    //checking the email & token are available or not
    if (data.email && data.token) {
      //Retrieving the user using the email
      User.findOne({
        where: {
          email: data.email
        }
      }, function(err, user) {
        if (err) {
          //console.log("unable to find the user");
          send({
            status: false,
            response: user.errors
          });
        } else {
          //console.log("Checking the user token & i/p token both are equal or not--->");
          //Checking the user token & i/p token both are equal or not
          if (user) {
            if (user.status && user.token == data.token) {
              var domain = "";
              if (data.domainName) {
                domain = data.domainName;
              } else if (data.domain) {
                domain = data.domain;
              }
              data.domainName = domain;
              //console.log("check domain------->",data.domainName,user.role);
              if (domain && user.role != "revadmin") {
                if (user.role == "user") {
                  var d_list = domain.split(",").length;
                  if (d_list == 1 && d_list[0] != '') {
                    check_user_domain(data, function(sts) {
                      if (sts) {
                        //console.log("sts is true in vALIDATION--->",sts);
                        next();
                      } else {
                        //console.log("sts is false in vALIDATION--->",sts);
                        send({
                          status: false,
                          response: {
                            "isDomainExist": false,
                            "message": "This domain has been deleted"
                          }
                        });
                      }
                    });
                  } else {
                    next();
                  }
                } else {
                  next();
                }
              } else {
                next();
              }
            } else {
              var resp_msg = "";
              if (user.token != data.token) {
                //console.log("User token is not valid");
                resp_msg = "Token Error";
              } else if (!user.status) {
                //console.log("User status is false");
                resp_msg = "Status Error";
              } else {
                //console.log("User is not valid");
                resp_msg = "Token Error";
              }
              send({
                status: false,
                response: resp_msg
              });
            }
          } else {
            //console.log("User has been deleted by other user");
            send({
              status: false,
              response: "User Error"
            });
          }
        }
      });
    } else {
      //console.log("User details are not valid");
      send({
        status: false,
        response: "Please send vaild user details"
      });
    }
  } catch (e) {
    //log.error("Application Controller validateRequest Method exceiton--->>>");
    send({
      status: false,
      response: "Unable to process the request"
    });
  }
});

/**
 *Check if user has particular domain 
 */

function check_user_domain(obj, callback) {
  //console.log("came into check user domain function",obj);
  User.findOne({
    where: {
      email: obj.email
    }
  }, function(err, user) {
    if (err) {
      send({
        status: false,
        response: user.errors
      });
    } else {
      //console.log("came into else part",user.domain);
      if (user.domain.indexOf(obj.domainName) != -1) {
        //console.log("user has the domain");
        callback(true);
      } else {
        //console.log("user does not have the domain");
        callback(false);
      }
    }
  });
}
