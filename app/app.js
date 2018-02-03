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
      audience: 'https://qanairy.auth0.com/userinfo',
      redirectUri: 'http://localhost:8001',
      scope: 'openid profile create:accounts'
    });

      jwtOptionsProvider.config({
        /*tokenGetter: function(auth) {
          console.log("stored conf token :: " + sessionStorage.getItem("token"));//+storeProvider.get('className'));

          return sessionStorage.getItem("token"); //storeProvider.get("token");
        },*/
        whiteListedDomains: ['localhost', 'api.qanairy.com'],
      //  unauthenticatedRedirectPath: '/login'
      });

      jwtInterceptorProvider.tokenGetter = function (store, auth) {
          // just obtain authentication token for this Client App
          return store.get('token');

      }
      $httpProvider.interceptors.push('jwtInterceptor');
  }])

.run(['$rootScope', 'store', 'jwtHelper', '$state', '$location', 'Account', '$window', 'Auth',
  function($rootScope, store, jwtHelper, $state , $location, Account, $window, Auth){
    Auth.handleAuthentication();

/*
    qanairyAuthProvider.on('authenticated', function($location) {
      // This is after a refresh of the page
      // If the user is still authenticated, you get this event
    });

    qanairyAuthProvider.on('loginFailure', function($location, error) {
      console.log("ERROR !!");

    });

    qanairyAuthProvider.on('forbidden', function($location, error){
      console.log("forbidden request");
      $location.go('/login');
    });

    qanairyAuthProvider.on('loginSuccess', function($location, profilePromise, idToken, store) {
      store.set('token', idToken);

        profilePromise.then(function(profile) {
          store.set('profile', profile);
          //$rootScope.$broadcast('new-account');
          profile.app_metadata.plan = "alpha"
          if(profile.app_metadata && profile.app_metadata.status == "new"){
            console.log("navigating to account index");
            //broadcast event to trigger creating account
            //$location.path("/accounts");
            console.log("NEW ACCOUNT! WOOO!");
            var account = {
              service_package: "alpha",
              payment_acct: "stripe_acct_tmp"
            }
            Account.save(account);
            $window.location.reload();
            //create account with user data
            //$rootScope.$broadcast("new-account");
          }
        });
      });


      qanairyAuthProvider.on('authenticated', function($location) {
        console.log("Authenticated ;; ")
        // This is after a refresh of the page
        // If the user is still authenticated, you get this event
      });

      qanairyAuthProvider.on('loginFailure', function($location, error) {
        console.log("ERROR !!");

      });

      qanairyAuthProvider.on('forbidden', function($location, error){
        console.log("forbidden request");
        $location.go('/login');
      });
*/
    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
      if(!Auth.isAuthenticated()){
        Auth.login();
      }
     //var requireLogin = toState.data.requireLogin || false;
     /*if (!auth.isAuthenticated) {
       e.preventDefault();

       // get me a login modal!
       auth.signin({
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
        Auth.handleAuthentication();
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
