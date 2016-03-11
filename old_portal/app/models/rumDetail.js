/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Latheef Shaik>
*/

//Validations for Sync Failed collection
module.exports = function (compound, RumDetail) {
	RumDetail.validatesPresenceOf("rum_url");
	RumDetail.validatesPresenceOf("evalutor_url");

	RumDetail.beforeUpdate = function(next){
		this.updated_at = new Date().toISOString();
		next();
	};
};
