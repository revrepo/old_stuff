(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .directive('httpStatusCodeChart', httpStatusCodeChartDirective);

  /*@ngInject*/
  function httpStatusCodeChartDirective() {

    return {
      restrict: 'AE',
      templateUrl: 'parts/reports/charts/http-status-code.html',
      scope: {
        ngDomain: '=',
        statusCodes: '=',
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
          series: []
        };

        $scope.reload = function () {
          if (!$scope.ngDomain || !$scope.ngDomain.id || !$scope.statusCodes || !$scope.statusCodes.length) {
            return;
          }
          $scope.traffic = {
            labels: [],
            series: []
          };
          var promises = {};
          var series = [];
          var labels = [];
          $scope.statusCodes.forEach(function (code) {
            if (!code) {
              return;
            }
            promises[code] = Stats.traffic(angular.merge({domainId: $scope.ngDomain.id}, $scope.filters, {
              status_code: code
            })).$promise;
          });
          $scope._loading = true;
          var timeSet = false;
          $q.all(promises)
            .then(function (data) {
              labels = [];
              $scope.delay = 1800;
              angular.forEach(data, function (val, idx) {
                var results = [];
                if (data[idx].metadata.interval_sec) {
                  $scope.delay = data[idx].metadata.interval_sec;
                }
                if (data[idx].data && data[idx].data.length > 0) {
                  angular.forEach(data[idx].data, function (res) {
                    if (!timeSet) {
                      labels.push(moment(res.time).format('MMM Do YY h:mm'));
                    }
                    //$scope.traffic.labels.push(data.time);
                    results.push(Util.toRPS(res.requests, $scope.delay, true));
                    //series[idx].data.push(res.requests);
                  });
                  timeSet = true;

                }
                series.push({
                  name: idx,
                  data: results
                });
              });
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
          $scope.reload();
        });
        $scope.$watch('statusCodes', function () {
          $scope.reload();
        });
      }
    };
  }
})();
