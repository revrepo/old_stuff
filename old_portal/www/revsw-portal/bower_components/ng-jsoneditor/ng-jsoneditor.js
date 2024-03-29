(function () {
  var module = angular.module('ng.jsoneditor', []);
  module.constant('ngJsoneditorConfig', {});

  module.directive('ngJsoneditor', ['ngJsoneditorConfig', '$timeout', function (ngJsoneditorConfig, $timeout) {
    var defaults = ngJsoneditorConfig || {};

    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {'options': '=', 'ngJsoneditor': '=', 'preferText': '='},
      link: function ($scope, element, attrs, ngModel) {
        var debounceTo, debounceFrom;
        var editor;
        var internalTrigger = false;
        var init = false;

        if (!angular.isDefined(window.JSONEditor)) {
          throw new Error("Please add the jsoneditor.js script first!");
        }

        function _createEditor(options) {
          var settings = angular.extend({}, defaults, options);
          var theOptions = angular.extend({}, settings, {
            change: function () {
              if (typeof debounceTo !== 'undefined') {
                $timeout.cancel(debounceTo);
              }

              debounceTo = $timeout(function () {
                if (editor) {
                  internalTrigger = true;
                  ngModel.$setViewValue($scope.preferText === true ? editor.getText() : editor.get());
                  internalTrigger = false;

                  if (settings && settings.hasOwnProperty('change')) {
                    settings.change();
                  }
                }
              }, settings.timeout || 100);
            }
          });

          element.html('');

          var instance = new JSONEditor(element[0], theOptions);

          if ($scope.ngJsoneditor instanceof Function) {
            $timeout(function () { $scope.ngJsoneditor(instance);});
          }

          return instance;
        }

        $scope.$watch('options', function (newValue, oldValue) {
          for (var k in newValue) {
            if (newValue.hasOwnProperty(k)) {
              var v = newValue[k];

              if (newValue[k] !== oldValue[k]) {
                if (k === 'mode') {
                  mode = v;
                  editor.setMode(v);
                } else if (k === 'name') {
                  editor.setName(v);
                } else { //other settings cannot be changed without re-creating the JsonEditor
                  editor = _createEditor(newValue);
                  $scope.updateJsonEditor();
                  return;
                }
              }
            }
          }
        }, true);

        $scope.$on('$destroy', function () {
          //remove jsoneditor?
        });

        $scope.updateJsonEditor = function (newValue) {
          if (internalTrigger) return; //ignore if called by $setViewValue

          if (typeof debounceFrom !== 'undefined') {
            $timeout.cancel(debounceFrom);
          }

          debounceFrom = $timeout(function () {
            if (($scope.preferText === true) && !angular.isObject(ngModel.$viewValue)) {
              editor.setText(ngModel.$viewValue || '{}');
            } else {
              editor.set(ngModel.$viewValue || {});
            }

            if (!init) {
              init = true;

              if ($scope.options.hasOwnProperty('expanded') && (!$scope.options.mode || (/^(tree|view)$/i.test($scope.options.mode)))) { //default mode is tree
                editor[$scope.options.expanded ? 'expandAll' : 'collapseAll']();
              }
            }
          }, $scope.options.timeout || 10);
        };

        editor = _createEditor($scope.options);

        ngModel.$render = $scope.updateJsonEditor;
        $scope.$watch(function () { return ngModel.$modelValue; }, $scope.updateJsonEditor, true); //if someone changes ng-model from outside
      }
    };
  }]);
})();
