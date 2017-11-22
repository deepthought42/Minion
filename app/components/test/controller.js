'use strict';

angular.module('Qanairy.tests', ['Qanairy.TesterService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.tests', {
    url: '/tests',
    templateUrl: 'components/test/index.html',
    controller: 'TesterIndexCtrl'
  });
}])

.controller('TesterIndexCtrl', ['$rootScope', '$scope', '$interval', 'Tester', 'store', '$state',
  function($rootScope, $scope, $interval, Tester, store, $state) {
    $scope._init= function(){
      $('[data-toggle="tooltip"]').tooltip()
      $scope.errors = [];
      $scope.tests = {};
      $scope.groups = [];
      $scope.group = {name: "", description: "" };
      $scope.node_key = "";
      $scope.current_node = null;
      $scope.filteredTests = [];
      $scope.getTestsByUrl(store.get('domain').url);
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

    $scope.updateTestCorrectness = function(test, correctness){
      Tester.updateCorrectness({key: test.key, correct: correctness}).$promise
        .then(function(data){
          console.log("Updated correctness of test");
          $rootScope.$broadcast("updateFailingCnt");
          test.correct = data.correct;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    }

    $scope.runTest = function(test, correctness){
      test.running = true;
      Tester.runTest({key: test.key, browser_type: "phantomjs"}).$promise
        .then(function(data){
          test.running = false;
          test.correct = data.passes;

          Raven.captureMessage("Test ran successfully :: "+data,{
              level: 'info'
          });

        })
        .catch(function(err){
          test.running = false;
          Raven.captureMessage("Tester failed to run successfully"+data,{
              level: 'info'
          });
        });
    }

    $scope.runTests = function(){
      //get keys for tests and put
      $scope.keys = [];
      $scope.filteredTests.forEach(function(test){
        test.running = true;
        $scope.keys.push(test.key);
      });

      Tester.runTests({test_keys: $scope.keys, browser_type: "phantomjs"}).$promise
        .then(function(data){
          Raven.captureMessage("Test ran successfully :: "+data,{
              level: 'info'
          });

          //keys = Object.keys(data);
          $scope.keys.forEach(function(key){
            var val = data[key];
            //iterate over tests and set correctness based on if test key is present in data

            $scope.filteredTests.forEach(function(test){
              test.running = false;

              if(data[test.key]){
                test.correct = data[test.key];
                console.log('val '+val);
              }
            })
          })
        })
        .catch(function(err){
          $scope.errors.push(err);
          Raven.captureException(err);
          Raven.showReportDialog();
          console.log("Tester failed to run successfully");
        });
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
      Tester.addGroup({name: group.name, description: group.description, key: test.key}).$promise
        .then(function(data){
          test.groups.push(data);
        })
        .catch(function(err){
          $scope.errors.push(err);
        });;
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

    $scope.toggleTestDataVisibility = function(test){
      test.visible = !test.visible;

      if(test.visible){
        setCurrentNode(test.path.path[0]);
      }
    }

    $scope.setCurrentNode = function(node){
      $scope.current_node = node;
    }

    $scope.getDate = function(test){
      if(test.lastRunTimestamp == null){
        return null;
      }
      else{
        return new Date(test.lastRunTimestamp).toLocaleString();
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

    $scope.isCurrentNodePage = function(){
      return $scope.current_node=='Page';
    }

    $scope._init();
  }
]);
