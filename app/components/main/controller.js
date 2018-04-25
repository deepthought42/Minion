
angular.module('Qanairy.main', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main', {
    url: "",
    abstract: true,
    templateUrl: 'components/main/index.html',
    controller: 'MainCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('MainCtrl', ['$rootScope', '$scope', 'PathRealtimeService', 'store', '$location', 'Tester', 'Auth', '$state',
  function ($rootScope, $scope, PathRealtimeService, store, $location, Tester, Auth, $state) {

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
      $scope.domain_list = store.get('domains');
      $scope.errors = [];

      $scope.approved_test_cnt = store.get("approved_test_cnt");
      $scope.$location = $location;
      $scope.current_path = $location.path();
      $scope.user_profile = store.get('profile');
      $scope.navToggledOpen = true;
    }

    $scope.showDomainsPage = function(){
      $state.go("main.domains");
    }

    $scope.login = function(){
      Auth.login();
      $scope.isAuthenticated=true;
    }

    $scope.logout = function(){
      Auth.logout();
      $scope.isAuthenticated=false;
      Auth.login();
    }

    this._init();

    $scope.$on('domain_updated', function(){
      $scope.domain = store.get('domain');
    })

    $scope.$on('updateApprovedTestCnt', function(event, approved_test_cnt){
      console.log("Approved test count :: "+approved_test_cnt);
      $scope.approved_test_cnt = approved_test_cnt;
    })
  }
]);
