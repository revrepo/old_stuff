(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .directive('requestStatusChart', requestStatusChartDirective);

  /*@ngInject*/
  function requestStatusChartDirective() {

    return {
      restrict: 'AE',
      templateUrl: 'parts/reports/charts/request-status.html',
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
            name: 'Successful',
            data: []
          }, {
            name: 'Failed',
            data: []
          }]
        };

        $scope.loadOk = function() {
          return Stats.traffic(angular.merge({domainId: $scope.ngDomain.id}, $scope.filters, {
            request_status: 'OK'
          })).$promise;
        };

        $scope.loadError = function() {
          return Stats.traffic(angular.merge({domainId: $scope.ngDomain.id}, $scope.filters, {
            request_status: 'ERROR'
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
              name: 'Successful',
              data: []
            }, {
              name: 'Failed',
              data: []
            }]
          };

          $q.all([
              $scope.loadOk(),
              $scope.loadError()
            ])
            .then(function (data) {
              $scope.delay = data[0].metadata.interval_sec || 1800;
              var labels = [];
              var series = [{
                name: 'Successful',
                data: []
              }, {
                name: 'Failed',
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
