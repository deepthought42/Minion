'use strict';

angular.module('Qanairy.discovery', ['ui.router', 'Qanairy.DiscoveryService', 'Qanairy.PathRealtimeService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.discovery', {
    url: "/discovery",
    templateUrl: 'components/discovery/index.html',
    controller: 'DiscoveryCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('DiscoveryCtrl', ['$rootScope', '$scope', 'Discovery', 'PathRealtimeService', 'Test', 'store', '$state', '$mdDialog', 'Account', 'segment',
  function($rootScope, $scope, Discovery, PathRealtimeService, Test, store, $state, $mdDialog, Account, segment) {

    this._init = function(){
      $scope.errors = [];
      $scope.tests = [];
      $scope.isStarted = false;
      $scope.current_node = [];
      $scope.current_node_idx = 0;
      $scope.visible = false;
			$scope.visible_test_nav1 = 'section-linemove-1';
      $scope.visible_test_nav2 = 'section-linemove-1';
      $scope.visible_tab = "nodedata0";
      $scope.default_browser = store.get('domain')['discoveryBrowserName'];
      $scope.groups = [];
      $scope.group = {};
      $scope.group.name = "";
      $scope.group.description = "";
      $scope.test_idx = -1;
      $scope.discoveryOnboardingIndex = 0;
      $scope.discovery_status = {};
      $scope.current_domain = store.get('domain');

      //ERRORS
      $scope.unresponsive_server_err = "Qanairy servers are currently unresponsive. Please try again in a few minutes.";

      if($scope.current_domain != null){
        $scope.waitingOnTests = true;
        Discovery.getStatus({url: $scope.current_domain.url}).$promise
          .then (function(data){
            $scope.discovery_status = data;

            if( data.startTime == null){
              $scope.isStarted = false;
            }
            else{
              var diff_time = (Date.now()-(new Date(data.startTime)))/1000/60;
              if(diff_time > 1440 || (data.totalPathCount <= data.examinedPathCount)){
                $scope.isStarted = false
              }
              else{
                $scope.isStarted = true;
              }
            }
          })
          .catch(function(err){
            $scope.isStarted = false;
          });

        Test.getUnverified({url: $scope.current_domain.url}).$promise
          .then(function(data){
            $scope.tests = data
            $scope.waitingOnTests = false;
            if(data.length > 0){
              $scope.discoveredTestOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('discovered-test');
              $scope.discoveredTestOnboardingIndex = 0;
            }
          })
          .catch(function(err){
            if(err.data){
              $scope.errors.push(err.data);
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }
            $scope.waitingOnTests = false;
          });

        // Enable pusher logging - don't include this in production
        //Pusher.logToConsole = true;
        var pusher = new Pusher('77fec1184d841b55919e', {
          cluster: 'us2',
          encrypted: true
        });

        var channel = pusher.subscribe($scope.extractHostname($scope.current_domain.url));
        channel.bind('test-discovered', function(data) {
          $scope.discoveredTestOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('discovered-test');
          $scope.discoveredTestOnboardingIndex = 0;
          $scope.waitingOnTests = false;
          $scope.tests.push( JSON.parse(data));
          $scope.$apply();
        });

        channel.bind('path_object', function(data) {

        });

        channel.bind('discovery-status', function(data) {
          $scope.discovery_status = JSON.parse(data);
          $scope.$apply();
        });
      }
      else{
        $state.go("main.domains")
      }
    }

    $scope.discoveryOnboardingSteps = [
      {
        title: "Begin finding tests by starting a discovery.",
        position: "right",
        description: "Discovery time varies based on the complexity of your domain. If a discovery has been running for longer than 48 hours, please contact support@qanairy.com.",
        attachTo:"#start_discovery_button",
        top: 50,
        width: 400
      }
    ];

    $scope.discoveredTestOnboardingSteps = [
      {
        title: "Congratulations, you built your first test!",
        position: "centered",
        description: "Now it’s time to learn about the test path. Start by clicking on the test bar to open the path details.",
        width: 400,
      }
    ];

    $scope.testVerificationSteps = [
      {
        title: "Review your test",
        description: "Tests paths are comprised of three parts: page, element, and action. Single page tests like this one here indicate that the page has successfully loaded.",
        attachTo:"#test0_data",
        position: "top",
        top: 150,
        left: 100,
        width: 400
      },
      {
        position: "top",
        description: "Examine the test details to determine whether the status of a test is passing or failing. Select passing or failing to teach Qanairy the expected outcome of each test. Once a status is selected the test will move to the 'Tests' page where it can be run.",
        attachTo:"#test0_status",
        width: 400
      }
    ];

    /**
     *  Returns an array containing the start index values for partitioning a path
     */
    $scope.getPathIterations = function(path_size){
      var segment_cnt = Math.trunc(path_size/3);
      if(segment_cnt == 0 ){
        segment_cnt = 1;
      }

      var arr = new Array(segment_cnt);
      for(var i=0; i<arr.length; i++){
        arr[i] = i*3;
      }

      return arr;
    }

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

    $scope.onTabChanges = function(currentTabIndex){
       store.set('active',currentTabIndex);
       $scope.selectedTab.dataTab = currentTabIndex;
     };

     /**
     *  Starts discovery process for a given domain via Qanairy api
     */
    $scope.startDiscovery = function(){
      $scope.isStarted = true;
      $scope.discoveryOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('discovery');
      $scope.discoveryRunningOnboardingIndex = 0;

      Discovery.startWork({url:  $scope.current_domain.url}).$promise
        .then(function(value){
          $scope.discovery_status = value;
          segment.track("Started Discovery", {
            domain : $scope.current_domain.url,
            success : true
          }, function(success){});
        })
        .catch(function(err){
          //$scope.waitingOnTests = false;
          if(err.data){
            $scope.errors.push(err.data);

            if(err.data.message == "A discovery is already running"){
              $scope.isStarted = true;
            }
            else{
              $scope.isStarted = false;
            }
            segment.track("Started Discovery", {
              domain : $scope.current_domain.url,
              success : false
            }, function(success){});
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err});
          }
        });
    }

    $scope.setTestIndex = function(idx){
      $scope.test_idx = idx;
    }

    $scope.setCurrentNode = function(node, index){
      $scope.current_node_idx = index;
      $scope.current_node[$scope.test_idx] = node;
    }

    $scope.setTestName = function(test, new_name){
      test.show_waiting_icon = true;
      Test.updateName({key: test.key, name: new_name}).$promise
        .then(function(data){
          test.show_waiting_icon = false;
          test.show_test_name_edit_field=false;
          test.name = new_name;
        })
        .catch(function(err){
          test.show_waiting_icon = false;
          test.show_test_name_edit_field = false;
          if(err.data){
            $scope.errors.push("An error occurred while trying to update the test name");          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }

        });
    }

    $scope.getPathObject = function(key){
      var path_objecs = store.get('path_objects').filter(function( path_object ){
        return path_object.key == key;
      });
      return path_objecs[0];
    }

    $scope.toggleTestDataVisibility = function(test, index){
      if($scope.test && $scope.test_idx != index){
        $scope.test.visible = false;
      }
      $scope.test_idx = index;
      $scope.test = test;
      test.visible===undefined ? test.visible = true : test.visible = !test.visible ;
      $scope.visible_browser_screenshot = $scope.default_browser;

      $scope.current_path_objects = $scope.retrievePathObjectsUsingKeys(test.pathKeys);
      $scope.setCurrentNode($scope.current_path_objects[0], index);

      if(test.visible){
        $scope.testVerificationOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('test-verification');
        $scope.testVerificationOnboardingIndex = 0;
      }
    }

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

    $scope.stopDiscoveryProcess = function(){
      WorkAllocation.stopWork().$promise
        .then(function(){
           $scope.isStarted = false;
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push("An error occurred stopping discovery");
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });
    }

    $scope.archiveTest = function(test){
      Test.archive({key: test.key} ).$promise.
        then(function(resp){
          test.archived = true;
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push("An error occurred while archiving test");
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });

        segment.track("Archived Test", {
          test_key : test.key
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
                 segment.track("Added Group", {
                   group_key: group.key,
                   test_key: test.key,
                   success : true
                 }, function(success){});
               })
               .catch(function(err){
                 if(err.data){
                   $scope.errors.push("An error occurred while adding group ");
                 }
                 else{
                   $scope.errors.push({message: $scope.unresponsive_server_err });
                 }
                 segment.track("Added Group", {
                   group_key: group.key,
                   test_key: test.key,
                   success : false
                 }, function(success){});
               });


    }

    $scope.removeGroup = function(test, group, $index){
      Test.removeGroup({group_key: group.key, test_key: test.key}).$promise
        .then(function(data){
          test.groups.splice($index,1);
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push("An error occurred deleting group "+group.key);
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });
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

    $scope.cancelEditingTestName = function(test){
      test.show_test_name_edit_field = false;
    }


    $scope.timeSinceLastTest = function(){
      return (Date.now() - (new Date($scope.discovery_status.last_path_ran_at)));
    }

    $scope.getTotalRuntime = function(){
        var last_run_date = $scope.discovery_status.last_path_ran_at;
        var discovery_started_date = $scope.discovery_status.started_at;
        if(last_run_date != null && discovery_started_date != null){
          var time_diff = (last_run_date-discovery_started_date)/1000/60/60;
          var hours = Math.trunc(time_diff);
          var minutes = Math.trunc((time_diff%1).toFixed(2)*60);
          if(minutes < 10){
            minutes = "0"+minutes;
          }
          return hours+":"+minutes;
        }
        else{
          return "00:00";
        }
    }

    $scope.editTest = function(test){
      test.show_test_name_edit_field = true;
    }
    /**
     *
     */
    $scope.updateCorrectness = function(test, correctness, idx){
      test.waitingOnStatusChange = true;
      Test.setPassingStatus({key: test.key, status: correctness, browser_name: $scope.default_browser}).$promise
        .then(function(data){
          test.waitingOnStatusChange = false;
          test.status = data.status;
          //remove from list
          for(var i=0; i<$scope.tests.length; i++){
            if($scope.tests[i].key == test.key){
              $scope.tests.splice(i, 1);
              break;
            }
          }
          //update approved test count
          var approved_cnt = 0;
          if(!store.get('approved_test_cnt')){
            approved_cnt = 1;
          }
          else{
            var approved_cnt = store.get('approved_test_cnt')+1;
          }
          store.set('approved_test_cnt', approved_cnt);

          $rootScope.$broadcast("updateApprovedTestCnt", approved_cnt);
          segment.track("Classified Test", {
            test_key : test.key,
            correctness : correctness,
            success : true
          }, function(success){});
        })
        .catch(function(err){
          test.waitingOnStatusChange = false;
          if(err.data){
            $scope.errors.push("An error occurred updating test "+test.name);
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
          segment.track("Classified Test", {
            test_key : test.key,
            correctness : correctness,
            success : false
          }, function(success){});
        });
    }

    $scope.openBrowserSelectionDialog  = function(event) {
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/discovery/default_browser_modal.html",
          controller: function DialogController($scope, $mdDialog) {
             $scope.closeDialog = function() {
                $mdDialog.hide();
             }
          }
       });
    };

    $scope.hasUserAlreadyOnboarded = function(onboard_step_name){
      var onboard = null;
      if(store.get("onboard")){
        onboard = store.get("onboard").indexOf(onboard_step_name) > -1;
      }
      //check if discovery onboarding has already been seen
      if(!onboard  || onboard == null){
        Account.addOnboardingStep({step_name: onboard_step_name}).$promise
          .then(function(data){
            store.set("onboard", data);
          })
          .catch(function(err){
            if(err.data){
              $scope.errors.push("An error occurred updating onboarding step");
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }
          });
      }
      return onboard;
    }

    this._init();

    /* EVENTS */
    $rootScope.$on('reload_tests', function(e){
      $scope.current_domain =  store.get('domain');
      Discovery.getStatus({url: $scope.current_domain.url}).$promise
        .then (function(data){
          $scope.discovery_status = data;

          if( data.startTime == null){
            $scope.isStarted = false;
          }
          else{
            var diff_time = (Date.now()-(new Date(data.startTime)))/1000/60;
            if(diff_time > 1440 || (data.totalPathCount <= data.examinedPathCount)){
              $scope.isStarted = false
            }
            else{
              $scope.isStarted = true;
            }
          }
        })
        .catch(function(err){
          $scope.isStarted = false;
        });

      Test.getUnverified({url:  store.get('domain').url}).$promise
        .then(function(data){
          $scope.tests = data
          $scope.waitingOnTests = false;
          if(data.length > 0){
            $scope.discoveredTestOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('discovered-test');
            $scope.discoveredTestOnboardingIndex = 0;
          }
        })
        .catch(function(err){
          $scope.errors.push(err.data);
          $scope.waitingOnTests = false;
        });
    });

    $rootScope.$on('missing_resorce_error', function (e){
      $scope.errors.push("We seem to have misplaced those records. Please try again. I'm sure we have them somewhere.");
    });

    $rootScope.$on('internal_server_error', function (e){
      $scope.errors.push("There was an error while processing your request. Please try again.");
    });
  }
]);
