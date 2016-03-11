(function () {
  'use strict';

  angular.module('revapm.Portal', [
    'revapm.Portal.Auth',
    'revapm.Portal.Profile',
    'revapm.Portal.Users',
    'revapm.Portal.Domains',
    'revapm.Portal.Companies',
    'revapm.Portal.Cache',
    'revapm.Portal.Reports',
    'revapm.Portal.Keys',
    'ui.router',
    'ui.bootstrap.tpls',
    'ui.bootstrap.tooltip',
    'ui.bootstrap.popover'
  ]);

})();
