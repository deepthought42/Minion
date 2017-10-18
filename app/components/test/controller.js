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

.controller('TesterIndexCtrl', ['$scope', '$interval', 'Tester', 'store', '$state',
  function($scope, $interval, Tester, store, $state) {
    $scope._init= function(){
      $('[data-toggle="tooltip"]').tooltip()

      $scope.tester = {};
      $scope.groups = [];
      $scope.group = {name: "", description: "" };
      $scope.node_key = "";
      $scope.current_node = null;

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
      console.log("test key " + test.key);
      Tester.updateCorrectness({key: test.key, correct: correctness}).$promise
        .then(function(data){
          test.correct = data.correct;
        });
    }

    $scope.runTest = function(test, correctness){
      test.running = true;
      Tester.runTest({key: test.key, browser_type: "phantomjs"}).$promise
        .then(function(data){
          test.running = false;
          console.log("Tester ran successfully :: "+data);
        })
        .catch(function(err){
          test.running = false;
          console.log("Tester failed to run successfully");
        });
    }

    $scope.runGroupTests = function(url, group){
      Tester.runTestsByGroup({url: url, group: group});
    }

    $scope.addGroup = function(test, group){
      console.log("Adding group "+group+" to test ");

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
      console.log("Change current node");
    }

    $scope.getDate = function(test){
      if(test.lastRunTime == null){
        return null;
      }
      else{
        return new Date(test.lastRunTime).toLocaleString();
      }
    }

    $scope.isCurrentNodePage = function(){
      console.log("current node being checked : "+ ($scope.current_node.type=='Page'));
      return $scope.current_node=='Page';
    }

    $scope._init();
  }
]);
