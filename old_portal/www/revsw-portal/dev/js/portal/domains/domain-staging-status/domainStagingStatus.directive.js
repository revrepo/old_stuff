(function () {
  'use strict';

  angular
    .module('revapm.Portal.Domains')
    .directive('domainStagingStatus', domainStagingStatus);

  /*@ngInject*/
  function domainStagingStatus(DomainsConfig, $config, $timeout) {
    return {
      template: '<i class="glyphicon" ng-class="iconStaging" tooltip="{{tooltipStaging}}"></i>' +
                '&nbsp;&nbsp;&nbsp;' +
                '<i class="glyphicon" ng-class="iconGlobal" tooltip="{{tooltipGlobal}}"></i>',
      scope: {
        ngId: '=' // Domain id
      },
      /*@ngInject*/
      controller: function ($scope) {
        var intervalPromise;
        var domainId;

        $scope.iconStaging = 'glyphicon-refresh spin';
        $scope.tooltipStaging = 'Staging status';
        $scope.iconGlobal = 'glyphicon-refresh spin';
        $scope.tooltipGlobal = 'Global status';

        $scope.startRefresh = function() {
          if (!domainId) {
            return;
          }
          intervalPromise = $timeout($scope.fetchStatus, $config.DOMAIN_STATUS_REFRESH_INTERVAL);
        };

        $scope.stopRefresh = function () {
          if (angular.isDefined(intervalPromise)) {
            $timeout.cancel(intervalPromise);
            intervalPromise = undefined;
          }
        };

        $scope.fetchStatus = function(id) {
          if (!id && !domainId) {
            return;
          }
          if (!id && domainId) {
            id = domainId;
          }

          DomainsConfig
            .status({id: id})
            .$promise
            .then(function (data) {
              if ($config.DOMAIN_STATUS_ICONS[data.staging_status]) {
                $scope.iconStaging = $config.DOMAIN_STATUS_ICONS[data.staging_status];
              }
              $scope.tooltipStaging = 'Staging status: ' + data.staging_status;
              if ($config.DOMAIN_STATUS_ICONS[data.global_status]) {
                $scope.iconGlobal = $config.DOMAIN_STATUS_ICONS[data.global_status];
              }
              $scope.tooltipGlobal = 'Global status: ' + data.global_status;
              $scope.startRefresh();
            })
            .catch(function (err) {
              console.log(err);
              $scope.iconStaging = 'glyphicon-remove text-danger';
              $scope.tooltipStaging = 'Staging status: Error';
              $scope.iconGlobal = 'glyphicon-remove text-danger';
              $scope.tooltipGlobal = 'Global status: Error';
              $scope.stopRefresh();
            });
        };

        $scope.$on('$destroy', function () {
          $scope.stopRefresh();
        });

        $scope.$watch('ngId', function (newValue) {
          if (!newValue) {
            return;
          }
          domainId = newValue;
          $scope.fetchStatus(newValue);
        });
      }
    };
  }
})();
