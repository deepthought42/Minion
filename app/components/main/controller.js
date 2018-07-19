
angular.module('Qanairy.main', ['ui.router', 'Qanairy.ActionService'])

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

.controller('MainCtrl', ['$rootScope', '$scope', 'PathRealtimeService', 'store', '$location', 'Account', 'Action', 'Auth', '$state',
  function ($rootScope, $scope, PathRealtimeService, store, $location, Account, Action, Auth, $state) {

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

    var pusher = new Pusher('77fec1184d841b55919e', {
      cluster: 'us2',
      encrypted: true
    });

    $scope.extractHostname = function(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }

    if($scope.domain != null){
      var channel = pusher.subscribe($scope.extractHostname($scope.domain.url));

      channel.bind('discovery_status', function(data) {
        store.set('discovery_status', JSON.parse(data));
      });

      channel.bind('path_object', function(data) {
        var path_objects = store.get('path_objects');
        path_objects.push( JSON.parse(data));
        store.set('path_objects',path_objects);
      });
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

    $scope.$on('domain_updated', function(){
      $scope.domain = store.get('domain');
      $scope.$apply();
    });

    $scope.$on('domain_selected', function(){
      var channel = pusher.subscribe($scope.extractHostname($store.get('domain').url));
      $scope.domain = store.get('domain');

      channel.bind('path_object', function(data) {
        var path_objects = store.get('path_objects');
        path_objects.push( JSON.parse(data));
        store.set('path_objects', path_objects);
      });
    });

    $scope.$on('updateApprovedTestCnt', function(event, approved_test_cnt){
      $scope.approved_test_cnt = approved_test_cnt;
    });

    Action.query().$promise.
      then(function(data){
        store.set('actions', data);
      });
  }
]);
