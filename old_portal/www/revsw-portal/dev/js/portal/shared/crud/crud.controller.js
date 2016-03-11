(function () {
  'use strict';

  angular
    .module('revapm.Portal.Shared')
    .factory('CRUDController', CRUDController);

  /*@ngInject*/
  function CRUDController($window, $config, AlertService, $q, User, $anchorScroll, $modal) {

    function CRUDControllerImpl($scope, $stateParams) {

      /***************************************************************************************
       *****                           VARIABLES INITIALIZATION SECTION
       **************************************************************************************/

      $scope.auth = User;

      /**
       * Alert service
       */
      $scope.alertService = AlertService;

      /**
       * Loading flag
       *
       * @access private
       * @type {boolean}
       */
      $scope._loading = false;

      /**
       * Current state
       *
       * @type {string}
       */
      $scope.state = '';

      /**
       * List of routing params
       */
      $scope.params = $stateParams;

      /**
       * Resource that will be used for work with data
       * @type {object|null}
       */
      $scope.resourse = null;

      /**
       * List of loaded records
       *
       * @type {Array}
       */
      $scope.records = [];

      /**
       * Selected model
       * @type {object|null}
       */
      $scope.model = null;

      /**
       * Filter field value
       * @type {string}
       */
      $scope.quickFilter = '';

      /**
       * List of fields that not allowed
       * @type {Array}
       */
      $scope.deniedFields = [];

      /**
       * Page settings
       *
       * @type {object}
       */
      $scope.page = {
        hasPrevPage: false,
        hasNextPage: true,
        current: 1,
        pages: [1]
      };

      /**
       * Filters to make pagination
       *
       * @type {object}
       */
      $scope.filter = {
        limit: 25,
        skip: 0,
        predicate: '',
        reverse: false
      };

      /***************************************************************************************
       *****                       END VARIABLES INITIALIZATION SECTION
       **************************************************************************************/

      /***************************************************************************************
       *****                       MODAL INITIALIZATION SECTION
       **************************************************************************************/

      /**
       * onfirmation dialog
       *
       * @param {string=} [template]
       * @param {Object=} [resolve]
       * @returns {*}
       */
      $scope.confirm = function (template, resolve) {
        if (angular.isObject(template)) {
          resolve = template;
          template = '';
        }
        if (angular.isObject(resolve)) {
          resolve = {
            model: resolve
          };
        }
        var modalInstance = $modal.open({
          animation: true,
          templateUrl: template || 'parts/modal/confirmDelete.html',
          controller: 'ConfirmModalInstanceCtrl',
          size: 'md',
          resolve: resolve || {}
        });

        return modalInstance.result;
      };

      /***************************************************************************************
       *****                       END MODAL INITIALIZATION SECTION
       **************************************************************************************/

      /**
       * Getter and setter for {@link $scope._loading} property
       *
       * @param {boolean?} [loading]
       * @returns {boolean}
       */
      $scope.loading = function (loading) {
        if (angular.isUndefined(loading)) {
          return $scope._loading;
        }
        $scope._loading = Boolean(loading);
      };

      /**
       * Set {@link $scope.state} property
       *
       * @param {string} state
       */
      $scope.setState = function (state) {
        if (!state) {
          throw new Error('Wrong state provided.');
        }
        $scope.state = state;
      };

      /**
       * Clear quick filter value
       *
       * @param {string=} [filter] filter to clear otherwise {@link $scope.quickFilter} will be cleared
       */
      $scope.clearQuickFilter = function (filter) {
        if (filter) {
          filter = '';
        } else {
          $scope.quickFilter = '';
        }
      };

      /**
       * Clears model record.
       *
       * @param {object=} [model]
       */
      $scope.clearModel = function (model) {
        if (!model) {
          model = $scope.model;
        }
        angular.forEach(model, function (val, key) {
          model[key] = '';
        });
        model = null;
      };

      /**
       * Will remove all elements from array of records.
       */
      $scope.clearList = function () {
        $scope.records.splice(0, $scope.records.length);
      };

      /**
       * Set resource for future using
       *
       * @param {object} resource
       */
      $scope.setResource = function (resource) {
        $scope.resource = resource;
      };

      /**
       * Set fields that not allowed
       *
       * @param {Array} fields
       */
      $scope.setDeniedFields = function (fields) {
        if (!angular.isArray(fields)) {
          return;
        }
        $scope.deniedFields = fields;
      };

      /**
       * Scroll page to top
       */
      $scope.scrollTop = function() {
        $anchorScroll('top');
      };

      /**
       * Order by some field
       *
       * @param {string} predicate
       */
      $scope.order = function(predicate) {
        $scope.filter.reverse = ($scope.filter.predicate === predicate) ? !$scope.filter.reverse : false;
        $scope.filter.predicate = predicate;
      };

      /**
       * Check if user is not on the 1st page. he will be send there.
       */
      $scope.checkFilterPage = function() {
        if ($scope.filter.skip > 0) {
          $scope.goToPage(1);
        }
      };

      /***************************************************************************************
       *****                             PAGINATION SECTION
       **************************************************************************************/

      /**
       * This method will check if next page is available and prev one.
       *
       * @private
       */
      $scope._checkPagination = function () {
        if ($scope.records.length < ($scope.filter.limit + $scope.filter.skip)) {
          $scope.page.hasNextPage = false;
        } else {
          $scope.page.hasNextPage = true;
        }
        if ($scope.filter.skip > 0) {
          $scope.page.hasPrevPage = true;
        } else {
          $scope.page.hasPrevPage = false;
        }
        var pages = Math.ceil($scope.records.length / $scope.filter.limit);
        $scope.page.pages.splice(0, $scope.page.pages.length);
        for (var i = 1; i <= pages; i++) {
          $scope.page.pages.push(i);
        }
        $scope.page.current = Math.ceil($scope.filter.skip / $scope.filter.limit) + 1;
      };

      /**
       * Load next records
       */
      $scope.nextPage = function () {
        if (!$scope.page.hasNextPage) {
          return;
        }
        if($scope.page.current === $scope.page.pages.length){
          return;
        }
        $scope.filter.skip += $scope.filter.limit;
        $scope._checkPagination();
        $scope.scrollTop();
      };

      /**
       * Load prev records
       */
      $scope.prevPage = function () {
        if (!$scope.page.hasPrevPage) {
          return;
        }
        $scope.filter.skip -= $scope.filter.limit;
        if ($scope.filter.skip < 0) {
          $scope.filter.skip = 0;
        }
        $scope._checkPagination();
        $scope.scrollTop();
      };

      /**
       * List of pages
       *
       * @param {number} page
       */
      $scope.goToPage = function(page) {
        if ($scope.page.current == page) {
          return;
        }
        $scope.page.current = page;
        $scope.filter.skip = (page * $scope.filter.limit) - $scope.filter.limit;
        $scope._checkPagination();
        $scope.scrollTop();
      };

      /***************************************************************************************
       *****                                  END PAGINATION SECTION
       **************************************************************************************/


      /***************************************************************************************
       *****                                  BASE ACTIONS SECTION
       **************************************************************************************/


      /**
       * Loads list of models
       *
       * @see $scope#_checkPagination()
       * @throws Error is not {@link $scope.resource} provided
       * @returns {Promise}
       */
      $scope.list = function () {
        if (!$scope.resource) {
          throw new Error('No resource provided.');
        }
        $scope.loading(true);
        //fetching data
        return $scope.resource
          .query(function (data) {
            $scope.records = data;
            $scope._checkPagination();
            return data; // Send data to future promise
          }).$promise
          .finally(function () {
            $scope.loading(false);
          });
      };

      /**
       * Delete a model from list
       *
       * @throws Error if not {@link $scope.resource} provided
       * @param {object} model
       */
      $scope.delete = function (model) {
        if (!model) {
          return;
        }
        if (!angular.isFunction(model.$remove)) {
          throw new Error('Wrong model provided.');
        }
        // loading model
        model.loading = true;
        // Could be removed using $resource
        return model.$remove()
          .then(function (data) {
            var idx = $scope.records.indexOf(model);
            if (data.statusCode == $config.STATUS.OK) {
              $scope.records.splice(idx, 1);
            }
            return data;
          })
          .finally(function () {
            model.loading = false;
          });
      };

      /**
       * Create a new record
       *
       * @throws Error
       * @param {object} model
       * @returns {Promise}
       */
      $scope.create = function (model) {
        if (!$scope.resource) {
          throw new Error('No resource provided.');
        }
        $scope.alertService.clear();
        $scope.loading(true);
        var record = new $scope.resource(model);
        return record.$save()
          .then(function (data) {
            $scope.list(); // Update list
            $scope.clearModel(model);
            return data; // Send data next to promise handlers
          })
          .catch(function (data) {
            if (data.status == $config.STATUS.BAD_REQUEST) {
              if (data.data && data.data.message) {
                $scope.alertService.danger(data.data.message, 5000);
              }
            }
            return $q.reject(data);
          })
          .finally(function () {
            $scope.loading(false);
          });
      };

      /**
       * Load details about record
       *
       * @param {string|number} id
       * @returns {Promise}
       */
      $scope.get = function (id) {
        if (!$scope.resource) {
          throw new Error('No resource provided.');
        }
        $scope.clearModel();
        $scope.alertService.clear();
        $scope.loading(true);
        return $scope.resource
          .get({id: id})
          .$promise
          .then(function (record) {
            $scope.model = record;
            return record;
          })
          .finally(function () {
            $scope.loading(false);
          });
      };

      /**
       * Update model data
       *
       * @param {object} [params]
       * @param {object} model
       * @returns {Promise}
       */
      $scope.update = function (params, model) {
        if (angular.isObject(params) && !model) {
          model = params;
          params = undefined;
        }
        var id = model.id;
        if (!params) {
          params = {id: id};
        }
        angular.forEach($scope.deniedFields, function (val) {
          if (model[val]) {
            delete model[val];
          }
        });

        $scope.alertService.clear();
        $scope.loading(true);
        // Send data
        return $scope.resource
          .update(params, model)
          .$promise
          .then(function (data) {
            $scope.list(); // Update list
            $scope.$emit('list');
            return data;
          })
          .finally(function () {
            $scope.loading(false);
          });
      };

      $scope.$on('list', function() {
        $scope.list();
      });

      /***************************************************************************************
       *****                             END BASE ACTIONS SECTION
       **************************************************************************************/

    };

    return CRUDControllerImpl;
  };
})();
