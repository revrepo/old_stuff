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
module.exports = function (compound, MasterConfiguration) {
	MasterConfiguration.validatesPresenceOf("domainName");
	MasterConfiguration.validatesPresenceOf("configurationJson");
	MasterConfiguration.validatesUniquenessOf("domainName");
};