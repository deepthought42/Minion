
angular.module('Qanairy.main', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main', {
    url: "",
    abstract: true,
    templateUrl: 'components/main/index.html',
    controller: 'MainCtrl'
  });
}])

.controller('MainCtrl', ['$rootScope', '$scope', 'auth', 'WorkAllocation', 'PathRealtimeService', 'store', '$location',
  function ($rootScope, $scope, auth, WorkAllocation, PathRealtimeService, store, $location) {

    this._init = function(){
      $scope.displayUserDropDown = false;
      $scope.auth = auth;
      $scope.menuToggled = false;
      $scope.isAuthenticated = false;
      $scope.paths = [];
      $scope.isStarted = false;
      $scope.auth = auth;
      $scope.protocols = ["http", "https", "file"];
      $scope.workAllocation = {};
      $scope.workAllocation.urlProtocol = $scope.protocols[0];

      $scope.approved_test_cnt = store.get('approved_test_cnt');
      if(store.get('domain')){
        $scope.domain = store.get('domain').url;
      }
      $scope.$location = $location;
      $scope.current_path = $location.path();
      $scope.user_profile = store.get('profile');
      $scope.navToggledOpen = true;
    }

    $scope.login = function(){
      $scope.auth.login();
      $scope.isAuthenticated=true;
    }

    $scope.logout = function(){
      $scope.auth.logout();
      $scope.isAuthenticated=false;
    }

    this._init();
  }
]);
