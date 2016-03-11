/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Haranath Gorantla>
*/

//Validations for DomainStats collection
module.exports = function (compound, DomainStats) {
	DomainStats.validatesPresenceOf("stats_url");
	DomainStats.validatesUniquenessOf("stats_url");
};