'use strict';

angular.module('Qanairy.DiscoveryTestDataPanel', ['ng-split'])
.directive("discoveryTestDataPanel",function(){
  return{
    restrict: 'E',
    controller: function($scope){
      $scope.openPathSlider = function(path, current_node_idx) {
        $scope.path = path;
        $scope.current_idx = current_node_idx;
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

      $scope.translateObjectType = function(type){
        if(type == "PageState"){
          return "Page";
        }
        else if(type == "ElementState"){
          return "Element";
        }
        return type;
      }
    },
    scope: false,
    transclude: true,
    templateUrl: 'components/discovery/test_data_panel.html'
  }

})
