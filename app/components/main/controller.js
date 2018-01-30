
angular.module('Qanairy.main', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main', {
    url: "",
    abstract: true,
    templateUrl: 'components/main/index.html',
    controller: 'MainCtrl',
    data: {
        requireLogin: true // this property will apply to all children of 'app'
      }
  });
}])

.controller('MainCtrl', ['$rootScope', '$scope', 'PathRealtimeService', 'store', '$location', 'Tester', 'Auth',
  function ($rootScope, $scope, PathRealtimeService, store, $location, Tester, Auth) {
    var getFailingCount = function(){
      Tester.getFailingCount({url: $scope.domain }).$promise
        .then(function(data){
          store.set("failing_tests", data.failing);
          $scope.failingTests = data.failing;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    }

    this._init = function(){
      $scope.displayUserDropDown = false;
      $scope.menuToggled = false;
      $scope.auth = Auth;
      $scope.isAuthenticated = false;
      $scope.paths = [];
      $scope.isStarted = false;
      $scope.protocols = ["http", "https", "file"];
      $scope.workAllocation = {};
      $scope.workAllocation.urlProtocol = $scope.protocols[0];
      $scope.domain = store.get('domain');
      $scope.errors = [];

      getFailingCount();

      $scope.$location = $location;
      $scope.current_path = $location.path();
      $scope.user_profile = store.get('profile');
      $scope.navToggledOpen = true;
    }

    $scope.login = function(){
      Auth.login();
      $scope.isAuthenticated=true;
    }

    $scope.logout = function(){
      Auth.signout();
      $scope.isAuthenticated=false;
    }

    this._init();

    $scope.$on('domain_updated', function(){
      $scope.domain = store.get('domain');
      console.log("domain set in main");
    })

    $scope.$on('updateFailingCnt', function(){
      getFailingCount();
    })
  }
]);
