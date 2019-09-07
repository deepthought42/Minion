'use strict';

angular.module('Qanairy.DiscoveryTestDataPanel', [])
.directive("discoveryTestDataPanel",function(){
  return{
    restrict: 'E',
    controller: function($scope){

    },
    link: function($scope, element) {

    },
    scope: false,
    transclude: true,
    templateUrl: 'components/discovery/test_data_panel.html'
  }

});
