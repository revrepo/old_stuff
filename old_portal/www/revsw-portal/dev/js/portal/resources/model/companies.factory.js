(function () {
  'use strict';

  angular
    .module('revapm.Portal.Resources')
    .factory('Companies', CompaniesResource);

  /*@ngInject*/
  function CompaniesResource(Resource, $config) {

    return Resource($config.API_URL + '/accounts/:id', {id: '@id'});
  };

})();
