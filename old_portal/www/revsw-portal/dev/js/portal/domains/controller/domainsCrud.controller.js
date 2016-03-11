(function () {
  'use strict';

  angular
    .module('revapm.Portal.Domains')
    .controller('_DomainsCrudController', DomainsCrudController);

  /*@ngInject*/
  function DomainsCrudController($scope,
     $localStorage,
     CRUDController,
     DomainsConfig,
     $injector,
     $stateParams,
     $config,
     Companies,
     $http,
     $q,
     $state) {
    //Invoking crud actions
    $injector.invoke(CRUDController, this, {$scope: $scope, $stateParams: $stateParams});

    //Set state (ui.router)
    $scope.setState('index.webApp._domains');

    $scope.setResource(DomainsConfig);

    // Fetch list of records
    $scope.$on('$stateChangeSuccess', function (state) {
      if ($state.is($scope.state)) {
        $scope.list();
      }
    });

    $scope.locations = [];
    $scope.companies = [];
    $scope.model = {};

    // fetch list of locations
    $scope.fetchLocations = function() {
      $http
        .get($config.API_URL + '/locations/firstmile')
        .then(function (data) {
          if (data.status == $config.STATUS.OK) {
            $scope.locations = data.data;
          }
        });
    };

    $scope.fetchCompanies = function(companyIds) {
      var promises = [];
      companyIds.forEach(function (id) {
        promises.push(Companies.get({id: id}).$promise);
      });
      $q.all(promises).then(function (data) {
        $scope.companies = data;
      });
    };

    $scope.prepareSimpleDomainUpdate = function(model) {
      model = _.clone(model.toJSON());
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

    if ($scope.auth.isReseller()) {
      // Loading list of companies
      Companies.query(function (list) {
        $scope.companies = list;
      });
    } else if (!angular.isArray($scope.auth.getUser().companyId)) {
      $scope.model.account_id = $scope.auth.getUser().companyId;
    } else if ($scope.auth.getUser().companyId.length === 1) {
      $scope.model.account_id = $scope.auth.getUser().companyId[0];
    } else {
      $scope.fetchCompanies($scope.auth.getUser().companyId);
    }

    $scope.fetchLocations();

    $scope.getDomain = function(id) {
      $scope.get(id)
        .catch(function (err) {
          $scope.alertService.danger('Could not load domain details');
        });
    };

    $scope.deleteDomain = function(model) {
      $scope.confirm('confirmModal.html', model).then(function () {
        $scope.delete(model).then(function (data) {
          $scope.list();
        });
      });
    };

    $scope.createDomain = function (model) {
      $scope.create(model)
        .then(function () {
          $scope.alertService.success('Domain created', 5000);
        });
    };

    $scope.publishDomain = function(model) {
      if (!model) {
        return;
      }
      if (!model.id) {
        model.id = $stateParams.id;
      }
      var modelId = model.id;
      $scope.confirm('confirmPublishModal.html', model).then(function () {
        model = $scope.prepareSimpleDomainUpdate(model);
        $scope.update({
          id: modelId,
          options: 'publish'
        }, model)
          .then(function (data) {
            $scope.alertService.success('Domain configuration published', 5000);
          })
          .catch(function (err) {
            $scope.alertService.danger(err);
          });
      });
    };

    $scope.validateDomain = function(model) {
      if (!model) {
        return;
      }
      if (!model.id) {
        model.id = $stateParams.id;
      }
      var modelId = model.id;
      model = $scope.prepareSimpleDomainUpdate(model);
      $scope.update({
        id: modelId,
        options: 'verify_only'
      }, model)
        .then(function (data) {
          $scope.alertService.success('Domain configuration is correct', 5000);
        })
        .catch(function (err) {
          $scope.alertService.danger(err.data.message || 'Oops something ment wrong', 5000);
        });
    };

    $scope.updateDomain = function (model) {
      if (!model) {
        return;
      }
      if (!model.id) {
        model.id = $stateParams.id;
      }
      var modelId = model.id;
      $scope.confirm('confirmUpdateModal.html', model).then(function () {
        model = $scope.prepareSimpleDomainUpdate(model);
        $scope.update({id: modelId}, model)
          .then(function () {
            $scope.alertService.success('Domain updated', 5000);
          })
          .catch(function (err) {
            $scope.alertService.danger(err.data.message || 'Oops something ment wrong', 5000);
          });
      });
    };

    $scope.storeToStorage = function (model) {
      $localStorage.selectedDomain = model;
    };
  }
})();
