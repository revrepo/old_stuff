(function () {
  'use strict';

  angular
    .module('revapm.Portal')
    .config(routesConfig);

  /*@ngInject*/
  function routesConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/users');

    $stateProvider
      // Base 3 layout
      .state('index', {
        url: '',
        views: {
          layout: {
            templateUrl: 'parts/layout.html',
            /*@ngInject*/
            controller: function($scope, $state, User) {
              $scope.userService = User;
              if (!User.isAuthed() && $state.current.name != 'index.restore') {
                $state.go('login');
              } else if($state.current.name == 'index') {
                $state.go('index.reports.proxy');
              }
            }
          }
        }
      })
      .state('index.webApp', {
        url: '',
        views: {
          menu: {
            controller: function ($scope, $state) {
              $scope.account = '';
              $scope.webapp = '';
              $scope.reports = '';
              $scope.help = '';
              if ($state.includes('index.webApp')) {
                $scope.webapp = 'active';
              }
            },
            templateUrl: 'parts/cadmin-top-menu.html'
          },
          sideMenu: {
            templateUrl: 'parts/menu/domains-side.html'
          },
          page: {
            controller: function () {},
            templateUrl: 'parts/layout/page.html',
          }
        }
      })
      .state('index.accountSettings', {
        url: '',
        views: {
          menu: {
            controller: function ($scope, $state) {
              $scope.account = '';
              $scope.webapp = '';
              $scope.reports = '';
              $scope.help = '';
              if($state.includes('index.accountSettings')){
                $scope.account = 'active';
              }
            },
            templateUrl: 'parts/cadmin-top-menu.html'
          },
          sideMenu: {
            templateUrl: 'parts/menu/accounts-side.html'
          },
          page: {
            controller: function () {},
            templateUrl: 'parts/layout/page.html'
          }
        }
      })
      .state('index.reports', {
        url: '',
        views: {
          menu: {
            controller: function ($scope, $state) {
              $scope.account = '';
              $scope.webapp = '';
              $scope.reports = '';
              $scope.help = '';
              if($state.includes('index.reports')){
                $scope.reports = 'active';
              }
            },
            templateUrl: 'parts/cadmin-top-menu.html'
          },
          sideMenu: {
            templateUrl: 'parts/menu/analitycs-side.html'
          },
          page: {
            controller: function () {},
            templateUrl: 'parts/layout/page.html'
          }
        }
      })
      .state('index.help', {
        url: '/help',
        views: {
          menu: {
            controller: function ($scope, $state) {
              $scope.account = '';
              $scope.webapp = '';
              $scope.reports = '';
              $scope.help = '';
              if($state.includes('index.help')){
                $scope.help = 'active';
              }
            },
            templateUrl: 'parts/cadmin-top-menu.html'
          },
          sideMenu: {
            templateUrl: 'parts/menu/help-side.html'
          },
          page: {
            controller: function () {},
            templateUrl: 'parts/help/contactus.html'
          }
        }
      });
  };
})();
