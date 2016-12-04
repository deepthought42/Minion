'use strict';

angular.module('Minion.tester', ['Minion.TesterService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.tester', {
    url: '/tester',
    templateUrl: 'components/tester/index.html',
    controller: 'TesterIndexCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('TesterIndexCtrl', ['$scope','$interval', 'Tester',
  function($scope, $interval, Tester) {
    $scope.tester = {};
    $scope.groups = [];
    $scope.node_key = "";
    $scope.current_node = null;
    console.log("groups : :" + $scope.groups);

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
      $scope.test = Tester.updateCorrectness({key: test.key, correct: correctness});
      return $scope.test.correct;
    }

    $scope.runTest = function(test, correctness){
      Tester.runTest({key: test.key})
        .then(function(data){
          console.log("Tester ran successfully :: "+data);
        })
        .catch(function(err){
          console.log("Tester failed to run successfully");
        });
    }

    $scope.runGroupTests = function(url, group){

      Tester.runTestsByGroup({url: url, group: group});
    }

    $scope.addGroup = function(test, group){
      console.log("Adding group "+group+" to test ");
      Tester.addGroup({group: group, key: test.key}).
        then(function(data){
          test = data;
        });
    }

    $scope.setCurrentNode = function(node){
      $scope.current_node = node;
      console.log("Change current node");
    }

    $scope.isCurrentNodePage = function(){
      console.log("current node being checked : "+ ($scope.current_node.type=='Page'));
      return $scope.current_node=='Page';
    }
  }
]);
