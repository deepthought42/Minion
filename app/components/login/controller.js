'use strict';

angular.module('Qanairy.login', ['ui.router', 'Qanairy.AuthService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.login', {
    url: "/login",
    templateUrl: 'components/login/login.html',
    controller: 'LoginController'
  });
}])

.controller('LoginController', ['$rootScope', '$scope',
  function($rootScope, $scope) {
    this._init = function(){
      //var vm = this;
      //vm.auth = authService;
    }

    this._init();
}]);
