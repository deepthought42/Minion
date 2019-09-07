'use strict';

angular.module('Qanairy.ExpandablePathToggle', [])
.directive("expandablePathToggle",['$mdDialog', '$timeout', function($mdDialog, $timeout){
  return{
    restrict: 'E',
    controller: function($scope){
      $scope.current_path_idx = 0;

      console.log("current node key  ::  "+$scope.current_node.key);
      $scope.next = function() {
        $scope.pathIdx = $scope.pathIdx + 1;
        if($scope.pathIdx >= $scope.path.length){
          $scope.pathIdx = 0;
        }
        $scope.current_node = $scope.path[$scope.pathIdx].page;

        $scope.current_path_idx = $scope.pathIdx;
      }

      $scope.previous = function() {
        console.log("getting previous");
        $scope.pathIdx -= 1;
        if($scope.pathIdx < 0){
          $scope.pathIdx = $scope.path.length - 1;
        }
        $scope.current_node = $scope.path[$scope.pathIdx].page;
        $scope.current_path_idx = $scope.pathIdx;
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
        console.log("generating new outline for element :: "+page.key);
        console.log("generating new outline for element :: "+element.key);
        var elem = angular.element(document.getElementById('expandable'+page.key));
        console.log("element :: "+Object.keys(elem));
        var width = elem.width();
        var height = elem.height();
        var scale_height = height/page.viewportHeight;
        var scale_width = width/page.viewportWidth;

        if(scale_height === 0){
          scale_height = scale_width;
        }

        var element_width = element.width * scale_width;
        var element_height = element.height * scale_height;

        var x_offset = (element.xlocation - page.scrollXOffset) * scale_width;
        var y_offset = (element.ylocation - page.scrollYOffset) * scale_height;
        console.log("parent height   :::   "+height);
        console.log("parent width   :::   "+width);
        console.log("page height ::: "+page.viewportHeight);
        console.log("page width  ::  "+page.viewportWidth);
        console.log("scale height ::: "+scale_height);
        console.log("scale width  ::  "+scale_width);
        console.log("element state y :: "+x_offset);
        console.log("element state x :: "+y_offset);
        console.log("page state y :: "+page.scrollXOffset);
        console.log("page state x :: "+page.scrollYOffset);

        return "top: "+ y_offset +"px;left: "+ x_offset +"px; width: "+ element_width +"px; height:"+ element_height +"px";
      }
    },
    link: function($scope, element) {
    },
    scope: false,
    transclude: true,
    templateUrl: 'components/organisms/expandablePathToggle/path_toggle_panel.html'
  }

}])
