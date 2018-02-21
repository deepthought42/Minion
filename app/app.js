'use strict';
var AUTH0_DOMAIN='qanairy.auth0.com';
var AUTH0_CLIENT_ID='wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV';
var API_SERVER_URL='api.qanairy.com:8080';  // default server url for Java Spring Security API sample
var DELEGATION_ENABLED=false;
var API_SERVER_CLIENT_ID='';  // set to '' if DELEGATION_ENABLED=false
var qanairyAuthProvider = null;
// Declare app level module which depends on views, and components
angular.module('Qanairy', [
  'ui.router',
  'Qanairy.discovery',
  'Qanairy.domain',
  'Qanairy.tests',
  'Qanairy.main',
  'Qanairy.account',
  'auth0.auth0',
  'angular-jwt',
  'angular-storage',
  'ngMaterial',
  'Qanairy.version',
  'AuthInterceptor',
  'Qanairy.authService',
  'ngRaven'
]).
config(['$urlRouterProvider', 'angularAuth0Provider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider',
  function($urlRouterProvider, angularAuth0Provider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider) {
    $urlRouterProvider.otherwise('/domains');
    qanairyAuthProvider = angularAuth0Provider;

    storeProvider.setStore("sessionStorage");
    angularAuth0Provider.init({
      clientID: 'wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV',
      domain: 'qanairy.auth0.com',
      responseType: 'token id_token',
      audience: 'https://api.qanairy.com',
      redirectUri: 'http://localhost:8001',
      scope: 'openid profile read:domains delete:domains update:domains create:domains create:accounts read:tests update:tests read:groups update:groups create:groups delete:groups run:tests start:discovery'
    });

      jwtOptionsProvider.config({
        tokenGetter: function(auth) {
          return localStorage.getItem("access-token"); //storeProvider.get("token");
        },
        whiteListedDomains: ['localhost', 'api.qanairy.com'],
      //  unauthenticatedRedirectPath: '/login'
      });


      $httpProvider.interceptors.push('jwtInterceptor');
  }])

.run(['$rootScope', 'store', 'jwtHelper', '$state', '$location', 'Account', '$window', 'Auth',
  function($rootScope, store, jwtHelper, $state , $location, Account, $window, Auth){
    Auth.handleAuthentication();

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
     //var requireLogin = toState.data.requireLogin || false;
       if(store.get('domain') == null){
         $rootScope.$broadcast('domainRequiredError');
         if(toState.name != 'main.domains' && fromState.name == 'main.domains'){
           e.preventDefault();
         }
         else if(toState.name != 'main.domains' && fromState.name != 'main.domains'){
           e.preventDefault();
           $state.go('main.domains');
         }
       }
    });

    $rootScope.$on('auth:unauthorized', function (e, toState, toParams, fromState, fromParams) {
        if(!Auth.isAuthenticated()){
          Auth.login();
        }
        /*auth.signin({
          authParams: {
            scope: 'openid profile app_metadata' // This is if you want the full JWT
          }
        }, function(profile, idToken, accessToken, state, refreshToken) {
          console.log("successful sign in")
          //$state.go('/user-info')
        }, function(err) {
          console.log("Sign in Error :(", err);
        });*/
    });

    $rootScope.$on('account-missing', function (e){
      console.log("account missing");
//    NOTE TO IMPLEMENT --- NAVIGATE TO ACCOUNT SIGN UP PAGE

      //e.preventDefault();
      //$location.path('/accounts');

      var account = {
        service_package: "alpha",
        users: ["test32@qanairy.com"]
      }
      Account.save(account);
    })
  // Put the authService on $rootScope so its methods
  // can be accessed from the nav bar
  //auth.hookEvents();
}]);
