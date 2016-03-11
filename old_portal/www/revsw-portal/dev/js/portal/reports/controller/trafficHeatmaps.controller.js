(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .controller('TrafficHeatmapsController', TrafficHeatmapsController);

  /*@ngInject*/
  function TrafficHeatmapsController($scope, HeatmapsDrawer, Countries, Stats, $q) {

    /**
     * Loading flag
     *
     * @type {boolean}
     * @private
     */
    $scope._loading = false;

    /**
     * Domain object that will be selected from dropdown
     *
     * @type {?Object}
     */
    $scope.domain = null;

    /**
     * Delay in hours.
     * Will load list of countries reports for last `delay` hours.
     *
     * @type {string|number}
     */
    $scope.delay = '6';

    /**
     * Object with information about countries and hits.
     * Format:
     * ```json
     * {
     *   'United States': { value: 2564, tooltip: '2.6K requests' }
     *    .........
     * }
     * ```
     *
     * @type {Object}
     */
    $scope.countryHitsData = {};
    /**
     * Object with information about countries and transfer stats.
     * Format:
     * ```json
     * {
     *   'United States': { value: 9876543, tooltip: 'Sent: 36.3 GB Received: 1.88 GB' }
     *    .........
     * }
     * ```
     *
     * @type {Object}
     */
    $scope.countryGBTData = {};

    /**
     * Loading list of country names
     */
    $scope.countries = Countries.query();

    /**
     * Loads list of country hits.
     *
     * @param {String|Number} domainId
     */
    $scope.reloadHitsCountry = function (domainId) {
      // Remove prev map
      HeatmapsDrawer.clearMap( '#canvas-svg-hits' );
      // Set loading
      $scope._loading = true;
      // Clear old data
      $scope.countryHitsData = {};

      // Loading new data
      return Stats.country({
          domainId: domainId,
          count: 250,
          from_timestamp: moment().subtract($scope.delay || 6, 'hours').valueOf(),
          to_timestamp: Date.now()
        })
        .$promise
        .then(function (data) {
          if (data.data && data.data.length > 0) {
            angular.forEach(data.data, function (item) {
              var name = $scope.countries[item.key.toUpperCase()] || item.key;
              $scope.countryHitsData[name] = {
                value: item.count,
                tooltip: '<strong>' + HeatmapsDrawer.valueFormat(item.count) + '</strong> requests'
              };
            });
          }
          // Pass to next `.then()`
          return data;
        });
    };

    /**
     * Loads list of country trensferred data.
     *
     * @param {String|Number} domainId
     */
    $scope.reloadGBTCountry = function (domainId) {
      // Remove prev map
      HeatmapsDrawer.clearMap( '#canvas-svg-gbt' );
      // Set loading
      $scope._loading = true;
      // Clear old data
      $scope.countryGBTData = {};

      // Loading new data
      return Stats.gbt_country({
          domainId: domainId,
          count: 250,
          from_timestamp: moment().subtract($scope.delay || 6, 'hours').valueOf(),
          to_timestamp: Date.now()
        })
        .$promise
        .then(function (data) {
          if (data.data && data.data.length > 0) {
            angular.forEach(data.data, function (item) {
              var name = $scope.countries[item.key.toUpperCase()] || item.key;
              $scope.countryGBTData[name] = {
                value: item.sent_bytes,
                tooltip: ( 'Sent: <strong>' + HeatmapsDrawer.valueFormat(item.sent_bytes, 'G'/*force G*/) +
                  'B</strong> Received: <strong>' + HeatmapsDrawer.valueFormat(item.received_bytes, 'G') + 'B</strong>' )
              };
            });
          }
          // Pass to next `.then()`
          return data;
        });
    };

    /**
     * Handle domain select
     *
     * @see {$scope.reloadCountry}
     */
    $scope.onDomainSelect = function () {
      if (!$scope.domain || !$scope.domain.id) {
        return;
      }
      $q.all([
        $scope.reloadHitsCountry($scope.domain.id),
        $scope.reloadGBTCountry($scope.domain.id)
      ]).then(function () {
        // Redraw maps using received data
        HeatmapsDrawer.drawMap("#canvas-svg-hits", "#tooltip-container-hits", $scope.countryHitsData);
        HeatmapsDrawer.drawMap("#canvas-svg-gbt", "#tooltip-container-gbt", $scope.countryGBTData);
      }).finally(function () {
        $scope._loading = false;
      });

    };

    // Draw a empty world map
    HeatmapsDrawer.drawMap("#canvas-svg-hits", "#tooltip-container-hits", {});
    HeatmapsDrawer.drawMap("#canvas-svg-gbt", "#tooltip-container-gbt", {});
  }
})();
