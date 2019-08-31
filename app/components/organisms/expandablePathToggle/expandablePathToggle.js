'use strict';

angular.module('Qanairy.ExpandablePathToggle', [])
.directive("expandablePathToggle",['$mdDialog', function($mdDialog){
  return{
    restrict: 'E',
    controller: function($scope){
      $scope.current_path_idx = 0;

      $scope.next = function() {
        console.log($scope.path);
        $scope.preview_path = $scope.path;
        console.log("path_index :: "+ Object.keys($scope.path));

        console.log("getting next "+$scope.path);

        $scope.pathIdx = $scope.pathIdx + 1;
        if($scope.pathIdx >= $scope.path.length){
          $scope.pathIdx = 0;
        }
        $scope.current_path_idx = $scope.pathIdx;
      }

      $scope.previous = function() {
        console.log("getting previous");
        $scope.pathIdx -= 1;
        if($scope.pathIdx < 0){
          $scope.pathIdx = $scope.path.length - 1;
        }
        $scope.current_path_idx = $scope.pathIdx;
      }

      $scope.openPathSlider = function(path) {
        $scope.path = path;
        $scope.preview_path = path;
        console.log("opening path slider :: "+path);
          //add result to end of path

        //create object consisting of a page and it's list of interactions
        //iterate over path and combine elements and actions into single object named interaction

        // $scope.preview_path = path;
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
    },
    link: function($scope, element) {
      $scope.getOutlineStyle = function(element_state, index, page, page_idx){
        console.log('Page idx  :  '+page_idx);
        //var parent_elem =  angular.element( document.querySelector("#testthingy"));
        var parent_elem = element.children().eq(1);
        var scale_height = parent_elem.height()/page.viewportHeight;
        var scale_width = parent_elem.width()/page.viewportWidth;
/*
        console.log("parent element   ::   "+Object.keys(parent_elem));
        console.log("parent height   :::   "+parent_elem.height());
        console.log("parent width   :::   "+parent_elem.width());
        console.log("page height ::: "+page.viewportHeight);
        console.log("page width  ::  "+page.viewportWidth);
        console.log("scale height ::: "+scale_height);
        console.log("scale width  ::  "+scale_width);
        console.log("element state y :: "+element_state.element.ylocation);
        console.log("element state x :: "+element_state.element.xlocation);
        //add outline styling object to elements
        console.log("path idx :: "+$scope.pathIdx);
*/
        return {
          top: element_state.element.ylocation * scale_width,
          left: element_state.element.xlocation * scale_width,
          width: element_state.element.width * scale_width,
          height: element_state.element.height * scale_width
        };
      }

      for(var i=0; i < $scope.preview_path.length; i++){
        console.log("preview path in element state outline directive :   "+JSON.stringify($scope.preview_path[i]));
        for(var j=0; j < $scope.preview_path[i].interactions.length; j++ ){
          console.log("interaction0 :: "+JSON.stringify($scope.preview_path[i].interactions[j]) );
          $scope.preview_path[i].interactions[j].outline = $scope.getOutlineStyle($scope.preview_path[i].interactions[j], j, $scope.preview_path[i].page, i);
          console.log("interaction1    :: "+JSON.stringify($scope.preview_path[i].interactions[j]) );
        }
      }
    },
    scope: {
      path: '=',
      pathIdx: '='
    },
    transclude: true,
    templateUrl: 'components/organisms/expandablePathToggle/path_toggle_panel.html'
  }

}])
