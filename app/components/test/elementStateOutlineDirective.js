'use strict';

angular.module('Qanairy.ElementStateOutline', [])
.directive("elementOutline",function(){
  return{
    restrict: 'E',
    controller: function($scope){
      console.log($scope.path);
      $scope.preview_path = $scope.path;
      console.log("path_index :: "+$scope.pathIdx)

      $scope.next = function() {
        $scope.pathIdx = $scope.pathIdx + 1;
        if($scope.pathIdx >= $scope.preview_path.length){
          $scope.pathIdx = 0;
        }
      }

      $scope.previous = function() {
        $scope.pathIdx -= 1;
        if($scope.pathIdx < 0){
          $scope.pathIdx = $scope.preview_path.length - 1;
        }
      }
      $scope.getOutlineStyle = function(element, index, page){
        var parent_elem = $('#interaction'+index);
        var scale_height = parent_elem.height()/page.viewportHeight;
        var scale_width = parent_elem.width()/page.viewportWidth;

        return {
          'top': element.ylocation * scale_height,
          'left': element.xlocation * scale_width,
          'width': element.width * scale_width,
          'height': element.height * scale_height
        }
      }
    },
    scope: {
      path: '=',
      pathIdx: '='
    },
    transclude: true,
    templateUrl: 'components/test/path_toggle_panel.html'
  }

})
