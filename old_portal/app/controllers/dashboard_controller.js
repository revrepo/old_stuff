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
  only: ['stats', 'heatMap', 'deviceBrowser']
});

//Loading the required modules
var log = require("co-logger");
var WebSocketClient = require('websocket').client;
var cube = require("cube");
var WebSocket = require('ws');
var revportal = require("revportal");
var http = require("http");
var es = require('elasticsearch');
var config = require('././config/config');
var connection = null;

//for loading mongo client
var MongoClient = require('mongodb').MongoClient;

/**
 * Declaring the required constants
 */
var PC = "page_count";
var BC = "bytes_count";
var AT = "attack_count";
var PLT = "pageloadTime";

var stats_count_array = [PC, BC, AT];

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

var bpStatJson = {};
//Browsers array declaration
var browsers = [AC, AD, AF, CH, FF, IE, SF, IC, IS, WP, OT];
var browserJson = {
  "android-chrome": "Android-Chrome",
  "android": "Android-Default",
  "android-firefox": "Android-Firefox",
  "chrome": "Desktop-Chrome",
  "firefox": "Desktop-Firefox",
  "ie": "Desktop-IE",
  "safari": "Desktop-Safari",
  "ios-chrome": "iOS-Chrome",
  "ios-safari": "iOS-Safari",
  "windows-phone": "Windows Phone",
  "others": "Others"
};

//HeatMap Country codes
var country_codes = ["IN", "US", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "EU", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"];
//var country_codes = ["AF","AO","AR","AU","BO","BR","BW","CA","CD","CL","CN","DE","DZ","EG","ES","ET","FI","FR","GB","GL","ID","IN","IQ","IR","IS","IT","JP","KE","KP","KR","KZ","LY","MG","ML","MN","MX","NA","NG","NO","NZ","PE","PG","PK","PL","RU","SA","SD","SE","TD","TH","TR","TZ","UA","US","VE","ZA"];
//HeatMap Region array declaration
var usa_region_codes = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];
var region_codes = [];
var region_key = "";
//DashBoard time_range values declaration
var OHR = "1 hour";
var TFHRS = "24 hours";
var SDS = "7 days";
var THDS = "30 days";
var RT = "Rev Start";

//for managing bulk response from policy
var isBulkResponse = true;
var iscacheHetaMapRunning = false;
var heatMapBatchCount = 15;

/**
 * Service is used to get the stats details for requested domain
 */
var prepare_default_json_1_24 = function(params) {
  var heatJson = {};

  heatJson.domainName = params.domain_name;
  heatJson.geo = "";

  var con = {};
  var st = {};

  for (var code in country_codes) {
    con[country_codes[code]] = 0;
  }

  for (var stcode in usa_region_codes) {
    st[usa_region_codes[stcode]] = 0;
  }

  heatJson.countries = con;
  heatJson.states = st;
  return heatJson;
};

var get_device_browser_data_1_24 = function(params, callback) {
  //console.log("Calling get_device_browser_data_1_24");
  /**var mngoUrl = "mongodb://"+revportal.mongo.url+":"+revportal.mongo.port+"/"+revportal.mongo.database;

  if(revportal.mongo.is_auth_required) {
  	mngoUrl = "mongodb://"+revportal.mongo.username+":"+revportal.mongo.password+"@"+revportal.mongo.url+":"+revportal.mongo.port+"/"+revportal.mongo.database;
  } */

  var mngoUrl = "";
  var url = "";
  if (revportal.mongo.full_connection_string && revportal.mongo.full_connection_string != "" && revportal.mongo.full_connection_string != undefined) {
    mngoUrl = revportal.mongo.full_connection_string;
  } else {
    if (revportal.mongo.is_replica_set) {
      var host = "";
      for (val in revportal.mongo.url) {
        var port = (revportal.mongo.port[val] == "" || revportal.mongo.port[val] == undefined) ? 27017 : revportal.mongo.port[val];
        if (host == "") {
          host = revportal.mongo.url[val] + ":" + port;
        } else {
          host = host + "," + revportal.mongo.url[val] + ":" + port;
        }
      }
      url = host + "/" + revportal.mongo.database + "?replicaSet=" + revportal.mongo.replica_set_name;

      if (revportal.mongo.aditional_params && revportal.mongo.aditional_params != "")
        url = host + "/" + revportal.mongo.database + "?replicaSet=" + revportal.mongo.replica_set_name + "&" + revportal.mongo.aditional_params;
    } else {
      var port = (revportal.mongo.port[0] == "" || revportal.mongo.port[0] == undefined) ? 27017 : revportal.mongo.port[0];
      url = revportal.mongo.url[0] + ":" + port + "/" + revportal.mongo.database;
    }

    if (revportal.mongo.is_auth_required) {
      mngoUrl = "mongodb://" + revportal.mongo.username + ":" + revportal.mongo.password + "@" + url;
    } else {
      mngoUrl = "mongodb://" + url;
    }
  }

  //connect away
  MongoClient.connect(mngoUrl, function(err, db) {
    if (err) {
      console.log("Error", err);
      callback(prepare_default_device_browser_json());
    }
    // Fetch the collection test
    var collection = db.collection(revportal.mongo.event_collection);

    if (collection) {
      var isoStart;
      var endDate;
      var isoEnd;
      var st;
      var ed;

      if (params.type && params.type == 'cache') {
        isoStart = new Date().toISOString();
        isoEnd = new Date().toISOString();
        st = new Date(isoEnd);
        st.setHours(0, 0, 0, 0);

        ed = new Date(isoStart);
      } else {
        isoStart = new Date().toISOString();
        endDate = new Date().getTime() - time(params.time_range);
        isoEnd = new Date(endDate).toISOString();
        st = new Date(isoEnd);
        ed = new Date(isoStart);
      }

      //console.log("ST",isoStart);
      //console.log("ED",isoEnd);

      //var dom = "mgo-rev-eng.revsw.net";
      var dom = params.domain_name;
      //collection.aggregate([{$match:{"d.domain":dom,"t":{$gte: st, $lte: ed}}},{$group:{ _id :{ geography : "$d.geography", region : "$d.region"},val :{ $sum : "$d.pageloadTime"},count :{ $sum : 1}}}],function(err, docs) {
      collection.aggregate([{
        $match: {
          "d.domain": dom,
          "t": {
            $gte: st,
            $lte: ed
          }
        }
      }, {
        $group: {
          _id: {
            device: "$d.device"
          },
          count: {
            $sum: 1
          }
        }
      }], function(err, docs) {
        //console.log("docs",docs);
        valueJson = {};
        var browsArr = [];

        if (docs.length == 0) {
          var json = {};
          for (browser in browsers) {
            json[browsers[browser]] = 0;
          }
          callback(json);
        } else {
          docs.forEach(function(doc) {
            valueJson[doc._id.device] = doc.count;
            browsArr.push(doc._id.device);
          });
        }

        db.close();
        callback(valueJson);
        //send({status:true,response:valueJson});
      });
    } else {
      callback(prepare_default_device_browser_json());
    }
  });
};

var get_heat_map_data_1_24 = function(params, callback) {
  //console.log("Calling get_heat_map_data_1_24");
  //connect away
  // 	var mngoUrl = "mongodb://"+revportal.mongo.url+":"+revportal.mongo.port+"/"+revportal.mongo.database;
  /**var mngoUrl = "mongodb://"+revportal.mongo.url+":"+revportal.mongo.port+"/"+revportal.mongo.database;

        if(revportal.mongo.is_auth_required) {
                mngoUrl = "mongodb://"+revportal.mongo.username+":"+revportal.mongo.password+"@"+revportal.mongo.url+":"+revportal.mongo.port+"/"+revportal.mongo.database;
        }*/

  var mngoUrl = "";
  var url = "";

  if (revportal.mongo.full_connection_string && revportal.mongo.full_connection_string != "" && revportal.mongo.full_connection_string != undefined) {
    mngoUrl = revportal.mongo.full_connection_string;
  } else {
    if (revportal.mongo.is_replica_set) {
      var host = "";
      for (val in revportal.mongo.url) {
        var port = (revportal.mongo.port[val] == "" || revportal.mongo.port[val] == undefined) ? 27017 : revportal.mongo.port[val];
        if (host == "") {
          host = revportal.mongo.url[val] + ":" + port;
        } else {
          host = host + "," + revportal.mongo.url[val] + ":" + port;
        }
      }
      //url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name+"&"+revportal.mongo.aditional_params;

      url = host + "/" + revportal.mongo.database + "?replicaSet=" + revportal.mongo.replica_set_name;

      if (revportal.mongo.aditional_params && revportal.mongo.aditional_params != "")
        url = host + "/" + revportal.mongo.database + "?replicaSet=" + revportal.mongo.replica_set_name + "&" + revportal.mongo.aditional_params;

    } else {
      var port = (revportal.mongo.port[0] == "" || revportal.mongo.port[0] == undefined) ? 27017 : revportal.mongo.port[0];
      url = revportal.mongo.url[0] + ":" + port + "/" + revportal.mongo.database;
    }

    if (revportal.mongo.is_auth_required) {
      mngoUrl = "mongodb://" + revportal.mongo.username + ":" + revportal.mongo.password + "@" + url;
    } else {
      mngoUrl = "mongodb://" + url;
    }
  }
  //console.log("MONGO URL",mngoUrl);

  MongoClient.connect(mngoUrl, function(err, db) {
    if (err) {
      console.log("Error", err);
      callback(prepare_default_json_1_24(params));
    }
    // Fetch the collection test
    var collection = db.collection(revportal.mongo.event_collection);

    // Cursor has an to array method that reads in all the records to memory
    //collection.find().sort({$natural:-1}).limit(10).toArray(function(err, docs) {

    if (collection) {
      var isoStart = new Date().toISOString();

      var endDate = (new Date().getTime()) - (time(params.time_range));
      var isoEnd = new Date(endDate).toISOString();
      //var isoEnd = new Date("2014-08-13").toISOString();

      var st = new Date(isoStart);
      var ed = new Date(isoEnd);
      // Non Working Code

      //console.log("ISO ST",isoStart);
      //console.log("ISO ED",isoEnd);

      //console.log("ST",st);
      //console.log("ED",ed);

      //var dom = "mgo-rev-eng.revsw.net";
      var dom = params.domain_name;

      collection.aggregate([{
        $match: {
          "d.domain": dom,
          "t": {
            $gte: ed,
            $lte: st
          }
        }
      }, {
        $group: {
          _id: {
            geography: "$d.geography",
            region: "$d.region"
          },
          val: {
            $sum: "$d.pageloadTime"
          },
          count: {
            $sum: 1
          }
        }
      }], function(err, docs) {
        //collection.aggregate([{$match:{"d.domain":"mgo-rev-eng.revsw.net"}},{$group:{ _id :{ geography : "$d.geography", region : "$d.region"},val :{ $sum : "$d.pageloadTime"},count :{ $sum : 1}}}],function(err, docs) {

        var i = 0;
        var heatJson = {};
        var countryArr = {};
        var stateArr = {};
        var countryCountArr = {};
        var stateCountArr = {};

        var con_codes = [];
        var st_codes = [];

        //	console.log("docs",docs);

        if (docs.length == 0) {
          callback(prepare_default_json_1_24(params));
        } else {
          docs.forEach(function(doc) {
            if (countryArr[doc._id.geography] && countryArr[doc._id.geography] != undefined) {
              countryArr[doc._id.geography] = countryArr[doc._id.geography] + parseFloat(doc.val);
              countryCountArr[doc._id.geography] = countryCountArr[doc._id.geography] + parseFloat(doc.count);

              //countryArr[doc._id.geography] = countryArr[doc._id.geography]+	parseFloat(doc.val)/parseFloat(doc.count);
            } else {
              con_codes.push(doc._id.geography);
              countryArr[doc._id.geography] = parseFloat(doc.val);
              countryCountArr[doc._id.geography] = parseFloat(doc.count);

              //countryArr[doc._id.geography] = parseFloat(doc.val)/parseFloat(doc.count);
            }

            if (doc._id.geography == 'US') {
              if (stateArr[doc._id.region] && stateArr[doc._id.region] != undefined) {
                stateArr[doc._id.region] = stateArr[doc._id.region] + parseFloat(doc.val);
                stateCountArr[doc._id.region] = stateCountArr[doc._id.region] + parseFloat(doc.count);

                //	stateArr[doc._id.region] = stateArr[doc._id.region]+	parseFloat(doc.val)/parseFloat(doc.count);
              } else {
                st_codes.push(doc._id.region);
                //stateArr[doc._id.region] = parseFloat(doc.val)/parseFloat(doc.count);
                stateArr[doc._id.region] = parseFloat(doc.val);
                stateCountArr[doc._id.region] = parseFloat(doc.count);

              }
            }

            i++;

            if (docs.length == i) {
              var finalConArray = {};
              var finalStateArry = {};

              for (var code in country_codes) {
                if (con_codes.indexOf(country_codes[code]) != -1) {
                  //	finalConArray[country_codes[code]]= countryArr[country_codes[code]];
                  finalConArray[country_codes[code]] = countryArr[country_codes[code]] / countryCountArr[country_codes[code]];

                } else {
                  finalConArray[country_codes[code]] = 0;
                }
              }

              for (var scode in usa_region_codes) {
                if (st_codes.indexOf(usa_region_codes[scode]) != -1) {
                  finalStateArry[usa_region_codes[scode]] = stateArr[usa_region_codes[scode]] / stateCountArr[usa_region_codes[scode]];

                  //	finalStateArry[usa_region_codes[scode]]= stateArr[usa_region_codes[scode]];
                } else {
                  finalStateArry[usa_region_codes[scode]] = 0;
                }
              }

              heatJson.domainName = params.domain_name;
              heatJson.geo = "";
              heatJson.countries = finalConArray;
              heatJson.states = finalStateArry;

              db.close();
              callback(heatJson);
              //send({status:true,response:heatJson});
            }
          });

        }
      });
    } else {
      callback(prepare_default_json_1_24(params));
    }
  });
};


/**
 * Service is used to get the stats details for requested domain
 */
/**action("elastic_search_stats",function(){
	console.log("Came into elstic stats----->",req.body);
	if(req.body.domainName){
		Domain.findOne({where:{name:req.body.domainName}},function(err,domain){
			if(err){
				send({status:false,response:domain.errors});
			}else{
				if(domain && domain.status){
					var params = {};
					params.domain_name = req.body.domainName;
					if(req.body.time_range == OHR || req.body.time_range == TFHRS || req.body.time_range == SDS || req.body.time_range == THDS){
						params.time_range = req.body.time_range;
					}else{
						params.time_range = RT;
						params.time_val = req.body.time_range;
					}
					params.cube_url = domain.cube_url;

					var statsJson = {};
								
					statsJson.domainName = req.body.domainName;
					statsJson.node_info = "";
					statsJson.system_health = 0;

					var attacks_count=0;
					var page_count=0;
					var bytes_count=0;

					es.traffic_page.num_pages(req.body,function(num_pages){
						page_count=num_pages.page_accelerated;
					});

					es.traffic_page.bandwidth_graph(req.body,function(bytes_cnt){
						bytes_count=bytes_cnt;
					});

					es.traffic_page.num_attacks_blocked(req.body,function(attacks_cnt){
						attacks_count=attacks_cnt;
					});

					
					revportal.stats_page.avg_page_load_time(params,function(page_load){
					//console.log("PAGE LOAD",page_load);
						if(page_load.status){
							revportal.stats_page.avg_first_byte_time(params,function(first_byte){				
								//console.log("FIRST BYTE",first_byte);
								if(first_byte.status){	
									statsJson.page_load_time = page_load.response ? page_load.response : 0;
									statsJson.first_byte_time = first_byte.response ? first_byte.response :0;
									statsJson.page_count = page_count;
									statsJson.bytes_count = bytes_count;
									statsJson.attacks_count = attacks_count;

									send({status:true,response:statsJson});
								}
							});
						}
					});
				} else {
					send({status:false,response:revportal.prepare_deleted_domain_json()});
				}
			}
		});
	}else{
		send({ status: false, response: "Please send a valid JSON"});
	}
});*/

action("elastic_search_stats", function() {
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
          var params = {};
          params.domain_name = req.body.domainName;
          if (req.body.time_range == OHR || req.body.time_range == TFHRS || req.body.time_range == SDS || req.body.time_range == THDS) {
            params.time_range = req.body.time_range;
          } else {
            params.time_range = RT;
            params.time_val = req.body.time_range;
          }
          params.cube_url = domain.cube_url;
          params.reqFrom = "dashboard";
          var statsJson = {};

          statsJson.domainName = req.body.domainName;
          statsJson.node_info = "";
          statsJson.system_health = 0;

          var attacks_count = "0";
          var page_count = "0";
          var bytes_count = "0";
          req.body.reqFrom = "dashboard";
          revportal.stats_page.avg_page_load_time(params, function(page_load) {
            //console.log("PAGE LOAD",page_load);
            if (page_load.status) {
              revportal.stats_page.avg_first_byte_time(params, function(first_byte) {
                //console.log("FIRST BYTE",first_byte);
                if (first_byte.status) {
                  statsJson.page_load_time = page_load.response ? page_load.response : 0;
                  statsJson.first_byte_time = first_byte.response ? first_byte.response : 0;
                  es.traffic_page.num_pages(req.body, function(num_pages) {
                    page_count = num_pages.page_accelerated ? num_pages.page_accelerated : 0;
                    es.traffic_page.bandwidth_graph(req.body, function(bytes_cnt) {
                      bytes_count = (bytes_cnt.summary && bytes_cnt.summary.totalBytes) ? bytes_cnt.summary.totalBytes : 0;
                      es.traffic_page.num_attacks_blocked(req.body, function(attacks_cnt) {
                        attacks_count = attacks_cnt ? attacks_cnt : 0;
                        statsJson.page_count = page_count;
                        statsJson.bytes_count = bytes_count;
                        statsJson.attacks_count = attacks_count;

                        send({
                          status: true,
                          response: statsJson
                        });
                      });

                    });

                  });

                }
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
      response: "Please send a valid JSON"
    });
  }
});


/**
 * Service is used to get the stats details for requested domain
 */
action("stats", function() {
  //console.log("Came in to the stats service--->>>");
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
          //getting the data from stats_url
          get_refresh_stats_data(domain.stats_url, domain.name);
          Stats.findOne({
            where: {
              domain_name: domain.name
            }
          }, function(err, stats) {
            if (err) {
              send({
                status: false,
                response: stats.errors
              });
            } else {
              //Preparing the JSON
              if (stats) {
                var params = {};
                params.domain_name = req.body.domainName;
                if (req.body.time_range == OHR || req.body.time_range == TFHRS || req.body.time_range == SDS || req.body.time_range == THDS) {
                  params.time_range = req.body.time_range;
                } else {
                  params.time_range = RT;
                  params.time_val = req.body.time_range;
                }

                //if(stats.rev_component[params.time_range] !=undefined) {
                //	send({status:true,response:stats.rev_component[params.time_range] !=undefined ? stats.rev_component[params.time_range]:prepare_cube_fail_default_stats_json()});
                //}

                var statsJson = {};

                statsJson.domainName = stats.domain_name;
                statsJson.node_info = stats.rev_component.node_info;
                if (stats.rev_component.system_health) {
                  statsJson.system_health = stats.rev_component.system_health;
                } else {
                  statsJson.system_health = 0;
                }

                params.cube_url = domain.cube_url;

                if (stats.rev_component[params.time_range] == undefined || stats.rev_component[params.time_range].page_load_time == 0) {
                  revportal.stats_page.avg_page_load_time(params, function(page_load) {
                    //console.log("PAGE LOAD",page_load);
                    if (page_load.status) {
                      revportal.stats_page.avg_first_byte_time(params, function(first_byte) {
                        //console.log("FIRST BYTE",first_byte);
                        if (first_byte.status) {
                          getPBACount(params, function(values) {
                            //console.log("VALUES <><><>",values);
                            //	console.log("DEF VALUES",stats.rev_component[params.time_range][PC]);	
                            for (val in stats_count_array) {
                              statsJson[stats_count_array[val]] = values[stats_count_array[val]] ? values[stats_count_array[val]] : 0;
                              //	console.log("A",stats.rev_component[params.time_range][stats_count_array[val]]);	
                            }
                            statsJson.page_load_time = page_load.response ? page_load.response : 0;
                            statsJson.first_byte_time = first_byte.response ? first_byte.response : 0;

                            //console.log("STATS JSON",statsJson);	
                            if (bpStatJson['status'] == false) {
                              //console.log("STAT FAIL ELSE BLK");
                              send({
                                status: 'statsFailed',
                                response: stats.rev_component[params.time_range] != undefined ? stats.rev_component[params.time_range] : prepare_cube_fail_default_stats_json()
                              });
                            } else {
                              //console.log("STAT FAIL TRUE BLK");												
                              save_stats_data(statsJson, params.time_range, params.domain_name);
                              send({
                                status: true,
                                response: statsJson
                              });
                            }
                          });
                        } else {
                          //cube fails condition
                          var cubfd = stats.rev_component[params.time_range] != undefined ? stats.rev_component[params.time_range] : prepare_cube_fail_default_stats_json();
                          //console.log("CUBE FAILED DATA BLK A",cubfd);
                          send({
                            status: 'statsFailed',
                            response: stats.rev_component[params.time_range] != undefined ? stats.rev_component[params.time_range] : prepare_cube_fail_default_stats_json()
                          });
                        }
                      });
                    } else {
                      //cube fails condition
                      //console.log("CUBE FAILED DATA BLK B");
                      send({
                        status: 'statsFailed',
                        response: stats.rev_component[params.time_range] != undefined ? stats.rev_component[params.time_range] : prepare_cube_fail_default_stats_json()
                      });
                    }
                  });
                } else {
                  // If TimeRange is 1hr and Page load time is non zero
                  //console.log("OLD DATE TR 1HR",Date());
                  //setTimeout(function() { return true; }, 10000);

                  //setTimeout(getStatsData(), 5000);

                  setTimeout(
                    function() {
                      //do something special
                      getStatsData();
                    }, 2000);

                  getRumData();

                  function getStatsData() {
                    //console.log("NEW DATE TR 1 HR",Date());

                    getPBACount(params, function(values) {
                      //console.log("VALUES <><><>",values);
                      //	console.log("DEF VALUES",stats.rev_component[params.time_range][PC]);	
                      for (val in stats_count_array) {
                        statsJson[stats_count_array[val]] = values[stats_count_array[val]] ? values[stats_count_array[val]] : 0;
                        //	console.log("A",stats.rev_component[params.time_range][stats_count_array[val]]);	
                      }
                      statsJson.page_load_time = stats.rev_component[params.time_range].page_load_time ? stats.rev_component[params.time_range].page_load_time : 0;
                      statsJson.first_byte_time = stats.rev_component[params.time_range].first_byte_time ? stats.rev_component[params.time_range].first_byte_time : 0;

                      //console.log("STATS JSON",statsJson);	
                      if (bpStatJson['status'] == false) {
                        //console.log("STAT FAIL ELSE BLK");
                        send({
                          status: 'statsFailed',
                          response: stats.rev_component[params.time_range] != undefined ? stats.rev_component[params.time_range] : prepare_cube_fail_default_stats_json()
                        });
                      } else {
                        //console.log("STAT FAIL TRUE BLK");												
                        save_stats_data(statsJson, params.time_range, params.domain_name);
                        send({
                          status: true,
                          response: statsJson
                        });
                      }
                    });
                  }

                  function getRumData() {
                    revportal.stats_page.avg_page_load_time(params, function(page_load) {
                      //console.log("PAGE LOAD",page_load);
                      if (page_load.status) {
                        revportal.stats_page.avg_first_byte_time(params, function(first_byte) {
                          //console.log("FIRST BYTE",first_byte);
                          if (first_byte.status) {
                            getPBACount(params, function(values) {
                              //console.log("VALUES <><><>",values);
                              //	console.log("DEF VALUES",stats.rev_component[params.time_range][PC]);	
                              for (val in stats_count_array) {
                                statsJson[stats_count_array[val]] = values[stats_count_array[val]] ? values[stats_count_array[val]] : 0;
                                //	console.log("A",stats.rev_component[params.time_range][stats_count_array[val]]);	
                              }
                              statsJson.page_load_time = page_load.response ? page_load.response : 0;
                              statsJson.first_byte_time = first_byte.response ? first_byte.response : 0;

                              save_stats_data(statsJson, params.time_range, params.domain_name);
                            });
                          }
                        });
                      }
                    });
                  }
                }
              } else {
                send({
                  status: false,
                  response: "Unable to find the stats data"
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
      response: "Please send a valid JSON"
    });
  }
});

/**
 * Preparing the default stats json to handle cube fail scenario
 */
var prepare_cube_fail_default_stats_json = function() {
  var json = {};
  for (val in stats_count_array) {
    json[stats_count_array[val]] = 0;
  }

  json.page_load_time = 0;
  json.first_byte_time = 0;

  return json;
};

var save_stats_data = function(statsJson, time_range, domainName) {
  //console.log("CALLING SAVE STATS DATA");
  var key = "domainName";
  delete statsJson[key];

  Stats.findOne({
    where: {
      domain_name: domainName
    }
  }, function(err, stats) {
    if (err) {
      send({
        status: false,
        response: stats.errors
      });
    } else {

      if (stats.rev_component[OHR] == undefined && stats.rev_component[TFHRS] == undefined && stats.rev_component[SDS] == undefined && stats.rev_component[THDS] == undefined && stats.rev_component[RT] == undefined) {
        var js = {};
        stats.rev_component = js;
      }

      if (time_range == OHR) {
        stats.rev_component[OHR] = statsJson;
      } else if (time_range == TFHRS) {
        stats.rev_component[TFHRS] = statsJson;
      } else if (time_range == SDS) {
        stats.rev_component[SDS] = statsJson;
      } else if (time_range == THDS) {
        stats.rev_component[THDS] = statsJson;
      } else if (time_range == RT) {
        stats.rev_component[RT] = statsJson;
      }

      stats.updateAttributes(stats, function(err, updStat) {
        if (err) {
          //console.log("Domain Stats error");
        } else {
          //console.log("Domain Stats Created");
        }
      });

    }
  });
};

/**
 * Getting the stats data when user refresh the accordian/time_range filtering
 */
var get_refresh_stats_data = function(stats_url, domainName) {
  if (stats_url && stats_url != "") {
    var statsArray = new Array();
    statsArray = stats_url.split(",");
    for (stats_ip in statsArray) {
      if (statsArray[stats_ip] && statsArray[stats_ip] != " ") {
        var domainJson = {};
        var domainNames = {};
        domainNames["d" + 1] = domainName;
        domainJson.domain_names = domainNames;
        get_stats_data(statsArray[stats_ip], domainJson, 1);
      }
    }
  }
};

/**
 * Not Used
 * Getting the avg page load time
 */
var get_avg_page_load_time = function(params, callback) {
  //console.log("---get_avg_page_load_time-----");
  var pageLoadTimeJson = {};
  var eval_url = "ws://" + params.cube_url.split('//')[1].split('/')[0] + "/1.0/metric/get";
  //console.log("eval_url--->>");
  try {
    var ews = new WebSocket(eval_url);
    ews.on("open", function() {
      //console.log("----connection Openend-------");
      ews.send(prepare_ws_stats_json(params, PLT));
    });
    ews.on("message", function(msg) {
      msg = JSON.parse(msg);
      //console.log("msg--->>>>");
      if (msg.id == PLT && msg.value != undefined) {
        if (pageLoadTimeJson[PLT]) {
          pageLoadTimeJson[PLT] = pageLoadTimeJson[PLT] + msg.value;
        } else {
          pageLoadTimeJson[PLT] = msg.value;
        }
      } else if (msg.id == PLT && msg.value == undefined) {
        if (pageLoadTimeJson[PLT]) {
          pageLoadTimeJson[PLT] = 0;
          callback(pageLoadTimeJson);
        }
      }

      //for closing the connection
      setInterval(function() {
        ews.close();
      }, 120000);
    });
  } catch (e) {
    //console.log("get_avg_page_load_time error");
    pageLoadTimeJson[PLT] = 0;

    //for closing the connection
    setInterval(function() {
      ews.close();
    }, 120000);

    callback(pageLoadTimeJson);


  }
};

/**
 * Return the ws count details
 */
var wscount = function(data) {
  switch (data) {
    case OHR:
      return 2;
      break;
    case TFHRS:
      return 49;
      break;
    case SDS:
      return 15;
      break;
    case THDS:
      return 61;
      break;
    default:
      return 1;
      break;
  }
};

/**
 * This function is used to generate PBA Query
 */
var generate_pba_query = function(params, type) {
  var query = "http://localhost:1081/1.0/metric?expression=";

  if (type && params.domain_name) {
    query += "sum(stats_info(" + type + ").eq(domain_name,'" + params.domain_name + "'))";
  } else if (type) {
    query += "sum(stats_info(" + type + "))";
  }

  if (params.time_range == OHR) {
    var ed = new Date().getTime() - time(params.time_range);

    query += "&start=" + new Date(ed).toISOString();
    query += "&stop=" + new Date().toISOString();
    query += "&step=3e5";

  } else if (params.time_range == TFHRS) {
    var ed = new Date().getTime() - time(params.time_range);

    query += "&start=" + new Date(ed).toISOString();
    query += "&stop=" + new Date().toISOString();
    query += "&step=36e5";
  } else if (params.time_range == SDS) {
    var ed = new Date().getTime() - time(params.time_range);

    query += "&start=" + new Date(ed).toISOString();
    query += "&stop=" + new Date().toISOString();
    query += "&step=864e5";

  } else if (params.time_range == THDS) {
    var ed = new Date().getTime() - time(params.time_range);

    query += "&start=" + new Date(ed).toISOString();
    query += "&stop=" + new Date().toISOString();
    query += "&step=864e5";

  } else if (params.time_range == RT) {
    var ed = new Date().getTime() - params.time_val * 24 * 60 * 60 * 1000;

    query += "&start=" + new Date(ed).toISOString();
    query += "&stop=" + new Date().toISOString();
    query += "&step=864e5";

  } else {
    var ed = new Date().getTime() - time(params.time_range);

    query += "&start=" + new Date(ed).toISOString();
    query += "&stop=" + new Date().toISOString();
    query += "&step=36e5";
  }
  //console.log("STAT QUERY",query);

  return query;
};

var getPBACount = function(params, callback) {
  //console.log("CALLING PBACCOUNT");
  var valueJson = {};
  var val = 0;

  fetchPBADetails();

  function fetchPBADetails() {
    if (val < stats_count_array.length) {

      var value = 0;

      var pba_count_req = http.get(generate_pba_query(params, stats_count_array[val]), function(res) {
        try {
          var opdata = "";
          res.on('data', function(chunk) {
            opdata += chunk.toString();
          });
          res.on('end', function() {
            try {
              opdata = JSON.parse(opdata);
            } catch (e) {
              callback(prepare_default_stats_json());
            }

            for (var i = 0; i < opdata.length; i++) {

              if (opdata[i].hasOwnProperty("value") && opdata[i].value > 0) {
                value = value + opdata[i].value;
              }

              if (i == opdata.length - 1) {
                valueJson[stats_count_array[val]] = value;

                val++;
                fetchPBADetails();
              }
            }
          });
        } catch (e) {
          callback(prepare_default_stats_json());
        }
      });
      pba_count_req.on('error', function(e) {
        callback(prepare_default_stats_json());
      });
    } else {
      //console.log("PBA ELSE BLK");
      callback(valueJson);
    }
  }
};

/**
 * Preparing the default stats json
 */
var prepare_default_stats_json = function() {
  var json = {};
  for (val in stats_count_array) {
    json[stats_count_array[val]] = 0;
  }
  return json;
};

/**
 * Preparing the stats json
 */
var prepare_ws_stats_json = function(params, type) {
  var json = {};
  if (type && params.domain_name) {
    json.expression = "sum(stats_info(" + type + ").eq(domain_name,'" + params.domain_name + "'))";
    json.id = type;
  } else if (type) {
    json.expression = "sum(stats_info(" + type + "))";
    json.id = type;
  }
  json.stop = new Date().toISOString();
  if (params.time_range == OHR) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 36e5;
  } else if (params.time_range == TFHRS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 36e5;
  } else if (params.time_range == SDS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else if (params.time_range == THDS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else if (params.time_range == RT) {
    var ed = new Date().getTime() - params.time_val * 24 * 60 * 60 * 1000;
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 36e5;
  }
  return JSON.stringify(json);
};

/**
 * Return the time details
 */
var time = function(data) {
  switch (data) {
    case OHR:
      return 1 * 60 * 60 * 1000;
      break;
    case TFHRS:
      return 24 * 60 * 60 * 1000;
      break;
    case SDS:
      return 7 * 24 * 60 * 60 * 1000;
      break;
    case THDS:
      return 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      return 1 * 60 * 60 * 1000;
      break;
  }
};

/**
 * Service for running the corn job for every one hour to evaluate the stats data(registered domains)
 */
action("eval_stats_cron", function() {
  //console.log("EVAL STATS CRON JOB <>>>>>>>>>>>>>>>>>>>>>>>>>");
  if (!iscacheHetaMapRunning) {
    Domain.all({
      where: {
        status: true
      }
    }, function(err, domains) {
      if (err) {
        console.log("errors--->>>>");
      } else {
        for (domain in domains) {
          var params = {};
          params.domain_name = domains[domain].name;
          stats_ws_data(params);
        }
      }
    });
  }
});

/**
 * Calcualting the metrics for each one hour.
 */
var stats_ws_data = function(params) {
  //console.log("Came in to read_stats_data-->>>");
  var cube_url = "ws://localhost:1081/1.0/metric/get";
  var ws = new WebSocket(cube_url);
  ws.on("open", function() {
    ws.send(prepare_ws_stats_json(params, PC));
    ws.send(prepare_ws_stats_json(params, BC));
    ws.send(prepare_ws_stats_json(params, AT));

    //for closing websocket connection
    setInterval(function() {
      ws.close();
    }, 120000);
  });
};

/**
 * ######################################## CRON JOB ############################
 */
action('dev_browser_cache_cron_24hrs', function() {
  //console.log("calling dev_browser_cache_cron_24hrs");
  //Retrieving the all domains list
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
      if (domains.length > 0) {
        var time_range_arr = [SDS, THDS, RT];
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          if (i < domains.length) {
            if (domains[i].name) {
              var params = {};
              params.cube_url = domains[i].cube_url;
              params.time_range = TFHRS;

              params.domain_name = domains[i].name;
              //console.log("PARAMS",params);

              get_device_browser_data(params, function(valueJson) {
                var valueArray = [];
                //console.log("DEV BROW CUBE TRUE");
                if (Object.keys(valueJson).length > 0) {
                  valueJson[AC] > 0 ? valueArray.push(["Android-Chrome", valueJson[AC]]) : "";
                  valueJson[AD] > 0 ? valueArray.push(["Android-Default", valueJson[AD]]) : "";
                  valueJson[AF] > 0 ? valueArray.push(["Android-Firefox", valueJson[AF]]) : "";
                  valueJson[CH] > 0 ? valueArray.push(["Desktop-Chrome", valueJson[CH]]) : "";
                  valueJson[FF] > 0 ? valueArray.push(["Desktop-Firefox", valueJson[FF]]) : "";
                  valueJson[IE] > 0 ? valueArray.push(["Desktop-IE", valueJson[IE]]) : "";
                  valueJson[SF] > 0 ? valueArray.push(["Desktop-Safari", valueJson[SF]]) : "";
                  valueJson[IC] > 0 ? valueArray.push(["iOS-Chrome", valueJson[IC]]) : "";
                  valueJson[IS] > 0 ? valueArray.push(["iOS-Safari", valueJson[IS]]) : "";
                  valueJson[WP] > 0 ? valueArray.push(["Windows Phone", valueJson[WP]]) : "";
                  valueJson[OT] > 0 ? valueArray.push(["Others", valueJson[OT]]) : "";
                  DevBrowserCache.findOne({
                    where: {
                      domainName: domains[i].name
                    }
                  }, function(err, devBrowserObj) {
                    if (err) {
                      i++;
                      iterateDomains();
                      //console.log("Unable to add Device Browser Cache Details");
                    } else {
                      if (devBrowserObj) {
                        //console.log("Device and Browsers Obj exists");

                        if (devBrowserObj.devBrowserJson == undefined) {
                          var js = {};
                          devBrowserObj.devBrowserJson = js;
                        }

                        if (devBrowserObj.devBrowserJson[TFHRS] == undefined) {
                          devBrowserObj.devBrowserJson[TFHRS] = {};
                        }

                        devBrowserObj.devBrowserJson[TFHRS] = valueArray;

                        devBrowserObj.updateAttributes(devBrowserObj, function(err, updDevBrowserObj) {
                          if (err) {
                            console.log("Device and Browser Cache Update error");
                            i++;
                            iterateDomains();
                          } else {
                            console.log("Device and Browser Cache details updated successfully");
                            i++;
                            iterateDomains();
                          }
                        });
                      } else {
                        //console.log("Device and Browser Obj does n't exists");
                        var dbCacheObj = new DevBrowserCache();
                        dbCacheObj.domainName = domains[i].name;
                        dbCacheObj.devBrowserJson = {};
                        dbCacheObj.devBrowserJson[TFHRS] = {};
                        dbCacheObj.devBrowserJson[TFHRS] = valueArray;

                        dbCacheObj.save(function(err, res) {
                          if (err) {
                            console.log("Unable to add dev browser cache details");
                            i++;
                            iterateDomains();
                          } else {
                            console.log("hdev browser cache details added successfully");
                            i++;
                            iterateDomains();
                          }
                        });
                      }
                    }
                  });
                } else {
                  i++;
                  iterateDomains();
                }
                //send({ status: true, response: valueArray});
              });
            } else {
              i++;
              iterateDomains();
            }
          } else {
            //send mail
            //sendDeviceBrowserCacheMail();
            //send({ status: true, response: "send mail"});
          }
        }
      }
    }
  });
});

action('heatmap_cache_cron_24hrs', function() {
  //console.log("calling heatmap_cache_cron_24hrs");
  //Retrieving the all domains list
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
      if (domains.length > 0) {
        //console.log("DOM LENGTH",domains.length);
        //console.log("domains",domains[i].name, (new Date()-domains[i].created_at)/(24*3600*1000));
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          if (i < domains.length) {
            iscacheHetaMapRunning = true;
            if (domains[i].name) {
              var params = {};
              params.cube_url = domains[i].cube_url;
              params.time_range = TFHRS;

              params.domain_name = domains[i].name;
              get_heatmap_cache_data(params, 'countries', function(countryValueJson) {
                get_heatmap_cache_data(params, 'states', function(stateValueJson) {
                  HeatMapCache.findOne({
                    where: {
                      domainName: domains[i].name
                    }
                  }, function(err, heatObj) {
                    if (err) {
                      i++;
                      iterateDomains();
                      //console.log("Unable to add Heat Map Cache Details");
                    } else {
                      if (heatObj) {
                        //console.log("Heat Map Obj exists");
                        if (heatObj.pageLoadTime == undefined) {
                          var js = {};
                          heatObj.pageLoadTime = js;
                        }

                        if (heatObj.pageLoadTime[TFHRS] == undefined) {
                          heatObj.pageLoadTime[TFHRS] = {};
                        }

                        heatObj.pageLoadTime[TFHRS]['countries'] = countryValueJson;
                        heatObj.pageLoadTime[TFHRS]['us_states'] = stateValueJson;

                        heatObj.updateAttributes(heatObj, function(err, updHeatObj) {
                          if (err) {
                            console.log("HeatMap Cache Update error");
                            i++;
                            iterateDomains();
                          } else {
                            console.log("HeatMap Cache details updated successfully");
                            i++;
                            iterateDomains();
                          }
                        });
                      } else {
                        //console.log("Heat Map Obj does n't exists");
                        var hmCacheObj = new HeatMapCache();
                        hmCacheObj.domainName = domains[i].name;
                        hmCacheObj.pageLoadTime = {};
                        hmCacheObj.pageLoadTime[TFHRS] = {};
                        hmCacheObj.pageLoadTime[TFHRS]['countries'] = countryValueJson;
                        hmCacheObj.pageLoadTime[TFHRS]['us_states'] = stateValueJson;

                        hmCacheObj.save(function(err, res) {
                          if (err) {
                            console.log("Unable to add heat map cache details");
                            i++;
                            iterateDomains();
                          } else {
                            console.log("heat map cache details added successfully");
                            i++;
                            iterateDomains();
                          }
                        });
                      }
                    }
                  });
                });
              });
            } else {
              i++;
              iterateDomains();
            }
          } else {
            //For sending the mail
            //console.log("send mail");
            iscacheHetaMapRunning = false;
            //sendHeatMapCacheMail();
            //send({ status: true, response: "send mail"});
          }
        }
      }
    }
  });
});

action('agregate_ohr_heatmap', function() {
  var domains = [];
  if (req.body.domain) {
    domains = req.body.domain.split(",");
  }
  if (domains.length > 0) {
    var i = 0;
    iterateDomains();

    function iterateDomains() {
      if (i < domains.length) {
        if (domains[i]) {
          //console.log("DOMAIN NAME",domains[i]);
          Domain.findOne({
            where: {
              name: domains[i]
            }
          }, function(err, domainObj) {
            if (err) {} else {
              //console.log("IN DOMAIN NAME BLK");
              if (domainObj && domainObj.status) {
                var params = {};
                params.cube_url = domainObj.cube_url;
                params.time_range = OHR;
                params.domain_name = domainObj.name;
                get_heatmap_cache_data(params, 'countries', function(countryValueJson) {
                  get_heatmap_cache_data(params, 'states', function(stateValueJson) {
                    HeatMapCache.findOne({
                      where: {
                        domainName: domainObj.name
                      }
                    }, function(err, heatObj) {
                      if (err) {
                        //console.log("Unable to add Heat Map Cache Details");
                        i++;
                        iterateDomains();
                      } else {
                        if (heatObj) {
                          if (heatObj.pageLoadTime == undefined) {
                            var js = {};
                            heatObj.pageLoadTime = js;
                          }
                          if (heatObj.pageLoadTime[OHR] == undefined) {
                            heatObj.pageLoadTime[OHR] = {};
                          }
                          heatObj.pageLoadTime[OHR]['countries'] = countryValueJson;
                          heatObj.pageLoadTime[OHR]['us_states'] = stateValueJson;

                          heatObj.updateAttributes(heatObj, function(err, updHeatObj) {
                            if (err) {
                              console.log("HeatMap Cache Update error");
                              i++;
                              iterateDomains();
                            } else {
                              console.log("HeatMap Cache details updated successfully");
                              i++;
                              iterateDomains();
                            }
                          });
                        } else {
                          //console.log("Heat Map Obj does n't exists");
                          var hmCacheObj = new HeatMapCache();
                          hmCacheObj.domainName = domainObj.name;
                          hmCacheObj.pageLoadTime = {};
                          hmCacheObj.pageLoadTime[OHR] = {};
                          hmCacheObj.pageLoadTime[OHR]['countries'] = countryValueJson;
                          hmCacheObj.pageLoadTime[OHR]['us_states'] = stateValueJson;
                          hmCacheObj.save(function(err, res) {
                            if (err) {
                              console.log("Unable to add heat map cache details");
                              i++;
                              iterateDomains();
                            } else {
                              console.log("heat map cache details added successfully");
                              i++;
                              iterateDomains();
                            }
                          });
                        }
                      }
                    });
                  });
                });
              }
            }
          });
        }
      }
    }
  }
});


action('agregate_ohr_dev_browser', function() {
  var domains = [];
  if (req.body.domain) {
    domains = req.body.domain.split(",");
  }

  if (domains.length > 0) {
    var i = 0;
    iterateDomains();

    function iterateDomains() {
      if (i < domains.length) {
        if (domains[i]) {
          //console.log("DOMAIN NAME",domains[i]);
          Domain.findOne({
            where: {
              name: domains[i]
            }
          }, function(err, domainObj) {
            if (err) {} else {
              //console.log("IN DOMAIN NAME BLK");
              if (domainObj && domainObj.status) {
                var params = {};
                params.cube_url = domainObj.cube_url;
                params.time_range = OHR;
                params.domain_name = domainObj.name;
                get_device_browser_data(params, function(valueJson) {
                  var valueArray = [];
                  //console.log("DEV BROW CUBE TRUE");
                  if (Object.keys(valueJson).length > 0) {
                    valueJson[AC] > 0 ? valueArray.push(["Android-Chrome", valueJson[AC]]) : "";
                    valueJson[AD] > 0 ? valueArray.push(["Android-Default", valueJson[AD]]) : "";
                    valueJson[AF] > 0 ? valueArray.push(["Android-Firefox", valueJson[AF]]) : "";
                    valueJson[CH] > 0 ? valueArray.push(["Desktop-Chrome", valueJson[CH]]) : "";
                    valueJson[FF] > 0 ? valueArray.push(["Desktop-Firefox", valueJson[FF]]) : "";
                    valueJson[IE] > 0 ? valueArray.push(["Desktop-IE", valueJson[IE]]) : "";
                    valueJson[SF] > 0 ? valueArray.push(["Desktop-Safari", valueJson[SF]]) : "";
                    valueJson[IC] > 0 ? valueArray.push(["iOS-Chrome", valueJson[IC]]) : "";
                    valueJson[IS] > 0 ? valueArray.push(["iOS-Safari", valueJson[IS]]) : "";
                    valueJson[WP] > 0 ? valueArray.push(["Windows Phone", valueJson[WP]]) : "";
                    valueJson[OT] > 0 ? valueArray.push(["Others", valueJson[OT]]) : "";
                    DevBrowserCache.findOne({
                      where: {
                        domainName: domainObj.name
                      }
                    }, function(err, devBrowserObj) {
                      if (err) {
                        console.log("Unable to add Device Browser Cache Details");
                        i++;
                        iterateDomains();
                      } else {
                        if (devBrowserObj) {
                          //console.log("Device and Browsers Obj exists");
                          if (devBrowserObj.devBrowserJson == undefined) {
                            var js = {};
                            devBrowserObj.devBrowserJson = js;
                          }
                          if (devBrowserObj.devBrowserJson[OHR] == undefined) {
                            devBrowserObj.devBrowserJson[OHR] = {};
                          }
                          devBrowserObj.devBrowserJson[OHR] = {};
                          devBrowserObj.devBrowserJson[OHR] = valueArray;

                          devBrowserObj.updateAttributes(devBrowserObj, function(err, updDevBrowserObj) {
                            if (err) {
                              console.log("Device and Browser Cache Update error");
                              i++;
                              iterateDomains();
                            } else {
                              console.log("Device and Browser Cache details updated successfully");
                              i++;
                              iterateDomains();
                            }
                          });
                        } else {
                          //console.log("Device and Browser Obj does n't exists");
                          var dbCacheObj = new DevBrowserCache();
                          dbCacheObj.domainName = domainObj.name;
                          dbCacheObj.devBrowserJson = {};
                          dbCacheObj.devBrowserJson[OHR] = {};
                          dbCacheObj.devBrowserJson[OHR] = valueArray;

                          dbCacheObj.save(function(err, res) {
                            if (err) {
                              console.log("Unable to add dev browser cache details");
                              i++;
                              iterateDomains();
                            } else {
                              console.log("hdev browser cache details added successfully");
                              i++;
                              iterateDomains();
                            }
                          });
                        }
                      }
                    });
                  } else {
                    i++;
                    iterateDomains();
                  }
                });
              }
            }
          });
        }
      }
    }
  }
});

action('dev_browser_cache_cron', function() {
  //console.log("calling dev_browser_cache_cron");
  //if(req.body && req.body.accessToken != undefined && req.body.accessToken=="AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP"){
  //Retrieving the all domains list
  var inputJson = {
    status: true
  };
  if (req.body && req.body.domainName && req.body.domainName != "") {
    inputJson = {
      name: req.body.domainName
    };
  }
  Domain.all({
    where: inputJson
  }, function(err, domains) {
    if (err) {
      send({
        status: false,
        response: domains.errors
      });
    } else {
      if (domains.length > 0) {
        var time_range_arr = [SDS, THDS, RT];
        if (req.body && req.body.timeRange && req.body.timeRange != "") {
          time_range_arr = [req.body.timeRange];
        }
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          if (i < domains.length) {
            if (domains[i].name) {
              var j = 0;
              iterateTimeRange();

              function iterateTimeRange() {
                if (j < time_range_arr.length) {
                  var params = {};
                  params.cube_url = domains[i].cube_url;
                  if (time_range_arr[j] == SDS || time_range_arr[j] == THDS) {
                    params.time_range = time_range_arr[j];
                  } else {
                    params.time_range = RT;
                    params.time_val = (new Date() - domains[i].created_at) / (24 * 3600 * 1000);
                  }
                  params.domain_name = domains[i].name;
                  //console.log("PARAMS",params);
                  get_device_browser_data(params, function(valueJson) {
                    var valueArray = [];
                    //console.log("DEV BROW CUBE TRUE");
                    if (Object.keys(valueJson).length > 0) {
                      valueJson[AC] > 0 ? valueArray.push(["Android-Chrome", valueJson[AC]]) : "";
                      valueJson[AD] > 0 ? valueArray.push(["Android-Default", valueJson[AD]]) : "";
                      valueJson[AF] > 0 ? valueArray.push(["Android-Firefox", valueJson[AF]]) : "";
                      valueJson[CH] > 0 ? valueArray.push(["Desktop-Chrome", valueJson[CH]]) : "";
                      valueJson[FF] > 0 ? valueArray.push(["Desktop-Firefox", valueJson[FF]]) : "";
                      valueJson[IE] > 0 ? valueArray.push(["Desktop-IE", valueJson[IE]]) : "";
                      valueJson[SF] > 0 ? valueArray.push(["Desktop-Safari", valueJson[SF]]) : "";
                      valueJson[IC] > 0 ? valueArray.push(["iOS-Chrome", valueJson[IC]]) : "";
                      valueJson[IS] > 0 ? valueArray.push(["iOS-Safari", valueJson[IS]]) : "";
                      valueJson[WP] > 0 ? valueArray.push(["Windows Phone", valueJson[WP]]) : "";
                      valueJson[OT] > 0 ? valueArray.push(["Others", valueJson[OT]]) : "";
                      DevBrowserCache.findOne({
                        where: {
                          domainName: domains[i].name
                        }
                      }, function(err, devBrowserObj) {
                        if (err) {
                          j++;
                          iterateTimeRange();
                          console.log("Unable to add Device Browser Cache Details");
                        } else {
                          if (devBrowserObj) {
                            //console.log("Device and Browsers Obj exists");

                            if (devBrowserObj.devBrowserJson == undefined) {
                              var js = {};
                              devBrowserObj.devBrowserJson = js;
                            }


                            if (time_range_arr[j] == SDS) {
                              devBrowserObj.devBrowserJson[SDS] = {};
                              devBrowserObj.devBrowserJson[SDS] = valueArray;
                            } else if (time_range_arr[j] == THDS) {
                              devBrowserObj.devBrowserJson[THDS] = {};
                              devBrowserObj.devBrowserJson[THDS] = valueArray;
                            } else if (time_range_arr[j] == RT) {
                              devBrowserObj.devBrowserJson[RT] = {};
                              devBrowserObj.devBrowserJson[RT] = valueArray;
                            }
                            devBrowserObj.updateAttributes(devBrowserObj, function(err, updDevBrowserObj) {
                              if (err) {
                                console.log("Device and Browser Cache Update error");
                                j++;
                                iterateTimeRange();
                              } else {
                                console.log("Device and Browser Cache details updated successfully");
                                j++;
                                iterateTimeRange();
                              }
                            });
                          } else {
                            //console.log("Device and Browser Obj does n't exists");
                            var dbCacheObj = new DevBrowserCache();
                            dbCacheObj.domainName = domains[i].name;
                            dbCacheObj.devBrowserJson = {};
                            if (time_range_arr[j] == SDS) {
                              dbCacheObj.devBrowserJson[SDS] = {};
                              dbCacheObj.devBrowserJson[SDS] = valueArray;
                            } else if (time_range_arr[j] == THDS) {
                              dbCacheObj.devBrowserJson[THDS] = {};
                              dbCacheObj.devBrowserJson[THDS] = valueArray;
                            } else if (time_range_arr[j] == RT) {
                              dbCacheObj.devBrowserJson[RT] = {};
                              dbCacheObj.devBrowserJson[RT] = valueArray;
                            }
                            dbCacheObj.save(function(err, res) {
                              if (err) {
                                console.log("Unable to add dev browser cache details");
                                j++;
                                iterateTimeRange();
                              } else {
                                console.log("hdev browser cache details added successfully");
                                j++;
                                iterateTimeRange();
                              }
                            });
                          }
                        }
                      });
                    } else {
                      j++;
                      iterateTimeRange();
                    }
                    //send({ status: true, response: valueArray});
                  });
                } else {
                  i++;
                  iterateDomains();
                }
              }
            }
          } else {
            //send mail
            //sendDeviceBrowserCacheMail();
            send({
              status: true,
              response: "Device and Browsers Job Completed"
            });
          }
        }
      }
    }
  });
  //} else {
  //	send({ status:true,response: "You dont have permission to perform this operation"});
  //}
});

action('sendDeviceBrowserCacheMail', function() {
  sendDeviceBrowserCacheMail();
});

var sendDeviceBrowserCacheMail = function() {
  var mail = new revportal.heatMapmail();
  var email = "prashant@revsw.com";
  DevBrowserCache.all(function(err, dbCache) {
    var data = "<div><table style='background-color:white;width:60%;height:auto;' align='center' cellpadding=2 cellspacing=1 border=1>";
    data += "<tr style='background-color:#00688B;color:white;height:30px;'>";
    data += "<th>Domain Name</th>";
    data += "<th>Last Updated</th></tr>";
    var m = 0;
    prepareDevBrowserCacheData();

    function prepareDevBrowserCacheData() {
      if (m < dbCache.length) {
        if (dbCache[m].domainName) {
          data += "<tr>";
          data += "<td>" + dbCache[m].domainName + "</td>";
          data += "<td>" + dbCache[m].updated_at + "</td>";
          data += "</tr>";
          m++;
          prepareDevBrowserCacheData();
        }
      } else {
        data += "</table></div>";
        //console.log("DATA",data);
        mail.sendMail(revportal.heatMapCacheMail("Prashanth", email, data, "Device & Browsers Details"), function(stat) {
          if (stat) {
            send({
              status: true,
              response: "Device & Browsers Cache details mailed successfully"
            });
          } else {
            send({
              status: false,
              response: "Unable to send Device & Browsers cache details"
            });
          }
        });
      }
    }
  });
};

action('heatmap_cache_cron_old', function() {
  console.log("calling heatmap_cache_cron");
  //if(req.body && req.body.accessToken != undefined && req.body.accessToken=="AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP"){
  var inputJson = {
    status: true
  };

  if (req.body && req.body.domainName && req.body.domainName != "") {
    inputJson = {
      name: req.body.domainName
    };
  }
  //Retrieving the all domains list
  Domain.all({
    where: inputJson
  }, function(err, domains) {
    if (err) {
      send({
        status: false,
        response: domains.errors
      });
    } else {
      if (domains.length > 0) {
        //console.log("DOM LENGTH",domains.length);
        var time_range_arr = [SDS, THDS, RT];

        if (req.body && req.body.timeRange && req.body.timeRange != "") {
          time_range_arr = [req.body.timeRange];
        }
        //console.log("domains",domains[i].name, (new Date()-domains[i].created_at)/(24*3600*1000));
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          if (i < domains.length) {
            iscacheHetaMapRunning = true;
            if (domains[i].name) {
              var j = 0;
              iterateTimeRange();

              function iterateTimeRange() {
                if (j < time_range_arr.length) {
                  var params = {};
                  params.cube_url = domains[i].cube_url;
                  if (time_range_arr[j] == SDS || time_range_arr[j] == THDS) {
                    params.time_range = time_range_arr[j];
                  } else {
                    params.time_range = RT;
                    params.time_val = (new Date() - domains[i].created_at) / (24 * 3600 * 1000);
                  }
                  params.domain_name = domains[i].name;
                  //params.domain_name="techv-qa.shine.com";
                  //params.domain_name="test-shine-qa.revsw.net";
                  //params.cube_url="http://boom12.revsw.net:1081/";

                  get_heatmap_cache_data(params, 'countries', function(countryValueJson) {
                    //console.log("LENGTH",Object.keys(countryValueJson).length);
                    //console.log("countryValueJson",countryValueJson);
                    get_heatmap_cache_data(params, 'states', function(stateValueJson) {
                      HeatMapCache.findOne({
                        where: {
                          domainName: domains[i].name
                        }
                      }, function(err, heatObj) {
                        if (err) {
                          j++;
                          iterateTimeRange();
                          console.log("Unable to add Heat Map Cache Details");
                        } else {
                          if (heatObj) {
                            //console.log("Heat Map Obj exists");
                            if (heatObj.pageLoadTime[SDS] == undefined && heatObj.pageLoadTime[THDS] == undefined && heatObj.pageLoadTime[RT] == undefined) {
                              var js = {};
                              heatObj.pageLoadTime = js;
                            }
                            if (time_range_arr[j] == SDS) {
                              heatObj.pageLoadTime[SDS] = {};
                              heatObj.pageLoadTime[SDS]['countries'] = countryValueJson;
                              heatObj.pageLoadTime[SDS]['us_states'] = stateValueJson;
                            } else if (time_range_arr[j] == THDS) {
                              heatObj.pageLoadTime[THDS] = {};
                              heatObj.pageLoadTime[THDS]['countries'] = countryValueJson;
                              heatObj.pageLoadTime[THDS]['us_states'] = stateValueJson;
                            } else if (time_range_arr[j] == RT) {
                              heatObj.pageLoadTime[RT] = {};
                              heatObj.pageLoadTime[RT]['countries'] = countryValueJson;
                              heatObj.pageLoadTime[RT]['us_states'] = stateValueJson;
                            }

                            if (Object.keys(countryValueJson).length == country_codes.length && Object.keys(stateValueJson).length == usa_region_codes.length) {
                              heatObj.updateAttributes(heatObj, function(err, updHeatObj) {
                                if (err) {
                                  console.log("HeatMap Cache Update error");
                                  j++;
                                  iterateTimeRange();
                                } else {
                                  console.log("HeatMap Cache details updated successfully");
                                  j++;
                                  iterateTimeRange();
                                }
                              });
                            } else {
                              j++;
                              iterateTimeRange();
                            }
                          } else {
                            //console.log("Heat Map Obj does n't exists");
                            var hmCacheObj = new HeatMapCache();
                            hmCacheObj.domainName = domains[i].name;
                            hmCacheObj.pageLoadTime = {};
                            if (time_range_arr[j] == SDS) {
                              hmCacheObj.pageLoadTime[SDS] = {};
                              hmCacheObj.pageLoadTime[SDS]['countries'] = countryValueJson;
                              hmCacheObj.pageLoadTime[SDS]['us_states'] = stateValueJson;
                            } else if (time_range_arr[j] == THDS) {
                              hmCacheObj.pageLoadTime[THDS] = {};
                              hmCacheObj.pageLoadTime[THDS]['countries'] = countryValueJson;
                              hmCacheObj.pageLoadTime[THDS]['us_states'] = stateValueJson;
                            } else if (time_range_arr[j] == RT) {
                              hmCacheObj.pageLoadTime[RT] = {};
                              hmCacheObj.pageLoadTime[RT]['countries'] = countryValueJson;
                              hmCacheObj.pageLoadTime[RT]['us_states'] = stateValueJson;
                            }
                            hmCacheObj.save(function(err, res) {
                              if (err) {
                                console.log("Unable to add heat map cache details");
                                j++;
                                iterateTimeRange();
                              } else {
                                console.log("heat map cache details added successfully");
                                j++;
                                iterateTimeRange();
                              }
                            });
                          }
                        }
                      });
                    });
                  });
                } else {
                  i++;
                  iterateDomains();
                }
              }
            }
          } else {
            //For sending the mail
            //console.log("send mail");
            iscacheHetaMapRunning = false;
            sendHeatMapCacheMail();
            //send({ status: true, response: "send mail"});
          }
        }
      } else {
        send({
          status: false,
          response: "No domains found"
        });
      }
    }
  });
  //} else {
  //send({ status:true,response: "You dont have permission to perform this operation"});
  //}
});

var updateDomainsHeatMapJobDetails = function(domain) {
  HeatMapJobDetail.findOne({
    where: {
      domainName: domain
    }
  }, function(err, heatMapJobDetail) {
    if (err) {
      console.log("Error while getting heat map job details");
      //send({status: false, response: heatMapJobDetail.errors});
    } else {
      if (heatMapJobDetail) {
        var isoEnd = new Date().toISOString();
        var ed = new Date(isoEnd);

        heatMapJobDetail.jobEndTime = ed;

        heatMapJobDetail.save(function(err, res) {
          if (err) {
            console.log("Unable to save heatmap job details");
          } else {
            console.log("heatmap job details added successfully");
          }
        });
      } else {
        console.log("Heatmap job details doesnt exist");
      }
    }
  });
}

var checkHeatMapFailedJobDetails = function(domain, callback) {
  console.log("Calling checkHeatMapFailedJobDetails");
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
      url = host + "/" + config.portalMongo.database + "?replicaSet=" + config.portalMongo.replica_set_name;

      if (config.portalMongo.aditional_params && config.portalMongo.aditional_params != "")
        url = host + "/" + config.portalMongo.database + "?replicaSet=" + config.portalMongo.replica_set_name + "&" + config.portalMongo.aditional_params;

      // url = host+"/"+config.portalMongo.database+"?replicaSet="+config.portalMongo.replica_set_name+"&"+config.portalMongo.aditional_params;
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
      console.log("HeatMap Failed Job Encountered Err", err);
      callback(false);
    } else {
      var collection = db.collection(config.HeatMapJob.heatmap_job_collection);
      if (collection) {
        var isoStart = new Date().toISOString();
        //var startDate =  (new Date().getTime()) - 60*60*1000;
        //var isoStart = new Date(startDate).toISOString();

        var st = new Date(isoStart);
        //var ed = new Date(isoEnd);

        var timeout = config.HeatMapJob.heatmap_fail_job_time_out * 1000;

        //var query = {domainName:domain,$or:[ { $where: "(new ISODate() - this.jobStartTime) >"+diff} , { $where: "(this.jobStartTime-this.jobEndTime)>"+10000}]};
        //var query = {domainName:domain,$or:[ { $where: "(new ISODate() - this.jobStartTime) >"+diff} , { $where:'{ $and:[{ $where: "(new ISODate()-this.jobStartTime)>10000"},{ $where: "(this.jobStartTime - this.jobEndTime)>"+10000}]}'}]};

        //var query = {domainName:domain,$or:[ { $where: "(this.jobStartTime - this.jobEndTime) >"+10000}]};
        var query = {
          domainName: domain,
          $and: [{
            $where: "(new ISODate() - this.jobStartTime) >" + timeout
          }, {
            $where: "(this.jobStartTime - this.jobEndTime) >" + timeout
          }]
        };

        //	console.log("QUERY",query);

        //var query = {domainName:"testcpp.com",$or:[ { $where: "(new ISODate() - this.jobStartTime) >"+diff} , { $where: '$and:'[{"this.jobStartTime > this.jobEndTime"},{"(this.jobStartTime - this.jobEndTime)">10000}]}]};


        var sort = [];
        var operator = {
          $set: {
            "jobStartTime": st
          }
        };
        var options = {
          'new': true
        };

        collection.findAndModify(query, sort, operator, options, function(err, jobDet) {
          if (err) {
            console.log("HeatMap Failed Job Encountered Err", err);
            callback(false);
            db.close();
          } else {
            if (jobDet) {
              console.log("Processing Heatmap Failed Job for domain ", domain);
              callback(true);
              db.close();
            } else {
              console.log("Domain processing of Heatmap Failed Job not needed for ", domain);
              callback(false);

              db.close();
            }
          }
        });
        //collection.aggregate([{$match:{"d.domain":dom,"t":{$gte: ed, $lte: st}}},{$group:{ _id :{ geography : "$d.geography", region : "$d.region"},val :{ $sum : "$d.pageloadTime"},count :{ $sum : 1}}}],function(err, docs) {
      } else {
        console.log("Unable to get HeatMap Job Object");
        callback(false);
        db.close();
      }
    }
  });
}

var checkHeatMapJobDetails = function(domain, callback) {
  console.log("Calling checkHeatMapJobDetails");

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
      console.log("HeatMap Job Encountered Err", err);
      callback(false);
    } else {
      var collection = db.collection(config.HeatMapJob.heatmap_job_collection);
      if (collection) {
        var isoStart = new Date().toISOString();

        var st = new Date(isoStart);

        var diff = config.HeatMapJob.heatmap_job_time_out * 60 * 60 * 1000;

        //var query = {domainName:domain,$or:[ { $where: "(new ISODate() - this.jobStartTime) >"+diff} , { $where: "(this.jobStartTime-this.jobEndTime)>"+600000}]};
        var query = {
          domainName: domain,
          $or: [{
            $where: "(new ISODate() - this.jobStartTime) >" + diff
          }]
        };

        //var query = {domainName:domain,$or:[ { $where: "(new ISODate() - this.jobStartTime) >"+diff} , { $where:'{ $and:'[{ $where: "this.jobStartTime > this.jobEndTime"},{ $where: "(this.jobStartTime - this.jobEndTime)>"+10000}]}}]};

        var sort = [];
        var operator = {
          $set: {
            "jobStartTime": st
          }
        };
        var options = {
          'new': true
        };

        collection.findAndModify(query, sort, operator, options, function(err, jobDet) {
          if (err) {
            console.log("HeatMap Job Encountered Err ", err);
            callback(false);
            db.close();
          } else {
            if (jobDet) {
              console.log("Processing domain ", domain);
              callback(true);
              db.close();
            } else {
              console.log("Domain processing not needed for ", domain);
              callback(false);
              db.close();
            }
          }
        });
        //collection.aggregate([{$match:{"d.domain":dom,"t":{$gte: ed, $lte: st}}},{$group:{ _id :{ geography : "$d.geography", region : "$d.region"},val :{ $sum : "$d.pageloadTime"},count :{ $sum : 1}}}],function(err, docs) {
      } else {
        console.log("Unable to get HeatMap Job Object");
        callback(false);
        db.close();
      }
    }
  });
}

action('heatmap_cache_failed_cron', function() {
  console.log("calling heatmap_cache_failed_cron");
  //if(req.body && req.body.accessToken != undefined && req.body.accessToken=="AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP"){
  var inputJson = {
    status: true
  };
  //console.log("job sleep time---->",config.portalMongo.heatmap_job_sleep_time);	
  var sleep = config.HeatMapJob.heatmap_job_sleep_time * 1000;

  if (req.body && req.body.domainName && req.body.domainName != "") {
    inputJson = {
      name: req.body.domainName
    };
  }
  //Retrieving the all domains list
  Domain.all({
    where: inputJson
  }, function(err, domains) {
    if (err) {
      send({
        status: false,
        response: domains.errors
      });
    } else {
      if (domains.length > 0) {
        //console.log("DOM LENGTH",domains.length);
        var time_range_arr = [SDS, THDS, RT];

        if (req.body && req.body.timeRange && req.body.timeRange != "") {
          time_range_arr = [req.body.timeRange];
        }
        //console.log("domains",domains[i].name, (new Date()-domains[i].created_at)/(24*3600*1000));
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          //	console.log("I VAL",i,"DOM LENGTH",domains.length);

          if (i < domains.length) {
            iscacheHetaMapRunning = true;
            if (domains[i].name) {
              //			console.log("Job Started for the domain",domains[i].name)
              checkHeatMapFailedJobDetails(domains[i].name, function(jobStat) {
                if (jobStat) {
                  //console.log("ENTERED INTO IF LOOP");	
                  var j = 0;
                  iterateTimeRange();

                  function iterateTimeRange() {
                    if (j < time_range_arr.length) {
                      var params = {};
                      params.cube_url = domains[i].cube_url;
                      if (time_range_arr[j] == SDS || time_range_arr[j] == THDS) {
                        params.time_range = time_range_arr[j];
                      } else {
                        params.time_range = RT;
                        params.time_val = (new Date() - domains[i].created_at) / (24 * 3600 * 1000);
                      }
                      params.domain_name = domains[i].name;
                      //params.domain_name="techv-qa.shine.com";
                      //params.domain_name="test-shine-qa.revsw.net";
                      //params.cube_url="http://boom12.revsw.net:1081/";

                      get_heatmap_cache_data(params, 'countries', function(countryValueJson) {
                        //	console.log("LENGTH",Object.keys(countryValueJson).length);
                        //	console.log("countryValueJson",countryValueJson);
                        get_heatmap_cache_data(params, 'states', function(stateValueJson) {
                          HeatMapCache.findOne({
                            where: {
                              domainName: domains[i].name
                            }
                          }, function(err, heatObj) {
                            if (err) {
                              console.log("Unable to add Heat Map Cache Details");
                              setTimeout(function() {
                                j++;
                                iterateTimeRange();
                              }, sleep);
                              //j++;
                              //iterateTimeRange();
                            } else {
                              if (heatObj) {
                                //console.log("Heat Map Obj exists");
                                if (heatObj.pageLoadTime[SDS] == undefined && heatObj.pageLoadTime[THDS] == undefined && heatObj.pageLoadTime[RT] == undefined) {
                                  var js = {};
                                  heatObj.pageLoadTime = js;
                                }
                                if (time_range_arr[j] == SDS) {
                                  heatObj.pageLoadTime[SDS] = {};
                                  heatObj.pageLoadTime[SDS]['countries'] = countryValueJson;
                                  heatObj.pageLoadTime[SDS]['us_states'] = stateValueJson;
                                } else if (time_range_arr[j] == THDS) {
                                  heatObj.pageLoadTime[THDS] = {};
                                  heatObj.pageLoadTime[THDS]['countries'] = countryValueJson;
                                  heatObj.pageLoadTime[THDS]['us_states'] = stateValueJson;
                                } else if (time_range_arr[j] == RT) {
                                  heatObj.pageLoadTime[RT] = {};
                                  heatObj.pageLoadTime[RT]['countries'] = countryValueJson;
                                  heatObj.pageLoadTime[RT]['us_states'] = stateValueJson;
                                }

                                if (Object.keys(countryValueJson).length == country_codes.length && Object.keys(stateValueJson).length == usa_region_codes.length) {
                                  heatObj.updateAttributes(heatObj, function(err, updHeatObj) {
                                    if (err) {
                                      console.log("HeatMap Cache Update error");

                                      setTimeout(function() {
                                        j++;
                                        iterateTimeRange();
                                      }, sleep);

                                      //j++;
                                      //iterateTimeRange();
                                    } else {
                                      console.log("HeatMap Cache details updated successfully");
                                      setTimeout(function() {
                                        j++;
                                        iterateTimeRange();
                                      }, sleep);

                                      //j++;
                                      //iterateTimeRange();
                                    }
                                  });
                                } else {
                                  setTimeout(function() {
                                    j++;
                                    iterateTimeRange();
                                  }, sleep);

                                  //j++;
                                  //iterateTimeRange();
                                }
                              } else {
                                //console.log("Heat Map Obj does n't exists");
                                var hmCacheObj = new HeatMapCache();
                                hmCacheObj.domainName = domains[i].name;
                                hmCacheObj.pageLoadTime = {};
                                if (time_range_arr[j] == SDS) {
                                  hmCacheObj.pageLoadTime[SDS] = {};
                                  hmCacheObj.pageLoadTime[SDS]['countries'] = countryValueJson;
                                  hmCacheObj.pageLoadTime[SDS]['us_states'] = stateValueJson;
                                } else if (time_range_arr[j] == THDS) {
                                  hmCacheObj.pageLoadTime[THDS] = {};
                                  hmCacheObj.pageLoadTime[THDS]['countries'] = countryValueJson;
                                  hmCacheObj.pageLoadTime[THDS]['us_states'] = stateValueJson;
                                } else if (time_range_arr[j] == RT) {
                                  hmCacheObj.pageLoadTime[RT] = {};
                                  hmCacheObj.pageLoadTime[RT]['countries'] = countryValueJson;
                                  hmCacheObj.pageLoadTime[RT]['us_states'] = stateValueJson;
                                }
                                hmCacheObj.save(function(err, res) {
                                  if (err) {
                                    console.log("Unable to add heat map cache details");
                                    //j++;
                                    //iterateTimeRange();
                                    setTimeout(function() {
                                      j++;
                                      iterateTimeRange();
                                    }, sleep);

                                  } else {
                                    console.log("heat map cache details added successfully");
                                    //j++;
                                    //iterateTimeRange();
                                    setTimeout(function() {
                                      j++;
                                      iterateTimeRange();
                                    }, sleep);
                                  }
                                });
                              }
                            }
                          });
                        });
                      });
                    } else {
                      //i++;
                      //iterateDomains();
                      // To update the jobEnd time
                      updateDomainsHeatMapJobDetails(domains[i].name);
                      setTimeout(function() {
                        i++;
                        iterateDomains();
                      }, sleep);
                    }
                  }
                } else {
                  setTimeout(function() {
                    i++;
                    iterateDomains();
                  }, sleep);
                }
              });
            }
          } else {
            //For sending the mail
            //console.log("JOB COMPLETED");
            iscacheHetaMapRunning = false;
            //sendHeatMapCacheMail();
            send({
              status: true,
              response: "send mail"
            });
          }
        }
      } else {
        send({
          status: false,
          response: "No domains found"
        });
      }
    }
  });
  //} else {
  //send({ status:true,response: "You dont have permission to perform this operation"});
  //}
});

action('heatmap_cache_cron', function() {
  console.log("calling heatmap_cache_cron");
  //if(req.body && req.body.accessToken != undefined && req.body.accessToken=="AXity123OIPiuosertU$%@I78UIOPilkujnmMNOP"){
  var inputJson = {
    status: true
  };
  //console.log("job sleep time---->",config.portalMongo.heatmap_job_sleep_time);	
  var sleep = config.HeatMapJob.heatmap_job_sleep_time * 1000;

  if (req.body && req.body.domainName && req.body.domainName != "") {
    inputJson = {
      name: req.body.domainName
    };
  }
  //Retrieving the all domains list
  Domain.all({
    where: inputJson
  }, function(err, domains) {
    if (err) {
      send({
        status: false,
        response: domains.errors
      });
    } else {
      if (domains.length > 0) {
        //console.log("DOM LENGTH",domains.length);
        var time_range_arr = [SDS, THDS, RT];

        if (req.body && req.body.timeRange && req.body.timeRange != "") {
          time_range_arr = [req.body.timeRange];
        }
        //console.log("domains",domains[i].name, (new Date()-domains[i].created_at)/(24*3600*1000));
        var i = 0;
        iterateDomains();

        function iterateDomains() {
          //	console.log("I VAL",i,"DOM LENGTH",domains.length);

          if (i < domains.length) {
            iscacheHetaMapRunning = true;
            if (domains[i].name) {
              //			console.log("Job Started for the domain",domains[i].name)
              checkHeatMapJobDetails(domains[i].name, function(jobStat) {
                if (jobStat) {
                  var j = 0;
                  iterateTimeRange();

                  function iterateTimeRange() {
                    if (j < time_range_arr.length) {
                      var params = {};
                      params.cube_url = domains[i].cube_url;
                      if (time_range_arr[j] == SDS || time_range_arr[j] == THDS) {
                        params.time_range = time_range_arr[j];
                      } else {
                        params.time_range = RT;
                        params.time_val = (new Date() - domains[i].created_at) / (24 * 3600 * 1000);
                      }
                      params.domain_name = domains[i].name;
                      //params.domain_name="techv-qa.shine.com";
                      //params.domain_name="test-shine-qa.revsw.net";
                      //params.cube_url="http://boom12.revsw.net:1081/";

                      get_heatmap_cache_data(params, 'countries', function(countryValueJson) {
                        //	console.log("LENGTH",Object.keys(countryValueJson).length);
                        //	console.log("countryValueJson",countryValueJson);
                        get_heatmap_cache_data(params, 'states', function(stateValueJson) {
                          HeatMapCache.findOne({
                            where: {
                              domainName: domains[i].name
                            }
                          }, function(err, heatObj) {
                            if (err) {
                              console.log("Unable to add Heat Map Cache Details");
                              setTimeout(function() {
                                j++;
                                iterateTimeRange();
                              }, sleep);
                              //j++;
                              //iterateTimeRange();
                            } else {
                              if (heatObj) {
                                //console.log("Heat Map Obj exists");
                                if (heatObj.pageLoadTime[SDS] == undefined && heatObj.pageLoadTime[THDS] == undefined && heatObj.pageLoadTime[RT] == undefined) {
                                  var js = {};
                                  heatObj.pageLoadTime = js;
                                }
                                if (time_range_arr[j] == SDS) {
                                  heatObj.pageLoadTime[SDS] = {};
                                  heatObj.pageLoadTime[SDS]['countries'] = countryValueJson;
                                  heatObj.pageLoadTime[SDS]['us_states'] = stateValueJson;
                                } else if (time_range_arr[j] == THDS) {
                                  heatObj.pageLoadTime[THDS] = {};
                                  heatObj.pageLoadTime[THDS]['countries'] = countryValueJson;
                                  heatObj.pageLoadTime[THDS]['us_states'] = stateValueJson;
                                } else if (time_range_arr[j] == RT) {
                                  heatObj.pageLoadTime[RT] = {};
                                  heatObj.pageLoadTime[RT]['countries'] = countryValueJson;
                                  heatObj.pageLoadTime[RT]['us_states'] = stateValueJson;
                                }

                                if (Object.keys(countryValueJson).length == country_codes.length && Object.keys(stateValueJson).length == usa_region_codes.length) {
                                  heatObj.updateAttributes(heatObj, function(err, updHeatObj) {
                                    if (err) {
                                      console.log("HeatMap Cache Update error");

                                      setTimeout(function() {
                                        j++;
                                        iterateTimeRange();
                                      }, sleep);

                                      //j++;
                                      //iterateTimeRange();
                                    } else {
                                      console.log("HeatMap Cache details updated successfully");
                                      setTimeout(function() {
                                        j++;
                                        iterateTimeRange();
                                      }, sleep);

                                      //j++;
                                      //iterateTimeRange();
                                    }
                                  });
                                } else {
                                  setTimeout(function() {
                                    j++;
                                    iterateTimeRange();
                                  }, sleep);

                                  //j++;
                                  //iterateTimeRange();
                                }
                              } else {
                                //console.log("Heat Map Obj does n't exists");
                                var hmCacheObj = new HeatMapCache();
                                hmCacheObj.domainName = domains[i].name;
                                hmCacheObj.pageLoadTime = {};
                                if (time_range_arr[j] == SDS) {
                                  hmCacheObj.pageLoadTime[SDS] = {};
                                  hmCacheObj.pageLoadTime[SDS]['countries'] = countryValueJson;
                                  hmCacheObj.pageLoadTime[SDS]['us_states'] = stateValueJson;
                                } else if (time_range_arr[j] == THDS) {
                                  hmCacheObj.pageLoadTime[THDS] = {};
                                  hmCacheObj.pageLoadTime[THDS]['countries'] = countryValueJson;
                                  hmCacheObj.pageLoadTime[THDS]['us_states'] = stateValueJson;
                                } else if (time_range_arr[j] == RT) {
                                  hmCacheObj.pageLoadTime[RT] = {};
                                  hmCacheObj.pageLoadTime[RT]['countries'] = countryValueJson;
                                  hmCacheObj.pageLoadTime[RT]['us_states'] = stateValueJson;
                                }
                                hmCacheObj.save(function(err, res) {
                                  if (err) {
                                    console.log("Unable to add heat map cache details");
                                    //j++;
                                    //iterateTimeRange();
                                    setTimeout(function() {
                                      j++;
                                      iterateTimeRange();
                                    }, sleep);

                                  } else {
                                    console.log("heat map cache details added successfully");
                                    //j++;
                                    //iterateTimeRange();
                                    setTimeout(function() {
                                      j++;
                                      iterateTimeRange();
                                    }, sleep);
                                  }
                                });
                              }
                            }
                          });
                        });
                      });
                    } else {
                      //i++;
                      //iterateDomains();
                      // To update the jobEnd time
                      updateDomainsHeatMapJobDetails(domains[i].name);
                      setTimeout(function() {
                        i++;
                        iterateDomains();
                      }, sleep);
                    }
                  }
                } else {
                  setTimeout(function() {
                    i++;
                    iterateDomains();
                  }, sleep);
                }
              });
            }
          } else {
            //For sending the mail
            //console.log("JOB COMPLETED");
            iscacheHetaMapRunning = false;
            //sendHeatMapCacheMail();
            send({
              status: true,
              response: "Heatmap job completed"
            });
          }
        }
      } else {
        send({
          status: false,
          response: "No domains found"
        });
      }
    }
  });
  //} else {
  //send({ status:true,response: "You dont have permission to perform this operation"});
  //}
});

var get_heatmap_cache_data = function(params, geo, callback) {
  //console.log("Calling get_heatmap_cache_data");
  params.geography = geo;
  var regCodesArr = [];
  if (params.geography == "countries") {
    regCodesArr = country_codes;
  } else if (params.geography == "states") {
    regCodesArr = usa_region_codes;
  }

  var countryJson = {};
  var currentIndex = 0;
  var endIndex = 0;

  iterateRegions();

  function iterateRegions() {
    //console.log("Calling iterateRegions",endIndex,regCodesArr.length);
    var regArr = [];

    if (endIndex < regCodesArr.length) {
      endIndex = currentIndex + heatMapBatchCount;
      if (endIndex > regCodesArr.length) {
        endIndex = regCodesArr.length;
      }

      for (var i = currentIndex; i < endIndex; i++) {
        regArr.push(regCodesArr[i]);
      }
      get_heatmap_cache_data_batch(params, geo, regArr, function(countryBatchJson) {
        for (var attrname in countryBatchJson) {
          countryJson[attrname] = countryBatchJson[attrname];
        }
        //console.log("countryJson",countryJson);
        currentIndex = endIndex;
        setTimeout(
          function() {
            //do something special
            iterateRegions();
          }, 500);
      });
    } else {
      callback(countryJson);
    }
  }
};

/**
 * Getting the avg page load time based on the region.
 */
var get_heatmap_cache_data_batch = function(params, geo, regArr, callback) {
  //console.log("get_heatmap_cache_data",params);
  var eval_url = "ws://" + params.cube_url.split('//')[1].split('/')[0] + "/1.0/metric/get";
  var value = 0;
  var msg_id_array = [];
  var region_array = {};
  params.geography = geo;

  region_codes = regArr;

  if (params.geography == "countries") {
    //region_codes = country_codes;
    region_key = 'geography';
  } else if (params.geography == "states") {
    //region_codes = usa_region_codes;
    region_key = 'region';
  }
  //console.log("geography--->",params.geography);
  for (region in region_codes) {
    region_array[region_codes[region]] = [];
  }
  try {
    var ews = new WebSocket(eval_url);
    ews.on("open", function() {
      //console.log("heat_map Connection Open");
      for (region in region_codes) {
        //for(var ri=0; ri<1;ri++){
        //region = region_codes[ri];
        ews.send(prepare_ws_heat_map_json(params, region_codes[region]));
      }
    });
    ews.on("error", function() {
      console.log('HeatMap error ');

      revportal.heatMapCronErrorlog("/////////////////////////////////////////////////");
      revportal.heatMapCronErrorlog("Error while connecting to " + eval_url);
      revportal.heatMapCronErrorlog("/////////////////////////////////////////////////\n");

      //for closing the connection
      setInterval(function() {
        ews.close();
      }, 10000);
      //callback(prepare_default_heap_map_json());
      callback({});
    });

    ews.on('connectFailed', function(error) {
      console.log('HeatMap Cron Connect Failed: ');

      revportal.heatMapCronErrorlog("/////////////////////////////////////////////////");
      revportal.heatMapCronErrorlog("ConnectFailed while connecting to " + eval_url);
      revportal.heatMapCronErrorlog("/////////////////////////////////////////////////\n");

      setInterval(function() {
        ews.close();
      }, 10000);
      callback({});
    });

    ews.on("message", function(msg) {
      msg = JSON.parse(msg);
      //console.log("MSG",msg);
      if (msg.value != undefined) {
        region_array[msg.id].push(msg.value);
      }
      if (msg_id_array.indexOf(msg.id) == -1) {
        msg_id_array.push(msg.id);
      } else {
        if (region_codes.length == msg_id_array.length) {
          value++;
        }
        //console.log("REGION LENGTH",region_codes.length, "MSG ID LENGTH", msg_id_array.length, "VALUE", value);
        if (region_codes.length == msg_id_array.length && value == 2 && params.time_range == OHR) {
          //console.log("Return the JSON for OHR");
          callback(prepare_val_heap_map_json(region_array));
        } else if (region_codes.length == msg_id_array.length && value == 25 && params.time_range == TFHRS) {
          //console.log("Return the JSON for TFHRS");
          callback(prepare_val_heap_map_json(region_array));
        } else if (region_codes.length == msg_id_array.length && value == 8 && params.time_range == SDS) {
          //console.log("Return the JSON for SDS");
          callback(prepare_val_heap_map_json(region_array));
        } else if (region_codes.length == msg_id_array.length && value == 30 && params.time_range == THDS) {
          //console.log("Return the JSON for THDS");
          callback(prepare_val_heap_map_json(region_array));
        } else if (region_codes.length == msg_id_array.length && value == Math.ceil(params.time_val) && params.time_range == RT) {
          //console.log("Return the JSON for RT");
          callback(prepare_val_heap_map_json(region_array));
        }
      }
      //for closing the connection
      setInterval(function() {
        ews.close();
      }, 120000);
    });
  } catch (e) {
    //for closing the connection

    revportal.heatMapCronErrorlog("/////////////////////////////////////////////////");
    revportal.heatMapCronErrorlog("Entered into cache block with the error: " + e.message);
    revportal.heatMapCronErrorlog("/////////////////////////////////////////////////\n");

    setInterval(function() {
      ews.close();
    }, 10000);
    //callback(prepare_default_heap_map_json());
    callback({});
  }
};

action('sendHeatMapCacheMail', function() {
  sendHeatMapCacheMail();
});

var sendHeatMapCacheMail = function() {
  var mail = new revportal.heatMapmail();
  var email = "prashant@revsw.com";
  HeatMapCache.all(function(err, hmCache) {
    var data = "<div><table style='background-color:white;width:60%;height:auto;' align='center' cellpadding=2 cellspacing=1 border=1>";
    data += "<tr style='background-color:#00688B;color:white;height:30px;'>";
    data += "<th>Domain Name</th>";
    data += "<th>Last Updated</th></tr>";
    var m = 0;
    prepareHeatMapCacheData();

    function prepareHeatMapCacheData() {
      if (m < hmCache.length) {
        if (hmCache[m].domainName) {
          data += "<tr>";
          data += "<td>" + hmCache[m].domainName + "</td>";
          data += "<td>" + hmCache[m].updated_at + "</td>";
          data += "</tr>";
          m++;
          prepareHeatMapCacheData();
        }
      } else {
        data += "</table></div>";
        //console.log("DATA",data);
        mail.sendMail(revportal.heatMapCacheMail("Prashanth", email, data, "Heat Map Details"), function(stat) {
          if (stat) {
            send({
              status: true,
              response: "Heat map Cache details mailed successfully"
            });
          } else {
            send({
              status: false,
              response: "Unable to send heatmap cache details"
            });
          }
        });
      }
    }
  });
};
/**
 * ######################################## CRON JOB ############################
 */

action('heatMap', function() {
  //console.log("Calling Heta map method");
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
          var params = {};
          params.cube_url = domain.cube_url;
          if (req.body.time_range == OHR || req.body.time_range == TFHRS || req.body.time_range == SDS || req.body.time_range == THDS) {
            params.time_range = req.body.time_range;
          } else {
            params.time_range = RT;
            params.time_val = req.body.time_range;
          }
          params.domain_name = domain.name;;
          params.geography = req.body.geography;
          if (req.body.is_heat_map_cache == 'true') {
            // If the user request for either 1 hr(very first time), 7 days, 30 days, Rev start it will enter into this block
            HeatMapCache.findOne({
              where: {
                domainName: req.body.domainName
              }
            }, function(err, heatObj) {
              if (err) {
                console.log("Unable to add Heat Map Cache Details");
              } else {
                var time_rang = '';
                if (req.body.time_range == OHR || req.body.time_range == TFHRS || req.body.time_range == SDS || req.body.time_range == THDS) {
                  time_rang = req.body.time_range;
                } else {
                  time_rang = RT;
                }

                var geo_temp;
                if (req.body.geography == 'countries') {
                  geo_temp = 'countries';
                } else {
                  geo_temp = 'us_states';
                }

                if (heatObj && heatObj.pageLoadTime[time_rang] && heatObj.pageLoadTime[time_rang][geo_temp]) {
                  // If Heat map exists and data also exist for that time range
                  // it will enter into this loop
                  var heatmap_res = {};
                  heatmap_res.domainName = heatObj.domainName;
                  heatmap_res.geo = req.body.geography;
                  if (req.body.geography == 'countries') {
                    if (heatObj.pageLoadTime[time_rang]['countries'] != undefined) {
                      heatmap_res.data = heatObj.pageLoadTime[time_rang]['countries'];
                    } else {
                      region_codes = country_codes;
                      heatmap_res.data = prepare_default_heap_map_json();
                    }
                  } else {
                    if (heatObj.pageLoadTime[time_rang]['us_states'] != undefined) {
                      heatmap_res.data = heatObj.pageLoadTime[time_rang]['us_states'];
                    } else {
                      region_codes = usa_region_codes;
                      heatmap_res.data = prepare_default_heap_map_json();
                    }
                  }
                  send({
                    status: true,
                    response: heatmap_res
                  });
                } else {
                  // If heat map cache object doesnt exist then make a call to evalutor and get the data
                  get_heat_map_data(params, function(valueJson) {
                    //console.log("valueJson--->>>",valueJson);
                    var heatmap_res = {};
                    heatmap_res.domainName = domain.name;
                    heatmap_res.geo = req.body.geography;
                    heatmap_res.data = valueJson;
                    send({
                      status: true,
                      response: heatmap_res
                    });

                    /************** ****************************/
                    HeatMapCache.findOne({
                      where: {
                        domainName: req.body.domainName
                      }
                    }, function(err, heatCacheObj) {

                      if (heatCacheObj) {
                        //If heat Object Exists updating cache table
                        if (heatCacheObj.pageLoadTime[time_rang] == undefined) {
                          heatCacheObj.pageLoadTime[time_rang] = {};
                        }
                        if (req.body.geography == 'countries') {
                          heatCacheObj.pageLoadTime[time_rang]['countries'] = valueJson;
                        } else {
                          heatCacheObj.pageLoadTime[time_rang]['us_states'] = valueJson;
                        }

                        heatCacheObj.updateAttributes(heatCacheObj, function(err, updhObj) {
                          if (err) {
                            console.log("Unable to update heat map cache details");
                          } else {
                            console.log("Updated heat map  details");
                          }
                        });
                      } else {
                        //If heat Object Doesnt Exist adding heat Object
                        var hObj = new HeatMapCache();
                        hObj.domainName = domain.name;
                        hObj.pageLoadTime = {};
                        hObj.pageLoadTime[time_rang] = {};

                        if (req.body.geography == 'countries') {
                          hObj.pageLoadTime[time_rang]['countries'] = valueJson;
                        } else {
                          hObj.pageLoadTime[time_rang]['us_states'] = valueJson;
                        }

                        hObj.save(function(err, res) {
                          if (err) {} else {
                            console.log("heat map cache details added successfully");
                          }
                        });
                      }
                    });

                    /************* *****************************/


                  });
                }
              }
            });
          } else {
            //If the user requests for 24 hrs data then it will enter into this loop
            if (domain && domain.status) {
              //console.log("Calling DB heat map");

              get_heat_map_data_1_24(params, function(heatmap_res) {
                send({
                  status: true,
                  response: heatmap_res
                });
              });

              /**get_heat_map_data(params,function(valueJson){
              	//console.log("valueJson--->>>",valueJson);
              	var heatmap_res = {};
              	heatmap_res.domainName = domain.name;
              	heatmap_res.geo = req.body.geography;
              	heatmap_res.data = valueJson;
              	send({ status: true, response: heatmap_res});
              });*/
            } else {
              send({
                status: false,
                response: revportal.prepare_deleted_domain_json()
              });
            }
          }
        } else {
          send({
            status: false,
            response: revportal.prepare_deleted_domain_json()
          });
        }
      }
    });
    //}
  } else {
    send({
      status: false,
      response: "Please sed a valid JSON"
    });
  }
});

/**
 * Getting the avg page load time based on the region. 
 */
var get_heat_map_data = function(params, callback) {
  //console.log("get_heat_map_data",params);
  var eval_url = "ws://" + params.cube_url.split('//')[1].split('/')[0] + "/1.0/metric/get";
  var value = 0;
  var msg_id_array = [];
  var region_array = {};

  if (params.geography == "countries") {
    region_codes = country_codes;
    region_key = 'geography';
  } else if (params.geography == "states") {
    region_codes = usa_region_codes;
    region_key = 'region';
  }
  //console.log("geography--->",params.geography);
  for (region in region_codes) {
    region_array[region_codes[region]] = [];
  }

  try {
    var ews = new WebSocket(eval_url);
    ews.on("open", function() {
      //console.log("heat_map Connection Open");
      for (region in region_codes) {
        ews.send(prepare_ws_heat_map_json(params, region_codes[region]));
      }
    });
    ews.on("error", function() {
      console.log("heat_map Connection error");

      //for closing the connection
      setInterval(function() {
        ews.close();
      }, 120000);

      callback(prepare_default_heap_map_json());
    });
    ews.on("message", function(msg) {
      msg = JSON.parse(msg);
      if (msg.value != undefined) {
        region_array[msg.id].push(msg.value);
      }
      if (msg_id_array.indexOf(msg.id) == -1) {
        msg_id_array.push(msg.id);
      } else {
        if (region_codes.length == msg_id_array.length) {
          value++;
        }
        if (region_codes.length == msg_id_array.length && value == 2 && params.time_range == OHR) {
          //console.log("Return the JSON for OHR");
          callback(prepare_val_heap_map_json(region_array));
        } else if (region_codes.length == msg_id_array.length && value == 25 && params.time_range == TFHRS) {
          //console.log("Return the JSON for TFHRS");
          callback(prepare_val_heap_map_json(region_array));
        } else if (region_codes.length == msg_id_array.length && value == 8 && params.time_range == SDS) {
          //console.log("Return the JSON for SDS");
          callback(prepare_val_heap_map_json(region_array));
        } else if (region_codes.length == msg_id_array.length && value == 30 && params.time_range == THDS) {
          //console.log("Return the JSON for THDS");
          callback(prepare_val_heap_map_json(region_array));
        } else if (region_codes.length == msg_id_array.length && value == Math.ceil(params.time_val) && params.time_range == RT) {
          //console.log("Return the JSON for RT");
          callback(prepare_val_heap_map_json(region_array));
        }
      }

      //for closing the connection
      setInterval(function() {
        ews.close();
      }, 120000);

    });
  } catch (e) {
    //for closing the connection
    setInterval(function() {
      ews.close();
    }, 120000);

    callback(prepare_default_heap_map_json());
  }
};

/**
 * Service for running the corn job for every one hour to evaluate the heat map(registered domains)
 */
action("eval_heatmap_cron", function() {
  //console.log("HEAT MAP CRON >>>>>>>>>>>>>>>>>>>>");
  Domain.all({
    where: {
      status: true
    }
  }, function(err, domains) {
    if (err) {
      console.log("errors--->>>>");
    } else {
      for (domain in domains) {
        var params = {};
        params.domain_name = domains[domain].name;
        params.cube_url = domains[domain].cube_url;
        eval_heat_map_data(params);
      }
    }
  });
});

var eval_heat_map_data = function(params) {
  //console.log("Came in to eval_heat_map_data>>");
  var eval_url = "ws://" + params.cube_url.split('//')[1].split('/')[0] + "/1.0/metric/get";

  var ws = new WebSocket(eval_url);
  ws.on("open", function() {
    //   console.log("CONNECTION OPEND");
    for (region in region_codes) {
      ews.send(prepare_ws_heat_map_json(params, region_codes[region]));
    }

    //for closing websocket connection
    setInterval(function() {
      ws.close();
    }, 120000);
  });
};

/**
 * Preparing the heap map response json with getting values
 */
var prepare_val_heap_map_json = function(region_array) {
  //console.log("prepare_val_heap_map_json");
  var json = {};
  for (region in region_codes) {
    json[region_codes[region]] = revportal.median(region_array[region_codes[region]]) ? revportal.median(region_array[region_codes[region]]) : 0;
  }
  return json;
};

/**
 * Preparing the heap map response json with 0 values
 */
var prepare_default_heap_map_json = function() {
  var json = {};
  for (region in region_codes) {
    json[region_codes[region]] = 0;
  }
  return json;
};

/**
 * Preparing the heap map evaluator json for getting the avg pageloadtime based on country
 */
var prepare_ws_heat_map_json = function(params, region) {
  var json = {};

  if (params.domain_name && region) {
    json.expression = "median(pl_info(" + PLT + ").eq(domain,'" + params.domain_name + "').eq(" + region_key + ",'" + region + "'))";
  } else {
    json.expression = "median(pl_info(" + PLT + "))";
  }
  json.id = region;
  json.stop = new Date().toISOString();
  if (params.time_range == OHR) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 3e5;
  } else if (params.time_range == TFHRS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 36e5;
  } else if (params.time_range == SDS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else if (params.time_range == THDS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else if (params.time_range == RT) {
    var ed = new Date().getTime() - params.time_val * 24 * 60 * 60 * 1000;
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 36e5;
  }
  return JSON.stringify(json);
};

process.on('uncaughtException', function(err) {
  console.log('Caught exception In Dashboard Controller: ' + err);
});

/**
 * Service for calcualting the device and browser details
 */

action('deviceBrowser', function() {
  //console.log("Calling device browser method");
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
          var params = {};
          params.cube_url = domain.cube_url;
          if (req.body.time_range == OHR || req.body.time_range == TFHRS || req.body.time_range == SDS || req.body.time_range == THDS) {
            params.time_range = req.body.time_range;
          } else {
            params.time_range = RT;
            params.time_val = req.body.time_range;
          }
          params.domain_name = domain.name;
          if (req.body.is_device_browser_cache == 'true') {
            DevBrowserCache.findOne({
              where: {
                domainName: req.body.domainName
              }
            }, function(err, dbObj) {
              if (err) {
                console.log("Unable to add Device Browsers Cache Details");
              } else {
                var time_rang = '';
                if (req.body.time_range == OHR || req.body.time_range == TFHRS || req.body.time_range == SDS || req.body.time_range == THDS) {
                  time_rang = req.body.time_range;
                } else {
                  time_rang = RT;
                }
                if (dbObj && dbObj.devBrowserJson[time_rang]) {
                  //console.log("HEAT CACHE DB DATA EXISTS");
                  params.type = "cache";

                  get_device_browser_data_1_24(params, function(valueJson) {
                    var valArr = [];
                    for (browser in browsers) {
                      if (valueJson[browsers[browser]] > 0) {
                        var isDataExist = false;
                        if (dbObj.devBrowserJson[time_rang].length == 0) {
                          valArr.push([browserJson[browsers[browser]], valueJson[browsers[browser]]]);

                        } else {
                          for (ind in dbObj.devBrowserJson[time_rang]) {
                            if (dbObj.devBrowserJson[time_rang][ind][0] == browserJson[browsers[browser]]) {
                              // valArr.splice(ind,1);
                              var browserCount = dbObj.devBrowserJson[time_rang][ind][1];

                              valArr.push([browserJson[browsers[browser]], valueJson[browsers[browser]] + browserCount]);
                              isDataExist = true;
                            } else {
                              if (!isDataExist && ind == dbObj.devBrowserJson[time_rang].length - 1)
                                valArr.push([browserJson[browsers[browser]], valueJson[browsers[browser]]]);
                            }
                          }
                        }
                      } else {
                        for (ind in dbObj.devBrowserJson[time_rang]) {
                          if (dbObj.devBrowserJson[time_rang][ind][0] == browserJson[browsers[browser]]) {
                            // valArr.splice(ind,1);
                            var browserCount = dbObj.devBrowserJson[time_rang][ind][1];

                            valArr.push([browserJson[browsers[browser]], browserCount]);
                          }
                        }
                      }
                    }
                    send({
                      status: true,
                      response: valArr
                    });
                  });

                  //send({ status: true, response: dbObj.devBrowserJson[time_rang]});
                } else {
                  //console.log("HEAT CACHE DB DATA DOES NT EXISTS");
                  get_device_browser_data(params, function(valueJson) {
                    //console.log("VALUE JSON",valueJson);
                    if (valueJson && valueJson['status'] && valueJson['status'] == 'cubeFailed') {
                      //console.log("DEV BROW CUBE FAILED");
                      send({
                        status: 'cubeFailed',
                        response: "Unable to retrieve the data"
                      });
                    } else {
                      var valueArray = [];
                      //console.log("DEV BROW CUBE TRUE");
                      if (Object.keys(valueJson).length > 0) {
                        valueJson[AC] > 0 ? valueArray.push(["Android-Chrome", valueJson[AC]]) : "";
                        valueJson[AD] > 0 ? valueArray.push(["Android-Default", valueJson[AD]]) : "";
                        valueJson[AF] > 0 ? valueArray.push(["Android-Firefox", valueJson[AF]]) : "";
                        valueJson[CH] > 0 ? valueArray.push(["Desktop-Chrome", valueJson[CH]]) : "";
                        valueJson[FF] > 0 ? valueArray.push(["Desktop-Firefox", valueJson[FF]]) : "";
                        valueJson[IE] > 0 ? valueArray.push(["Desktop-IE", valueJson[IE]]) : "";
                        valueJson[SF] > 0 ? valueArray.push(["Desktop-Safari", valueJson[SF]]) : "";
                        valueJson[IC] > 0 ? valueArray.push(["iOS-Chrome", valueJson[IC]]) : "";
                        valueJson[IS] > 0 ? valueArray.push(["iOS-Safari", valueJson[IS]]) : "";
                        valueJson[WP] > 0 ? valueArray.push(["Windows Phone", valueJson[WP]]) : "";
                        valueJson[OT] > 0 ? valueArray.push(["Others", valueJson[OT]]) : "";
                      }
                      send({
                        status: true,
                        response: valueArray
                      });

                      /********************* **************************/
                      if (dbObj) {
                        //If heat Object Exists updating cache table
                        if (dbObj.devBrowserJson[time_rang] == undefined) {
                          dbObj.devBrowserJson[time_rang] = {};
                        }
                        dbObj.devBrowserJson[time_rang] = valueArray;

                        dbObj.updateAttributes(dbObj, function(err, upddbObj) {
                          if (err) {
                            console.log("Unable to update dev browser cache details");
                          } else {
                            console.log("Updated dev browser cache details");
                          }
                        });
                      } else {
                        //If heat Object Doesnt Exist adding heat Object
                        var devBrowsObj = new DevBrowserCache();
                        devBrowsObj.domainName = domain.name;
                        devBrowsObj.devBrowserJson = {};
                        devBrowsObj.devBrowserJson[time_rang] = {};

                        devBrowsObj.devBrowserJson[time_rang] = valueArray;

                        devBrowsObj.save(function(err, res) {
                          if (err) {} else {
                            console.log("dev browser cache details added successfully");
                          }
                        });
                      }
                      /******************** ***************************/

                    }
                  });
                }
              }
            });
          } else {
            //get_device_browser_data(params,function(valueJson){
            get_device_browser_data_1_24(params, function(valueJson) {
              //console.log("VALUE JSON",valueJson);
              if (valueJson && valueJson['status'] && valueJson['status'] == 'cubeFailed') {
                //console.log("DEV BROW CUBE FAILED");
                send({
                  status: 'cubeFailed',
                  response: "Unable to retrieve the data"
                });
              } else {
                var valueArray = [];
                //console.log("DEV BROW CUBE TRUE");
                if (Object.keys(valueJson).length > 0) {
                  valueJson[AC] > 0 ? valueArray.push(["Android-Chrome", valueJson[AC]]) : "";
                  valueJson[AD] > 0 ? valueArray.push(["Android-Default", valueJson[AD]]) : "";
                  valueJson[AF] > 0 ? valueArray.push(["Android-Firefox", valueJson[AF]]) : "";
                  valueJson[CH] > 0 ? valueArray.push(["Desktop-Chrome", valueJson[CH]]) : "";
                  valueJson[FF] > 0 ? valueArray.push(["Desktop-Firefox", valueJson[FF]]) : "";
                  valueJson[IE] > 0 ? valueArray.push(["Desktop-IE", valueJson[IE]]) : "";
                  valueJson[SF] > 0 ? valueArray.push(["Desktop-Safari", valueJson[SF]]) : "";
                  valueJson[IC] > 0 ? valueArray.push(["iOS-Chrome", valueJson[IC]]) : "";
                  valueJson[IS] > 0 ? valueArray.push(["iOS-Safari", valueJson[IS]]) : "";
                  valueJson[WP] > 0 ? valueArray.push(["Windows Phone", valueJson[WP]]) : "";
                  valueJson[OT] > 0 ? valueArray.push(["Others", valueJson[OT]]) : "";
                }
                send({
                  status: true,
                  response: valueArray
                });
              }
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
      response: "Please sed a valid JSON"
    });
  }
});

/**
 * Service for running the corn job for every one hour to evaluate the browser data(registered domains)
 */
action("eval_dev_browser_cron", function() {
  //console.log("DEV AND BROWSER CRON <>>>>>>>>>>>>>>>>>>");
  if (!iscacheHetaMapRunning) {
    Domain.all({
      where: {
        status: true
      }
    }, function(err, domains) {
      if (err) {
        console.log("errors--->>>>");
      } else {
        var dev = 0;
        eval_cron_con();

        function eval_cron_con() {
          //console.log("into iterative---->");
          if (dev < domains.length) {
            if (domains[dev].name != "" && domains[dev].name != null) {
              var params = {};
              params.domain_name = (domains[dev].name != "" && domains[dev].name != null) ? domains[dev].name : "";
              params.cube_url = (domains[dev].cube_url != "" && domains[dev].cube_url != null) ? domains[dev].cube_url : "";
              eval_dev_browse_ws_data(params, function(status) {
                dev++;
                eval_cron_con();
              });
            }
          }
        }
      }
    });
  }
});

var eval_dev_browse_ws_data = function(params, callback) {
  //console.log("Came in to EVAL DEV BROWSER CRON>>");
  if (params.cube_url != "") {
    var eval_url = "ws://" + params.cube_url.split('//')[1].split('/')[0] + "/1.0/metric/get";
    //console.log("DEV BROWSER EVAL URL",eval_url);
    var ws = new WebSocket(eval_url);
    ws.on('connectFailed', function(error) {
      //console.log('"Dev Browser Cron Connect Failed: ');
      ws.close();
      callback(false);
    });

    ws.on("error", function(error) {
      //console.log("Dev Browser Cron Connection Error: ");
      ws.close();
      callback(false);
    });
    ws.on("open", function() {
      //console.log("CONNECTION OPEND");
      var _br = 0;
      for (browser in browsers) {
        ws.send(prepare_device_ws_browser_json(params, browsers[browser], browsers[browser]));
        _br++;
        if (_br == browsers.length - 1) {
          //for closing websocket connection
          setInterval(function() {
            ws.close();
          }, 120000);
          callback(true);
        }
      }
    });
  } else {
    //console.log("in false callack---->");
    callback(false);
  }
};

/**
 * Getting the device & browser values from Diablo system
 */
var get_device_browser_data = function(params, callback) {
  //console.log("get_device_browser_data");
  var json = {};
  var msg_id_array = [];
  var value = 0;

  var eval_url = "ws://" + params.cube_url.split('//')[1].split('/')[0] + "/1.0/metric/get";
  try {
    var ews = new WebSocket(eval_url);
    ews.on("open", function() {
      for (browser in browsers) {
        ews.send(prepare_device_ws_browser_json(params, browsers[browser], browsers[browser]));
      }
    });

    ews.on("error", function() {
      //console.log("Device Browser Connection error");

      //for closing the connection
      setInterval(function() {
        ews.close();
      }, 10000);

      revportal.deviceBrowsersCronErrorlog("/////////////////////////////////////////////////");
      revportal.deviceBrowsersCronErrorlog("Erro while connecting to " + eval_url);
      revportal.deviceBrowsersCronErrorlog("/////////////////////////////////////////////////\n");

      //callback(prepare_default_heap_map_json());
      callback({});
    });

    ews.on('connectFailed', function(error) {
      //console.log('Device Browser Cron Connect Failed: ');
      setInterval(function() {
        ews.close();
      }, 10000);

      revportal.deviceBrowsersCronErrorlog("/////////////////////////////////////////////////");
      revportal.deviceBrowsersCronErrorlog("ConnectFailed while connecting to " + eval_url);
      revportal.deviceBrowsersCronErrorlog("/////////////////////////////////////////////////\n");

      callback({});
    });

    ews.on("close", function() {
      console.log("Device Browser Connection closed");
    });

    ews.on("message", function(msg) {

      msg = JSON.parse(msg);

      if (msg.value != undefined) {
        if (json[msg.id] && json[msg.id] != undefined) {
          json[msg.id] = json[msg.id] + msg.value;
        } else {
          json[msg.id] = msg.value;
        }
      }

      if (msg_id_array.indexOf(msg.id) == -1) {
        msg_id_array.push(msg.id);
      } else {
        if (browsers.length == msg_id_array.length) {
          value++;
        }
        //console.log("msg_id_array.length",msg_id_array.length, "VALUE",value);

        if (browsers.length == msg_id_array.length && value == 13 && params.time_range == OHR) {
          //console.log("Return the JSON for OHR",json);
          callback(json);
          ews.close();
        } else if (browsers.length == msg_id_array.length && value == 25 && params.time_range == TFHRS) {
          //console.log("Return the JSON for TFHRS",json);
          callback(json);
          ews.close();
        } else if (browsers.length == msg_id_array.length && value == 8 && params.time_range == SDS) {
          //console.log("Return the JSON for SDS",json);
          callback(json);
          ews.close();
        } else if (browsers.length == msg_id_array.length && value == 30 && params.time_range == THDS) {
          //console.log("Return the JSON for THDS",json);
          callback(json);
          ews.close();
        } else if (browsers.length == msg_id_array.length && value == Math.ceil(params.time_val) && params.time_range == RT) {
          //console.log("Return the JSON for RT",json);
          callback(json);
          ews.close();
        }
      }
      /**if(msg.value != undefined && msg.value > 0){
      	if(json[msg.id]){
      		json[msg.id] = json[msg.id]+msg.value;
      	}else{
      		json[msg.id] = msg.value;
      	}
      }else if(msg.id == OT && msg.value == undefined){
      	callback(json);
      }*/

      //for closing the connection
      setInterval(function() {
        ews.close();
      }, 1000000);
    });
  } catch (e) {
    //for closing the connection
    setInterval(function() {
      ews.close();
    }, 10000);

    revportal.deviceBrowsersCronErrorlog("/////////////////////////////////////////////////");
    revportal.deviceBrowsersCronErrorlog("Entered into cache block with the error: " + e.message);
    revportal.deviceBrowsersCronErrorlog("/////////////////////////////////////////////////\n");

    //callback(prepare_default_heap_map_json());
    callback({});
  }
};

/**
 * Method used for preparing the default device browser json
 */
var prepare_default_device_browser_json = function() {
  console.log("came in to the default device browser json");
  var json = {};
  json['status'] = 'cubeFailed';
  for (browser in browsers) {
    json[browsers[browser]] = 0;
  }
  return json;
};

/**
 * Preparing the device and browser json
 */
var prepare_device_ws_browser_json = function(params, browser, type) {
  var json = {};
  if (params.domain_name && browser) {
    json.expression = "sum(pl_info(1).eq(domain,'" + params.domain_name + "').eq(device,'" + browser + "'))";
  } else if (browser) {
    json.expression = "sum(pl_info(1).eq(device,'" + browser + "'))";
  } else if (params.domain_name) {
    json.expression = "sum(pl_info(1).eq(domain,'" + params.domain_name + "'))";
  } else {
    json.expression = "sum(pl_info(1))";
  }
  if (type == AC) {
    json.id = AC;
  } else if (type == AD) {
    json.id = AD;
  } else if (type == AF) {
    json.id = AF;
  } else if (type == CH) {
    json.id = CH;
  } else if (type == FF) {
    json.id = FF;
  } else if (type == IE) {
    json.id = IE;
  } else if (type == SF) {
    json.id = SF;
  } else if (type == IC) {
    json.id = IC;
  } else if (type == IS) {
    json.id = IS;
  } else if (type == WP) {
    json.id = WP;
  } else {
    json.id = OT;
  }
  json.stop = new Date().toISOString();
  if (params.time_range == OHR) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 3e5;
  } else if (params.time_range == TFHRS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 36e5;
  } else if (params.time_range == SDS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else if (params.time_range == THDS) {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else if (params.time_range == RT) {
    var ed = new Date().getTime() - params.time_val * 24 * 60 * 60 * 1000;
    json.start = new Date(ed).toISOString();
    json.step = 864e5;
  } else {
    var ed = new Date().getTime() - time(params.time_range);
    json.start = new Date(ed).toISOString();
    json.step = 36e5;
  }
  return JSON.stringify(json);
};

/**
 * Service for running the cron job for every 15 minutes and preparing the policy controller json i/p
 */
action('stats_cron', function() {
  //console.log("STATS CRON JOB <>>>>>>>>>>>>>>>>>>>>");
  if (!iscacheHetaMapRunning) {
    DomainStats.all(function(err, domainStats) {
      //console.log("domainStats--->>>",domainStats);
      var i = 0;
      sendEachStats();

      function sendEachStats() {
        if (i < domainStats.length) {
          if (domainStats[i].domains.length > 0) {
            //console.log("each--->>>>>",domainStats[i]);
            var domains = domainStats[i].domains;
            //console.log("domains---->>>",domains);
            var domainJson = {};
            var domainNames = {};
            var j = 1;
            for (domain in domains) {
              domainNames["d" + j] = domains[domain];
              j++;
            }
            domainJson.domain_names = domainNames;
            //console.log("domainJson--->>>",domainJson);
            //console.log("stats_url--->>>",domainStats[i].stats_url);
            //if(domainStats[i].stats_url =="bp-sidde-dyn-sjc.revsw.net:8001") {
            if (domainStats[i].stats_url && domainStats[i].stats_url != " ") {
              get_stats_data(domainStats[i].stats_url, domainJson, j - 1);
            }
            //}
            i++;
            sendEachStats();
          } else {
            i++;
            sendEachStats();
          }
        }
      }
    });
  }
});

/**
 * Method is used to get the data from policy controller and send to cube
 */
var get_stats_data = function(stats_url, domainJson, reqCount) {
  //console.log("Came in to the get_stats_data");
  var wsUrl = "ws://" + stats_url;
  //wsUrl = "ws://bp-sidde-dyn-sjc.revsw.net:8001";
  //console.log("STAT URL",wsUrl,"DOM JSON",domainJson);

  var statJs = {};
  statJs['status'] = false;
  bpStatJson = statJs;

  var client = new WebSocketClient();
  client.connect(wsUrl, 'collector-bridge');

  client.on('connectFailed', function(error) {
    console.log('STATS WSConnect Failed: ');
  });

  client.on("error", function(error) {
    console.log("STAT WS Connection Error: ");
  });



  client.on("connect", function(connection) {
    var respCount = 0;
    //console.log("CONNECTION OPEN STAT <<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>");
    connection.on("open", function(error) {
      console.log("Connection Opened:");
    });
    connection.on("error", function(error) {
      console.log("STAT WS Connection Error: ");
    });
    connection.on('close', function() {
      console.log('Websocket Connection Closed');
    });
    //setInterval(function(){connection.close();},120000);

    connection.on('message', function(message) {
      statJs['status'] = true;
      bpStatJson = statJs;
      //console.log("STAT RESPONSE $$$$$$$$$$$$$$$$$$$$$$$$$",message);	
      if (isBulkResponse) {
        var data = JSON.parse(message.utf8Data);
        //var data = message.utf8Data;
        if (data && data.domains) {
          for (var i = 0; i < data.domains.length; i++) {
            var json = {};
            json.domain_name = data.domains[i].domain_name;
            json.rev_stats = data.domains[i].rev_stats;
            json.rev_stats.node_id = 0;
            send_stats_data_cube(json);
          }
        }
        if (connection) {
          connection.close();
        }


      } else {
        if (message.type === 'utf8') {
          respCount++;

          send_stats_data_cube(message.utf8Data);
          if (respCount === reqCount) {
            if (connection) {
              connection.close();
            }

          }
        }
      }
    });
    if (connection.connected) {
      connection.send(JSON.stringify(domainJson));
    } else {
      console.log('Not able to establish the connection');
    }
  });
};

/**
 * Sending the data to cube
 */
var send_stats_data_cube = function(data) {
  //console.log("Came in to the send_stats_data_cube------>>>>>");
  var cube_url = "ws://localhost:1080/";
  var cube_object = cube.emitter(cube_url);
  if (!isBulkResponse) {
    //console.log("IN CUBE SEND BULK RESP FALSE BLK >>>>>>>>>>>>>>>>>>>>>>");
    data = JSON.parse(data);
  }
  var send_obj = {};
  send_obj.type = "stats_info";
  var stats_json = {};
  stats_json.domain_name = data.domain_name;
  stats_json.node_id = data.rev_stats.node_id;
  stats_json.time_stamp = data.rev_stats.time_stamp;
  stats_json.page_count = data.rev_stats.page_count;
  stats_json.bytes_count = data.rev_stats.bytes_count;
  stats_json.attack_count = data.rev_stats.attack_count;
  send_obj.data = stats_json;
  //console.log("---Cube Send data---",stats_json);
  cube_object.send(send_obj);
  cube_object.close();
};
