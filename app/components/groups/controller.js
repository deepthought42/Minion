'use strict';

angular.module('Minion.tester', ['Minion.GroupService'])

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

    $scope.getTest = function(url) {
      $scope.tests = Tester.query({url: url});
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

    $scope.addGroup = function(test, group){
      console.log("Adding group "+group+" to test ");
      Tester.addGroup({group: group, key: test.key}).
        then(function(data){
          test = data;
        });

    }
  }
]);
