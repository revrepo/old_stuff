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

var settings = require("./config/config");
var revlogger = require("rev-logger");
var check = require('check-types');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;


revlogger.log('info', 'Starting db-consistency-check tool');


var purgeConObj = null;
var portalConObj = null;

var Company = null;
var DevBrowserCache = null;
var Domain = null;
var DomainLastUpdated = null;
var DomainStats = null;
var Filter = null;
var HeatMapCache = null;
var ServerGroup = null;
var User = null;

var portalMDBUrl = "mongodb://" + settings.portal_mongo.url + ":" + settings.portal_mongo.port + "/" + settings.portal_mongo.database;

if (settings.portal_mongo.is_auth_required) {
  portalMDBUrl = "mongodb://" + settings.portal_mongo.username + ":" + settings.portal_mongo.password + "@" + settings.portal_mongo.url + ":" + settings.portal_mongo.port + "/" + settings.portal_mongo.database;
}

var purgeMDBUrl = "mongodb://" + settings.purge_mongo.url + ":" + settings.purge_mongo.port + "/" + settings.purge_mongo.database;

if (settings.purge_mongo.is_auth_required) {
  purgeMDBUrl = "mongodb://" + settings.purge_mongo.username + ":" + settings.purge_mongo.password + "@" + settings.purge_mongo.url + ":" + settings.purge_mongo.port + "/" + settings.purge_mongo.database;
}

MongoClient.connect(portalMDBUrl, function(err, portalConObj) {
  if (err) {
    revlogger.log('error', 'Failed to connect to the Portal MDB service, error: ' + err);
  } else {
    var collection = portalConObj.collection('Company');
    revlogger.log('info', 'Loading Company collection into memory');
    collection.find().toArray(function(err, Company) {
      if (err) {
        revlogger.log('critical', 'Failed to read records from Company collection');
      } else {
        var collection = portalConObj.collection('DevBrowserCache');
        revlogger.log('info', 'Loading DevBrowserCache collection into memory');
        collection.find().toArray(function(err, DevBrowserCache) {
          if (err) {
            revlogger.log('critical', 'Failed to read records from DevBrowserCache collection');
          } else {
            var collection = portalConObj.collection('Domain');
            revlogger.log('info', 'Loading Domain collection into memory');
            collection.find().toArray(function(err, Domain) {
              if (err) {
                revlogger.log('critical', 'Failed to read records from DevBrowserCache collection');
              } else {

                var collection = portalConObj.collection('DomainLastUpdated');
                revlogger.log('info', 'Loading DomainLastUpdated collection into memory');
                collection.find().toArray(function(err, DomainLastUpdated) {
                  if (err) {
                    revlogger.log('critical', 'Failed to read records from DomainLastUpdated collection');
                  } else {

                    var collection = portalConObj.collection('DomainStats');
                    revlogger.log('info', 'Loading DomainStats collection into memory');
                    collection.find().toArray(function(err, DomainStats) {
                      if (err) {
                        revlogger.log('critical', 'Failed to read records from DomainStats collection');
                      } else {

                        var collection = portalConObj.collection('Filter');
                        revlogger.log('info', 'Loading Filter collection into memory');
                        collection.find().toArray(function(err, Filter) {
                          if (err) {
                            revlogger.log('critical', 'Failed to read records from Filter collection');
                          } else {

                            var collection = portalConObj.collection('HeatMapCache');
                            revlogger.log('info', 'Loading HeatMapCache collection into memory');
                            collection.find().toArray(function(err, HeatMapCache) {
                              if (err) {
                                revlogger.log('critical', 'Failed to read records from HeatMapCache collection');
                              } else {

                                var collection = portalConObj.collection('ServerGroup');
                                revlogger.log('info', 'Loading ServerGroup collection into memory');
                                collection.find().toArray(function(err, ServerGroup) {
                                  if (err) {
                                    revlogger.log('critical', 'Failed to read records from ServerGroup collection');
                                  } else {

                                    var collection = portalConObj.collection('User');
                                    revlogger.log('info', 'Loading User collection into memory');
                                    collection.find().toArray(function(err, User) {
                                      if (err) {
                                        revlogger.log('critical', 'Failed to read records from User collection');
                                      } else {

                                        checkPortalData(User, Company, Filter, Domain, DomainStats, ServerGroup);

                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
});

function findElement(arr, propName, propValue) {
  for (var i = 0; i < arr.length; i++)
    if (arr[i][propName] == propValue)
      return arr[i];
    // will return undefined if not found; you could return a default instead
}


function findElement2(arr, propName, propValue, propName2, propValue2) {
  for (var i = 0; i < arr.length; i++)
    if (arr[i][propName] == propValue && arr[i][propName2] == propValue2)
      return arr[i];
    // will return undefined if not found; you could return a default instead
}


function checkPortalData(User, Company, Filter, Domain, DomainStats, ServerGroup) {

  console.log('=========================================================');
  console.log('INFO: Checking collection User, number of records: ' + User.length);

  for (var i = 0; i < User.length; i++) {
    console.log('=========================================================');
    console.log('INFO: Checking User record # ' + i);

    if (User[i].email === undefined) {
      console.log('ERROR: Missing "email" attribute');
    } else {
      console.log('INFO: "email" = ' + User[i].email);
    }

    if ( ! User[i].status || ! check.boolean(User[i].status)) {
      console.log('ERROR: Missing "status" attribute');
    } else {
      console.log('INFO: "status" = ' + User[i].status);
      if ( ! User[i].status ) {
        console.log('INFO: Disabled user - skipping to the next record');
        continue;
      }
    }

    if ( ! User[i].role) {
      console.log('ERROR: Missing "role" attribute');
    } else {
      console.log('DEBUG: "role" = ' + User[i].role);
      var roles = [ 'user', 'admin', 'reseller', 'revadmin' ];
      if ( roles.indexOf(User[i].role) === -1 ) {
        console.log('ERROR: Wrong role ' + User[i].role);
      }
    }

    if ( ! User[i].theme) {
      console.log('ERROR: Missing "theme" attribute');
    } else {
      console.log('DEBUG: "theme" = ' + User[i].theme);
      var themes = [ 'light', 'dark' ];
      if ( themes.indexOf(User[i].theme) === -1 ) {
        console.log('ERROR: Wrong theme ' + User[i].theme);
      }
    }

    if ( ! User[i].access_control_list ) {
      console.log('ERROR: Missing "access_control_list" attribute');
    } else {
      console.log('DEBUG: "access_control_list" = ' + User[i].access_control_list);
    }

    if ( User[i].role !== 'revadmin' && ( ! User[i].companyId || ! check.string(User[i].companyId) ) ) {
      console.log('ERROR: Missing "companyId" attribute');
    } else {
      console.log('INFO: "companyId" = ' + User[i].companyId);
      if ( User[i].role === 'revadmin' ) continue;
      var companies = User[i].companyId.split(',');
      console.log('DEBUG: companies = ', companies);
      for( var i1 = 0; i1 < companies.length; i1++ ) {
         if ( ! findElement(Company, '_id', companies[i1]) ) {
           console.log('ERROR: Cannot find company with companyId = ' + companies[i1]);
         }
      }
    }

    if ( User[i].role !== 'revadmin' &&  ! User[i].domain ) {
      console.log('ERROR: Missing "domain" attribute');
    } else {
      console.log('INFO: "domain" = ' + User[i].domain);
      if ( User[i].role === 'revadmin' ) continue;
      var domains = User[i].domain.split(',');
      console.log('DEBUG: domains = ', domains); 
      for ( var i2 = 0; i2 < domains.length; i2++ ) {
        if ( ! findElement(Domain, 'name', domains[i2]) ) {
          console.log('ERROR: Cannot find domain with domain = ' + domains[i2]);
        }
      }
    }

    if (User[i].firstname === undefined || User[i].firstname === '' ) {
      console.log('ERROR: Missing or empty "firstname" attribute');
    } else {
      console.log('INFO: "firstname" = ' + User[i].firstname);
    }

    if (User[i].lastname === undefined || User[i].lastname === '' ) {
      console.log('ERROR: Missing or empty "lastname" attribute');
    } else {
      console.log('INFO: "lastname" = ' + User[i].lastname);
    }

    if (User[i].password === undefined || User[i].password === '' ) {
      console.log('ERROR: Missing or empty "password" attribute');
    } else {
      console.log('INFO: "password" = ' + User[i].password);
    }

    if (User[i].updated_at === undefined) {
      console.log('ERROR: Missing "updated_at" attribute');
    } else {
      console.log('INFO: "updated_at" = ' + User[i].updated_at);
    }

  }

process.exit();

  console.log('=========================================================');
  console.log('INFO: Checking collection Domain, number of records: ' + Domain.length);

  for ( i = 0; i < Domain.length; i++) {
    console.log('=========================================================');
    console.log('INFO: Checking Domain record # ' + i);

    if (Domain[i].name === undefined) {
      console.log('ERROR: Missing "name" attribute');
    } else {
      console.log('INFO: "name" = ' + Domain[i].name);
    }

    if (Domain[i].status === undefined || !check.boolean(Domain[i].status)) {
      console.log('ERROR: Missing "status" attribute');
    } else {
      console.log('INFO: "status" = ' + Domain[i].status);
      if (!Domain[i].status) {
        console.log('INFO: "status" field is false - skipping the record');
        continue;
      }
    }

    if (Domain[i].BPGroup === undefined) {
      console.log('ERROR: Missing "BPGroup" attribute');
    } else {
      console.log('INFO: "BPGroup" = ' + Domain[i].BPGroup);
      if (Domain[i].BPGroup !== 'Manual') {
        serverGroupRecord = findElement2(ServerGroup, 'groupName', Domain[i].BPGroup, 'groupType', 'BP');
        //      console.log('DEBUG: serverGroupRecord = ', serverGroupRecord);
        if (serverGroupRecord) {
          console.log('INFO: Correct BP server group ' + Domain[i].BPGroup);
        } else {
          console.log('ERROR: Missing or incorrect BP server group ' + Domain[i].BPGroup);
        }
      }
    }

    if (Domain[i].COGroup === undefined) {
      console.log('ERROR: Missing "COGroup" attribute');
    } else {
      console.log('INFO: "COGroup" = ' + Domain[i].COGroup);
      if (Domain[i].COGroup !== 'Manual') {
        serverGroupRecord = findElement2(ServerGroup, 'groupName', Domain[i].COGroup, 'groupType', 'CO');
        if (serverGroupRecord) {
          console.log('INFO: Correct CO server group ' + Domain[i].COGroup);
        } else {
          console.log('ERROR: Missing or not CO server ' + Domain[i].COGroup);
        }
      }
    }

    if (Domain[i].bp_apache_custom_config === undefined || !check.string(Domain[i].bp_apache_custom_config)) {
      console.log('ERROR: Missing "bp_apache_custom_config" attribute');
    } else {
      //      console.log('INFO: "bp_apache_custom_config" = ' + Domain[i].bp_apache_custom_config);
    }

    console.log('DEBUG: Domain[i].bp_apache_fe_custom_config = ', Domain[i].bp_apache_fe_custom_config);
    if (Domain[i].bp_apache_fe_custom_config === undefined || !check.string(Domain[i].bp_apache_fe_custom_config)) {
      console.log('ERROR: Missing "bp_apache_fe_custom_config" attribute');
    } else {
      console.log('INFO: "bp_apache_fe_custom_config" = ' + Domain[i].bp_apache_fe_custom_config);
    }

    //     console.log('DEBUG: "co_apache_custom_config" = ' + Domain[i].co_apache_custom_config);
    //   console.log('DEBUG: check.string(Domain[i].co_apache_custom_config = ', check.string(Domain[i].co_apache_custom_config));
    if (Domain[i].co_apache_custom_config === undefined) {
      console.log('ERROR: Missing "co_apache_custom_config" attribute');
    } else {
      console.log('INFO: "co_apache_custom_config" = ' + Domain[i].co_apache_custom_config);
    }

    if (Domain[i].co_cnames === undefined || !check.string(Domain[i].co_cnames || Domain[i].co_cnames === '')) {
      console.log('ERROR: Missing "co_cnames" attribute');
    } else {
      console.log('INFO: "co_cnames" = ' + Domain[i].co_cnames);
      if (Domain[i].COGroup !== 'Manual') {
        serverCOGroup = findElement(ServerGroup, 'co_cnames', Domain[i].co_cnames);
        if (serverCOGroup === undefined) {
          console.log('ERROR: co_cname value of "' + Domain[i].co_cnames + '" does not match co_cnames value in ServerGroup record "' + serverCOGroup);
        }
      }
    }

    if (Domain[i].companyId === undefined || !check.string(Domain[i].companyId) || Domain[i].companyId === '') {
      console.log('ERROR: Missing "companyId" attribute');
    } else {
      console.log('INFO: "companyId" = ' + Domain[i].companyId);
      company = findElement(Company, '_id', Domain[i].companyId);
      if (company === undefined) {
        console.log('ERROR: companyId value of "' + Domain[i].companyId + '" cannot be found in Company collection');
      }
    }

    if (Domain[i].config_command_options === undefined || !check.string(Domain[i].config_command_options)) {
      console.log('ERROR: Missing "config_command_options" attribute');
    } else {
      console.log('INFO: "config_command_options" = ' + Domain[i].config_command_options);
    }

    if (Domain[i].config_url === undefined || !check.string(Domain[i].config_url)) {
      console.log('ERROR: Missing "config_url" attribute');
    } else {
      console.log('INFO: "config_url" = ' + Domain[i].config_url);
    }

    if (Domain[i].created_at === undefined || !check.date(Domain[i].created_at)) {
      console.log('ERROR: Missing "created_at" attribute');
    } else {
      console.log('INFO: "created_at" = ' + Domain[i].created_at);
    }

    if (Domain[i].updated_at === undefined) {
      console.log('ERROR: Missing "updated_at" attribute');
    } else {
      console.log('INFO: "updated_at" = ' + Domain[i].updated_at);
    }

    if (Domain[i].cube_url === undefined || !check.string(Domain[i].cube_url)) {
      console.log('ERROR: Missing "cube_url" attribute');
    } else {
      console.log('INFO: "cube_url" = ' + Domain[i].cube_url);
    }

    if (Domain[i].origin_domain === undefined || !check.string(Domain[i].origin_domain) || Domain[i].origin_domain === '') {
      console.log('ERROR: Missing "origin_domain" attribute');
    } else {
      console.log('INFO: "origin_domain" = ' + Domain[i].origin_domain);
    }

    if (Domain[i].origin_server === undefined || !check.string(Domain[i].origin_server) || Domain[i].origin_server === '') {
      console.log('ERROR: Missing "origin_server" attribute');
    } else {
      console.log('INFO: "origin_server" = ' + Domain[i].origin_server);
    }

    if (Domain[i].rum_beacon_url === undefined || !check.string(Domain[i].rum_beacon_url) || Domain[i].rum_beacon_url === '') {
      console.log('ERROR: Missing "rum_beacon_url" attribute');
    } else {
      console.log('INFO: "rum_beacon_url" = ' + Domain[i].rum_beacon_url);
    }

    if (Domain[i].stats_url === undefined || !check.string(Domain[i].stats_url) || Domain[i].stats_url === '') {
      console.log('ERROR: Missing "stats_url" attribute');
    } else {
      console.log('INFO: "stats_url" = ' + Domain[i].stats_url);
    }

    if (Domain[i].sync_status === undefined || !check.string(Domain[i].sync_status)) {
      console.log('ERROR: Missing "sync_status" attribute');
    } else {
      console.log('INFO: "sync_status" = ' + Domain[i].sync_status);
      if (Domain[i].sync_status !== "Success" && Domain[i].sync_status !== "Sync Failed") {
        console.log('ERROR: Field "sync_status" has invalid value of "' + Domain[i].sync_status + '"');
      }
    }

    if (Domain[i].tolerance === undefined || !check.string(Domain[i].tolerance)) {
      console.log('ERROR: Missing "tolerance" attribute');
    } else {
      console.log('INFO: "tolerance" = ' + Domain[i].tolerance);
    }

    if (Domain[i].webpagetest_url === undefined || !check.string(Domain[i].webpagetest_url)) {
      console.log('ERROR: Missing "webpagetest_url" attribute');
    } else {
      console.log('INFO: "webpagetest_url" = ' + Domain[i].webpagetest_url);
    }
  }
  process.exit();
}
