'use strict';

angular.module('Qanairy.ExpandablePathComparisonToggle', [])
.directive("expandablePathComparisonToggle",['$mdDialog', '$timeout', function($mdDialog, $timeout){
  return{
    restrict: 'E',
    controller: function($scope, $element, store){
      $scope.next = function() {
        $scope.pathIdx = $scope.pathIdx + 1;
        if($scope.pathIdx >= $scope.path.length){
          $scope.pathIdx = 0;
        }
        $scope.setCurrentNode($scope.path[$scope.pathIdx].page);
        $scope.setBaselineCurrentNode($scope.last_test_record_path[$scope.pathIdx].page);
      }

      $scope.previous = function() {
        console.log("getting previous");
        $scope.pathIdx -= 1;
        if($scope.pathIdx < 0){
          $scope.pathIdx = $scope.path.length - 1;
        }
        $scope.setCurrentNode($scope.path[$scope.pathIdx].page);
        $scope.setBaselineCurrentNode($scope.last_test_record_path[$scope.pathIdx].page);
      }

      $scope.openPathSlider = function(path) {
        $scope.path = path;
        console.log("opening path slider :: "+path);
          //add result to end of path

        //create object consisting of a page and it's list of interactions
        //iterate over path and combine elements and actions into single object named interaction
          $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            templateUrl: "components/test/page_modal.html",
            controller: function DialogController($scope, $mdDialog) {
               $scope.closeDialog = function() {
                  $mdDialog.hide();
               }
            }
         });
      };

      $scope.generateElementOutline = function(page, element){
        return buildElementOutlineStyle(page, element);
      };

      function buildElementOutlineStyle(page, element){
        var elem = angular.element(document.getElementById('expandable'+page.key));
        if($scope.width !== elem.width() && elem.width() !== 0){
          $scope.width = elem.width();
        }
        if($scope.height !== elem.height() && elem.height() !== 0){
          $scope.height = elem.height();
        }

        var scale_height = $scope.height/page.viewportHeight;
        var scale_width = $scope.width/page.viewportWidth;

        if(scale_height === 0){
          scale_height = scale_width;
        }

        var element_width = element.width * scale_width;
        var element_height = element.height * scale_height;

        var x_offset = (element.xlocation - page.scrollXOffset) * scale_width;
        var y_offset = (element.ylocation - page.scrollYOffset) * scale_height;
        var outline_style = "top: "+ y_offset +"px;left: "+ x_offset +"px; width: "+ element_width +"px; height:"+ element_height +"px";
        return outline_style;
      };
    },
    link: function($scope, element) {

    },
    scope: false,
    transclude: true,
    templateUrl: 'components/organisms/expandablePathComparisonToggle/path_comparison.html'
  }

}])
