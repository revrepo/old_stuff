(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .directive('requestsChart', requestsChartDirective);

  /*@ngInject*/
  function requestsChartDirective() {

    return {
      restrict: 'AE',
      templateUrl: 'parts/reports/charts/requests.html',
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

        $scope.chartOptions = {
          yAxis: {
            title: {
              text: 'Bandwidth'
            },
            labels: {
              formatter: function() {
                return Util.convertTraffic(this.value);
              }
            }
          },
          tooltip: {
            formatter: function() {
              return '<b>'+ this.x +'</b><br/>'+
                this.series.name + ': ' + Util.convertTraffic(this.y);
            }
          }
        };

        $scope.traffic = {
          labels: [],
          series: [{
            name: 'Incoming bandwidth',
            data: []
          }, {
            name: 'Outgoing bandwidth',
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
              name: 'Incoming bandwidth',
              data: []
            }, {
              name: 'Outgoing bandwidth',
              data: []
            }]
          };

          Stats.traffic(angular.merge({domainId: $scope.ngDomain.id}, $scope.filters))
            .$promise
            .then(function (data) {
              if (data.data && data.data.length > 0) {
                var series = [{
                  name: 'Incoming bandwidth',
                  data: []
                }, {
                  name: 'Outgoing bandwidth',
                  data: []
                }];
                var labels = [];
                $scope.delay = data.metadata.interval_sec || 1800;
                angular.forEach(data.data, function (data) {
                  labels.push(moment(data.time).format('MMM Do YY h:mm'));
                  //$scope.traffic.labels.push(data.time);
                  series[0].data.push(Util.toBps(data.received_bytes, $scope.delay, true));
                  series[1].data.push(Util.toBps(data.sent_bytes, $scope.delay, true));
                });
                // model better to update once
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
