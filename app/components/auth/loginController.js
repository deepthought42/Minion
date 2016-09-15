'use strict';

angular.module('Minion.login', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.login', {
    url: "/login",
    templateUrl: 'components/auth/login.html',
    controller: 'LoginCtrl'
  });
}])

.controller('LoginCtrl', ['$scope', 'auth', function ($scope, auth) {
  $scope.errorMessage = null;
  $scope.formData = {
    username: '',         // Expose to user as email/username field
    password: '',
  };

  $scope.auth = auth;

  // Use this method with ng-submit on your form
  $scope.login = function login(formData){
    $auth.authenticate(formData)
     .then(function(){
       console.log('login success');
       $state.go('main.starter');
     })
     .catch(function(err){
       $scope.errorMessage = err.message;
     });
  }
}]);
