(function () {
  'use strict';

  angular
    .module('revapm.Portal.Domains')
    .config(ReportsRoutes);

  /*@ngInject*/
  function ReportsRoutes($stateProvider) {
    $stateProvider
      .state('index.reports.proxy', {
        url: '/reports/proxy',
        views: {
          main: {
            controller: 'ReportsProxyTrafficController',
            templateUrl: 'parts/reports/proxy.html'
          }
        }
      })
      .state('index.reports.topreports', {
        url: '/reports/topreports',
        views: {
          main: {
            controller: 'TopReportsTrafficController',
            templateUrl: 'parts/reports/top-reports.html'
          }
        }
      })
      .state('index.reports.top', {
        url: '/reports/top',
        views: {
          main: {
            controller: 'TopObjectsController',
            templateUrl: 'parts/reports/top.html'
          }
        }
      })
      .state('index.reports.heatmaps', {
        url: '/reports/heatmaps',
        views: {
          main: {
            controller: 'TrafficHeatmapsController',
            templateUrl: 'parts/reports/heatmaps.html'
          }
        }
      })
      .state('index.reports.lm_rtt_heatmaps', {
        url: '/reports/lm_rtt_heatmaps',
        views: {
          main: {
            controller: 'LMRTTHeatmapsController',
            templateUrl: 'parts/reports/lm-rtt-heatmaps.html'
          }
        }
      });
  }
})();
