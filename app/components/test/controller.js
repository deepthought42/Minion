'use strict';

angular.module('Qanairy.tests', ['Qanairy.TesterService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.tests', {
    url: '/tests',
    templateUrl: 'components/test/index.html',
    controller: 'TesterIndexCtrl'
  });
}])

.controller('TesterIndexCtrl', ['$rootScope', '$scope', '$interval', 'Tester', 'store', '$state', '$mdDialog',
  function($rootScope, $scope, $interval, Tester, store, $state, $mdDialog) {
    $scope._init= function(){
      $('[data-toggle="tooltip"]').tooltip()
      $scope.errors = [];
      $scope.tests = [];
      $scope.groups = [];
      $scope.group = {name: "", description: "" };
      $scope.node_key = "";
      $scope.current_node = [];
      $scope.filteredTests = [];
      $scope.test_idx = -1;
      if(store.get('domain')){
        $scope.default_browser = store.get('domain')['discoveryBrowser'];
        $scope.getTestsByUrl(store.get('domain').url);
      }
    }

    $scope.setCurrentNodeKey = function(key){
      $scope.node_key=key;
    }

    $scope.getTestsByUrl = function(url) {
      $scope.waitingOnTests = true;
      Tester.query({url: url}).$promise
        .then(function(data){
          $scope.tests = data;
          $scope.waitingOnTests = false;
        })
        .catch(function(err){
          $scope.tests = [];
          $scope.errors.push(err);
          $scope.waitingOnTests = false;
        });

      Tester.getGroups({url: url}).$promise
        .then(function(data){
          $scope.groups = data;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    };

    $scope.getTestByName = function(name) {
      Tester.query({name: name}).$promise
        .then(function(data){
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    };

    $scope.updateTestCorrectness = function(test, browser, correctness){
      Tester.updateCorrectness({key: test.key, browser: browser, correct: correctness}).$promise
        .then(function(data){
          test.browserPassingStatuses = data.browserPassingStatuses;
          $rootScope.$broadcast("updateFailingCnt");
          test.correct = data.correct;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    }

    $scope.runTest = function(firefox_selected, chrome_selected){
      $scope.keys = [];
      $scope.keys.push($scope.test.key);
      $scope.test.runStatus = true;
      var browsers = [];

      if(firefox_selected){
        browsers.push("firefox");
      }

      if(chrome_selected){
        browsers.push("chrome");
      }

      for(var i=0; i < browsers.length; i++){

        Tester.runTests({test_keys: $scope.keys, browser_type: browsers[i]}).$promise
          .then(function(data){
            $scope.closeDialog();

            $scope.test.runStatus = false;
            $scope.test.correct = data.passes;
            //move test to top of list
            $scope.tests.splice($scope.test_idx, 1);
            $scope.tests.unshift(data);
          })
          .catch(function(err){
            $scope.test.runStatus = false;
          });
        }
    }

    $scope.runTests = function(firefox_selected, chrome_selected){
      //get keys for tests and put
      $scope.keys = [];
      $scope.filteredTests.forEach(function(test){
        test.runStatus = true;
        $scope.keys.push(test.key);
      });

      var browsers = [];
      if(firefox_selected){
        browsers.push("firefox");
      }

      if(chrome_selected){
        browsers.push("chrome");
      }

      for(var i=0; i < browsers.length; i++){
        Tester.runTests({test_keys: $scope.keys, browser_type: browsers[i]}).$promise
          .then(function(data){
            $scope.closeDialog();

            //keys = Object.keys(data);
            $scope.keys.forEach(function(key){
              var val = data[key];
              //iterate over tests and set correctness based on if test key is present in data

              $scope.filteredTests.forEach(function(test){
                test.runStatus = false;

                if(data[test.key]){
                  test.correct = data[test.key];
                  console.log('val '+val);
                }
              })
            })
          })
          .catch(function(err){
            $scope.errors.push(err);

            console.log("Tester failed to run successfully");
          });
        }
    }

    $scope.runGroupTests = function(url, group){
      Tester.runTestsByGroup({url: url, group: group}).$promise
        .then(function(data){

        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    }

    $scope.addGroup = function(test, group){
      if(!group.name.length){
         $scope.errors.push("Group name cannot be empty");
         return;
      }

      //Check if group already exists before creating adding it
      for(var i=0; i < test.groups.length; i++){
          if(test.groups[i].name === group.name){
            $scope.showExistingGroupNotice = true;
            return;
          }
      }

      if(test.groups){
        Tester.addGroup({name: group.name,
                         description: group.description,
                         key: test.key}).$promise
                  .then(function(data){
                     $scope.group.name = null;
                     test.groups.push(data);
                   })
                   .catch(function(err){
                     $scope.errors.push(err.data.message);
                   });
       }
    }

    $scope.removeGroup = function(test, group, $index){
      Tester.removeGroup({group_key: group.key, test_key: test.key}).$promise
        .then(function(data){
          test.groups.splice($index,1);
        })
        .catch(function(err){
          $scope.errors.push(err);
        });;
    }

    $scope.toggleTestDataVisibility = function(test, index){
      if($scope.test_idx >= 0 && $scope.test_idx != index){
        $scope.tests[$scope.test_idx].visible = false;
      }

      test.visible = !test.visible;
      $scope.test_idx = index;

      if(test.visible){
        $scope.setCurrentNode(test.path.path[0], index);
      }
    }

    $scope.setCurrentNode = function(node, index){
      if(index== null){
        $scope.current_node[$scope.test_idx] = node;
      }
      else{
        $scope.current_node[index] = node;
      }
    }

    $scope.getDate = function(value){
      if(value == null){
        return null;
      }
      else{
        return new Date(value).toLocaleString();
      }
    }

    $scope.setTestName = function(test, new_name){
      test.show_waiting_icon = true;
      Tester.updateName({key: test.key, name: new_name}).$promise
        .then(function(data){
          test.show_waiting_icon = false;
          test.show_test_name_edit_field=false;
          test.name = new_name;
        })
        .catch(function(err){
          test.show_waiting_icon = false;
          $scope.errors.push(err);
          test.show_test_name_edit_field = false;
        });
    }

    $scope.showTestNameEdit = function(test){
      test.show_test_name_edit_field = true;
      test.show_waiting_icon = false;
    }

    $scope.cancelEditingTestName = function(test){
      test.show_test_name_edit_field = false;
    }

    $scope.openPageModal = function(page) {
      $scope.current_preview_page = page;
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

    $scope.openBrowserSelectionDialog  = function(test, $index) {
      $scope.chrome_selected = false;
      $scope.firefox_selected = false;
      $scope.runSingleTestFlag = false;
      if(test != null && $index != null){
        $scope.runSingleTestFlag = true;
      }

      $scope.test = test;
      $scope.test_idx = $index;
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/test/browser_selection_modal.html",
          controller: function DialogController($scope, $mdDialog) {
             $scope.closeDialog = function() {
                $mdDialog.hide();
             }
          }
       });
    };

    $scope._init();
  }
]);
