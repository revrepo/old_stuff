module.exports = function (compound, Company) {
	Company.validatesPresenceOf("companyName");
	Company.validatesUniquenessOf("companyName");
	Company.validatesLengthOf("companyName", { min: 3, max: 50});
	Company.beforeUpdate = function(next){
		this.updated_at = new Date().toISOString();
		next();
	};
};