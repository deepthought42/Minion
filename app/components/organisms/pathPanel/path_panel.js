'use strict';

angular.module('Qanairy.PathPanel', [])
.directive("pathPanel",['$mdDialog', function($mdDialog){
  return{
    restrict: 'E',
    controller: function($scope){
      $scope.path = {};
      console.log("scope path :: "+$scope.path);

      $scope.$on("updateDiscoveryPath", function(event, path){
        console.log("path updated");
        $scope.path = path;
      });
    },
    scope: {},
    replace: true,
    templateUrl: 'components/organisms/pathPanel/path_panel.html'
  }

}])
