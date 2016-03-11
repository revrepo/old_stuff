(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .directive('httpHttpsChart', httpHttpsChartDirective);

  /*@ngInject*/
  function httpHttpsChartDirective() {

    return {
      restrict: 'AE',
      templateUrl: 'parts/reports/charts/http-https.html',
      scope: {
        ngDomain: '=',
        flCountry: '=',
        flOs: '=',
        flDevice: '='
      },
      /*@ngInject*/
      controller: function ($scope, Stats, $q, Util) {
        $scope._loading = false;
        $scope.delay = 1800;
        $scope.filters = {
          from_timestamp: moment().subtract(1, 'days').valueOf(),
          to_timestamp: Date.now()
        };

        $scope.traffic = {
          labels: [],
          series: [{
            name: 'HTTP',
            data: []
          }, {
            name: 'HTTPS',
            data: []
          }]
        };

        $scope.loadHttp = function() {
          return Stats.traffic(angular.merge({domainId: $scope.ngDomain.id}, $scope.filters, {
            protocol: 'HTTP'
          })).$promise;
        };

        $scope.loadHttps = function() {
          return Stats.traffic(angular.merge({domainId: $scope.ngDomain.id}, $scope.filters, {
            protocol: 'HTTPS'
          })).$promise;
        };

        $scope.reload = function () {
          if (!$scope.ngDomain || !$scope.ngDomain.id) {
            return;
          }
          $scope._loading = true;
          $scope.traffic = {
            labels: [],
            series: [{
              name: 'HTTP',
              data: []
            }, {
              name: 'HTTPS',
              data: []
            }]
          };
          $q.all([
              $scope.loadHttp(),
              $scope.loadHttps()
            ])
            .then(function (data) {
              $scope.delay = data[0].metadata.interval_sec || 1800;
              var labels = [];
              var series = [{
                name: 'HTTP',
                data: []
              }, {
                name: 'HTTPS',
                data: []
              }];
              if (data[0].data && data[0].data.length > 0) {
                angular.forEach(data[0].data, function (data) {
                  labels.push(moment(data.time).format('MMM Do YY h:mm'));
                  //$scope.traffic.labels.push(data.time);
                  series[0].data.push(Util.toRPS(data.requests, $scope.delay, true));
                });
              }
              if (data[1].data && data[1].data.length > 0) {
                angular.forEach(data[1].data, function (data) {
                  //$scope.traffic.labels.push(moment(data.time).format('MMM Do YY h:mm'));
                  //$scope.traffic.labels.push(data.time);
                  series[1].data.push(Util.toRPS(data.requests, $scope.delay, true));
                });
              }
              // model better to update once
              $scope.traffic = {
                labels: labels,
                series: series
              };
            })
            .finally(function () {
              $scope._loading = false;
            });
        };

        $scope.$watch('ngDomain', function () {
          if (!$scope.ngDomain) {
            return;
          }
          $scope.reload();
        });
      }
    };
  }
})();
