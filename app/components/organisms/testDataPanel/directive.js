'use strict';

angular.module('Qanairy.TestDataPanel', ['ng-split', 'Qanairy.PathPanel'])
.directive("testDataPanel",function(){
  return{
    restrict: 'E',
    controller: ['$rootScope', '$scope', 'store', '$mdDialog', 'Test', 'segment', function($rootScope, $scope, store, $mdDialog, Test, segment){
      $scope.current_node = {};
      $scope.current_baseline_node = {};
      $scope.path = [];
      $scope.test = {};
      $scope.errors = [];
      $scope.test_baseline = [];
      $scope.editTest = function(test){
        test.show_test_name_edit_field = true;
      };
      $scope.domain_url = store.get("domain").url

      $scope.openPathSlider = function() {
        $scope.path = $scope.convertToIterativePath($scope.path_objects);

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
               };
            }
         });
      };

      $scope.translateObjectType = function(type){
        if(type === "PageState"){
          return "Page";
        }
        else if(type === "ElementState"){
          return "Element";
        }
        return type;
      };

      $scope.visible_test_nav1 = 'section-linemove-1';

      $scope.setCurrentNode = function(node){
        $scope.current_node = node;
      };

      $scope.setBaselineCurrentNode = function(node){
        $scope.current_baseline_node = node;
      };

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
      };

      $scope.getSecondToLastTest = function(test){
        //get last passing test from test records
        var last_passing_record = null;


        for(var idx = test.length-1; idx >= 0; idx--){
          if(test.records[idx].status === "PASSING"){
            last_passing_record = test.records[idx];
            break;
          }
        }

        if(!last_passing_record){
          last_passing_record = test.records[test.records.length-1];
        }
        var baseline_path = $scope.retrievePathObjectsUsingKeys(last_passing_record.pathKeys);
        baseline_path.push(last_passing_record.result);
        return baseline_path;
      };

      $scope.toggleTestDataVisibility = function(test){
        $scope.test = test;
        $scope.visible_browser_screenshot = $scope.default_browser;

        $scope.path_objects = $scope.retrievePathObjectsUsingKeys(test.pathKeys);
        $scope.setCurrentNode($scope.path_objects[0]);
      };

      $scope.cancelEditingTestName = function(test){
        test.show_test_name_edit_field = false;
      };

      $scope.setTestName = function(new_name){
        $scope.test.show_waiting_icon = true;
        Test.updateName({key: $scope.test.key, name: new_name, url: $scope.domain_url}).$promise
          .then(function(data){
            $scope.test.show_waiting_icon = false;
            $scope.test.show_test_name_edit_field=false;
            $scope.test.name = new_name;
          })
          .catch(function(err){
            $scope.test.show_waiting_icon = false;
            $scope.test.show_test_name_edit_field = false;
            if(err.data){
              $scope.errors.push("An error occurred while trying to update the test name");          }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }

          });
      };

      $scope.getScreenshot = function(record){
        var browser_idx = 0;
        for(var i=0; i < record.result.screenshots.length; i++){
          if(record.result.screenshots[i].browser === "firefox"){
            browser_idx = i;
            break;
          }
        }
        $scope.openPageModal(record.result.screenshots[browser_idx].screenshotUrl);
      };

      $scope.getPathObject = function(key){
        var path_objects = store.get('path_objects').filter(function( path_object ){
          return path_object.key === key;
        });
        return path_objects[0];
      };

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
      };

      $scope.loadPageInteraction = function(interaction){
        var page_interaction = {};
        page_interaction.page = interaction;
        page_interaction.page_key = interaction.key;
        page_interaction.interactions = [];
        return page_interaction;
      };

      //EVENTS
      $scope.$on("updateCurrentTest", function(event, test){
        $scope.test = test;
        $scope.test_baseline = $scope.getSecondToLastTest(test);

        //iterate over keys and load path PathObjects
        var path_objects = $scope.retrievePathObjectsUsingKeys(test.pathKeys);
        if(path_objects[path_objects.length-1].type !== "PageState"){
          path_objects.push(test.result);
        }

        $scope.path_objects = path_objects;
        $scope.pathIdx = 0;
        $scope.path = $scope.convertToIterativePath($scope.path_objects);
        $scope.last_test_record_path = $scope.convertToIterativePath($scope.test_baseline);
        $scope.current_node = path_objects[0];
        $scope.current_baseline_node = $scope.test_baseline;
      });

      $scope.addGroup = function(test, group){
        if(!group.name.length){
           $scope.errors.push("Group name cannot be empty");
           return;
        }
        Test.addGroup({name: group.name,
                       description: group.description,
                       key: test.key,
                       url: $scope.domain_url
                }).$promise
                .then(function(data){
                   group.name = null;
                   test.groups.push(data);
                 })
                 .catch(function(err){
                   if(err.data){
                     $scope.errors.push({message:"An error occurred while adding group"});
                   }
                   else{
                     $scope.errors.push({message: $scope.unresponsive_server_err });
                   }
                 });

         segment.track("Added Group", {
           group_key: group.key,
           test_key: test.key,
           success : !$scope.errors.length
         }, function(success){});
      };

      $scope.removeGroup = function(test, group, $index){
        Test.removeGroup({group_key: group.key, test_key: test.key}).$promise
          .then(function(data){
            test.groups.splice($index,1);
          })
          .catch(function(err){
            if(err.data){
              $scope.errors.push({message:"An error occurred while removing group"});
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }
          });
      };
    }],
    scope: {},
    transclude: true,
    templateUrl: 'components/organisms/testDataPanel/test_data_panel.html'
  };
});
