'use strict';

angular.module('Minion.auth', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.register', {
    url: "/register",
    templateUrl: 'components/auth/register.html',
    controller: 'RegistrationCtrl'
  });
}])

.controller('RegistrationCtrl', function ($scope, $user) {
  $scope.errorMessage = null;
  $scope.accountData = {
    username: '',         // Expose to user as email/username field
    password: '',
  };

  // Use this method with ng-submit on your form
  $scope.register = function register(accountData){
    $user.create(accountData)
      .then(function(account){
        if(account.status === 'ENABLED'){
          // The account is enabled and ready to use
        }else if(account.status === 'UNVERIFIED'){
          // The account requires email verification
        }
      })
      .catch(function(err){
        // Show the error message to the user
        $scope.error = err.message;
      });
  }
});
