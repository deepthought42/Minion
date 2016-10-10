
angular.module('Minion.main', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main', {
    url: "",
    abstract: true,
    templateUrl: 'components/main/index.html',
    controller: 'MainCtrl'
  });
}])

.controller('MainCtrl', ['$rootScope', '$scope', 'auth', 'WorkAllocation', 'PathRealtimeService', '$stomp', 'store',
  function ($rootScope, $scope, auth, WorkAllocation, PathRealtimeService, $stomp, store) {

    this._init = function(){
      $scope.displayUserDropDown = false;
      $scope.authService = auth;
      $scope.menuToggled = false;
      $scope.isAuthenticated = false;
      $scope.paths = [];
      $scope.isStarted = false;

      $scope.protocols = ["http", "https"];
      $scope.workAllocation = {};
      $scope.workAllocation.urlProtocol = $scope.protocols[0];
      console.log($scope.workAllocation.urlProtocol);
    }

    this._init();

    $scope.startMappingProcess = function(workAllocation){
      console.log("Starting mapping process : " + workAllocation.url );
      WorkAllocation.query({url:  $scope.workAllocation.urlProtocol+"://"+$scope.workAllocation.url, account_key: "account_key_here"})
        .$promise.then(function(value){
          //broadcast event to start connection
          $rootScope.$broadcast("openPathStream");

          console.log("successful work request");
          $scope.isStarted = true;
        })
        .catch( function(data){
          console.log("Work request failed");
        });

    }

    /**
     * Stops mapping process on servers
     */
    $scope.stopMappingProcess = function(account_key){
      WorkAllocation.stopWork({account_key: "account_key_here"})
        .$promise.then(function(){
          $rootScope.$broadcast("closePathStream");
          $scope.isStarted = false;
        })
    }
  }
]);
