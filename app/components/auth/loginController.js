'use strict';

angular.module('Minion.login', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('login', {
    url: "/login",
    templateUrl: 'components/auth/login.html',
    controller: 'LoginCtrl'
  });

}])

.controller('LoginCtrl', ['$scope', '$state', 'AuthService','$http', function ($scope, $state, AuthService, $http) {
  $scope.errorMessage = null;
  $scope.formData = {
    username: '',         // Expose to user as email/username field
    password: '',
  };


  $scope.login = function(formData) {
    console.log(formData);

  /*  $http.post('http://localhost:8080/login', formData, {
              headers : {
                'content-type' : 'application/x-www-form-urlencoded'
              }
            }).success(function() {
              console.log('login success');
            }).error(function() {
              console.log('login error');
            });
*/

    AuthService.signin({username: formData.username, password: formData.password});
    /*authService.signin({
      authParams: {
        scope: 'openid profile' // This is if you want the full JWT
      }
    }, function(profile, idToken, accessToken, state, refreshToken) {
      console.log("successful sign in")
      $state.path('/user-info')
    }, function(err) {
      console.log("Sign in Error :(", err);
    });
    */
  }

}]);
