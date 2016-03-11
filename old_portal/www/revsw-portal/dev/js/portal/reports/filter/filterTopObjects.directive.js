(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .directive('filterTopObjects', filterTopObjects);

  /*@ngInject*/
  function filterTopObjects() {

    return {
      restrict: 'AE',
      templateUrl: 'parts/reports/filters/top-objects-filter.html',
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
        if (!$scope.ngFilters) {
          $scope.ngFilters = {};
        }
        $scope.ngFilters.count = '20';


        $scope.updateFilters = function () {

          $scope.ngFilters.from_timestamp = moment(Date.now()).subtract(parseInt($scope.delay), 'hours').valueOf();
          $scope.ngFilters.to_timestamp = Date.now();

          $scope.onFilter();
        }
      }
    }
  }
})();
