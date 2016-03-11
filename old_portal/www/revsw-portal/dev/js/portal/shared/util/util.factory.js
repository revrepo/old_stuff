(function () {
  'use strict';

  angular
    .module('revapm.Portal.Shared')
    .factory('Util', UtilFactory);

  /*@ngInject*/
  function UtilFactory() {

    /**
     * Convert traffic value to bytes per second
     *
     * @param {number} bytes
     * @param {number} delay
     * @returns {number}
     */
    function toBps(bytes, delay) {
      delay = delay || 1800;
      if (!angular.isNumber(delay)) {
        delay = 1800;
      }
      return (bytes / delay * 8);
    }

    /**
     * Convert trafic value to Kbps, Mbps, Gbps, Tbps
     *
     * @param {number} bps
     * @returns {string}
     */
    function convertTraffic(bps) {
      var sizes = ['Bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
      if (bps == 0 || !bps) return '0 Bps';
      var i = parseInt(Math.floor(Math.log(bps) / Math.log(1024)));
      var result = Math.round(bps / Math.pow(1024, i), 2) + ' ' + (sizes[i] || '');
      return result || '';
    }

    /**
     * Convert value to RPS
     *
     * @param {number} bytes
     * @param {number} delay
     * @param {boolean=} [isNumber] if true - result will be a numeric. Otherwise string
     * @returns {string|string}
     */
    function toRPS(bytes, delay, isNumber) {
      if (!angular.isNumber(delay)) {
        delay = 1800;
      }
      var result = (bytes / (delay)).toFixed(1);
      if (isNumber) {
        result = parseFloat(result);
        return result || 0;
      }
      return result || '';
    }

    return {

      /**
       * @inheritDoc
       */
      convertTraffic: convertTraffic,

      /**
       * @inheritDoc
       */
      toBps: toBps,

      /**
       * @inheritDoc
       */
      toRPS: toRPS
    };
  }
})();
