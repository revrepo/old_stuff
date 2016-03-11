(function () {
  'use strict';

  angular
    .module('revapm.Portal.Shared')
    .factory('AlertService', AlertService);

  /*@ngInject*/
  function AlertService($interval) {

    var alerts = [];

    /**
     * Add new alert
     * @param {object} alert
     * @param {number=} [timeout]
     */
    function add(alert, timeout) {
      alerts.push(alert);

      if (timeout) {
        $interval(remove.bind(this, alert), timeout, 1);
      }
    };

    /**
     * Add a success alert
     *
     * @param {string} msg
     * @param {number=} [timeout]
     */
    function success(msg, timeout) {
      if (angular.isUndefined(timeout)) {
        timeout = 5000;
      }
      add({
        type: 'success',
        message: msg || ''
      }, timeout);
    };

    /**
     * Add a danger alert
     *
     * @param {string|object} msg
     * @param {number=} [timeout]
     */
    function danger(msg, timeout) {
      if (angular.isUndefined(timeout)) {
        timeout = 5000;
      }
      // Check if err obj passed from `.catch()`
      if (angular.isObject(msg)) {
        if (msg && msg.data && msg.data.message) {
          msg = msg.data.message;
        } else {
          msg = 'Something wrong...';
        }
      }
      add({
        type: 'danger',
        message: msg || ''
      }, timeout);
    };

    function remove(alert) {
      var idx = alerts.indexOf(alert);
      if (!~idx) {
        return;
      }
      alerts.splice(idx, 1);
    };

    /**
     * Clear all alerts
     */
    function clear() {
      alerts.splice(0, alerts.length);
    };

    return {
      alerts: alerts,

      success: success,

      danger: danger,

      add: add,

      remove: remove,

      clear: clear
    };
  };
})();
