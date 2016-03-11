(function () {
  'use strict';

  angular
    .module('revapm.Portal.Domains')
    .config(routesConfig);

  /*@ngInject*/
  function routesConfig($stateProvider) {
    $stateProvider
      .state('index.webApp.domainConfig', {
        url: '/domain/configure',
        views: {
          main: {
            controller: 'DomainsConfigureController',
            templateUrl: 'parts/domains/configure.html'
          }
        }
      })
      .state('index.webApp.domains', {
        url: '/domains',
        views: {
          main: {
            controller: 'DomainsCrudController',
            templateUrl: 'parts/domains/list.html'
          }
        }
      })
      .state('index.webApp.domains.advanced', {
        url: '/configure/:id',
        views: {
          page: {
            controller: 'DomainsConfigureAdvancedController',
            templateUrl: 'parts/domains/configure_advanced.html'
          }
        }
      })
      .state('index.webApp.domains.new', {
        url: '/new',
        views: {
          page: {
            templateUrl: 'parts/domains/new.html'
            //controller: 'DomainsNewController'
          }
        }
      })
      .state('index.webApp.domains.edit', {
        url: '/edit/:id',
        views: {
          page: {
            templateUrl: 'parts/domains/edit.html',
            controller: 'DomainsCrudController'
          }
        }
      })
      .state('index.webApp._domains', {
        url: '/_domains',
        views: {
          main: {
            controller: '_DomainsCrudController',
            templateUrl: 'parts/domains/_list.html'
          }
        }
      })
      .state('index.webApp._domains.advanced', {
        url: '/configure/:id',
        views: {
          page: {
            controller: '_DomainsConfigureAdvancedController',
            templateUrl: 'parts/domains/_configure_advanced.html'
          }
        }
      })
      .state('index.webApp._domains.new', {
        url: '/new',
        views: {
          page: {
            templateUrl: 'parts/domains/_new.html'
            //controller: 'DomainsNewController'
          }
        }
      })
      .state('index.webApp._domains.edit', {
        url: '/edit/:id',
        views: {
          page: {
            templateUrl: 'parts/domains/_edit.html',
            controller: '_DomainsCrudController'
          }
        }
      });
  }
})();
