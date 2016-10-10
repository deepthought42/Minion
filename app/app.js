'use strict';
var AUTH0_DOMAIN='hypedrive.auth0.com';
var AUTH0_CLIENT_ID='HBqtsV4ZHZPzzptfZTsaCkqTjQKadLT8';
var API_SERVER_URL='http://localhost:8080';  // default server url for Java Spring Security API sample
var DELEGATION_ENABLED=false;
var API_SERVER_CLIENT_ID='';  // set to '' if DELEGATION_ENABLED=false
// Declare app level module which depends on views, and components
angular.module('Minion', [
  'ui.router',
  'Minion.starter',
  'Minion.dashboard',
  'Minion.tester',
  'Minion.main',
  'Minion.register',
  'Minion.login',
  'Minion.d3visualization',
  'auth0',
  'angular-jwt',
  'angular-storage',
  'ngStomp',
  'Minion.version',
  'AuthInterceptor'
]).
config(['$urlRouterProvider', 'authProvider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider',
  function($urlRouterProvider, authProvider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider ) {
    $urlRouterProvider.otherwise('/starter');

    storeProvider.setStore("sessionStorage");
    authProvider.init({
      clientID: 'HBqtsV4ZHZPzzptfZTsaCkqTjQKadLT8',
      domain: 'hypedrive.auth0.com'
    });

    authProvider.on('loginSuccess', function($location, profilePromise, idToken, store) {
      console.log("success token : "+idToken);
      store.set('token', idToken);

        profilePromise.then(function(profile) {
          sessionStorage.setItem('profile', profile);

          // sessionStorage.set('token', idToken);
          console.log("profile token :: "+profile);
        });
        $location.go('/');
      });

      authProvider.on('authenticated', function($location) {
        console.log("hmmm");
        // This is after a refresh of the page
        // If the user is still authenticated, you get this event
      });

      authProvider.on('loginFailure', function($location, error) {
        console.log("ERROR !!")

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
  console.log("meh");
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

    /**  jwtInterceptorProvider.tokenGetter = function (store, config, auth, jwtHelper) {
            if (DELEGATION_ENABLED && config.url.indexOf(API_SERVER_URL) === 0) {
              // does Auth0 delegation lookup
              var fetchDelegationTokenFromAuth0 = function () {
                return auth.getToken({
                  targetClientId: targetClientId,
                  scope: 'openid roles',
                  api_type: 'app'
                }).then(function (delegation) {
                  store.set('delegationToken', delegation.id_token);
                  return delegation.id_token;
                });
              };
              var targetClientId = API_SERVER_CLIENT_ID;
              var delegationToken = store.get('delegationToken');
              if (delegationToken && !jwtHelper.isTokenExpired(delegationToken)) {
                // use cached delegation token
                return delegationToken;
              } else {
                return fetchDelegationTokenFromAuth0();
              }
            } else {
              // just obtain authentication token for this Client App
              return store.get('token');
            }
          };
*/
    $httpProvider.interceptors.push('jwtInterceptor');

  }])
.run(['$rootScope', 'auth', 'store', 'jwtHelper', '$state', function($rootScope, auth, store, jwtHelper, $state){
  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
      var token = store.get('token');
      console.log("token :: "+token);
      if (token) {
        if (!jwtHelper.isTokenExpired(store.get('token'))) {
          if (!auth.isAuthenticated) {
            auth.authenticate(store.get('profile'), token);
          }
        } else {
          $state.go('main.login');
        }
      }
    });
  // Put the authService on $rootScope so its methods
  // can be accessed from the nav bar
  //auth.hookEvents();
}]);
