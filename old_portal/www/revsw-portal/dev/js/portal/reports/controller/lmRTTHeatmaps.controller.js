(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .controller('LMRTTHeatmapsController', LMRTTHeatmapsController);

  /*@ngInject*/
  function LMRTTHeatmapsController($scope, HeatmapsDrawer, Countries, Stats) {

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
     * Object with information about countries and RTT stats.
     * Format:
     * ```json
     * {
     *   'Russian Federation': { value: 34, tooltip: 'ave: 34, min: 12, max: 1201 ms' },
     *   'Zimbabwe': { value: 617, tooltip: 'ave: 617, min: 501, max: 12033 ms' },
     *   'United States': { value: 11, tooltip: 'ave: 11, min: 4, max: 277 ms' }
     * }
     * ```
     *
     * @type {Object}
     */
    $scope.countryLMRTTData = {};

    /**
     * Loading list of country names
     */
    $scope.countries = Countries.query();

    /**
     * Loads list of country hits.
     *
     * @param {String|Number} domainId
     */
    $scope.reloadCountry = function (domainId) {
      // Remove prev map
      HeatmapsDrawer.clearMap();
      // Set loading
      $scope._loading = true;
      // Clear old data
      $scope.countryLMRTTData = {};

      console.log($scope.delay);

      // Loading new data
      return Stats.lm_rtt_country({
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
              $scope.countryLMRTTData[name] = {
                value: item.lm_rtt_avg_ms,
                tooltip: ( 'Avg: <strong>' + item.lm_rtt_avg_ms + '</strong> Min: <strong>' + item.lm_rtt_min_ms + '</strong> Max: <strong>' + item.lm_rtt_max_ms + '</strong> ms' )
              };
            });
          }
          // Pass to next `.then()`
          return data;
        })
        .finally(function () {
          $scope._loading = false;
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
      $scope
        .reloadCountry($scope.domain.id)
        .then(function () {
          // Redraw a new map using received data
          HeatmapsDrawer.drawMap("#canvas-svg", "#tooltip-container", $scope.countryLMRTTData);
        });

    };
    // Draw a empty world map
    HeatmapsDrawer.drawMap("#canvas-svg", "#tooltip-container", {});
  }
})();
