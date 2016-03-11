load('application');

//Loading the required modules
var log= require("co-logger");
var config = require('././config/config');
var revportal = require("revportal");

//for loading mongo client
var MongoClient = require('mongodb').MongoClient;

action('thirdparty_domains',function(){ 
	//console.log("calling thirdparty_domains");
	if(req.body && req.body.domainName != undefined && req.body.domainName !=""){
		//console.log("req.body.domainName",req.body.domainName);
		var mngoUrl ="";
		var url="";
		if(revportal.mongo.full_connection_string && revportal.mongo.full_connection_string !="" && revportal.mongo.full_connection_string !=undefined) {
	    	mngoUrl=revportal.mongo.full_connection_string;
		} else {
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
		    	url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name;

		    	if(revportal.mongo.aditional_params && revportal.mongo.aditional_params!="")
		        url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name+"&"+revportal.mongo.aditional_params;
			} else {
				var port = (revportal.mongo.port[0]=="" || revportal.mongo.port[0]== undefined)?27017:revportal.mongo.port[0];
		        	url=revportal.mongo.url[0]+":"+port+"/"+revportal.mongo.database;
			}

			if(revportal.mongo.is_auth_required) {
		    	mngoUrl = "mongodb://"+revportal.mongo.username+":"+revportal.mongo.password+"@"+url;
			} else {
				mngoUrl = "mongodb://"+url;    	
			}
		}
		//console.log("Mongo URL",mngoUrl);

		//connect away
		MongoClient.connect(mngoUrl, function(err, db) {
			if (err) {
				//console.log("thirdpartyreport->thirdparty_domains() error while connecting to mongo db");
				send({ status:false, response :"Due to internal error, Unable to get the data"});
			} else {
				// Fetch the collection test
			    var collection = db.collection(revportal.mongo.event_collection);

			    if(collection) {
			    	//db.pl_info_events.find({"d.domain":"suvarna-rum-test.com"}).sort({$natural:-1}).limit(1).pretty()
			    	collection.find({"d.domain": req.body.domainName,"d.rt":1}).sort({$natural:-1}).limit(1).toArray(function(err,thirdPartyDet) {
			    		if(err){
							//console.log("thirdpartyreport->thirdparty_domains() error while getting data from event collection");
			    			send({ status:false, response :"Due to internal error, Unable to get the data"});
			    		} else{
			    			if(thirdPartyDet.length>0) {
			    				thirdPartyDet=thirdPartyDet[0];
			    				//console.log("THIRD PARTY",thirdPartyDet);
			    				//console.log("THIRD PARTY",thirdPartyDet.d.third_party);
			    				var third_party_json={};
			    				var third_party_array=[];
			    				if(thirdPartyDet.d && thirdPartyDet.d.third_party) {
			    					for(var i=0;i<thirdPartyDet.d.third_party.length;i++) {
				    					var tp = thirdPartyDet.d.third_party[i];
				    					var tp_json={};
				    					tp_json.domain=tp.d;
				    					tp_json.avg=tp.avg;
				    					tp_json.count=tp.count;

				    					third_party_array.push(tp_json);
				    				}
				    				third_party_json.res3pDuration=thirdPartyDet.d.res3pDuration;
			    					third_party_json.resources=third_party_array;
									send({ status:true, response : third_party_json});
			    				} else {
			    					send({ status:false, response :"No results found"});
			    				}
			    			} else {
								//console.log("thirdpartyreport->thirdparty_domains() no data found");
			    				send({ status:false, response :"No results found"});
			    			}
			    		}
			    	});
			    } else {
					//console.log("thirdpartyreport->thirdparty_domains() no collection found");
					send({ status:false, response :"Due to internal error, Unable to get the data"});
			    }
			}			
		});
	}else{
		send({ status:false, response : "Please send valid params" });
	}
});

action('origin_stats',function(){ 
	//console.log("calling origin_stats");
	if(req.body && req.body.domainName != undefined && req.body.domainName !=""){
		//console.log("req.body.domainName",req.body.domainName);
		var mngoUrl ="";
		var url="";
		if(revportal.mongo.full_connection_string && revportal.mongo.full_connection_string !="" && revportal.mongo.full_connection_string !=undefined) {
	    	mngoUrl=revportal.mongo.full_connection_string;
		} else {
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
		    	url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name;

		    	if(revportal.mongo.aditional_params && revportal.mongo.aditional_params!="")
		        url = host+"/"+revportal.mongo.database+"?replicaSet="+revportal.mongo.replica_set_name+"&"+revportal.mongo.aditional_params;
			} else {
				var port = (revportal.mongo.port[0]=="" || revportal.mongo.port[0]== undefined)?27017:revportal.mongo.port[0];
		        	url=revportal.mongo.url[0]+":"+port+"/"+revportal.mongo.database;
			}

			if(revportal.mongo.is_auth_required) {
		    	mngoUrl = "mongodb://"+revportal.mongo.username+":"+revportal.mongo.password+"@"+url;
			} else {
				mngoUrl = "mongodb://"+url;    	
			}
		}
		//console.log("Mongo URL",mngoUrl);

		//connect away
		MongoClient.connect(mngoUrl, function(err, db) {
			if (err) {
				//console.log("thirdpartyreport->origin_stats() error while connecting to mongo db");
				send({ status:false, response :"Due to internal error, Unable to get the data"});
			} else {
				// Fetch the collection test
			    var collection = db.collection(revportal.mongo.event_collection);

			    if(collection) {
			    	//db.pl_info_events.find({"d.domain":"suvarna-rum-test.com"}).sort({$natural:-1}).limit(1).pretty()
			    	collection.find({"d.domain": req.body.domainName,"d.rt":1}).sort({$natural:-1}).limit(1).toArray(function(err,originStatsDet) {
			    		if(err){
							console.log("thirdpartyreport->origin_stats() error while getting data from event collection");
			    		} else{
			    			if(originStatsDet.length>0) {
			    				originStatsDet=originStatsDet[0];
			    				var origin_stats_json={};
			    				if(originStatsDet.d && originStatsDet.d) {
			    					var origin_stats_arr = [];
			    					var totalTime=(originStatsDet.d.pageloadTime && originStatsDet.d.pageloadTime!=null)?originStatsDet.d.pageloadTime:0;

				    				var totalTime = originStatsDet.d.pageloadTime;
				    				var rnt_obj = {};
				    				rnt_obj.label = "Network Time (root object)";
				    				rnt_obj.value = (originStatsDet.d.networkTime && originStatsDet.d.networkTime) ?originStatsDet.d.networkTime:0;
				    				if(rnt_obj.value!=0){
				    					origin_stats_arr.push(rnt_obj);
				    				}
				    				
				    				var rsnt_obj = {};
				    				rsnt_obj.label = "Network Time (resources)";
				    				rsnt_obj.value = (originStatsDet.d.resOrgNwTime && originStatsDet.d.resOrgNwTime!=null)?originStatsDet.d.resOrgNwTime:0;
				    				if(rsnt_obj.value!=0){
				    					origin_stats_arr.push(rsnt_obj);
				    				}

				    				var bnt_obj = {};
				    				bnt_obj.label = "Backend Time";
				    				bnt_obj.value = (originStatsDet.d.backendTime && originStatsDet.d.backendTime!=null)?originStatsDet.d.backendTime:0;
				    				if(bnt_obj.value!=0){
				    					origin_stats_arr.push(bnt_obj);
				    				}

				    				/**var brt_obj = {};
				    				brt_obj.label = "Browser Time";
				    				brt_obj.value = totalTime-(rnt_obj.value+rsnt_obj.value+bnt_obj.value);
				    				if(brt_obj.value!=0){
				    					origin_stats_arr.push(brt_obj);
				    				}
				    				*/
				    				
				    				/*origin_stats_json.rootNetworkTime = (originStatsDet.d.networkTime && originStatsDet.d.networkTime) ?originStatsDet.d.networkTime:0;
				    				origin_stats_json.originResNetworkTime = (originStatsDet.d.resOrgNwTime && originStatsDet.d.resOrgNwTime!=null)?originStatsDet.d.resOrgNwTime:0;
				    				origin_stats_json.backendTime = (originStatsDet.d.backendTime && originStatsDet.d.backendTime!=null)?originStatsDet.d.backendTime:0;
				    				origin_stats_json.browserTime = totalTime-(origin_stats_json.rootNetworkTime+origin_stats_json.originResNetworkTime+origin_stats_json.backendTime);*/
				    				if(origin_stats_arr.length >= 1){
				    					send({ status:true, response : origin_stats_arr});
				    				}else{
				    					send({ status:false, response : "No results found"});
				    				}
								} else {
									//console.log("thirdpartyreport->origin_stats() no data found");
			    					send({ status:false, response :"No results found"});
								}
			    			} else {
								//console.log("thirdpartyreport->origin_stats() no data found");
			    				send({ status:false, response :"No results found"});
			    			}
			    		}
			    	});
			    } else {
					//console.log("thirdpartyreport->origin_stats() no collection found");
					send({ status:false, response :"Due to internal error, Unable to get the data"});
			    }
			}			
		});
	} else{
		send({ status:false, response : "Please send valid params" });
	}
});
