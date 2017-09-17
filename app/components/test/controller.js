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
    };

    $scope.showNameInputField = function(test, showInput) {
      test.show_test_name_edit_field = showInput;
    };

    $scope.setCurrentNodeKey = function(key){
      $scope.node_key=key;
    };

    $scope.getTestsByUrl = function(url) {
      $scope.tests = Tester.query({url: url});
    };

    $scope.getTestByName = function(name) {
      $scope.tests = Tester.query({name: name}).$promise.then(function(){
      });

    };

    $scope.updateTestCorrectness = function(test, correctness){
      $scope.test = Tester.updateCorrectness({key: test.key, correct: correctness});
    }

    $scope.updateTestName = function(test){
      test.show_test_name_edit_field=false;

      Tester.updateName({key: test.key, name: test.name}).$promise.then(function(data){
        test.show_test_name_edit_field=false;
      });
    }

    $scope.runTest = function(test){
      Tester.runTest({key: test.key, browser_type:'phantomjs'}).$promise
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

    $scope.removeGroup = function(key, group){
      Tester.removeGroup({key: key, name: group.name});
    }

    $scope.setCurrentNode = function(node){
      $scope.current_node = node;
    }

    $scope.setTestName = function(key, name){
      Tester.updateName({key: key, name: name});
    }

    $scope.showTestData = function(test, node){
      test.visible = true;
      $scope.current_node = node;
    }

    $scope.toggleTestDataVisibility = function(test, node){
      test.visible = !test.visible;
      $scope.current_node = node;
    }

    $scope.isCurrentNodePage = function(){
      console.log("current node being checked : "+ ($scope.current_node.type=='Page'));
      return $scope.current_node=='Page';
    }

    $scope.object_keys = function(obj){
      return Object.keys(obj);
    }
    $scope._init();
  }
]);
