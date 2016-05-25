'use strict';

angular.module('Minion.auth', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.login', {
    url: "/login",
    templateUrl: 'components/auth/login.html',
    controller: 'LoginCtrl'
  });
}])

.controller('LoginCtrl', function ($scope) {
  $scope.errorMessage = null;
  $scope.formData = {
    username: '',         // Expose to user as email/username field
    password: '',
  };

  // Use this method with ng-submit on your form
  $scope.login = function login(formData){
    $auth.authenticate(formData)
     .then(function(){
       console.log('login success');
       $state.go('home');
     })
     .catch(function(err){
       $scope.errorMessage = err.message;
     });
  }
});
