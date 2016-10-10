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

    $scope.getTest = function(url) {
      Tester.query({url: url});
    };
  }
]);
