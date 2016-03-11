/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Haranath Gorantla>
*/

//Validations for Domain collection
module.exports = function (compound, Domain) {
  // define Domain here
	Domain.validatesPresenceOf("cube_url","name");
	//Domain.validatesUniquenessOf("webpagetest_url","cube_url","name");
	Domain.validatesUniquenessOf("name");
	//Domain.validatesFormatOf("webpagetest_url", { "with" : /(http):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ });
	Domain.validatesFormatOf("cube_url", { "with" : /(http):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ });
	Domain.validatesLengthOf("name", { min: 2, max: 50});
	//Domain.validatesLengthOf("webpagetest_url", { min: 8, max: 30});
	Domain.validatesLengthOf("cube_url", { min: 8, max: 50});
	
	Domain.beforeUpdate = function(next){
		this.updated_at = new Date().toISOString();
		next();
	};
};
