(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .directive('filterTimePeriods', filterTimePeriods);

  /*@ngInject*/
  function filterTimePeriods() {

    return {
      restrict: 'AE',
      templateUrl: 'parts/reports/filters/time-period.html',
      scope: {
        ngFilters: '=',
        onFilter: '&',
        flCountry: '=',
        flOs: '=',
        flDevice: '='
      },
      /*@ngInject*/
      controller: function ($scope) {
        $scope.delay = '1';
        $scope.updateFilters = function () {
          if (!$scope.ngFilters) {
            $scope.ngFilters = {};
          }
          $scope.ngFilters.from_timestamp = moment(Date.now()).subtract(parseInt($scope.delay), 'days').valueOf();
          $scope.ngFilters.to_timestamp = Date.now();

          $scope.onFilter();
        }
      }
    }
  }
})();
