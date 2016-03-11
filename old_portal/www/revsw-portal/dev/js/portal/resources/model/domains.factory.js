(function () {
  'use strict';

  angular
    .module('revapm.Portal.Resources')
    .factory('Domains', DomainsResource);

  /*@ngInject*/
  function DomainsResource(Resource, $config) {

    return Resource($config.API_URL + '/domains/:id', {id: '@id'}, {
      details: {url: $config.API_URL + '/domains/:id/details', method: 'GET', isArray: false},
      detailsUpdate: {url: $config.API_URL + '/domains/:id/details', method: 'PUT', isArray: false}
    });
  };
})();
