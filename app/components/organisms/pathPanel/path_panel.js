'use strict';

angular.module('Qanairy.PathPanel', [])
.directive("pathPanel",['$mdDialog', function($mdDialog){
  return {
    restrict: 'E',
    controller: function($scope){

    },
    scope: false,
    transclude: true,
    templateUrl: 'components/organisms/pathPanel/path_panel.html'
  };
}])
