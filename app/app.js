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
  'Qanairy.login',
  'auth0.auth0',
  'angular-jwt',
  'angular-storage',
  'ngMaterial',
  'Qanairy.version',
  'AuthInterceptor',
  'ngRaven'
]).
config(['$urlRouterProvider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider', '$stateProvider','$locationProvider','angularAuth0Provider',
  function($urlRouterProvider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider, $stateProvider, $locationProvider, angularAuth0Provider) {
    //$urlRouterProvider.otherwise('/domains');
    qanairyAuthProvider = angularAuth0Provider;

    storeProvider.setStore("sessionStorage");

    // Initialization for the angular-auth0 library
    angularAuth0Provider.init({
      clientID: AUTH0_CLIENT_ID,
      domain:  AUTH0_DOMAIN,
      responseType: 'token id_token',
      audience: 'https://qanairy.auth0.com/userinfo',
      redirectUri: 'http://localhost:8001/#/discovery',
      theme: {
        logo: 'https://s3.amazonaws.com/qanairy.com/assets/images/qanairy_logo_300.png',
        primaryColor: '#fddc05'
      },
      scope: 'openid'
    });

    //$urlRouterProvider.otherwise('/');

      jwtOptionsProvider.config({
        /*tokenGetter: function(auth) {
          console.log("stored conf token :: " + sessionStorage.getItem("token"));//+storeProvider.get('className'));

          return sessionStorage.getItem("token"); //storeProvider.get("token");
        },*/
        whiteListedDomains: ['localhost', 'api.qanairy.com'],
      //  unauthenticatedRedirectPath: '/login'
      });

      jwtInterceptorProvider.tokenGetter = function (store, auth) {
        if (DELEGATION_ENABLED) {
          // does Auth0 delegation lookup
          var fetchDelegationTokenFromAuth0 = function () {
            console.log("enabled : what");

            return auth.getToken({
              targetClientId: 'mbFktm6CPSZ7ZsAcFj11nwzkb3X64fpP',
              scope: 'openid profile app_metadata'
            }).then(function (delegation) {
              store.set('delegationToken', delegation.id_token);
              console.log("success :: "+delegation.id_token);
              return delegation.id_token;
            })
            .catch(function(data){
              console.log("error getting token");
            });
          };

          var targetClientId = API_SERVER_CLIENT_ID;
          var delegationToken = store.get('delegationToken');
          if (delegationToken) {
            // use cached delegation token
            return delegationToken;
          } else {
            console.log("delegation");
            return fetchDelegationTokenFromAuth0();
          }
        } else {
          // just obtain authentication token for this Client App
          return store.get('token');
        }

      }
      $httpProvider.interceptors.push('jwtInterceptor');

      $locationProvider.hashPrefix('');
      //$locationProvider.html5Mode(true);
  }])

.run(['$rootScope', 'angularAuth0', 'authService', 'store', 'jwtHelper', '$state', '$location', 'Account', '$window', function($rootScope, angularAuth0, authService, store, jwtHelper, $state , $location, Account, $window){

    authService.handleAuthentication();

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
      console.log("Changing state");
     //var requireLogin = toState.data.requireLogin || false;
     /*if (!angularAuth0.isAuthenticated) {
       e.preventDefault();

       // get me a login modal!
       angularAuth0.authorize({
         authParams: {
           scope: 'openid profile email' // This is if you want the full JWT
         }
       }, function(profile, idToken, accessToken, state, refreshToken) {
         store.set('profile', profile);
         $state.go(toState.name, toParams);
       }, function(err) {
         console.log("Sign in Error :(", err);
       });
     }
     else{
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
     }*/
    });

    $rootScope.$on('auth:unauthorized', function (e, toState, toParams, fromState, fromParams) {
        console.log("unauthorized user");
        auth.signin({
          authParams: {
            scope: 'openid profile app_metadata' // This is if you want the full JWT
          }
        }, function(profile, idToken, accessToken, state, refreshToken) {
          console.log("successful sign in")
          //$state.go('/user-info')
        }, function(err) {
          console.log("Sign in Error :(", err);
        });
    });

    $rootScope.$on('account-missing', function (e){
      console.log("account missing");
      //e.preventDefault();
      //$location.path('/accounts');

      var account = {
        service_package: "alpha",
        users: ["test32@qanairy.com"]
      }
      Account.save(account);
    })
}]);
