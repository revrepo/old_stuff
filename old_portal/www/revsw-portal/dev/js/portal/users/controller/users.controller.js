(function () {
  'use strict';

  angular
    .module('revapm.Portal.Users')
    .controller('UsersCrudController', UsersCrudController);

  // @ngInject
  function UsersCrudController($scope, CRUDController, Users, $injector, $stateParams, Companies, Domains, $state) {

    //Invoking crud actions
    $injector.invoke(CRUDController, this, {$scope: $scope, $stateParams: $stateParams});

    if ($scope.auth.isUser()) {
      $state.go('index.accountSettings.profile');
      return;
    }
    //Set state (ui.router)
    $scope.setState('index.accountSettings.users');

    $scope.setResource(Users);

    $scope.roles = ['user', 'admin'];

    $scope.companies = Companies.query();

    $scope.domains = Domains.query();

    if (!$scope.model) {
      $scope.model = {
        theme: 'light',
        access_control_list: {
          dashBoard: true,
          reports: false,
          configure: false,
          test: false,
          readOnly: false
        }
      };
    }

    $scope.getUser = function (id) {
      $scope.get(id)
        .catch(function (err) {
          $scope.alertService.danger('Could not load domain details');
        });
    };

    $scope.deleteUser = function (model) {
      $scope.confirm('confirmModal.html', model).then(function () {
        $scope.delete(model);
      });
    };

    $scope.updateUser = function (model) {
      if (!model) {
        return;
      }
      $scope.alertService.clear();
      // copy user id
      model.id = model.user_id;
      $scope
        .update(model)
        .then(function (data) {
          $scope.alertService.success('User updated', 5000);
        })
        .catch(function (err) {
          $scope.alertService.danger(err.data.message || 'Oops something ment wrong', 5000);
        });
    };

    $scope.createUser = function (model) {
      if (!model) {
        return;
      }
      if (model.passwordConfirm !== model.password) {
        $scope.alertService.danger('Passwords did not match', 5000);
        return;
      }
      $scope.alertService.clear();
      delete model.passwordConfirm;
      model.access_control_list.dashBoard = true;
      $scope.create(model)
        .then(function (data) {
          $scope.alertService.success('User created', 5000);
        });
    };
    // Fetch list of users
    $scope.list();

  }
})();
