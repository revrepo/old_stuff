(function () {
  'use strict';

  angular
    .module('revapm.Portal')
    .run(runApp);

  /*@ngInject*/
  function runApp($rootScope, AlertService) {
    $rootScope.$on('$stateChangeStart',
      function(event){
        // Clear alerts when routes change
        AlertService.clear();
      });
  };
})();
