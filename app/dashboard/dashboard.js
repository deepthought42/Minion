'use strict';

angular.module('Minion.dashboard', ['Minion.PastPathService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dashboard', {
    url: '/dashboard',
    templateUrl: 'dashboard/index.html',
    controller: 'DashboardIndexCtrl'
  });
}])

.controller('DashboardIndexCtrl', ['$scope','$interval', 'PastPath',
  function($scope, $interval, PastPath) {
    var stop;
    var count = 0;

    $scope.startPathRetrieval = function() {
      // Don't start a new fight if we are already fighting
      if ( angular.isDefined(stop) ) return;
      stop = $interval(function() {
        PastPath.query();
        count = count+1;
        if(count > 10){
          $scope.stopPathRetrieval();
        }
/*        if ($scope.blood_1 > 0 && $scope.blood_2 > 0) {
          $scope.blood_1 = $scope.blood_1 - 3;
          $scope.blood_2 = $scope.blood_2 - 4;
        } else {
          $scope.stopPathRetrieval();
        }
        */
      }, 10000);
    };

    $scope.stopPathRetrieval = function() {
      /*if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
      }*/
      $interval.cancel(stop);
    };

    $scope.$on('$destroy', function() {
      // Make sure that the interval is destroyed too
      $scope.stopPathRetrieval();
    });

    $scope.startPathRetrieval();
  }
]);
