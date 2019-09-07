'use strict';

angular.module('Qanairy.DiscoveryTestDataPanel', ['ng-split', 'Qanairy.PathPanel'])
.directive("discoveryTestDataPanel",function(){
  return{
    restrict: 'E',
    controller: ["$rootScope", "$scope", "store", function($rootScope, $scope, store){
      console.log("path :: " +  $scope.path);
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

      $scope.visible_test_nav1 = 'section-linemove-1';

      /**
       * Constructs a list of PathObjects consisting of PageState, PageElement,
       *    and Action objects currently stored in session storage
       */
      $scope.retrievePathObjectsUsingKeys = function(path_keys){
        var path_objects = [];
        for(var idx = 0; idx < path_keys.length; idx++){
          //search all elements
          var path_object  = $scope.getPathObject(path_keys[idx]);
          if(path_object != null){
             path_objects.push(path_object);
          }
        }

        return path_objects;
      }


      $scope.toggleTestDataVisibility = function(test, index){
        if($scope.test && $scope.test_idx != index){
          $scope.test.visible = false;
        }
        $scope.test_idx = index;
        $scope.test = test;
        test.visible===undefined ? test.visible = true : test.visible = !test.visible ;
        $scope.visible_browser_screenshot = $scope.default_browser;

        $scope.path_objects = $scope.retrievePathObjectsUsingKeys(test.pathKeys);
        $scope.setCurrentNode($scope.path_objects[0], 0);

        if(test.visible){
          $scope.testVerificationOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('test-verification');
          $scope.testVerificationOnboardingIndex = 0;
        }
      }


      $scope.getPathObject = function(key){
        var path_objects = store.get('path_objects').filter(function( path_object ){
          return path_object.key == key;
        });
        return path_objects[0];
      }

      $scope.convertToIterativePath = function(path_objects){
        //create object consisting of a page and it's list of interactions
        //iterate over path and combine elements and actions into single object named interaction
        var new_path = [];
        for(var i=0; i < path_objects.length; i++){
          if(path_objects[i].key.includes("pagestate") || path_objects[i].key.includes("redirect") || path_objects[i].key.includes("loadpageanimation")){
            new_path.push( $scope.loadPageInteraction(path_objects[i]));
          }
          else if(path_objects[i].key.includes("elementstate")){
            var interaction = {element: path_objects[i], action: path_objects[i+1], key: path_objects[i].key};
            //create interaction object and add it to page interactions
            new_path[new_path.length-1].interactions.push(interaction);
          }
        }
        return new_path;
      }

      $scope.loadPageInteraction = function(interaction){
        var page_interaction = {};
        page_interaction.page = interaction;
        page_interaction.page_key = interaction.key;
        page_interaction.interactions = [];
        return page_interaction;
      }

      //EVENTS
      $scope.$on("updateCurrentDiscoveryTest", function(event, test){
        console.log("update current discovery to test  :: "+JSON.stringify(test));
        //iterate over keys and load path PathObjects
        var path_objects = $scope.retrievePathObjectsUsingKeys(test.pathKeys);
        if(path_objects[path_objects.length-1].type !== "PageState"){
          path_objects.push(test.result)
        }
        $scope.path_objects = path_objects;
        $scope.pathIdx = 0;
        $scope.path = $scope.convertToIterativePath($scope.path_objects);
      });

    }],
    scope: {
      test: "=test"
    },
    transclude: true,
    templateUrl: 'components/discovery/test_data_panel.html'
  }

})
