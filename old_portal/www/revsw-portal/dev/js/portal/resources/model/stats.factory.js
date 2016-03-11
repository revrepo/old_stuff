(function () {
  'use strict';

  angular
    .module('revapm.Portal.Resources')
    .factory('Stats', StatsResource);

  /*@ngInject*/
  function StatsResource(Resource, $config) {
    return Resource($config.API_URL + '/stats/:domainId', {
      domainId: ''
    }, {
      // Actions
      os: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'os',
          count: 10
        }
      },
      device: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'device',
          count: 10
        }
      },
      country: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'country',
          count: 10
        }
      },
      lm_rtt_country: {
        method: 'GET',
        url: $config.API_URL + '/stats/lastmile_rtt/:domainId',
        params: {
          report_type: 'country',
          count: 10
        }
      },
      gbt_country: {
        method: 'GET',
        url: $config.API_URL + '/stats/gbt/:domainId',
        params: {
          report_type: 'country',
          count: 10
        }
      },
      protocol: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'protocol'
        }
      },
      httpProtocol: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'http_protocol'
        }
      },
      httpMethod: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'http_method'
        }
      },
      statusCode: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'status_code'
        }
      },
      contentType: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'content_type'
        }
      },
      cacheStatus: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'cache_status'
        }
      },
      quic: {
        method: 'GET',
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'QUIC'
        }
      },

      traffic: {
        method: 'GET'
      },

      referer: {
        url: $config.API_URL + '/stats/top/:domainId',
        params: {
          report_type: 'referer'
        }
      },

      topObjects: {
        method: 'GET',
        url: $config.API_URL + '/stats/top_objects/:domainId',
        params: {

        }
      }
    });
  }
})();
