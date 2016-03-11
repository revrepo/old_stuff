(function () {
  'use strict';

  angular
    .module('revapm.Portal.Domains')
    .controller('DomainsConfigureController', DomainsConfigureController);

  /*@ngInject*/
  function DomainsConfigureController($scope, User, $config, Domains, $timeout, AlertService) {

    $scope._loading = false;

    $scope.obj = {
      data: {},
      options: {
        mode: 'code',
        modes: ['code', 'view'], // allowed modes['code', 'form', 'text', 'tree', 'view']
        error: function (err) {
          alert(err.toString());
        }
      }
    };

    $timeout(function () {
      $scope.obj.options.mode = 'code';
    }, 10);

    $scope.domain = User.getSelectedDomain();

    $scope.update = function () {
      if (!$scope.domain || !$scope.domain.id) {
        AlertService.danger('Please select domain first');
        return;
      }
      $scope._loading = true;
      Domains.detailsUpdate({id: $scope.domain.id}, $scope.obj.data)
        .$promise
        .then(function (data) {
          if (data.message) {
            AlertService.success(data.message, 5000);
          }
        })
        .catch(function (err) {
          if (err.data && err.data.message) {
            AlertService.danger(err.data.message);
          } else {
            AlertService.danger('Something wrong');
          }
        })
        .finally(function () {
          $scope._loading = false;
        });
    };

    $scope.$on($config.EVENTS.DOMAIN_CHANGED, function () {
      $scope.domain = User.getSelectedDomain();
      if (!$scope.domain || !$scope.domain.id) {
        return;
      }
      $scope._loading = true;
      Domains
        .details({id: $scope.domain.id})
        .$promise
        .then(function (data) {
          $scope.obj.data = data.toJSON();
        })
        .finally(function () {
          $scope._loading = false;
        });
    });
  }
})();
