(function () {
  'use strict';

  angular
    .module('revapm.Portal.Profile')
    .config(routesConfig);

  /*@ngInject*/
  function routesConfig($stateProvider) {
    $stateProvider
      .state('index.accountSettings.profile', {
        url: '/profile',
        views: {
          main: {
            controller: 'ProfileEditController',
            templateUrl: 'parts/profile/edit.html'
          }
        }
      })
      .state('index.accountSettings.activitylog', {
        url: '/activitylog',
        views: {
          main: {
            controller: 'ActivityLogController',
            templateUrl: 'parts/profile/activity-log.html'
          }
        }
      })
      .state('index.accountSettings.2fa', {
        url: '/2fa',
        views: {
          main: {
            controller: 'TwoFactorAuthController',
            templateUrl: 'parts/profile/two-factor-auth.html'
          }
        }
      });
  };
})();
