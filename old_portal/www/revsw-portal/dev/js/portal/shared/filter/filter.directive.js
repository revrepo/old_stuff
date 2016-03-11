(function () {
  'use strict';

  angular
    .module('revapm.Portal.Shared')
    .directive('listFilter', listFilterDirective);

  /*@ngInject*/
  function listFilterDirective() {
    return {
      restrict: 'AE',
      template: '<form class="form-inline">' +
      '<div class="form-group">' +
      '<label for="search">Search:&nbsp;</label>' +
      '<input type="text" class="form-control" id="search" placeholder="" ng-model="quickFilter" ng-change="checkFilterPage()">' +
      '&nbsp;&nbsp;<i class="glyphicon glyphicon-remove" ng-show="quickFilter != \'\'" ng-click="quickFilter = \'\'"></i>' +
      '</div>' +
      '</form>'
    };
  };
})();
