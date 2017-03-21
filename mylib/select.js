(function() {
  'use strict';

  if (angular.element.prototype.querySelectorAll === undefined) {
    angular.element.prototype.querySelectorAll = function(selector) {
      return angular.element(this[0].querySelectorAll(selector));
    };
  }
  angular.module('tw.directives')
    .directive('twSelect',function($document) {

      function _controller($scope, $element, $timeout) {

        var ctrl = this;

        var EMPTY_SEARCH = ''; 

        ctrl.placeholder = undefined;
        ctrl.search = EMPTY_SEARCH;
        ctrl.activeIndex = 0;
        ctrl.focus=false;
        ctrl.items = [];
        ctrl.selected = undefined;
        ctrl.open = false;
        ctrl.selectCtrl=undefined;

        var _searchInput = $element.querySelectorAll('input.tw-select-search');

        // Most of the time the user does not want to empty the search input when in typeahead mode
        function _resetSearchInput() {
          ctrl.search = EMPTY_SEARCH;
        }

        function _repeateParse(expression) {
          var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

          var lhs = match[1]; // Left-hand side
          var rhs = match[2]; // Right-hand side
          var trackByExp = match[3];

          return {
            lhs: lhs,
            rhs: rhs,
            trackByExp: trackByExp
          };
        }

        // When the user clicks on tw-select, displays the dropdown list
        ctrl.activate = function() {
          _resetSearchInput();
           if(ctrl.items.length>0){
             ctrl.open = true;

              $timeout(function() {
                _searchInput[0].focus();
              });
           }
        };

        ctrl.parseRepeatAttr = function(repeatAttr) {
          var repeat=_repeateParse(repeatAttr);
          $scope.$watchCollection(repeat.rhs, function(items) {

            if (items === undefined || items === null) {
              ctrl.items = [];
            } else {
              ctrl.items = items;
            }
          });
        };

        // When the user clicks on an item inside the dropdown
        ctrl.select = function(item) {
          ctrl.selected = item;
          ctrl.close();

          if(ctrl.selectCtrl && ctrl.selectCtrl === 'country'){
             $element.data('onCountrySelect')(item.code, item.name);
          } else if(ctrl.selectCtrl && ctrl.selectCtrl == 'state'){
             $element.data('onStateSelect')(item.code, item.name);
          }
        }; 

        // Closes the dropdown
        ctrl.close = function() {
          if (ctrl.open) {
            _resetSearchInput();
            ctrl.open = false;
            $timeout(function() {
              $element.querySelectorAll('button.tw-select-match')[0].focus();
            }, 50);
          }
        };
        
        ctrl.toggle=function(e){
          if(ctrl.open){
            ctrl.close();
          } else {
            ctrl.activate();
          } 
        };

        var Key = {
          Enter: 13,
          Tab: 9,
          Up: 38,
          Down: 40,
          Escape: 27
        };

        function _onKeydown(key) {
          var processed = true;
          switch (key) {
            case Key.Down:
              if (ctrl.activeIndex < ctrl.items.length - 1) {
                ctrl.activeIndex++;
              }
              break;
            case Key.Up:
              if (ctrl.activeIndex > 0) {
                ctrl.activeIndex--;
              }
              break;
            case Key.Tab:
            case Key.Enter:
                  ctrl.select(ctrl.items[ctrl.activeIndex]);
              break;
            case Key.Escape:
              ctrl.close();
              break;
            default:
              processed = false;
          }
          return processed;
        }

        // Bind to keyboard shortcuts
        // Cannot specify a namespace: not supported by jqLite
        _searchInput.on('keydown', function(e) {
          if (ctrl.items.length > 0) {
            var key = e.which;

            $scope.$apply(function() {
              var processed = _onKeydown(key);
              if (processed) {
                e.preventDefault();
                e.stopPropagation();
              }
            });

            switch (key) {
              case Key.Down:
              case Key.Up:
                _ensureHighlightVisible();
                break;
            }
          }
        });
        
        function _ensureHighlightVisible() {
          var container = $element.querySelectorAll('.tw-select-choices-content');
          var rows = container.querySelectorAll('.tw-select-choices-row');

          var highlighted = rows[ctrl.activeIndex];
          var posY = highlighted.offsetTop + highlighted.clientHeight - container[0].scrollTop;
          var height = container[0].offsetHeight;

          if (posY > height) {
            container[0].scrollTop += posY - height;
          } else if (posY < highlighted.clientHeight) {
            container[0].scrollTop -= highlighted.clientHeight - posY;
          }
        }

        $scope.$on('$destroy', function() {
          _searchInput.off('keydown');
        });
      }

      function _link(scope, element, attrs, ctrls, transcludeFn){
        var $select = ctrls[0];
        var ngModel = ctrls[1];

          attrs.$observe('selectCtrl',function(){
            $select.selectCtrl=attrs.selectCtrl !==undefined ? attrs.selectCtrl.trim(): undefined;
          });

          scope.$watch('$select.selected', function(newValue, oldValue) {
            if (ngModel.$viewValue !== newValue) {
              ngModel.$setViewValue(newValue);
            }
          });
          
          $document.on('mousedown', function(e) {
                var contains = false;
        
                if (window.jQuery) {
                  // Firefox 3.6 does not support element.contains()
                  // See Node.contains https://developer.mozilla.org/en-US/docs/Web/API/Node.contains
                  contains = window.jQuery.contains(element[0], e.target);
                } else {
                  contains = element[0].contains(e.target);
                }
        
                if (!contains) {
                  $select.close();
                  scope.$digest();
                }
              });
          
          scope.$on('$destroy', function() {
            $document.off('mousedown');
          });

          transcludeFn(scope, function(clone) {
            var transcluded = angular.element('<div>').append(clone);
            var transcludedMatch = transcluded.querySelectorAll('.tw-select-match');
            element.querySelectorAll('.tw-select-match').replaceWith(transcludedMatch);

            var transcludedChoices = transcluded.querySelectorAll('.tw-select-choices');
            element.querySelectorAll('.tw-select-choices').replaceWith(transcludedChoices);
          });    
      }
      return {
        restrict: 'EA',
        template: '<div class="selectize-control"> <div class="selectize-input" ng-class="{\'focus\': $select.open,\'selectize-focus\':$select.focus}" ng-click="$select.activate()"> <div class="tw-select-match"></div> <input type="text" autocomplete="off" tabindex="" class="tw-select-search input-light-simple theme-separator-strokes" placeholder="{{$select.placeholder}}" ng-model="$select.search" ng-hide="$select.selected && !$select.open"> <svg class="icon-svg theme-primary-color dropdown-toogle-arrow icon-svg-tiny"><title>dropdown</title><use xlink:href="#_-s"></use></svg></div> <div class="tw-select-choices"></div> </div>',
        replace: true,
        transclude: true,
        require: ['twSelect', 'ngModel'],
        scope: true,

        controller: _controller,
        controllerAs: '$select',

        link: _link
      };
      }
    )

    .directive('twChoices', function() {
        return {
          restrict: 'EA',
          require: '^twSelect',
          replace: true,
          transclude: true,
          template: '<div ng-show="$select.open" class="tw-select-choices selectize-dropdown"> <div class="tw-select-choices-content selectize-dropdown-content" ng-transclude></div> </div>',
          link: function(scope, element, attrs, $select) {
                  $select.parseRepeatAttr(attrs.repeat);

                  scope.$watch('$select.search', function() {
                    $select.activeIndex = 0;
                  });
                }
        };
      }
    )

    .directive('twMatch', function() {
      return {
        restrict: 'EA',
        require: '^twSelect',
        replace: true,
        transclude: true,
        template: '<button ng-hide="$select.open" class="tw-select-match btn-simple theme-separator-strokes theme-inactive" ng-transclude></button>',
        link: function(scope, element, attrs, $select) {

          attrs.$observe('placeholder', function(placeholder) {
            $select.placeholder = placeholder !== undefined ? placeholder : '';
          });
        } 
      };
    })

    .filter('highlight', function() {
      function escapeRegexp(queryToEscape) {
        return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
      }

      return function(matchItem, query) {
        return query ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<span class="tw-select-highlight">$&</span>') : matchItem;
      };
    });
}());