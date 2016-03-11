(function () {
  'use strict';

  angular
    .module('revapm.Portal.Companies')
    .controller('CompaniesCrudController', CompaniesCrudController);

  /*@ngInject*/
  function CompaniesCrudController($scope, CRUDController, Companies, $injector, $stateParams, $config) {
    //Invoking crud actions
    $injector.invoke(CRUDController, this, {$scope: $scope, $stateParams: $stateParams});

    // Set resource to work with data
    $scope.setResource(Companies);
    //Set state (ui.router)
    $scope.setState('index.accountSettings.companies');

    // Fetch list of users
    $scope.list();

    $scope.getCompany = function(id) {
      $scope.get(id)
        .catch(function (err) {
          $scope.alertService.danger('Could not load company details');
        });
    };

    $scope.deleteCompany = function(model) {
      $scope.confirm('confirmModal.html', model).then(function () {
        $scope.delete(model);
      });
    };

    $scope.createCompany = function (model) {
      if (!model) {
        return;
      }
      $scope.create(model)
        .then(function () {
          $scope.alertService.success('Company created', 5000);
          $scope.auth.reloadUser();
        });
    };

    $scope.updateCompany = function (model) {
      $scope.update(model)
        .then(function () {
          $scope.alertService.success('Company updated', 5000);
        })
        .catch(function (err) {
          $scope.alertService.danger(err.data.message || 'Oops something ment wrong', 5000);
        });
    };
  };

})();
