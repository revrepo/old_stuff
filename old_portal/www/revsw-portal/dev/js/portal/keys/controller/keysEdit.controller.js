(function () {
  'use strict';

  angular
    .module('revapm.Portal.Keys')
    .controller('KeysEditController', KeysEditController);

  // @ngInject
  function KeysEditController($scope, $modalInstance, ApiKeys, AlertService, data) {

    /**
     * Loading flag
     *
     * @type {boolean}
     * @private
     */
    $scope._loading = false;

    /**
     * List of companies provided from other controller
     */
    $scope.companies = data.companies;

    /**
     * List of domains provided from other controller
     */
    $scope.domains = data.domains;

    /**
     * Selected account id
     *
     * @type {null|string}
     */
    $scope.selected = null;

    /**
     * Current kay object
     *
     * @type {null}
     */
    $scope.key = null;

    /**
     * List of domains related to selected account
     *
     * @type {Array}
     */
    $scope.selectedDomains = [];

    /**
     * Select domains that relates to key's account
     *
     * @param {string} accountId
     */
    $scope.selectDomains = function(accountId) {
      $scope.selectedDomains = [];
      angular.forEach($scope.domains, function (domain) {
        if (domain.companyId == accountId) {
          $scope.selectedDomains.push(domain);
        }
      });
    };

    /**
     * Load key details
     *
     * @param {string|number} id
     */
    $scope.loadKeyDetails = function(id) {
      if (!id) {
        return;
      }
      $scope._loading = true;
      $scope.key = null;
      ApiKeys
        .get({id: id})
        .$promise
        .then(function (key) {
          $scope.key = key;
        })
        .catch(function (err) {
          AlertService.danger(err);
        })
        .finally(function () {
          $scope._loading = false;
        });
    };

    /**
     * On selected account
     *
     * @param {Object} model
     */
    $scope.onModelSelect = function(model) {
      $scope.selected = model;
    };

    /**
     * Function will remove all data that should not be sent to server
     *
     * @param {Object} data
     * @returns {Object}
     */
    function clearUpdateData(data) {
      var fields = ['key_name', 'account_id', 'domains', 'allowed_ops', 'read_only_status', 'active'];
      return _.pick(_.clone(data), fields);
      //var result = _.pick(_.clone(data), fields);
      //return result;
    }

    /**
     * Click on ok button
     */
    $scope.ok = function () {
      if (!$scope.key || !$scope.key.id) {
        return;
      }
      $scope._loading = true;
      ApiKeys
        .update({id: $scope.key.id}, clearUpdateData($scope.key))
        .$promise
        .then(function (data) {
          //console.log(data);
          //AlertService.success('API Key updated');
          $modalInstance.close(data);
        })
        .catch(function (err) {
          AlertService.danger(err);
        })
        .finally(function () {
          $scope._loading = false;
        });
    };

    /**
     * Close dialog
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    if (data.keyId) {
      $scope.loadKeyDetails(data.keyId);
    }

    $scope.$watch('key.account_id', function(account_id) {
      $scope.selectDomains(account_id);
    });
  }
})();
