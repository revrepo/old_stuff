(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .controller('TopReportsTrafficController', TopReportsTrafficController);

  /*@ngInject*/
  function TopReportsTrafficController($scope, User, AlertService, Stats, Countries) {
    $scope.userService = User;

    $scope._loading = true;
    // Domain that selected
    $scope.domain = null;
    $scope.domains = [];

    $scope.filters = {
      from_timestamp: moment().subtract(1, 'days').valueOf(),
      to_timestamp: Date.now()
    };

    $scope.pieOpts = {
      scaleOverride: true
    };

    $scope.os = [];
    $scope.device = [];
    $scope.country = [];
    $scope.statusCode = [];
    //$scope.statusCode = {
    //  labels: [],
    //  data: []
    //};

    $scope.countries = Countries.query();


    /**
     * Reload list of OS
     *
     * @param {string|number} domainId
     */
    $scope.reloadOS = function (domainId) {
      //$scope.os = {
      //  labels: [],
      //  data: []
      //};
      //Stats.os({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      $scope.os.labels.push(os.key);
      //      $scope.os.data.push(os.count);
      //    });
      //  }
      //});
      $scope.os = [];
      Stats.os({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            newData.push({
              name: val.key,
              y: val.count
            });
          });
          $scope.os = newData;
        }
      });
    };

    /**
     * List of devices
     *
     * @param {string|number} domainId
     */
    $scope.reloadDevice = function (domainId) {
      //$scope.device = {
      //  labels: [],
      //  data: []
      //};
      //Stats.device({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      $scope.device.labels.push(os.key);
      //      $scope.device.data.push(os.count);
      //    });
      //  }
      //});
      $scope.device = [];
      Stats.device({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            newData.push({
              name: val.key,
              y: val.count
            });
          });
          $scope.device = newData;
        }
      });
    };

    /**
     * List of devices
     *
     * @param {string|number} domainId
     */
    $scope.reloadProtocol = function (domainId) {
      //$scope.protocol = {
      //  labels: [],
      //  data: []
      //};
      //Stats.protocol({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      var protocol = 'Unknows';
      //      if (os.key == 80) {
      //        protocol = 'HTTP';
      //      }
      //      if (os.key == 443) {
      //        protocol = 'HTTPS';
      //      }
      //      $scope.protocol.labels.push(protocol);
      //      $scope.protocol.data.push(os.count);
      //    });
      //  }
      //});
      $scope.protocol = [];
      Stats.protocol({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            var protocol = 'Unknows';
            if (val.key == 80) {
              protocol = 'HTTP';
            }
            if (val.key == 443) {
              protocol = 'HTTPS';
            }
            newData.push({
              name: protocol,
              y: val.count
            });
          });
          $scope.protocol = newData;
        }
      });
    };

    /**
     * List of devices
     *
     * @param {string|number} domainId
     */
    $scope.reloadHttpMethod = function (domainId) {
      //$scope.httpMethod = {
      //  labels: [],
      //  data: []
      //};
      //Stats.httpMethod({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      $scope.httpMethod.labels.push(os.key);
      //      $scope.httpMethod.data.push(os.count);
      //    });
      //  }
      //});
      $scope.httpMethod = [];
      Stats.httpMethod({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            newData.push({
              name: val.key,
              y: val.count
            });
          });
          $scope.httpMethod = newData;
        }
      });
    };

    /**
     * List of devices
     *
     * @param {string|number} domainId
     */
    $scope.reloadHttpProtocol = function (domainId) {
      //$scope.httpProtocol = {
      //  labels: [],
      //  data: []
      //};
      //Stats.httpProtocol({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      $scope.httpProtocol.labels.push(os.key);
      //      $scope.httpProtocol.data.push(os.count);
      //    });
      //  }
      //});
      $scope.httpProtocol = [];
      Stats.httpProtocol({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            newData.push({
              name: val.key,
              y: val.count
            });
          });
          $scope.httpProtocol = newData;
        }
      });
    };

    /**
     * List of devices
     *
     * @param {string|number} domainId
     */
    $scope.reloadStatusCode = function (domainId) {
      //$scope.statusCode = {
      //  labels: [],
      //  data: []
      //};
      //Stats.statusCode({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      $scope.statusCode.labels.push(os.key);
      //      $scope.statusCode.data.push(os.count);
      //    });
      //  }
      //});
      $scope.statusCode = [];
      Stats.statusCode({domainId: domainId}).$promise.then(function (data) {
        var newData = [];
        if (data.data && data.data.length > 0) {
          angular.forEach(data.data, function (os) {
            newData.push({
              name: os.key,
              y: os.count
            });
          });
          $scope.statusCode = newData;
        }
      });
    };

    /**
     * List of devices
     *
     * @param {string|number} domainId
     */
    $scope.reloadContentType = function (domainId) {
      //$scope.contentType = {
      //  labels: [],
      //  data: []
      //};
      //Stats.contentType({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      $scope.contentType.labels.push(os.key);
      //      $scope.contentType.data.push(os.count);
      //    });
      //  }
      //});
      $scope.contentType = [];
      Stats.contentType({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            newData.push({
              name: val.key,
              y: val.count
            });
          });
          $scope.contentType = newData;
        }
      });
    };

    /**
     * List of devices
     *
     * @param {string|number} domainId
     */
    $scope.reloadCacheStatus = function (domainId) {
      //$scope.cacheStatus = {
      //  labels: [],
      //  data: []
      //};
      //Stats.cacheStatus({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      $scope.cacheStatus.labels.push(os.key);
      //      $scope.cacheStatus.data.push(os.count);
      //    });
      //  }
      //});
      $scope.cacheStatus = [];
      Stats.cacheStatus({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            newData.push({
              name: val.key,
              y: val.count
            });
          });
          $scope.cacheStatus = newData;
        }
      });
    };

    /**
     * QUIC/non-QUIC requests distribution
     *
     * @param {string|number} domainId
     */
    $scope.reloadQUIC = function (domainId) {

      $scope.quic = [];
      Stats.quic({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            newData.push({
              name: ( val.key === '-' ? 'Non-QUIC' : val.key ),
              y: val.count
            });
          });
          $scope.quic = newData;
        }
      });
    };

    /**
     * List of country
     *
     * @param {string|number} domainId
     */
    $scope.reloadCountry = function (domainId) {
      //$scope.country = {
      //  labels: [],
      //  data: []
      //};
      //Stats.country({domainId: domainId}).$promise.then(function (data) {
      //  if (data.data && data.data.length > 0) {
      //    angular.forEach(data.data, function (os) {
      //      var name = $scope.countries[os.key.toUpperCase()] || os.key;
      //      $scope.country.labels.push(name);
      //      $scope.country.data.push(os.count);
      //    });
      //  }
      //});
      $scope.country = [];
      Stats.country({domainId: domainId}).$promise.then(function (data) {
        if (data.data && data.data.length > 0) {
          var newData = [];
          angular.forEach(data.data, function (val) {
            var name = $scope.countries[val.key.toUpperCase()] || val.key;
            newData.push({
              name: name,
              y: val.count
            });
          });
          $scope.country = newData;
        }
      });
    };

    $scope.reload = function() {
      $scope.reloadOS($scope.domain.id);
      $scope.reloadDevice($scope.domain.id);
      $scope.reloadCountry($scope.domain.id);
      $scope.reloadProtocol($scope.domain.id);
      $scope.reloadHttpMethod($scope.domain.id);
      $scope.reloadHttpProtocol($scope.domain.id);
      $scope.reloadStatusCode($scope.domain.id);
      $scope.reloadContentType($scope.domain.id);
      $scope.reloadCacheStatus($scope.domain.id);
      $scope.reloadQUIC($scope.domain.id);

    };

    // Load user domains
    User.getUserDomains(true)
      .then(function (domains) {
        $scope.domains = domains;
      })
      .catch(function () {
        AlertService.danger('Oops something wrong');
      })
      .finally(function () {
        $scope._loading = false;
      });

    $scope.onDomainSelected = function (domain) {
      if (!$scope.domain || !$scope.domain.id) {
        return;
      }
      $scope.reload();
    };
  }
})();
