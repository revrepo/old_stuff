(function() {
  'use strict';

  angular
    .module('revapm.Portal.Domains')
    .controller('DomainsConfigureAdvancedController', DomainsConfigureAdvancedController)
    .controller('_DomainsConfigureAdvancedController', _DomainsConfigureAdvancedController);

  /*@ngInject*/
  function DomainsConfigureAdvancedController($scope, User, $config, Domains, $timeout, AlertService, $stateParams) {

    $scope.id = $stateParams.id;

    $scope.domain = Domains.get({
      id: $scope.id
    });

    $scope._loading = false;

    $scope.obj = {
      data: {},
      options: {
        mode: 'code',
        modes: ['code', 'view'], // allowed modes['code', 'form', 'text', 'tree', 'view']
        error: function(err) {
          alert(err.toString());
        }
      }
    };

    $timeout(function() {
      $scope.obj.options.mode = 'code';
    }, 10);

    $scope.update = function() {
      if (!$scope.id) {
        AlertService.danger('Please select domain first');
        return;
      }
      $scope._loading = true;
      Domains.detailsUpdate({
          id: $scope.id
        }, $scope.obj.data)
        .$promise
        .then(function(data) {
          if (data.message) {
            AlertService.success(data.message, 5000);
          }
        })
        .catch(function(err) {
          if (err.data && err.data.message) {
            AlertService.danger(err.data.message);
          } else {
            AlertService.danger('Something wrong');
          }
        })
        .finally(function() {
          $scope._loading = false;
        });
    };

    $scope.load = function() {
      if (!$scope.id) {
        return;
      }
      $scope._loading = true;
      Domains
        .details({
          id: $scope.id
        })
        .$promise
        .then(function(data) {
          console.log(data);
          $scope.obj.data = data.toJSON();
        })
        .finally(function() {
          $scope._loading = false;
        });
    };

    $scope.load();
  }

  /*@ngInject*/
  function _DomainsConfigureAdvancedController($scope, User, $config, DomainsConfig, $timeout, AlertService, $stateParams) {

    $scope.id = $stateParams.id;

    $scope.clearDomain = function(model) {
      if (model.rev_component_bp) {
        delete model.rev_component_bp.cache_opt_choice;
        delete model.rev_component_bp.certificate_urls;
        delete model.rev_component_bp.ssl_certificates;
      }
      if (model.domain_name) {
        delete model.domain_name;
      }
      delete model.origin_protocol;
      delete model.id;
      return model;
    };

    DomainsConfig
      .get({
        id: $scope.id
      })
      .$promise
      .then(function(data) {
        $scope.domain = data;
        $scope.obj.data = $scope.clearDomain(data.toJSON());
      })
      .catch(function(err) {
        AlertService.danger(err);
      })
      .finally(function() {
        $scope._loading = false;
      });

    $scope._loading = false;

    $scope.obj = {
      data: {},
      options: {
        mode: 'code',
        modes: ['code', 'view'], // allowed modes['code', 'form', 'text', 'tree', 'view']
        error: function(err) {
          alert(err.toString());
        }
      }
    };

    $timeout(function() {
      $scope.obj.options.mode = 'code';
    }, 10);

    $scope.verify = function() {
      if (!$scope.id) {
        AlertService.danger('Please select domain first');
        return;
      }
      $scope._loading = true;
      DomainsConfig.update({
          id: $scope.id,
          options: 'verify_only'
        }, $scope.obj.data)
        .$promise
        .then(function(data) {
          $scope.alertService.success('Domain configuration is correct', 5000);
        })
        .catch(function(err) {
          AlertService.danger(err);
        })
        .finally(function() {
          $scope._loading = false;
        });
    };

    $scope.publish = function() {
      if (!$scope.id) {
        AlertService.danger('Please select domain first');
        return;
      }
      $scope.confirm('confirmPublishModal.html', $scope.domain).then(function () {
        $scope._loading = true;
        DomainsConfig.update({
            id: $scope.id,
            options: 'publish'
          }, $scope.obj.data)
          .$promise
          .then(function(data) {
            $scope.alertService.success('Domain configuration is published', 5000);
          })
          .catch(function(err) {
            AlertService.danger(err);
          })
          .finally(function() {
            $scope._loading = false;
          });
      });
    };

    $scope.update = function() {
      if (!$scope.id) {
        AlertService.danger('Please select domain first');
        return;
      }
      $scope.confirm('confirmUpdateModal.html', $scope.domain).then(function () {
        $scope._loading = true;
        DomainsConfig.update({
            id: $scope.id
          }, $scope.obj.data)
          .$promise
          .then(function(data) {
            if (data.message) {
              AlertService.success(data.message, 5000);
            }
          })
          .catch(function(err) {
            if (err.data && err.data.message) {
              AlertService.danger(err.data.message);
            } else {
              AlertService.danger('Something wrong');
            }
          })
          .finally(function() {
            $scope._loading = false;
          });
      });
    };
  }
})();
