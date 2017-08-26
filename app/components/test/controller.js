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
      $scope.group = {name: "", description: "" };
      $scope.node_key = "";
      $scope.current_node = null;
      $scope.visible = false;
      if(store.get('domain') != null){
        $scope.getTestsByUrl(store.get('domain').url);
      }
      else {
        $state.go('main.domains');
      }
    }

    $scope.setCurrentNodeKey = function(key){
      $scope.node_key=key;
    }

    $scope.getTestsByUrl = function(url) {
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
          console.log("Test ran successfully :: "+data);
        })
        .catch(function(err){
          console.log("Test failed to run successfully");
        });
    }

    $scope.runGroupTests = function(url, group){
      Tester.runTestsByGroup({url: url, group: group});
    }

    $scope.addGroup = function(test, group){
      console.log("Adding group "+group+" to test ");

      Tester.addGroup({name: group.name, description: group.description, key: test.key})
    }

    $scope.setCurrentNode = function(node){
      $scope.current_node = node;
    }

    $scope.showTestData = function(test_key, node){
      if(test_key == $scope.visibleTestKey){
        $scope.visible = !$scope.visible;
      }
      else{
        $scope.visibleTestKey = test_key;
        $scope.current_node = node;
        $scope.visible = true;
      }
    }

    $scope.toggleTestDataVisibility = function(test_key, node){
      if(test_key == $scope.visibleTestKey){
        $scope.visible = !$scope.visible;
      }
      else{
        $scope.visibleTestKey = test_key;
        $scope.current_node = node;
        $scope.visible = true;
      }
    }

    $scope.isCurrentNodePage = function(){
      console.log("current node being checked : "+ ($scope.current_node.type=='Page'));
      return $scope.current_node=='Page';
    }

    $scope._init();
  }
]);
