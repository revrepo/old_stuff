(function () {
  'use strict';

  angular
    .module('revapm.Portal.Keys')
    .config(routesConfig);

  /*@ngInject*/
  function routesConfig($stateProvider) {
    $stateProvider
      .state('index.accountSettings.keys', {
        url: '/keys/list',
        views: {
          main: {
            controller: 'KeysListController',
            templateUrl: 'parts/keys/list.html'
          }
        }
      });
  }
})();
