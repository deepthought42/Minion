'use strict';

angular.module('Qanairy.login', ['ui.router', 'Qanairy.auth'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.login', {
    url: "/login",
    templateUrl: 'components/login/login.html',
    controller: 'LoginController'
  });
}])

.controller('LoginController', ['$rootScope', '$scope', 'Auth',
  function($rootScope, $scope, Auth) {
    this._init = function(){
      console.log("HELP");
      $scope.vm = this;
      $scope.vm.auth = Auth;
    }

    this._init();
}]);
