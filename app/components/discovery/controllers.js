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

.controller('DiscoveryCtrl', ['$rootScope', '$scope', 'Discovery', 'PathRealtimeService', 'Test', 'store', '$state', '$mdDialog', 'Account',
  function($rootScope, $scope, Discovery, PathRealtimeService, Test, store, $state, $mdDialog, Account) {

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
      $scope.default_browser = store.get('domain')['browser_name'];
      $scope.groups = [];
      $scope.group = {};
      $scope.group.name = "";
      $scope.group.description = "";
      $scope.test_idx = -1;
      $scope.discoveryOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('discovery');
      $scope.discoveryOnboardingIndex = 0;
      $scope.discovery_status = {};
      $scope.current_domain = store.get('domain');
      if($scope.current_domain != null){
        $scope.waitingOnTests = true;
        $scope.discovery_url = $scope.current_domain.url;
        Discovery.getStatus({url: $scope.discovery_url}).$promise
          .then (function(data){
            if( data.started_at == null){
              $scope.isStarted = false;
            }
            else{

              $scope.discovery_status = data;
              var diff_time = (Date.now()-(new Date(data.started_at)))/1000/60;
              if(diff_time > 1440 || (data.total_path_cnt <= data.examined_path_cnt)){
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

        Test.getUnverified({url: $scope.discovery_url}).$promise
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

        // Enable pusher logging - don't include this in production
        //Pusher.logToConsole = true;
        var pusher = new Pusher('77fec1184d841b55919e', {
          cluster: 'us2',
          encrypted: true
        });

        console.log("Current domain url :: "+$scope.current_domain.url);
        var channel = pusher.subscribe($scope.extractHostname($scope.current_domain.url));
        channel.bind('test-discovered', function(data) {
          $scope.discoveredTestOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('discovered-test');
          $scope.discoveredTestOnboardingIndex = 0;
          $scope.waitingOnTests = false;
          $scope.tests.push( JSON.parse(data));
          $scope.$apply();
        });

        channel.bind('discovery-status', function(data) {
          $scope.discovery_status = data;
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

    $scope.discoveryRunningOnboardingSteps = [
      {
        title: "Qanairy’s AI is now working to find and build your tests for you. ",
        position: "centered",
        description: "Tests will begin returning as they are discovered. This process takes a few minutes, now would be a great time to take a break. You deserve it.",
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
        description: "Test paths are comprised of three parts: page, element, and action. Click on each part to learn more details about the test like destination, xpath, styling, and browser screenshots.",
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
      $scope.discoveryRunningOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('discovery-running');
      $scope.discoveryRunningOnboardingIndex = 0;

      Discovery.startWork({url:  $scope.discovery_url}).$promise
        .then(function(value){
          $scope.discovery_status = value;
        })
        .catch(function(err){
          //$scope.waitingOnTests = false;
          $scope.errors.push(err.data);

          if(err.data.message == "A discovery is already running"){
            $scope.isStarted = true;
          }
          else{
            $scope.isStarted = false;
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
        });
    }

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

    $scope.toggleTestDataVisibility = function(test, index){
      if($scope.test && $scope.test_idx != index){
        $scope.test.visible = false;
      }
      $scope.test_idx = index;
      $scope.test = test;
      test.visible===undefined ? test.visible = true : test.visible = !test.visible ;
      $scope.visible_browser_screenshot = $scope.default_browser;

      $scope.current_path_objects = $scope.retrievePathObjectsUsingKeys(test.path_keys);
      $scope.setCurrentNode($scope.current_path_objects[0][0], index);

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
        var page_state = $scope.getPageState(path_keys[idx]);
        if(page_state != null && page_state.length > 0){
           path_objects.push(page_state);
        }

        var page_element = $scope.getPageElement(path_keys[idx]);
        if(page_element != null && page_element.length > 0){
           path_objects.push(page_element);
        }

        var action = $scope.getAction(path_keys[idx]);
        if(action != null && action.length > 0){
          path_objects.push(action);
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
          $scope.errors.push(err.data);
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

    /**
     *
     */
    $scope.updateCorrectness = function(test, correctness, idx){
      test.waitingOnStatusChange = true;
      Test.setPassingStatus({key: test.key, correct: correctness, browser_name: $scope.default_browser}).$promise
        .then(function(data){
          test.waitingOnStatusChange = false;
          test.correct = data.correct;
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
        })
        .catch(function(err){
          test.waitingOnStatusChange = false;
          $scope.errors.push(err.data);
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

          });
      }
      return onboard;
    }

    this._init();

    /* EVENTS */
    $rootScope.$on('missing_resorce_error', function (e){
      $scope.errors.push("We seem to have misplaced those records. Please try again. I'm sure we have them somewhere.");
    });

    $rootScope.$on('internal_server_error', function (e){
      $scope.errors.push("There was an error while processing your request. Please try again.");
    });
  }
]);
