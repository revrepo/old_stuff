/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Haranath Gorantla>
*/

//Validations for Configure collection
module.exports = function (compound, DomainLastUpdated) {
	DomainLastUpdated.validatesPresenceOf("email");
	DomainLastUpdated.validatesPresenceOf("domainName");
	//DomainLastUpdated.validatesUniquenessOf("email","domainName");

	DomainLastUpdated.beforeUpdate = function(next){
		this.updated_at = new Date().toISOString();
		next();
	};
};
