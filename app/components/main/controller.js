
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

.controller('MainCtrl', ['$rootScope', '$scope', 'PathRealtimeService', 'store', '$location', 'Account', 'Action', 'Domain', 'Auth', '$state', 'segment',
  function ($rootScope, $scope, PathRealtimeService, store, $location, Account, Action, Domain, Auth, $state, segment) {

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


    if (Auth.getCachedProfile()) {
      $scope.profile = Auth.getCachedProfile();
      $scope.getAccount($scope.profile.email);
    } else {
      Auth.getProfile(function(err, profile) {
        $scope.profile = profile;
        $scope.getAccount(profile.email);
      });
    }


    $scope.getAccount = function(email){
      Account.getAccount().$promise
        .then(function(data){
          store.set("account", data);
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push("Error occurred retrieving account");
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        })
    }

    $scope.navToggledOpen = true;


    var pusher = new Pusher('77fec1184d841b55919e', {
      cluster: 'us2',
      encrypted: true
    });

    Account.getOnboardingSteps().$promise
      .then(function(data){
        store.set('onboard', data);
        $rootScope.$broadcast('onboardingStepsAcquired');
      })
      .catch(function(err){
        if(err.data){
          $scope.errors.push("Error occurred checking onboarding steps");
        }
        else{
          $scope.errors.push({message: $scope.unresponsive_server_err });
        }
      });

    Action.query().$promise.
      then(function(data){
        store.set('actions', data);
      })
      .catch(function(err){
        if(err.data){
          $scope.errors.push("Error occurred retrieving test data");
        }
        else{
          $scope.errors.push({message: $scope.unresponsive_server_err });
        }
      });

    $scope.extractHostname = function(url) {
        var hostname;
        var domain = store.get('domain');
        //find & remove protocol (http, ftp, etc.) and get hostname
        if (domain.url.indexOf("://") > -1) {
            hostname = domain.url.split('/')[2];
        }
        else {
            hostname = domain.url.split('/')[0];
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

    /**
     * Sets domain for session
     */
    $scope.selectDomain = function(domain){
      store.set('domain', domain);
      //get default browser for domain
      //if default browser is not set then show default browser selection dialog box
      $rootScope.$broadcast("domain_selected", domain);

      $rootScope.$broadcast("reload_tests", domain);

      //Load all page states

      Domain.getAllPathObjects({host: domain.url}).$promise
                .then(function(data){
                    store.set('path_objects', data);
                })
                .catch(function(err){
                  if(err.data){
                    $scope.errors.push("Error occurred retrieving test data");
                  }
                  else{
                    $scope.errors.push({message: $scope.unresponsive_server_err });
                  }
                });;

      $state.go("main.discovery");

    }

    $scope.showDomainsPage = function(){
      $state.go("main.domains");
    }

    $scope.login = function(){
      Auth.login();
      $scope.isAuthenticated=true;
    }

    $scope.logout = function(){
      segment.track("Clicked Logout", {
      }, function(success){});

      Auth.logout();
      $scope.isAuthenticated=false;
      Auth.login();
    }

    $scope.$on('domain_updated', function(){
      $scope.domain = store.get('domain');
    });

    $scope.$on('domain_selected', function(){
      $scope.domain = store.get('domain');
      var channel = pusher.subscribe($scope.extractHostname($scope.domain.url));

      channel.bind('path_object', function(data) {
        var path_objects = store.get('path_objects');
        path_objects.push( JSON.parse(data));
        store.set('path_objects', path_objects);
      });
    });

    $scope.$on('updateApprovedTestCnt', function(event, approved_test_cnt){
      $scope.approved_test_cnt = approved_test_cnt;
    });

    $scope.$on('updateFormClassificationAlert', function(event, status){
      $scope.forms_need_classifying = status;
    });

    $scope.$on('updateAccount',$scope.getAccount());
  }
]);
