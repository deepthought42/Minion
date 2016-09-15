
angular.module('Minion.main', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main', {
    url: "",
    abstract: true,
    templateUrl: 'components/main/index.html',
    controller: 'MainCtrl'
  });
}])

.controller('MainCtrl', ['$scope', 'auth', function ($scope, auth) {
    this._init = function(){
      $scope.displayUserDropDown = false;
      $scope.auth = auth;
	  $scope.menuToggled = false;
    }

    this._init();
  }
]);
