'use strict';

angular.module('Qanairy.ElementStateOutline', [])
.directive("elementOutline",function(){
  return{
    restrict: 'E',
    controller: function($scope){
      $scope.next = function() {
        console.log("getting next");
        $scope.pathIdx = $scope.pathIdx + 1;
        if($scope.pathIdx >= $scope.path.length){
          $scope.pathIdx = 0;
        }
      }

      $scope.previous = function() {
        console.log("getting previous");
        $scope.pathIdx -= 1;
        if($scope.pathIdx < 0){
          $scope.pathIdx = $scope.path.length - 1;
        }
      }
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

      for(var i=0; i < $scope.path.length; i++){
        console.log("preview path in element statel :   "+JSON.stringify($scope.path[i]));
        for(var j=0; j < $scope.path[i].interactions.length; j++ ){
          console.log("interaction0 :: "+JSON.stringify($scope.path[i].interactions[j]) );
          $scope.path[i].interactions[j].outline = $scope.getOutlineStyle($scope.path[i].interactions[j], j, $scope.path[i].page, i);
          console.log("interaction1    :: "+JSON.stringify($scope.path[i].interactions[j]) );
        }
      }
    },
    scope: {
      path: '=',
      pathIdx: '='
    },
    transclude: true,
    templateUrl: 'components/organisms/nonExpandablePathToggle/path_toggle_panel.html'
  }

})
