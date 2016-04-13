'use strict';

angular.module('Minion.tester', ['Minion.TesterService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('tester', {
    url: '/tester',
    templateUrl: 'tester/index.html',
    controller: 'TesterIndexCtrl'
  });
}])

.controller('TesterIndexCtrl', ['$scope','$interval', 'Tester',
  function($scope, $interval, Tester) {

    $scope.startTester = function() {
      Tester.query({url: $scope.tester.url});
    };
  }
]);
