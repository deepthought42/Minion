'use strict';

angular.module('Qanairy.authCallback', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.authenticate', {
    url: "/authenticate",
    templateUrl: 'components/auth/callback.html',
    controller: 'AuthCallbackCtrl'
  });
}])

.controller('AuthCallbackCtrl', ['$rootScope', '$scope',
  function($rootScope, $scope) {
    this._init = function(){

    }

    this._init();
  }
]);
