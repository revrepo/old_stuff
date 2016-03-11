(function () {
  'use strict';

  angular
    .module('revapm.Portal.Resources')
    .factory('Users', UsersResource);

  /*@ngInject*/
  function UsersResource(Resource, $config) {

    return Resource($config.API_URL + '/users/:id', {id: '@user_id'});
  };
})();
