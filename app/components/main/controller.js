
angular.module('Minion.main', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main', {
    url: "",
    abstract: true,
    templateUrl: 'components/main/index.html',
    controller: 'MainCtrl'
  });
}])

.controller('MainCtrl', ['$scope', function ($scope) {
    $scope.message = 'Hello';
  }
]);
