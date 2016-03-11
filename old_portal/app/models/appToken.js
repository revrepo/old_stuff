/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Venugopal Parala>
*/

//Validations for AppToken collection
module.exports = function (compound, AppToken) {
	AppToken.validatesPresenceOf("appName");
	AppToken.validatesPresenceOf("token");
};
