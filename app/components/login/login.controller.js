(function () {
  'use strict';

  angular.module('Qanairy.login', ['ui.router', 'authService'])

  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('main.login', {
      url: "/login",
      templateUrl: 'components/login/login.html',
      controller: 'LoginController'
    });
  }])
  .controller('LoginController', loginController);

  loginController.$inject = ['authService'];

  function loginController(authService) {

    var vm = this;
    vm.auth = authService;

  }

})();
