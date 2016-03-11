/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Latheef Shaik>
*/

/**
 * Added the services for checking the i/p request.
 */
load('application');
//before(use('validateRequest'),{only:['heatMapNew']});

//Loading the required modules
var log= require("co-logger");

var revportal = require("revportal");

//for loading mongo client
var MongoClient = require('mongodb').MongoClient;


//HeatMap Country codes
var country_codes = ["IN","US","AD","AE","AF","AG","AI","AL","AM","AO","AP","AQ","AR","AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","EU","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IO","IQ","IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"];
var usa_region_codes = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"];
var region_codes = [];
var region_key = "";
//DashBoard time_range values declaration
var OHR = "1 hour";
var TFHRS = "24 hours";
var SDS = "7 days";
var THDS = "30 days";
var RT = "Rev Start";

//for managing bulk response from policy
var iscacheHetaMapRunning=false;

// HEAT MAP CRON JOB NEW IMPLEMENTATION //
/**
 * This function is used to return the defalt heat map data(with '0' value for all the countries)
 */
 var prepare_default_cron_json_1_24 = function(params){
 	console.log("Calling prepare_default_cron_json_1_24");
 	var heatJson = {};

 	//heatJson.domainName = params.domain_name;	

	var con={};
	var st={};

 	for(var code in country_codes) {
 		con[country_codes[code]]= {};
 		con[country_codes[code]]['sum']=0;
 		con[country_codes[code]]['count']=0;
 	}

 	for(var stcode in usa_region_codes) {
 		st[usa_region_codes[stcode]]= {};
 		st[usa_region_codes[stcode]]['sum']= 0;
 		st[usa_region_codes[stcode]]['count']= 0;
 	}
 	var geoJson={};
 	geoJson.countries=con;
 	geoJson.states=st;

 	//heatJson.pageLoadTime={};
 	//console.log("GEO JSON",geoJson);
 	
	return geoJson;
 };

/**
* This function is used to return no.of days based on time range
*/
 var getNoOfDaysByTimeRange = function(time_range) {
 	var noOfDays=0;
 	if(time_range==SDS) {
 		noOfDays=7;
 	} else if(time_range==THDS) {
 		noOfDays=30;
 	} 
 	return noOfDays;
 };

action('createHeatMapCacheDataCollection',function(){
	console.log("Calling createHeatMapCacheDataCollection");
		//Retrieving the all domains list
	Domain.all({where:{status:true}},function(err,domains){
		if(err){
			send({ status: false, response: domains.errors });
		}else{
			if(domains.length>0){
				var i=0;
				iterateDomains();
				function iterateDomains() {
					if(i<domains.length) {
						if(domains[i].name) {
							HeatMapCacheData.findOne({where:{domainName: domains[i].name}},function(err,heatMapCacheObj){
								if(err) {
									i++;
									iterateDomains();
								} else {
									if(heatMapCacheObj) {
										heatMapCacheObj.pageLoadTime={};
										heatMapCacheObj.created_at=domains[i].created_at;
										heatMapCacheObj.updated_at=domains[i].created_at;
										heatMapCacheObj.updateAttributes(heatMapCacheObj,function(err,cache){
											if (err) {
												console.log("Unable to update the cache details");
												i++;
												iterateDomains();
											} else {
												i++;
												iterateDomains();
											}
										});
									} else {
										var heatMapCache = new HeatMapCacheData();
										heatMapCache.domainName=domains[i].name;
										heatMapCache.pageLoadTime={};
										heatMapCache.created_at=domains[i].created_at;
										heatMapCache.updated_at=domains[i].created_at;
										//console.log("server group",serverGroup);
										heatMapCache.save(function(err,res){
											if(err){
												i++;
												iterateDomains();
												//send({ status:false,response: "Cache details saved"});
											}else{
												i++;
												iterateDomains();
												//send({ status:true,response: "Server Group details added successfully"});
											}
										});
									}
								}
							});							
						} else {
							i++;
							iterateDomains();
						}
					} else {
						send({ status: true, response: "Created new collection"});
					}
				}
			} else {
				send({ status: false, response: "No domains found"});
			}
		}
	});
});

/**
* This function is used to get the heatmap data for 1 hr, 24 hr, 7d,30d
*/
action('heatMapNew',function(){
	console.log("Calling heatMapNew method");
	if(req.body.domainName){
		Domain.findOne({where:{name:req.body.domainName}},function(err,domain){
			if(err){
				send({ status: false, response:domain.errors });
			} else{
				if(domain && domain.status){
					var params={};
					params.domain_name = domain.name;
					params.time_range = req.body.time_range;

					// If the time range is 1hr or 24 hr it will enter into if loop
					if(req.body.time_range == OHR || req.body.time_range == TFHRS){
						get_heat_map_data_1_24(params,function(heatmap_res) {
							send({ status: true, response: heatmap_res});
						});
					} else {
						//To get the heatmap data for 7 days or 30 days
						//HeatMapCacheData.find({domainName: domain.name}).sort({$natural:1}).limit(1).toArray(function(err,heatObj) {

						//HeatMapCacheData.find({where:{status:true},order:'name:ASC'},function(err,domains){
						HeatMapCacheData.findOne({where:{domainName:domain.name}},function(err,heatObj){
							if(err) {
								console.log(Date() + ": heatMap() - Error while getting the heatMapObject for the domain ",domains[i].name);
							} else {
								if(heatObj) {
									if(params.time_range==SDS || params.time_range==THDS || params.time_range==RT) {
										var days = getNoOfDaysByTimeRange(params.time_range);
										
										var keys = [];
										for(var key in heatObj['pageLoadTime']) keys.push( key );
										keys.reverse();
										
										if(params.time_range==RT) {
                                                                                        days=keys.length;
                                                                                }

										var countrySumArr = {};
										var countryCountArr = {};

										var stateSumArr = {};
						                var stateCountArr = {};
						                
										for (var i=0; i<days; i++) {
											if(heatObj['pageLoadTime'] && heatObj['pageLoadTime'][keys[i]] && heatObj['pageLoadTime'][keys[i]]!=undefined) {
												var countryDict= heatObj['pageLoadTime'][keys[i]]['countries'];
												var stateDict= heatObj['pageLoadTime'][keys[i]]['states'];

												//To calculate totalSum, totalCount for day1, day2 etc by country code
												for(var code in country_codes) {
													if(countrySumArr[country_codes[code]] && countrySumArr[country_codes[code]]!=undefined) {
														countrySumArr[country_codes[code]] = countrySumArr[country_codes[code]]+ parseFloat(countryDict[country_codes[code]]['sum']);
							                            countryCountArr[country_codes[code]] = countryCountArr[country_codes[code]]+ parseFloat(countryDict[country_codes[code]]['count']);
													} else {
														countrySumArr[country_codes[code]] = parseFloat(countryDict[country_codes[code]]['sum']);
							                            countryCountArr[country_codes[code]] = parseFloat(countryDict[country_codes[code]]['count']);
													}
												}

												//To calculate totalSum, totalCount for day1, day2 etc by state code(Used For US Map)
												for(var scode in usa_region_codes) {
													if(stateSumArr[usa_region_codes[scode]] && stateSumArr[usa_region_codes[scode]]!=undefined) {
														//console.log("Multiple sub regions for US state ",stateSumArr[usa_region_codes[scode]]);
														stateSumArr[usa_region_codes[scode]] = stateSumArr[usa_region_codes[scode]]+    parseFloat(stateDict[usa_region_codes[scode]]['sum']);
						                                stateCountArr[usa_region_codes[scode]] = stateCountArr[usa_region_codes[scode]]+  parseFloat(stateDict[usa_region_codes[scode]]['count']);
													} else {
														stateSumArr[usa_region_codes[scode]] = parseFloat(stateDict[usa_region_codes[scode]]['sum']);
						                                stateCountArr[usa_region_codes[scode]] = parseFloat(stateDict[usa_region_codes[scode]]['count']);
													}
												}											
											}
										}
										var finalConArray={};
										var finalStateArray={};
										params.updated_at=heatObj.updated_at;

										// To get the heat map data from now()-24 hrs to now();
										get_heat_map_cron_data_1_24(params,function(heatmap_res) {
											// To Calculate average(totalSum/totalCount) for all the countries
											for(var code in country_codes) {
												var sum = heatmap_res['countries'][country_codes[code]]['sum']!=0?heatmap_res['countries'][country_codes[code]]['sum']:0;
												var count = heatmap_res['countries'][country_codes[code]]['count']!=0?heatmap_res['countries'][country_codes[code]]['count']:0;

												finalConArray[country_codes[code]]=(countryCountArr[country_codes[code]] && countryCountArr[country_codes[code]]!=0 && countryCountArr[country_codes[code]]!=undefined)?(countrySumArr[country_codes[code]]+sum)/(countryCountArr[country_codes[code]]+count):(count!=0)?(sum/count):0;
												if(isNaN(finalConArray[country_codes[code]])) {
													finalConArray[country_codes[code]]=0;
												}
											}

											// To Calculate average(totalSum/totalCount) for all the US States
											for(var scode in usa_region_codes) {
												var sum = heatmap_res['states'][usa_region_codes[scode]['sum']]!=0?heatmap_res['states'][usa_region_codes[scode]['sum']]:0;
												var count = heatmap_res['states'][usa_region_codes[scode]]['count']!=0?heatmap_res['states'][usa_region_codes[scode]]['count']:0;

												finalStateArray[usa_region_codes[scode]]=(stateCountArr[usa_region_codes[scode]] && stateCountArr[usa_region_codes[scode]]!=0 && stateCountArr[usa_region_codes[scode]]!=undefined)?((stateSumArr[usa_region_codes[scode]]+sum)/(stateCountArr[usa_region_codes[scode]]+count)):(count!=0)?(sum/count):0;
												//console.log(finalStateArray[usa_region_codes[scode]]);
												if(isNaN(finalStateArray[usa_region_codes[scode]])) {
													finalStateArray[usa_region_codes[scode]]=0;
												}
											}

											var heatmap_res = {};
											heatmap_res.domainName = domain.name;
											heatmap_res.countries = finalConArray;
											heatmap_res.states = finalStateArray;

											send({status:true,response:heatmap_res});
										});

									} else {
										// Need to handle Rev Start here
									}
								} else {
									//If the user accessed for 7 days or 30 days, But data doesnt exists in the db, 
									// it means that domain is created recently, then getting the last 24 hours data and returning to ui
									get_heat_map_data_1_24(params,function(heatmap_res) {
										send({ status: true, response: heatmap_res});
									});
								}
							}
						});

						// get_heat_map_data_7_30(params,function(heatmap_res) {
						// 	send({ status: true, response: heatmap_res});
						// });
					}
				} else {
					// TO handle domain not existance case
					send({status:false,response:revportal.prepare_deleted_domain_json()});
				}
			}
		});
	}else{
		send({ status: false, response: "Please sed a valid JSON"});
	}
});

/**
* This function is used to calculate the pageload time values while midnight job runs
*/
action('heatmap_cache_cron_new',function(){
	console.log("calling heatmap_cache_cron_new");
	
	var inputJson={status:true};
	
	if(req.body && req.body.domainName && req.body.domainName!="") {
		inputJson={name:req.body.domainName};
	}
	//Retrieving the all domains list
	Domain.all({where:inputJson},function(err,domains){
		if(err){
			send({ status: false, response: domains.errors });
		}else{
			if(domains.length>0){
				var i=0;
				iterateDomains();
				function iterateDomains() {

					if(i<domains.length) {
						iscacheHetaMapRunning = true;
						if(domains[i].name) {
							var params={};
							params.domain_name = domains[i].name;
							params.time_range = TFHRS;
							params.domain_name="mbeans.com";
							//params.domain_name="mbeans.com";
								HeatMapCacheData.findOne({where:{domainName:domains[i].name}},function(err,heatMapCacheObj){
									if(err) {
										i++;
										iterateDomains();
										console.log(Date() + ": heatmap_cache_cron_new() - Error while getting the heatMapObject for the domain ",domains[i].name);
									} else {
										//Code to check whether any key missed

										/**console.log("UPD DATE",heatMapObj.updated_at);
										var udate = new Date(heatMapObj.updated_at);
										console.log("YEAR",udate.getFullYear());
										console.log("MONGTH",udate.getMonth()+1);
										console.log("DAY",udate.getDate());
										var secondDate = new Date();
										secondDate.setFullYear(udate.getFullYear(), udate.getMonth(), udate.getDate());

										var curDate = new Date();
										console.log("CUR YEAR",curDate.getFullYear());
										console.log("CUR MONGTH",curDate.getMonth()+1);
										console.log("CUR DAY",curDate.getDate());
										curDate.setFullYear(curDate.getFullYear(), curDate.getMonth(), curDate.getDate());

										if(secondDate>=curDate) {
											console.log("SECOND DATE IS EQUAL > TO CUR DATE");
										} else {
											console.log("SECOND DATE IS LESS < TO CUR DATE");
										}

										var start = Math.floor( secondDate.getTime() / (3600*24*1000)); //days as integer from..
										var end   = Math.floor( curDate.getTime() / (3600*24*1000)); //days as integer from..
										var daysDiff = end - start; // exact dates
										console.log("DATe DIFF",daysDiff);

										*/
										var updatedDate = new Date();
										if(heatMapCacheObj) {
											updatedDate = new Date(heatMapCacheObj.updated_at);
										}
										var currentDate = new Date();
										console.log("CUR DATE",currentDate);
										console.log("UPD DATE DIFF",updatedDate);

										/**var start = Math.floor( udate.getTime() / (3600*24*1000)); //days as integer from..
										var end   = Math.floor( curDate.getTime() / (3600*24*1000)); //days as integer from..
										var daysDiff = end - start; // exact dates
										console.log("DATe DIFF",daysDiff);			
										*/

										var datesBetween = getDates( updatedDate, currentDate );
										if(datesBetween.length==0)
										datesBetween.length=1;

										params.datesLength = datesBetween.length;
										console.log("DAYS LEN",datesBetween.length);
										//console.log("DATES",a);										
										/**if(a.length==0) {
											params.datesLength = a.length;
											a[0] = new Date();
										} else {
											params.datesLength = a.length;
										}*/
										var j=0;
										iterateDates();

										function iterateDates() {
											if(j<datesBetween.length){
												var dt = new Date(datesBetween[j]);
												if(datesBetween[j]=="" || datesBetween[j]==undefined) {
													console.log("IN NULL BLK");
													dt=new Date();
												} 
												
												params.st=dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+(dt.getDate());

												console.log("DATES",dt.getFullYear(),"-",dt.getMonth()+1,"-",dt.getDate());
												get_heat_map_cron_data_1_24(params,function(heatmap_res) {
													//heatmap_res={"countries":"test","states":"test"};

													var dateString="";
													if(params.datesLength==0) {
														var date = new Date();
			    										var month = date.getMonth()+ 1;
			    										dateString =  date.getFullYear()+"-"+month + "-" + date.getDate();
													} else {
														dateString=dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate();
													}
													HeatMapCacheData.findOne({where:{domainName:domains[i].name}},function(err,heatMapObj){
														if(err) {
															j++;
															iterateDates();
															//i++;
															//iterateDomains();
															console.log(Date() + ": heatmap_cache_cron_new() - Error while getting the heatMapObject for the domain ",domains[i].name);
														} else {
															if(heatMapObj) {
																if(heatMapObj.pageLoadTime==undefined) {
																	heatMapObj.pageLoadTime={};
																}
																heatMapObj.pageLoadTime[dateString] = heatmap_res;	

																heatMapObj.updateAttributes(heatMapObj,function(err,updHeatObj){
																	if(err){
																		console.log(Date() + ": heatmap_cache_cron_new() - Error while updating heatMapObject for the domain ",err);
																		j++;
																		iterateDates();
																		//i++;
																		//iterateDomains();
																	}else{
																		j++;
																		iterateDates();
																		//i++;
																		//iterateDomains();
																	}
																});																					
															} else {
																var hmCacheObj = new HeatMapCacheData();
																hmCacheObj.domainName = domains[i].name;
																hmCacheObj.pageLoadTime={};
																hmCacheObj.pageLoadTime[dateString] = heatmap_res;																						

																hmCacheObj.save(function(err,res){
																	if(err){
																		console.log(Date() + ": heatmap_cache_cron_new() - Error while updating heatMapObject for the domain ",domains[i].name);
																		j++;
																		iterateDates();
																		//i++;
																		//iterateDomains();
																	}else{
																		console.log("heat map cache details added successfully");
																		//i++;
																		//iterateDomains();
																		j++;
																		iterateDates();
																	}
																});
															}
														}
													});
												});
											} else {
												i++;
												iterateDomains();
											}
										}
										
									}
								});
							//});

						} else {
							i++;
							iterateDomains();
						}
					} else {
						//For sending the mail
						console.log("send mail");
						iscacheHetaMapRunning = false;
						//sendHeatMapCacheMail();
						send({ status: true, response: "send mail"});
					}
				}
			} else {
				send({ status: false, response: "No domains found"});
			}
		}
	});
});

/**
* This function is used to return the dates between 2 date ranges
*/
function getDates( d1, d2 ){
  var oneDay = 24*3600*1000;
  for (var d=[],ms=d1*1,last=d2*1;ms<last;ms+=oneDay){
    d.push( new Date(ms) );
  }
  return d;
}

/**
 * Return the time details
 */
 var time = function(data){
	 switch(data){
	 	case OHR : return 1*60*60*1000; break;
	 	case TFHRS : return 24*60*60*1000; break;
	 	case SDS : return 7*24*60*60*1000; break;
	 	case THDS : return 30*24*60*60*1000; break;
	 	default : return 1*60*60*1000; break;
	 }
 };

/**
* This function used to get the data from midnight-midnight.
*/
var get_heat_map_cron_data_1_24 = function(params,callback){
 	console.log("Calling get_heat_map_cron_data_1_24");

	var mngoUrl ="";
	var url="";

	if(revportal.mongo.is_replica_set) {
		var host="";
		for(val in revportal.mongo.url){
          var port = (revportal.mongo.port[val]=="" || revportal.mongo.port[val]== undefined)?27017:revportal.mongo.port[val];
          if(host=="") {
            host=revportal.mongo.url[val]+":"+port;
          } else {
            host=host+","+revportal.mongo.url[val]+":"+port;
          }
        }
        url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name+"&"+revportal.mongo.connect_string;
	} else {
		var port = (revportal.mongo.port[0]=="" || revportal.mongo.port[0]== undefined)?27017:revportal.mongo.port[0];
        url=revportal.mongo.url[0]+":"+port+"/"+revportal.mongo.database;
	}

    if(revportal.mongo.is_auth_required) {
        mngoUrl = "mongodb://"+revportal.mongo.username+":"+revportal.mongo.password+"@"+url;
    } else {
		mngoUrl = "mongodb://"+url;    	
    }

    console.log("MONGO QUERY",mngoUrl);

	MongoClient.connect(mngoUrl, function(err, db) {
		if (err) {
			console.log(Date()+ " : get_heat_map_cron_data_1_24() - Error while connecting to mongo db",err);
			callback(prepare_default_cron_json_1_24(params));
		} else {
			// Fetch the collection test
	   		var collection = db.collection(revportal.mongo.event_collection);
		    if(collection) {
			  	var st="";
			  	var ed="";
			 	if(params.updated_at && params.updated_at!=undefined && params.updated_at!="") {
			 		console.log("IF LOOP");
			 		var isoStart = new Date().toISOString();
			 		var endDate =  new Date(params.updated_at);
					var isoEnd = new Date(endDate).toISOString();

		    		var st = new Date(isoEnd);
			    	var ed =new Date(isoStart); 
			 	} else {
			 		var isoStart = "";
			 		var endDate = "";
			 		var isoEnd = "";

			 		if(params.datesLength==1) {
			 			isoStart = new Date().toISOString();
			 			endDate =  (new Date().getTime()) - (time(params.time_range));
			 			isoEnd = new Date(endDate).toISOString();
			 		} else {
			 			// if jobs failed previously then it will enter into this
			 			//isoStart = new Date(params.st).toISOString();
			 			//endDate =  (new Date(isoStart).getTime()) - (time(params.time_range));

			 			isoStart = (new Date(params.st).getTime()) + (time(params.time_range));
			 			isoEnd =  new Date(params.st).toISOString();

			 			isoStart = new Date(isoStart).toISOString();
			 		}

		    		var st = new Date(isoEnd);
		    		//st.setHours(0,0,0,0);

			    	var ed =new Date(isoStart); 
					//ed.setHours(0,0,0,0);
			 	}
				console.log(Date() + ": heatmap_cache_cron_new() - Fetching data for domain ",params.domain_name, "for the date range between",st,",",ed);

				console.log("ISO ST",isoStart);
				console.log("ISO ED",isoEnd);

			    console.log("ST",st);
				console.log("ED",ed);

				//var dom = "mgo-rev-eng.revsw.net";
				var dom =params.domain_name;
				console.log("DOMAIN",dom);

			    collection.aggregate([{$match:{"d.domain":dom,"t":{$gte: st, $lte: ed}}},{$group:{ _id :{ geography : "$d.geography", region : "$d.region"},val :{ $sum : "$d.pageloadTime"},count :{ $sum : 1}}}],function(err, docs) {
					if(err) {
						db.close();
						callback(prepare_default_cron_json_1_24(params));
					} else {
						var i=0;
						var heatMapJson={};

						var countrySumArr = {};
						var countryCountArr = {};

						var stateSumArr = {};
		                var stateCountArr = {};

						var con_codes=[];
						var st_codes=[];

						console.log("DOCS",docs);

						if(docs.length==0) {
							db.close();
							callback(prepare_default_cron_json_1_24(params));
						} else {
							//To calculate totalSum, totalCount by country code
							docs.forEach(function(doc) {
								if(countrySumArr[doc._id.geography] && countrySumArr[doc._id.geography]!=undefined) {
									countrySumArr[doc._id.geography] = countrySumArr[doc._id.geography]+  parseFloat(doc.val);
		                            countryCountArr[doc._id.geography] = countryCountArr[doc._id.geography]+parseFloat(doc.count);
								} else {
									con_codes.push(doc._id.geography);
									countrySumArr[doc._id.geography] = parseFloat(doc.val);
		                            countryCountArr[doc._id.geography] = parseFloat(doc.count);
								}

								//To calculate totalSum, totalCount by state code(Used For US Map)
								if(doc._id.geography=='US')  {
									if(stateSumArr[doc._id.region] && stateSumArr[doc._id.region]!=undefined) {
										stateSumArr[doc._id.region] = stateSumArr[doc._id.region]+    parseFloat(doc.val);
		                                stateCountArr[doc._id.region] = stateCountArr[doc._id.region]+  parseFloat(doc.count);
									} else {
										st_codes.push(doc._id.region);
										stateSumArr[doc._id.region] = parseFloat(doc.val);
		                                stateCountArr[doc._id.region] = parseFloat(doc.count);
									}
								}

								i++;
								
								// If the calculation of totalSum, totalCount is completed for all the states and countries
								// Then it will enter into this loop
								if(docs.length==i) {
									var finalConArray={};
									var finalStateArrry={};

									// To build the final json,
									// If the above array does nt contain value for any country, then setting '0'.
									// If the above array contains the value, then setting that value in the final json
									for(var code in country_codes) {
										if(finalConArray[country_codes[code]]==undefined) {
											finalConArray[country_codes[code]]={};
										}
										if(con_codes.indexOf(country_codes[code]) !=-1) {
											finalConArray[country_codes[code]]["sum"]= countrySumArr[country_codes[code]];
											finalConArray[country_codes[code]]["count"]= countryCountArr[country_codes[code]];
										} else {	
											finalConArray[country_codes[code]]["sum"]= 0;
											finalConArray[country_codes[code]]["count"]= 0;
										}
									}
									
									// To build the final states json(for US),
									// If the above array does nt contain value for any country, then setting '0'.
									// If the above array contains the value, then setting that value in the final json
									for(var scode in usa_region_codes) {
										if(finalStateArrry[usa_region_codes[scode]] ==undefined
											) {
											finalStateArrry[usa_region_codes[scode]]={};	
										}
										if(st_codes.indexOf(usa_region_codes[scode]) !=-1) {
											finalStateArrry[usa_region_codes[scode]]["sum"]= stateSumArr[usa_region_codes[scode]];
											finalStateArrry[usa_region_codes[scode]]["count"]= stateCountArr[usa_region_codes[scode]];
										} else {
											finalStateArrry[usa_region_codes[scode]]["sum"]=0;
											finalStateArrry[usa_region_codes[scode]]["count"]=0;
										}
									}

									//heatJson.domainName = params.domain_name;	
									heatMapJson.countries=finalConArray;
									heatMapJson.states=finalStateArrry;

									//console.log("HEAT MAP JSON",heatJson);

									db.close(); 
									callback(heatMapJson);
									//send({status:true,response:heatJson});
								}
							});

						}
					}
				});
	 		} else {
	 			db.close();
	 			console.log(Date()+ " : get_heat_map_cron_data_1_24() - Error while getting collection object",err);
				callback(prpare_default_json_1_24(params));
			}
		}
		
	});
};

 /**var get_heat_map_cron_data_1_24 = function(params,callback){
 	console.log("Calling get_heat_map_cron_data_1_24");

	var mngoUrl ="";
	var url="";

	if(revportal.mongo.is_replica_set) {
		var host="";
		for(val in revportal.mongo.url){
          var port = (revportal.mongo.port[val]=="" || revportal.mongo.port[val]== undefined)?27017:revportal.mongo.port[val];
          if(host=="") {
            host=revportal.mongo.url[val]+":"+port;
          } else {
            host=host+","+revportal.mongo.url[val]+":"+port;
          }
        }
        url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name+"&"+revportal.mongo.connect_string;
	} else {
		var port = (revportal.mongo.port[0]=="" || revportal.mongo.port[0]== undefined)?27017:revportal.mongo.port[0];
        url=revportal.mongo.url[0]+":"+port+"/"+revportal.mongo.database;
	}

    if(revportal.mongo.is_auth_required) {
        mngoUrl = "mongodb://"+revportal.mongo.username+":"+revportal.mongo.password+"@"+url;
    } else {
		mngoUrl = "mongodb://"+url;    	
    }

    console.log("MONGO QUERY",mngoUrl);

	MongoClient.connect(mngoUrl, function(err, db) {
		console.log("In Connect Blk");
		if (err) {
			console.log(Date()+ " : get_heat_map_cron_data_1_24() - Error while connecting to mongo db",err);
			callback(prepare_default_cron_json_1_24(params));
		} else {
			console.log("In IF BLK");
			// Fetch the collection test
	   		var collection = db.collection(revportal.mongo.event_collection);
	   		console.log("AA");
		    if(collection) {
			  	var st="";
			  	var ed="";
			 	if(params.updated_at && params.updated_at!=undefined && params.updated_at!="") {
			 		console.log("IF LOOP");
			 		var isoStart = new Date().toISOString();
			 		var endDate =  new Date(params.updated_at);
					var isoEnd = new Date(endDate).toISOString();

		    		var st = new Date(isoEnd);
			    	var ed =new Date(isoStart); 
			 	} else {
			 		var isoStart = "";
			 		var endDate = "";
			 		var isoEnd = "";

			 		if(params.datesLength==1) {
			 			isoStart = new Date().toISOString();
			 			endDate =  (new Date().getTime()) - (time(params.time_range));
			 			isoEnd = new Date(endDate).toISOString();
			 		} else {
			 			// if jobs failed previously then it will enter into this
			 			//isoStart = new Date(params.st).toISOString();
			 			//endDate =  (new Date(isoStart).getTime()) - (time(params.time_range));

			 			isoStart = (new Date(params.st).getTime()) + (time(params.time_range));
			 			isoEnd =  new Date(params.st).toISOString();

			 			isoStart = new Date(isoStart).toISOString();
			 		}

		    		var st = new Date(isoEnd);
		    		//st.setHours(0,0,0,0);

			    	var ed =new Date(isoStart); 
					//ed.setHours(0,0,0,0);
			 	}
				console.log(Date() + ": heatmap_cache_cron_new() - Fetching data for domain ",params.domain_name, "for the date range between",st,",",ed);

				console.log("ISO ST",isoStart);
				console.log("ISO ED",isoEnd);

			    console.log("ST",st);
				console.log("ED",ed);

				//var dom = "mgo-rev-eng.revsw.net";
				var dom =params.domain_name;
				console.log("DOMAIN",dom);

			    collection.aggregate([{$match:{"d.domain":dom,"t":{$gte: st, $lte: ed}}},{$group:{ _id :{ geography : "$d.geography", region : "$d.region"},val :{ $sum : "$d.pageloadTime"},count :{ $sum : 1}}}],function(err, docs) {
					var i=0;
					var heatMapJson={};

					var countrySumArr = {};
					var countryCountArr = {};

					var stateSumArr = {};
	                var stateCountArr = {};

					var con_codes=[];
					var st_codes=[];

					console.log("DOCS",docs);

					if(docs.length==0) {
						callback(prepare_default_cron_json_1_24(params));
					} else {
						//To calculate totalSum, totalCount by country code
						docs.forEach(function(doc) {
							if(countrySumArr[doc._id.geography] && countrySumArr[doc._id.geography]!=undefined) {
								countrySumArr[doc._id.geography] = countrySumArr[doc._id.geography]+  parseFloat(doc.val);
	                            countryCountArr[doc._id.geography] = countryCountArr[doc._id.geography]+parseFloat(doc.count);
							} else {
								con_codes.push(doc._id.geography);
								countrySumArr[doc._id.geography] = parseFloat(doc.val);
	                            countryCountArr[doc._id.geography] = parseFloat(doc.count);
							}

							//To calculate totalSum, totalCount by state code(Used For US Map)
							if(doc._id.geography=='US')  {
								if(stateSumArr[doc._id.region] && stateSumArr[doc._id.region]!=undefined) {
									stateSumArr[doc._id.region] = stateSumArr[doc._id.region]+    parseFloat(doc.val);
	                                stateCountArr[doc._id.region] = stateCountArr[doc._id.region]+  parseFloat(doc.count);
								} else {
									st_codes.push(doc._id.region);
									stateSumArr[doc._id.region] = parseFloat(doc.val);
	                                stateCountArr[doc._id.region] = parseFloat(doc.count);
								}
							}

							i++;
							
							// If the calculation of totalSum, totalCount is completed for all the states and countries
							// Then it will enter into this loop
							if(docs.length==i) {
								var finalConArray={};
								var finalStateArrry={};

								// To build the final json,
								// If the above array does nt contain value for any country, then setting '0'.
								// If the above array contains the value, then setting that value in the final json
								for(var code in country_codes) {
									if(finalConArray[country_codes[code]]==undefined) {
										finalConArray[country_codes[code]]={};
									}
									if(con_codes.indexOf(country_codes[code]) !=-1) {
										finalConArray[country_codes[code]]["sum"]= countrySumArr[country_codes[code]];
										finalConArray[country_codes[code]]["count"]= countryCountArr[country_codes[code]];
									} else {	
										finalConArray[country_codes[code]]["sum"]= 0;
										finalConArray[country_codes[code]]["count"]= 0;
									}
								}
								
								// To build the final states json(for US),
								// If the above array does nt contain value for any country, then setting '0'.
								// If the above array contains the value, then setting that value in the final json
								for(var scode in usa_region_codes) {
									if(finalStateArrry[usa_region_codes[scode]] ==undefined
										) {
										finalStateArrry[usa_region_codes[scode]]={};	
									}
									if(st_codes.indexOf(usa_region_codes[scode]) !=-1) {
										finalStateArrry[usa_region_codes[scode]]["sum"]= stateSumArr[usa_region_codes[scode]];
										finalStateArrry[usa_region_codes[scode]]["count"]= stateCountArr[usa_region_codes[scode]];
		
									} else {
										finalStateArrry[usa_region_codes[scode]]["sum"]=0;
										finalStateArrry[usa_region_codes[scode]]["count"]=0;
									}
								}

								//heatJson.domainName = params.domain_name;	
								heatMapJson.countries=finalConArray;
								heatMapJson.states=finalStateArrry;

								//console.log("HEAT MAP JSON",heatJson);

								db.close(); 
								callback(heatMapJson);
								//send({status:true,response:heatJson});
							}
						});

					}
				});
	 		} else {
	 			console.log(Date()+ " : get_heat_map_cron_data_1_24() - Error while getting collection object",err);
				callback(prpare_default_json_1_24(params));
			}
		}
		
	});
};*/

// HEAT MAP CRON JOB NEW IMPLEMENTATION END//
