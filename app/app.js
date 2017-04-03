'use strict';
var AUTH0_DOMAIN='qanairy.auth0.com';
var AUTH0_CLIENT_ID='wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV';
var API_SERVER_URL='http://localhost:8080';  // default server url for Java Spring Security API sample
var DELEGATION_ENABLED=false;
var API_SERVER_CLIENT_ID='';  // set to '' if DELEGATION_ENABLED=false
// Declare app level module which depends on views, and components
angular.module('Qanairy', [
  'ui.router',
  'Qanairy.discovery',
  'Qanairy.dashboard',
  'Qanairy.domain',
  'Qanairy.tests',
  'Minion.main',
  'Qanairy.register',
  'Minion.login',
  'auth0',
  'angular-jwt',
  'angular-storage',
  'ngStomp',
  'ngMaterial',
  'Qanairy.version',
  'AuthInterceptor'
]).
config(['$urlRouterProvider', 'authProvider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider',
  function($urlRouterProvider, authProvider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider ) {
    $urlRouterProvider.otherwise('/discovery');

    storeProvider.setStore("sessionStorage");
    authProvider.init({
      clientID: 'wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV',
      domain: 'qanairy.auth0.com',
      loginUrl: '/login',
      callbackUrl: location.href,
    });

    authProvider.on('loginSuccess', function($location, profilePromise, idToken, store) {
      console.log("success token : "+idToken);
      store.set('token', idToken);

        profilePromise.then(function(profile) {
          sessionStorage.setItem('profile', profile);

          // sessionStorage.set('token', idToken);
          console.log("profile token :: "+profile);
        });
      });

      authProvider.on('authenticated', function($location) {
        // This is after a refresh of the page
        // If the user is still authenticated, you get this event
      });

      authProvider.on('loginFailure', function($location, error) {
        console.log("ERROR !!");

      });

      authProvider.on('forbidden', function($location, error){
        console.log("forbidden request");
        //$location.go('/login');
      });

    jwtOptionsProvider.config({
        /*tokenGetter: function(auth) {
          console.log("stored conf token :: " + sessionStorage.getItem("token"));//+storeProvider.get('className'));

          return sessionStorage.getItem("token"); //storeProvider.get("token");
        },*/
        whiteListedDomains: ['localhost'],
        unauthenticatedRedirectPath: '/login'
      });

jwtInterceptorProvider.tokenGetter = function (store, auth) {
  if (DELEGATION_ENABLED) {
    // does Auth0 delegation lookup
    var fetchDelegationTokenFromAuth0 = function () {
      console.log("enabled : what");

      return auth.getToken({
        targetClientId: 'mbFktm6CPSZ7ZsAcFj11nwzkb3X64fpP',
        scope: 'openid profile'
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

  }])
.run(['$rootScope', 'auth', 'store', 'jwtHelper', '$state', function($rootScope, auth, store, jwtHelper, $state){
  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
     var requireLogin = toState.data.requireLogin || false;
     if (requireLogin && !auth.isAuthenticated) {
       event.preventDefault();
       // get me a login modal!
       console.log("going back to signin")
       auth.signin({
         authParams: {
           scope: 'openid profile' // This is if you want the full JWT
         }
       }, function(profile, idToken, accessToken, state, refreshToken) {
         console.log("successful sign in")
         //$state.go('/user-info')
       }, function(err) {
         console.log("Sign in Error :(", err);
       });
     }
    });

    $rootScope.$on('auth:unauthorized', function (e, toState, toParams, fromState, fromParams) {
        console.log("403 forbidden");

        auth.signin({
          authParams: {
            scope: 'openid profile' // This is if you want the full JWT
          }
        }, function(profile, idToken, accessToken, state, refreshToken) {
          console.log("successful sign in")
          //$state.go('/user-info')
        }, function(err) {
          console.log("Sign in Error :(", err);
        });
    });
  // Put the authService on $rootScope so its methods
  // can be accessed from the nav bar
  auth.hookEvents();
}]);
