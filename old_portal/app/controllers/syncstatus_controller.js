/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Venugopal Parala>
*/

/**
 * Added  the services for checking the i/p request.
 */
load('application');
before(use('validateRequest'),{only:[]});

//Loading the required modules
var log= require("co-logger");
var WebSocket = require('ws');
var WebSocketClient = require('websocket').client;

var dns = require('dns');

var revportal = require("revportal");
var tokens = revportal.tokenArr;
 
function uniqueArr(a) {
    return a.sort().filter(function(item, pos) {
        return !pos || item != a[pos - 1];
    })
}
 

/**
 *  Create a check script to report the update status of registered proxy servers
 */
action("sync_failed_job",function(){
	//console.log('reqBody::::::',req.body);
	//console.log('Query:::::::',req.query)
	if(req.query && req.query.appName && req.query.token && req.query.appName != "" && req.query.token !=""){

		AppToken.findOne({where:{appName:req.query.appName,token:req.query.token}},function(err,tokenObj){
			if (err) {
						console.log("Unable to find token");
						callback(false);
			} else {
				//console.log("tokenObj::::::::::",tokenObj)
				if(tokenObj){
					//console.log("valid token");	
					var syncFaildObj = [];
					Domain.all({where:{status:true}},function(err,domains){
						if(err){
							send({ status: false, response: domains.errors });
						}else{
							var domainNames = [];
							if(domains.length > 0){
								for(var i=0; i<domains.length; i++){
									domainNames.push(domains[i].name);
									
								}
								
								var i=0;
								getIpList();
								function getIpList() {
									if(i<domainNames.length){
										if(domainNames[i]){
											SyncFailed.all({where:{domainName:domainNames[i]}},function(err,syncFailObj){
												if(err){
													console.log("error in get sync fail data")
													i++;
													getIpList();
												}else{
													//JSON.stringify(syncFailObj);
													//console.log('syncFailObj',JSON.stringify(syncFailObj));
													var obj = {};
													//console.log('dn:::',domainNames[i]);
													//console.log('syncFailObj len ::::',syncFailObj.length);
													if(syncFailObj.length > 0){
														var ipArr = []
														for(var j=0; j<syncFailObj.length; j++){
															ipArr.push(syncFailObj[j].ip);
														}

														obj.domainName = domainNames[i];
														ipArr = uniqueArr(ipArr);
														obj.ip = ipArr;
														syncFaildObj.push(obj);
														
													}
													i++;
													getIpList();
				 								}
											});
										}	
									}else{
										//console.log('syncFaildObj::::',JSON.stringify(syncFaildObj));
										send({ status: true, response: syncFaildObj});
									}
								}

								 
							} 
						}
					});
				}else{
					//console.log("invalid token");
					send({status: true, response: "invalid token", errorCode: 1});
				}
			}
		});
	}else{
		send({status: true, response: "invalid app details", errorCode: 1});
	}
});

action('setAppToken', function() {
	//console.log("set APP TOKEN");
	 /**var tokenArr = [
	 				 {'name':'portal-qa.revsw.net','token':'12345678'},
					 {'name':'portal-internal.revsw.net','token':'12345678'},
					 {'name':'portal.revsw.net','token':'12345678'},
					 {'name':'portal.dev.revsw.net','token':'12345678'}
					 ];*/
	var tokenArr = tokens;
	 var i = 0;
	 setToken();
	 function setToken(){
	 	if(i<tokenArr.length){
			 var appToken = new AppToken();
			 appToken.appName = tokenArr[i].name;
			 appToken.token = tokenArr[i].token;
			 appToken.save(function(err, tokenObj) {
		        if (err) {
		            console.log("Unable to save app token");
		            i++;
		            setToken();
		             
		        } else {
		            console.log("app token saved successfully");
		            i++;
		            setToken();
		        }
		    });
	 	}else{
	 		console.log("app tokens set completed")
	 	}
	 };
});
