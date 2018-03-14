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
      $scope.sortLastRun = false;

      $scope.tests = [];
      $scope.groups = [];
      $scope.group = {name: "", description: "" };
      $scope.node_key = "";
      $scope.current_node = [];
      $scope.filteredTests = [];
      $scope.test_idx = -1;
      if(store.get('domain')){
        $scope.default_browser = store.get('domain')['discoveryBrowser'];
        $scope.domain_url = store.get('domain').url;
        $scope.getTestsByUrl($scope.domain_url);
      }

      var pusher = new Pusher('77fec1184d841b55919e', {
        cluster: 'us2',
        encrypted: true
      });

      var channel = pusher.subscribe($scope.extractHostname($scope.domain_url));
      channel.bind('test-discovered', function(data) {
        var reported_test = JSON.parse(data);
        for(var idx=0; idx<$scope.tests.length; idx++){
          var test = $scope.tests[idx];
          if(test.key == reported_test.key){
            $scope.tests[idx] = reported_test;
            break;
          }
        }
        $scope.waitingOnTests = false;
        //$scope.tests.push(JSON.parse(data));
        $scope.$apply();
      });
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
    // Enable pusher logging - don't include this in production
    //Pusher.logToConsole = true;

    $scope.isTestRunning = function(test){
      for(var browser in test.browserPassingStatuses){
        if(test.browserPassingStatuses[browser] == null){
          return true;
        }
        //test.browserPassingStatuses['chrome']!=null || test.browserPassingStatuses['firefox']!=null
      }
      return false;
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

      $scope.closeDialog();
      for(var i=0; i < browsers.length; i++){
        $scope.current_test_browser = browsers[i];
        Tester.runTests({test_keys: $scope.keys, browser_type: $scope.current_test_browser}).$promise
          .then(function(data){
            $scope.test.runStatus = false;

            //use brute force method to find tests with returned keys so they can be updated
            for(var returned_key in data){
              for(var test_idx=0; test_idx < $scope.tests.length; test_idx++){
                if($scope.tests[test_idx].key === returned_key){
                  var test_record = data[returned_key];
                  $scope.tests[test_idx].correct = test_record.passing;
                  $scope.tests[test_idx].browserPassingStatuses[test_record.browser] = test_record.passing;
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
                  }, 1000);

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

      $scope.closeDialog();
      for(var i=0; i < browsers.length; i++){
        Tester.runTests({test_keys: $scope.keys, browser_type: browsers[i]}).$promise
          .then(function(data){

            //keys = Object.keys(data);
            $scope.keys.forEach(function(key){
              var val = data[key];

              //iterate over tests and set correctness based on if test key is present in data

              $scope.filteredTests.forEach(function(test){
                test.runStatus = false;

                if(data[test.key]){
                  test.correct = data[test.key];
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
        });;
    }

    $scope.toggleTestDataVisibility = function(test, index){
      if($scope.test && $scope.test_idx != index){
        $scope.test.visible = false;
      }

      $scope.test_idx = index || 0;
      $scope.test = test;
      test.visible===undefined ? test.visible = true : test.visible = !test.visible ;

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

    $scope.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    $scope._init();
  }
]);
