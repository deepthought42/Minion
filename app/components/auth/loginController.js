'use strict';

angular.module('Minion.login', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  /*$stateProvider.state('main.login', {
    url: "/login",
    templateUrl: 'components/auth/login.html',
    controller: 'LoginCtrl'
  });
*/
}])

.controller('LoginCtrl', ['$scope', 'authService', '$state', function ($scope, authService, $state) {
  $scope.errorMessage = null;
  $scope.formData = {
    username: '',         // Expose to user as email/username field
    password: '',
  };

  // Put the authService on $scope to access
  // the login method in the view
  $scope.authService = authService;
  $rootScope.$on('auth:unauthorized', function (e, toState, toParams, fromState, fromParams) {
      console.log("403 forbidden");

      $scope.authService.signin({
        authParams: {
          scope: 'openid profile' // This is if you want the full JWT
        }
      }, function(profile, idToken, accessToken, state, refreshToken) {
        console.log("successful sign in")
        $state.path('/user-info')
      }, function(err) {
        console.log("Sign in Error :(", err);
      });

    });

  $scope.login = function() {
    console.log("SHOWING LOGIN FORM");
    authService.signin({
      authParams: {
        scope: 'openid profile' // This is if you want the full JWT
      }
    }, function(profile, idToken, accessToken, state, refreshToken) {
      console.log("successful sign in")
      $state.path('/user-info')
    }, function(err) {
      console.log("Sign in Error :(", err);
    });
  }

}]);
