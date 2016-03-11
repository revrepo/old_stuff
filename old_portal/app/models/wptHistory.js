//Validations for wpt history collection
module.exports = function (compound, UserMenuOrder) {
	UserMenuOrder.validatesPresenceOf("domainName");
	UserMenuOrder.validatesPresenceOf("test_url");
	UserMenuOrder.validatesPresenceOf("test_id");
	UserMenuOrder.validatesUniquenessOf("test_id");

	UserMenuOrder.beforeUpdate = function(next){
		this.updated_at = new Date().toISOString();
		next();
	};
};