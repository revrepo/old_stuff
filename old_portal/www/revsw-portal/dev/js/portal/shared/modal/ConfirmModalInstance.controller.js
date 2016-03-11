(function () {
  'use strict';

  angular
    .module('revapm.Portal.Shared')
    .controller('ConfirmModalInstanceCtrl', ConfirmModalInstanceCtrl);

  /*@ngInject*/
  function ConfirmModalInstanceCtrl($scope, $modalInstance, model) {

    $scope.model = model;

    $scope.ok = function () {
      $modalInstance.close(true);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
})();
