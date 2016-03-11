(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .directive('proxyTrafficChart', proxyTrafficChartDirective);

  /*@ngInject*/
  function proxyTrafficChartDirective() {

    return {
      restrict: 'AE',
      templateUrl: 'parts/reports/charts/proxy-traffic.html',
      scope: {
        ngDomain: '=',
        flCountry: '=',
        flOs: '=',
        flDevice: '='
      },
      /*@ngInject*/
      controller: function ($scope, Stats, Util) {

        $scope.delay = 1800;

        $scope._loading = false;
        $scope.filters = {
          from_timestamp: moment().subtract(1, 'days').valueOf(),
          to_timestamp: Date.now()
        };

        $scope.traffic = {
          labels: [],
          series: [{
            name: 'Total',
            data: []
          }]
        };

        $scope.reloadTrafficStats = function () {
          if (!$scope.ngDomain || !$scope.ngDomain.id) {
            return;
          }
          $scope._loading = true;
          $scope.traffic = {
            labels: [],
            series: [{
              name: 'Total',
              data: []
            }]
          };
          Stats.traffic(angular.merge({domainId: $scope.ngDomain.id}, $scope.filters))
            .$promise
            .then(function (data) {
              if (data.data && data.data.length > 0) {
                $scope.delay = data.metadata.interval_sec || 1800;
                var series = [{
                  name: 'Total',
                  data: []
                }];
                var labels = [];
                angular.forEach(data.data, function (data) {
                  labels.push(moment(data.time).format('MMM Do YY h:mm'));
                  //$scope.traffic.labels.push(data.time);
                  series[0].data.push(Util.toRPS(data.requests, $scope.delay, true));
                });
                $scope.traffic = {
                  labels: labels,
                  series: series
                };
              }
            })
            .finally(function () {
              $scope._loading = false;
            });
        };

        $scope.$watch('ngDomain', function () {
          if (!$scope.ngDomain) {
            return;
          }
          $scope.reloadTrafficStats();
        });
      }
    };
  }
})();
