'use strict';

angular.module('Qanairy.tests', ['Qanairy.TestService', 'Qanairy.TestRecordService', 'Qanairy.TestDataPanel', 'Qanairy.ExpandablePathComparisonToggle'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.tests', {
    url: '/tests',
    templateUrl: 'components/test/index.html',
    controller: 'TestIndexCtrl'
  });
}])

.controller('TestIndexCtrl', ['$rootScope', '$scope', '$interval', 'Test', 'store', '$state', '$mdDialog', 'Account', 'segment', 'TestRecord', '$window',
  function($rootScope, $scope, $interval, Test, store, $state, $mdDialog, Account, segment, TestRecord, $window) {
    this._init= function(){
      $scope.errors = [];
      $scope.sortLastRun = false;
      $scope.current_test = null;

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
      if(store.get("domain")){
        $scope.default_browser = store.get("domain")["discoveryBrowserName"];
        $scope.domain_url = store.get("domain").url;
        $scope.getTestsByUrl($scope.domain_url);
      }

      //ERRORS
      $scope.unresponsive_server_err = "Qanairy servers are currently unresponsive. Please try again in a few minutes.";

      $scope.pusher = new Pusher("77fec1184d841b55919e", {
        cluster: "us2",
        encrypted: true
      });

      var channel = $scope.pusher.subscribe($scope.extractHostname($scope.domain_url));
      channel.bind('test-run', function(data) {
        var reported_test = JSON.parse(data);
        for(var idx=0; idx<$scope.tests.length; idx++){
          var test = $scope.tests[idx];
          if(test.key == reported_test.testKey){
            $scope.tests[idx].records.unshift(reported_test);
            $scope.tests[idx].browserStatuses[reported_test.browser] = reported_test.status.toUpperCase();

            for(var key in $scope.tests[idx].browserStatuses){
              if($scope.tests[idx].browserStatuses[key].toUpperCase() === "FAILING"){
                $scope.tests[idx].status = "FAILING";
                break;
              }
              else if($scope.tests[idx].browserStatuses[key].toUpperCase() === "UNVERIFIED"){
                $scope.tests[idx].status = "UNVERIFIED";
                break;
              }
            }
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
        attachTo:"#test-0",
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

    $scope.setTestIndex = function(idx, test){
      $scope.current_test = test;
      $scope.test_idx = idx;
       $rootScope.$broadcast("updateCurrentDiscoveryTest", test );
    }

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
            if(err.data){
              $scope.errors.push({message: "error updating onboarding process"});
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }
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
      for(var browser in test.browserStatuses){
        if(test.browserStatuses[browser] === "RUNNING"){
          return true;
        }
      }
      return false;
    }

    $scope.isTestRunningInAllBrowsers = function(test){
      var browser_count = 0;
      for(var browser in test.browserStatuses){
        if(test.browserStatuses[browser] === "RUNNING"){
          browser_count++;
        }
        //test.browserStatuses['chrome']!=null || test.browserStatuses['firefox']!=null
      }
      return browser_count==test.browserStatuses.length;
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
          $scope.waitingOnTests = false;
          if(err.data){
            $scope.errors.push({message: "An error occurred while retriving tests"});
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });

      Test.getGroups({url: url}).$promise
        .then(function(data){
          $scope.groups = data;
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push({message: "An error occurred while retrieving test groups"});
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });
    };

    /*
    * updates the passing status for a given browser
    */
    $scope.updateBrowserPassingStatus = function(test, browser, status){
      test.browserStatuses[browser] = status;
      var test_passing = "PASSING";
      for (var key in test.browserStatuses) {
          if(test.browserStatuses[key] != null && test.browserStatuses[key].toLowerCase()==='FAILING'){
            test_passing = "FAILING";
            break;
          }
      }

      segment.track("Update Browser Passing Status", {
        test_key : test.key,
        status : test.status
      }, function(success){});
    }

    $scope.runTest = function(test, firefox_selected, chrome_selected){
      var keys = [];
      keys.push(test.key);
      $scope.test = test;
      $scope.test.runStatus = true;
      var browsers = [];

      if(firefox_selected){
        browsers.push("firefox");
      }

      if(chrome_selected){
        browsers.push("chrome");
      }

      //$scope.closeDialog();
      for(var i=0; i < browsers.length; i++){
        $scope.current_test_browser = browsers[i];
        $scope.test.browserStatuses[browsers[i]] = "RUNNING";
        var url = store.get("domain").url;
        Test.runTests({test_keys: keys, browser: $scope.current_test_browser, host_url: url}).$promise
          .then(function(data){
            $scope.test.runStatus = false;

            segment.track("Run Test", {
              chrome : chrome_selected,
              firefox : firefox_selected
            }, function(success){});

            //use brute force method to find tests with returned keys so they can be updated
            for(var returned_key in data){
              for(var test_idx=0; test_idx < $scope.tests.length; test_idx++){
                if($scope.tests[test_idx].key === returned_key){
                  var test_record = data[returned_key];
                  $scope.tests[test_idx].status = test_record.status.toUpperCase();
                  $scope.tests[test_idx].browserStatuses[test_record.browser] = test_record.status.toUpperCase();
                  $scope.tests[test_idx].records.unshift(test_record);
                  //move test to top of list
                  var test = $scope.tests.splice(test_idx, 1)[0];
                  $scope.tests.unshift(test);

                  //shade bar either red or green depending on passing/failing status
                  if(test_record.status==="PASSING"){
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
            if(err.data){
              $scope.errors.push({message: "An error occurred while running test"});
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }
            $scope.test.runStatus = false;
            segment.track("Run Test", {
              chrome : chrome_selected,
              firefox : firefox_selected,
              succeeded : false
            }, function(success){});
          });
        }
    }

    $scope.runTests = function(firefox_selected, chrome_selected){
      var browsers = [];
      if(firefox_selected){
        browsers.push("firefox");
      }

      if(chrome_selected){
        browsers.push("chrome");
      }

      //get keys for tests and put
      var keys = [];
      $scope.tests.forEach(function(test){
        browsers.forEach(function(browser){
          test.browserStatuses[browser] = 'RUNNING';
          test.status = "RUNNING";
        });
        keys.push(test.key);
      });


      //$scope.closeDialog();

      var url = store.get("domain").url;
      for(var i=0; i < browsers.length; i++){
        Test.runTests({test_keys: keys, browser: browsers[i], host_url: store.get("domain").url}).$promise
          .then(function(data){

              //iterate over tests and set status based on if test key is present in data
              $scope.filteredTests.forEach(function(test){
                test.runStatus = false;

                if(data[test.key]){
                  test.status = data[test.key].status;
                  test.browserStatuses[data[test.key].browser] = data[test.key].status;
                  test.records.unshift(data[test.key]);

                  if(data[test.key].status==="PASSING"){
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
              });
          })
          .catch(function(err){
            if(err.data){
              $scope.errors.push({message: "Test failed to run successfully"});
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }

          });
          segment.track("Run Tests", {
            chrome : chrome_selected,
            firefox : firefox_selected,
            test_count : keys.length,
          }, function(success){});

        }
    }

    $scope.runGroupTests = function(url, group){
      segment.track("Run Tests By Group", {
        group : group,
        domain : url
      }, function(success){});

      Test.runTestsByGroup({url: url, group: group}).$promise
        .then(function(data){

        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push({message:"An error occurred while running tests by group"});
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
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
    }

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
    }

    $scope.saveTest = function(test){
      var status_arr = [];
      for (var key in test.browserStatuses) {
          if (test.browserStatuses.hasOwnProperty(key)) {
              status_arr.push( [ key, test.browserStatuses[key] ] );
          }
      }
      if(test.new_name && test.new_name.length > 0){
        test.name = test.new_name;
      }
      else{
        test.new_name = test.name;
      }
      Test.update({key: test.key, name: test.new_name, firefox:  test.browserStatuses.firefox, chrome:  test.browserStatuses.chrome}).$promise
        .then(function(data){
          test.waitingOnStatusChange = false;

          //update approved test count
          var approved_cnt = 0;
          if(!store.get("approved_test_cnt")){
            approved_cnt = 1;
          }
          else{
            approved_cnt = store.get("approved_test_cnt")+1;
          }
          test.name = data.name;
          test.status = data.status;
          test.records = data.records;
          test.browserStatuses = data.browserStatuses;
          test.show_test_name_edit_field = false;
          $scope.editing_test_idx = -1;
          test.show_waiting_icon = false;
          test.show_test_name_edit_field=false;
          store.set('approved_test_cnt', approved_cnt);
        })
        .catch(function(err){
          test.show_waiting_icon = false;
          test.waitingOnStatusChange = false;
          if(err.data){
            $scope.errors.push({message:"Error updating test"});
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });

      segment.track("Updated Test", {
        test_key: test.key,
        success : !$scope.errors.length
      }, function(success){});
      test.show_waiting_icon = true;
    }

    $scope.cancelEditingTest = function(index){
      $scope.editing_test_idx = -1;
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

    $scope.archiveTestDialog = function() {
      $scope.confirmationDialogConfig = {
        title: "Select Operation...",
        message: "Please select which operation you would like to perform.",
        buttons: [{
          label: "Reset",
          action: "reset"
        }, {
          label: "Delete",
          action: "delete"
        }, {
          label: "Save",
          action: "save"
        }]
      };
      $scope.showDialog(true);
    };

    $scope.archiveTest = function(test){
      Test.archive({key: test.key} ).$promise.
        then(function(resp){
          test.archived = true;
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push({message: "An error occurred while archiving test"});
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });

      segment.track("Archived Test", {
        test_key : test.key,
        success : test.archived
      }, function(success){});
    }

    $scope.askDelete = function(test) {
       // Appending dialog to document.body to cover sidenav in docs app
       var confirm = $mdDialog.confirm()
             .title('Would you like to delete this test?')
             .targetEvent(test)
             .ok('Confirm')
             .cancel('Cancel');

       $mdDialog.show(confirm).then(function() {
         $scope.archiveTest(test);
       }, function() {
         $scope.status = 'You decided to keep your test.';
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
      $scope.test_copy = JSON.parse(JSON.stringify(test));;
    }

    $scope.sendTestToIde = function(test){
      //get first url in test
      Test.sendTestToIde({test_key: test.key}).$promise
        .then(function(returned_test){
          var url = "";
          for(var idx=0; idx< returned_test.path.length; idx++){
            if(returned_test.path[idx].url){
              url = returned_test.path[idx].url;
              break;
            }
          }
          const new_tab = $window.open(url, "_blank");
          setTimeout(function(){
            new_tab.postMessage(JSON.stringify({status: "editing", accessToken: localStorage.getItem("access_token"), test: returned_test, profile: JSON.parse(sessionStorage.getItem("profile"))}), "*");
          }, 1000);
        })
        .catch(function(err){
          $scope.errors.push({message: "Oops something went wrong while sending test to the test recorder. Please try again."});
        });
    }

    this._init();

    /* EVENTS */
    $rootScope.$on("reload_tests", function(e){
      $scope.getTestsByUrl(store.get("domain").url);
    });

    $rootScope.$on("missing_resorce_error", function (e){
      $scope.errors.push({message: "There was an issue finding your resource. We'll find it soon and return it to it's rightful place."});
    });

    $rootScope.$on("internal_server_error", function (e){
      $scope.errors.push({message: "There was an error processing your request. Please try again."});
    });

    $scope.$on("$destroy", function() {
      $scope.pusher.unsubscribe($scope.extractHostname($scope.domain_url));
    });
  }
]);
