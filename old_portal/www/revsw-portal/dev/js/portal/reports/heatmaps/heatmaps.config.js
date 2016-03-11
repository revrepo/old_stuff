(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .constant('HeatmapsConfig', {

      /**
       * Amount of available colors
       */
      COLOR_COUNTS: 20,

      /**
       * Colors form min to max.
       * Will be interpolated
       */
      COLORS: {
        FIRST: '#99ccff',
        LAST: '#0050A1',
        ZERO: '#ccc'
      },
    });
})();
