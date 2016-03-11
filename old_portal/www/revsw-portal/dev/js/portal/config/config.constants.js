(function () {
  'use strict';

  angular
    .module('revapm.Portal.Config')
    .constant('$config', {

      /**
       * Server url
       */
      SERVER_URL: '',

      /**
       * URL to API
       */
      API_URL: window.API_URL || 'https://testsjc20-api01.revsw.net/v1',
      // API_URL: 'https://iad02-api01.revsw.net/v1',
      // API_URL: 'https://localhost:8000/v1',

      /**
       * HTTP Statuses
       */
      STATUS: {
        OK: 200,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        TWO_FACTOR_AUTH_REQUIRED: 403
      },

      /**
       * User roles
       */
      ROLE: {
        USER: 'user',
        RESELLER: 'reseller',
        ADMIN: 'admin'
      },

      /**
       * List of application events
       */
      EVENTS: {
        DOMAIN_CHANGED: 'domain_changed'
      },

      /**
       * List of icon classes for domain statuses
       */
      DOMAIN_STATUS_ICONS : {
        InProgress: 'glyphicon-refresh spin',
        Published: 'glyphicon-ok-circle text-success',
        Modified: 'glyphicon-ok-circle text-primary'
      },

      /**
       * Interval delay for refreshing domain staging/global status
       */
      DOMAIN_STATUS_REFRESH_INTERVAL: 5000
    });

})();
