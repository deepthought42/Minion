angular.module('Minion.auth', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('login', {
    url: "/login",
    templateUrl: 'components/auth/login.html',
    controller: 'LoginCtrl'
  });
}])

.controller('LoginCtrl', ['$scope',
  function($scope) {
  }
]);
