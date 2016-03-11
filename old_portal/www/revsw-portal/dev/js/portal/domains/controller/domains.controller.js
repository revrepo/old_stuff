(function () {
  'use strict';

  angular
    .module('revapm.Portal.Domains')
    .controller('DomainsCrudController', DomainsCrudController);

  /*@ngInject*/
  function DomainsCrudController($scope,
     $localStorage,
     CRUDController,
     Domains,
     $injector,
     $stateParams,
     $config,
     Companies,
     $http,
     $q) {
    //Invoking crud actions
    $injector.invoke(CRUDController, this, {$scope: $scope, $stateParams: $stateParams});

    //Set state (ui.router)
    $scope.setState('index.webApp.domains');

    $scope.setResource(Domains);

    // Fetch list of records
    $scope.list();

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

    if ($scope.auth.isReseller()) {
      // Loading list of companies
      Companies.query(function (list) {
        $scope.companies = list;
      });
    } else if (!angular.isArray($scope.auth.getUser().companyId)) {
      $scope.model.companyId = $scope.auth.getUser().companyId;
    } else if ($scope.auth.getUser().companyId.length === 1) {
      $scope.model.companyId = $scope.auth.getUser().companyId[0];
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
        $scope.delete(model);
      });
    };

    $scope.createDomain = function (model) {
      $scope.create(model)
        .then(function () {
          $scope.alertService.success('Domain created', 5000);
        });
    };

    $scope.updateDomain = function (model) {
      $scope.update(model)
        .then(function () {
          $scope.alertService.success('Domain updated', 5000);
        })
        .catch(function (err) {
          $scope.alertService.danger(err.data.message || 'Oops something ment wrong', 5000);
        });
    };
    $scope.storeToStorage = function (model) {
      $localStorage.selectedDomain = model;
    }
  };
})();
