'use strict';

angular.module('Qanairy.tests', ['Qanairy.TesterService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.tests', {
    url: '/tests',
    templateUrl: 'components/test/index.html',
    controller: 'TesterIndexCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('TesterIndexCtrl', ['$rootScope', '$scope', '$interval', 'Tester', 'store', '$state',
  function($rootScope, $scope, $interval, Tester, store, $state) {
    $scope._init= function(){
      $('[data-toggle="tooltip"]').tooltip()

      $scope.tester = {};
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
      $scope.tests = Tester.query({url: url});
      $scope.groups = Tester.getGroups({url: url});
    };

    $scope.getTestByName = function(name) {
      $scope.tests = Tester.query({name: name});
    };

    $scope.updateTestCorrectness = function(test, correctness){
      Tester.updateCorrectness({key: test.key, correct: correctness}).$promise
        .then(function(data){
          console.log("Updated correctness of test");
          $rootScope.$broadcast("updateFailingCnt");
          test.correct = data.correct;
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
          Raven.captureException(err);
          Raven.showReportDialog();
          console.log("Tester failed to run successfully");
        });
    }

    $scope.runGroupTests = function(url, group){
      Tester.runTestsByGroup({url: url, group: group});
    }

    $scope.addGroup = function(test, group){
      Tester.addGroup({name: group.name, description: group.description, key: test.key}).$promise
        .then(function(data){
          test.groups.push(data);
        });
    }

    $scope.removeGroup = function(test, group, $index){
      Tester.removeGroup({group_key: group.key, test_key: test.key}).$promise.then(function(data){
        test.groups.splice($index,1);
      });
    }

    $scope.toggleTestDataVisibility = function(test){
      test.visible = !test.visible;
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
      Tester.updateName({key: test.key, name: new_name}).$promise
        .then(function(data){
          test.show_test_name_edit_field=false;
          test.name = new_name;
        })
        .catch(function(err){
          test.show_test_name_edit_field = false;
        });
    }

    $scope.isCurrentNodePage = function(){
      return $scope.current_node=='Page';
    }

    $scope._init();
  }
]);
