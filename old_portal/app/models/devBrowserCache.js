/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Latheef Shaik>
*/

//Validations for Configure collection
module.exports = function (compound, DevBrowserCache) {
	DevBrowserCache.validatesPresenceOf("domainName");
	DevBrowserCache.validatesPresenceOf("devBrowserJson");

	//DomainLastUpdated.validatesUniquenessOf("email","domainName");

	DevBrowserCache.beforeUpdate = function(next){
		this.updated_at = new Date().toISOString();
		next();
	};
};
