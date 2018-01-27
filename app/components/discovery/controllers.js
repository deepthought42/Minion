'use strict';

angular.module('Qanairy.discovery', ['ui.router', 'Qanairy.DiscoveryService', 'Qanairy.PathRealtimeService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.discovery', {
    url: "/discovery",
    templateUrl: 'components/discovery/index.html',
    controller: 'WorkManagementCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('WorkManagementCtrl', ['$rootScope', '$scope', 'Discovery', 'PathRealtimeService', 'Tester', 'store', '$state', '$mdDialog',
  function($rootScope, $scope, Discovery, PathRealtimeService, Tester, store, $state, $mdDialog) {
    var getFailingCount = function(){
      Tester.getFailingCount({url: $scope.domain }).$promise
        .then(function(data){
          store.set("failing_tests", data.failing);
          $scope.failing_tests = data.failing;
        })
        .catch(function(err){
          $scope.errors.push(err.data);
        });;
    }

    this._init = function(){
      $scope.errors = [];
      $scope.tests = [];
      $scope.isStarted = false;
      $scope.current_node = [];
      $scope.visible = false;

      $scope.visible_tab = "nodedata0";
      $scope.default_browser = store.get('domain')['discoveryBrowser'];
      $scope.groups = [];
      $scope.group = {};
      $scope.group.name = "";
      $scope.group.description = "";
      $scope.test_idx = 0;

      if(store.get('domain') != null){
        $scope.waitingOnTests = true;
        $scope.discovery_url = store.get('domain').url;
        Tester.getUnverified({url: $scope.discovery_url}).$promise
            .then(function(data){
              $scope.tests = data
              $scope.waitingOnTests = false;
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

        var channel = pusher.subscribe($scope.extractHostname($scope.discovery_url));
        channel.bind('test-discovered', function(data) {
          $scope.waitingOnTests = false;
          $scope.tests.push(JSON.parse(data));
          $scope.$apply();
        });
      }
      else{
        $state.go("main.domains")
      }

      getFailingCount();
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
      $scope.waitingOnTests = true;
      Discovery.startWork({url:  $scope.discovery_url}).$promise
        .then(function(value){
          $scope.isStarted = true;
        })
        .catch(function(err){
          $scope.waitingOnTests = false;
          $scope.errors.push(err.data);
        });
    }

    $scope.setTestIndex = function(idx){
      $scope.test_idx = idx;
    }

    $scope.setCurrentNode = function(node, test_idx){
      $scope.current_node[test_idx] = node;
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
          test.show_test_name_edit_field = false;
        });
    }

    $scope.toggleTestDataVisibility = function(test, test_idx){
      if($scope.test_idx != test_idx){
        $scope.tests[$scope.test_idx].visible = false;
      }

      $scope.test_idx = test_idx;

      if(test.visible){
        $scope.setCurrentNode(test.path.path[0], test_idx);
      }
      test.visible = !test.visible;

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
      Tester.addGroup({name: group.name,
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
      Tester.removeGroup({group_key: group.key, test_key: test.key}).$promise
        .then(function(data){
          test.groups.splice($index,1);
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    }

    /**
    * Displays a info for a selected path object in the drop down that
    * accompanies the error panel for the associated path
    */
    $scope.showInfoPanel = function(obj){

    }

    $scope.cancelEditingTestName = function(test){
      test.show_test_name_edit_field = false;
    }

    $scope.updateCorrectness = function(test, correctness, idx){
      test.waitingOnStatusChange = true;
      Tester.setDiscoveredPassingStatus({key: test.key, correct: correctness}).$promise
        .then(function(data){
          test.waitingOnStatusChange = false;
          test.correct = data.correct;
          //remove from list
          $scope.tests.splice(idx, 1);
          //update approved test count

          if(!store.get('approved_test_cnt')){
            store.set('approved_test_cnt', 1);
          }
          else{
            var approved_cnt = store.get('approved_test_cnt');
            store.set('approved_test_cnt', approved_cnt);
          }
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

    this._init();
  }
]);
