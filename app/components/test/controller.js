'use strict';

angular.module('Qanairy.tests', ['Qanairy.TestService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.tests', {
    url: '/tests',
    templateUrl: 'components/test/index.html',
    controller: 'TestIndexCtrl'
  });
}])

.controller('TestIndexCtrl', ['$rootScope', '$scope', '$interval', 'Test', 'store', '$state', '$mdDialog', 'Account',
  function($rootScope, $scope, $interval, Test, store, $state, $mdDialog, Account) {
    this._init= function(){
      $scope.errors = [];
      $scope.sortLastRun = false;

      $scope.tests = [];
      $scope.groups = [];
      $scope.group = {name: "", description: "" };
      $scope.node_key = "";
      $scope.current_node = [];
      $scope.current_node_idx = 0;
      $scope.filteredTests = [];
      $scope.test_idx = -1;
      $scope.visible_test_nav1 = 'section-linemove-1';
      $scope.visible_test_nav2 = 'section-linemove-1';
      store.set("approved_test_cnt", null);
      $rootScope.$broadcast("updateApprovedTestCnt", null);
      if(store.get('domain')){
        $scope.default_browser = store.get('domain')['browser_name'];
        $scope.domain_url = store.get('domain').url;
        $scope.getTestsByUrl($scope.domain_url);
      }

      var pusher = new Pusher('77fec1184d841b55919e', {
        cluster: 'us2',
        encrypted: true
      });

      var channel = pusher.subscribe($scope.extractHostname($scope.domain_url));
      channel.bind('test-run', function(data) {
        var reported_test = JSON.parse(data);
        for(var idx=0; idx<$scope.tests.length; idx++){
          var test = $scope.tests[idx];
          if(test.key == reported_test.key){
            $scope.tests[idx] = reported_test;
            break;
          }
        }
        $scope.waitingOnTests = false;
        $scope.$apply();
      });
    }

    $scope.testRunOnboardingSteps = [
      {
        position: "left",
        description: "Run tests to compare the new run record to the last time the test was ran. If the test fails, but the expected outcome is now correct, you can update the test status by editing the selected test. Otherwise continue to run your test until your engineers have fixed the problem.",
        attachTo:"#run_test_button-0",
        top: 125,
        right: 280,
        width: 400
      },
      {
        title: "Congratulations, that’s all there is to it!",
        position: "centered",
        description: "We hope you enjoy your new testing experience with Qanairy. Please contact support@qanairy.com if you have any questions.",
        width: 400
      }
    ];

    /**
     *  Checks if onboarding step has already been experienced. if not, it adds
     *    it to the user account via API call
     */
    $scope.hasUserAlreadyOnboarded = function(onboard_step_name){
      var onboard = null;
      if(store.get("onboard")){
        onboard = store.get("onboard").indexOf(onboard_step_name) > -1;
      }

      //check if discovery onboarding has already been seen
      if(!onboard || onboard == null){
        Account.addOnboardingStep({step_name: onboard_step_name}).$promise
          .then(function(data){
            store.set("onboard", data);
          })
          .catch(function(err){

          });
      }
      return onboard;
      //return false;
    }

    /**
     * Extracts host name from a given url
     */
    $scope.extractHostname =  function(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }

    $scope.isTestRunning = function(test){
      for(var browser in test.browser_statuses){
        if(test.browser_statuses[browser] == null){
          return true;
        }
      }
      return false;
    }

    $scope.isTestRunningInAllBrowsers = function(test){
      var browser_count = 0;
      for(var browser in test.browser_statuses){
        if(test.browser_statuses[browser] == null){
          browser_count++;
        }
        //test.browser_statuses['chrome']!=null || test.browser_statuses['firefox']!=null
      }
      return browser_count==test.browser_statuses.length;
    }

    $scope.setCurrentNodeKey = function(key){
      $scope.node_key=key;
    }

    $scope.getTestsByUrl = function(url) {
      $scope.waitingOnTests = true;
      Test.query({url: url}).$promise
        .then(function(data){
          $scope.tests = data;
          $scope.waitingOnTests = false;
          //check if discovery onboarding has already been seen
          $scope.testRunOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('test-run');
          $scope.testRunOnboardingIndex = 0;
        })
        .catch(function(err){
          $scope.tests = [];
          $scope.errors.push(err);
          $scope.waitingOnTests = false;
        });

      Test.getGroups({url: url}).$promise
        .then(function(data){
          $scope.groups = data;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    };

    $scope.getTestByName = function(name) {
      Test.query({name: name}).$promise
        .then(function(data){
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    };

    /*
    * updates the passing status for a given browser
    */
    $scope.updateBrowserPassingStatus = function(test, browser, isPassing){
      test.browser_statuses[browser] = isPassing;
      var test_passing = true;
      for (var key in test.browser_statuses) {
          if(test.browser_statuses[key] != null && !test.browser_statuses[key]){
            test_passing = false;
            break;
          }
      }
      test.correct = test_passing;
    }

    $scope.runTest = function(firefox_selected, chrome_selected){
      var keys = [];
      keys.push($scope.test.key);
      $scope.test.runStatus = true;
      var browsers = [];

      if(firefox_selected){
        browsers.push("firefox");
      }

      if(chrome_selected){
        browsers.push("chrome");
      }

      $scope.closeDialog();
      for(var i=0; i < browsers.length; i++){
        $scope.current_test_browser = browsers[i];
        $scope.test.browser_statuses[browsers[i]] = null;
        Test.runTests({test_keys: keys, browser_type: $scope.current_test_browser}).$promise
          .then(function(data){
            $scope.test.runStatus = false;

            //use brute force method to find tests with returned keys so they can be updated
            for(var returned_key in data){
              for(var test_idx=0; test_idx < $scope.tests.length; test_idx++){
                if($scope.tests[test_idx].key === returned_key){
                  var test_record = data[returned_key];
                  $scope.tests[test_idx].correct = test_record.passing;
                  $scope.tests[test_idx].browser_statuses[test_record.browser_name] = test_record.passing;
                  $scope.tests[test_idx].records.unshift(test_record);
                  //move test to top of list
                  var test = $scope.tests.splice(test_idx, 1)[0];
                  $scope.tests.unshift(test);
                  if(test_record.passing){
                    test.passingStatusClass = true;
                    test.failingStatusClass = false;
                  }
                  else{
                    test.failingStatusClass = true;
                    test.passingStatusClass = false;
                  }

                  setTimeout(function() {
                    test.passingStatusClass = false;
                    test.failingStatusClass = false;
                    $scope.$apply();
                  }, 5000);

                  return;
                }
              }
            }
          })
          .catch(function(err){
            $scope.test.runStatus = false;
          });
        }
    }

    $scope.runTests = function(firefox_selected, chrome_selected){
      //get keys for tests and put
      var keys = [];
      $scope.filteredTests.forEach(function(test){
        test.runStatus = true;
        keys.push(test.key);
      });

      var browsers = [];
      if(firefox_selected){
        browsers.push("firefox");
      }

      if(chrome_selected){
        browsers.push("chrome");
      }

      $scope.closeDialog();
      for(var i=0; i < browsers.length; i++){
        Test.runTests({test_keys: keys, browser_type: browsers[i]}).$promise
          .then(function(data){
            keys.forEach(function(key){
              console.log("key :: "+key);
              var val = data[key];

              //iterate over tests and set correctness based on if test key is present in data
              $scope.filteredTests.forEach(function(test){
                test.runStatus = false;

                if(data[test.key]){
                  console.log("RETURN DATA :: "+Object.keys(data[test.key].passing));
                  test.correct = data[test.key].passing;
                  test.browser_statuses[data[test.key].browser_name] = data[test.key].browser_statuses;
                  //test.records.unshift(test_record);
                  $scope.tests.unshift(test);
                  if(test_record.passing){
                    test.passingStatusClass = true;
                    test.failingStatusClass = false;
                  }
                  else{
                    test.failingStatusClass = true;
                    test.passingStatusClass = false;
                  }

                  setTimeout(function() {
                    test.passingStatusClass = false;
                    test.failingStatusClass = false;
                    $scope.$apply();
                  }, 5000);

                }
              })
            })
          })
          .catch(function(err){
            $scope.errors.push("Test failed to run successfully");
          });
        }
    }

    $scope.runGroupTests = function(url, group){
      Test.runTestsByGroup({url: url, group: group}).$promise
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
      Test.addGroup({name: group.name,
                       description: group.description,
                       key: test.key}).$promise
                .then(function(data){
                   $scope.group.name = null;
                   test.groups.push(data);
                 })
                 .catch(function(err){
                   $scope.errors.push(err.data);
                 });
    }

    $scope.removeGroup = function(test, group, $index){
      Test.removeGroup({group_key: group.key, test_key: test.key}).$promise
        .then(function(data){
          test.groups.splice($index,1);
        })
        .catch(function(err){
          $scope.errors.push(err);
        });;
    }

    $scope.toggleTestDataVisibility = function(test, index){
      if($scope.test && $scope.test_idx != index){
        $scope.test.visible = false;
      }

      $scope.test_idx = index || 0;
      $scope.test = test;
      test.visible===undefined ? test.visible = true : test.visible = !test.visible ;
      console.log("default browser :: "+ $scope.default_browser);
      $scope.visible_browser_screenshot = $scope.default_browser;
      console.log("browser :: "+$scope.visible_browser_screenshot);
      $scope.current_path_objects = $scope.retrievePathObjectsUsingKeys(test.path_keys);
      $scope.setCurrentNode($scope.current_path_objects[0][0], index);

      if(test.visible){
        $scope.visible_test_nav1 = 'section-linemove-1';
        $scope.visible_test_nav2 = 'section-linemove-1';
      }
    }

    /**
     * Constructs a list of PathObjects consisting of PageState, PageElement,
     *    and Action objects currently stored in session storage
     */
    $scope.retrievePathObjectsUsingKeys = function(path_keys){
      var path_objects = [];
      console.log("path keys  ::  "+path_keys);

      console.log("path keys size ::  "+path_keys.length);
      for(var idx = 0; idx < path_keys.length; idx++){
        console.log("path objects ::  "+path_objects);

        //search all elements
        var page_state = $scope.getPageState(path_keys[idx]);
        if(page_state != null && page_state.length > 0){
          console.log("adding page");
           path_objects.push(page_state);
        }

        var page_element = $scope.getPageElement(path_keys[idx]);
        if(page_element != null && page_element.length > 0){
          console.log("page element added");
           path_objects.push(page_element);
        }

        var action = $scope.getAction(path_keys[idx]);
        if(action != null && action.length > 0){
          console.log("action added");
          path_objects.push(action);
        }
      }
      console.log("path objects :: " + path_objects);

      console.log("path objects size ::  "+path_objects.length);

      return path_objects;
    }

    $scope.setCurrentNode = function(node, index){
      $scope.current_node_idx = index;
      $scope.current_node[$scope.test_idx] = node;
    }

    $scope.getDate = function(value){
      if(value == null){
        return null;
      }
      else{
        return new Date(value).toLocaleString();
      }
    }

    $scope.saveTest = function(test){
      var status_arr = [];
      for (var key in test.browser_statuses) {
          if (test.browser_statuses.hasOwnProperty(key)) {
              status_arr.push( [ key, test.browser_statuses[key] ] );
          }
      }
      var persistable_test = {};
      persistable_test.key = test.key;
      persistable_test.name = test.new_name;
      persistable_test.browser_statuses = test.browser_statuses;

      Test.update({key: test.key, name: test.name, firefox:  test.browser_statuses.firefox, chrome:  test.browser_statuses.chrome}).$promise
        .then(function(data){
          console.log("data :: "+data);
          test.waitingOnStatusChange = false;

          //update approved test count
          var approved_cnt = 0;
          if(!store.get('approved_test_cnt')){
            approved_cnt = 1;
          }
          else{
            var approved_cnt = store.get('approved_test_cnt')+1;
          }
          store.set('approved_test_cnt', approved_cnt);
          test.show_test_name_edit_field = false;
          $scope.editing_test_idx = -1;
          test.show_waiting_icon = false;
          test.show_test_name_edit_field=false;

          $rootScope.$broadcast("updateApprovedTestCnt", approved_cnt);
        })
        .catch(function(err){
          test.show_waiting_icon = false;
          test.waitingOnStatusChange = false;
          $scope.errors.push(err.data);
        });
/*
      Test.updateName(persistable_test).$promise
        .then(function(data){
          $scope.editing_test_idx = -1;
          test.show_waiting_icon = false;
          test.show_test_name_edit_field=false;
          test.name = test.new_name;
        })
        .catch(function(err){
          test.show_waiting_icon = false;
          $scope.errors.push(err);
          test.show_test_name_edit_field = false;
        });
        */
      test.show_waiting_icon = true;
    }

    $scope.cancelEditingTest = function(test){
      $scope.editing_test_idx = -1;
      $scope.test = $scope.test_copy;
      $scope.test_copy = null;
    }

    $scope.openPageModal = function(full_screenshot) {
      $scope.full_page_screenshot = full_screenshot;
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
      $scope.test = test;
      $scope.runSingleTestFlag = false;
      if(test != null && $index != null){
        $scope.runSingleTestFlag = true;
      }
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

    $scope.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    $scope.editTest = function(test, $index){
      $scope.editing_test_idx = $index;
      $scope.test_copy = JSON.parse(JSON.stringify(test));
    }

    /**
     *  Returns an array containing the start index values for partitioning a path
     */
    $scope.getPathIterations = function(path_size){
      var segment_cnt = Math.trunc(path_size/3);
      if(segment_cnt == 0 ){
        segment_cnt = 1;
      }

      var arr = new Array(segment_cnt);
      for(var i=0; i < arr.length; i++){
        arr[i] = i*3;
      }

      return arr;
    }

    this._init();

    $scope.getPageState = function(key){
      return store.get('page_states').filter(function( page_state ){
        return page_state.key == key;
      });
    }

    $scope.getPageElement = function(key){
      return store.get('page_elements').filter(function( page_element ){
        return page_element.key == key;
      });
    }

    $scope.getAction = function(key){
      return store.get('actions').filter(function( action ){
        return action.key == key;
      });
    }

    /* EVENTS */
    $rootScope.$on('missing_resorce_error', function (e){
      $scope.errors.push("There was an issue finding your resource. We'll find it soon and return it to it's rightful place.");
    });

    $rootScope.$on('internal_server_error', function (e){
      $scope.errors.push("There was an error processing your request. Please try again.");
    });
  }
]);
