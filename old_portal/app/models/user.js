/*
* Copyright (c) 2014, Rev Software, Inc.
* All Rights Reserved.
*
* This code is confidential and proprietary to Rev Software, Inc
* and may only be used under a license from Rev Software Inc.
*
* Author: <Haranath Gorantla>
*/

//Validations for user collection
module.exports = function (compound, User) {
	User.validatesPresenceOf("firstname","lastname","email","password");
	User.validatesUniquenessOf("email");
	User.validatesFormatOf("email", { "with" : /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i });
	User.validatesLengthOf("firstname", { min: 3, max: 20});
	User.validatesLengthOf("lastname", { min: 3, max: 20});
	User.validatesLengthOf("email", { min: 8, max: 45});
	//User.validatesLengthOf("username", { min: 3, max: 20});
	User.validatesLengthOf("password", { min: 8, max: 40, allowNull: false });
	
	User.beforeUpdate = function(next){
		this.updated_at = new Date().toISOString();
		next();
	};
};