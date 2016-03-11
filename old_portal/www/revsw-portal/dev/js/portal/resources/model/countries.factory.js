(function () {
  'use strict';

  angular
    .module('revapm.Portal.Resources')
    .factory('Countries', CountriesResource);

  /*@ngInject*/
  function CountriesResource(Resource, $config) {

    return Resource($config.API_URL + '/countries/list', {}, {
      query: {isArray: false}
    });

  }
})();
