'use strict';

angular.module('Qanairy.comingSoon', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.comingSoon', {
    url: "/comingSoon",
    templateUrl: 'components/comingSoon/index.html',
    controller: 'ComingSoonCtrl'
  });
}])

.controller('ComingSoonCtrl', ['$rootScope', '$scope', 'store', 'segment',
  function($rootScope, $scope, store, segment) {

  }
]);
