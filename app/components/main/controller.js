
angular.module('Qanairy.main', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main', {
    url: "",
    abstract: true,
    templateUrl: 'components/main/index.html',
    controller: 'MainCtrl'
  });
}])

.controller('MainCtrl', ['$rootScope', '$scope', 'auth', 'WorkAllocation', 'PathRealtimeService', 'store', '$location', 'Tester',
  function ($rootScope, $scope, auth, WorkAllocation, PathRealtimeService, store, $location, Tester) {
    var getFailingCount = function(){
      Tester.getFailingCount({url: $scope.domain }).$promise
        .then(function(data){
          console.log("data :: "+data.failing);
          $scope.failingTests = data.failing;
        })
        .catch(function(){

        });;
    }
    
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

      if(store.get('domain')){
        $scope.domain = store.get('domain').url;
      }
      getFailingCount();

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



    $scope.$on('updateFailingCnt', function(){
      getFailingCount();
      console.log("updating failing test count now ... " );
    })
  }
]);
