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
  'auth0',
  'angular-jwt',
  'angular-storage',
  'ngMaterial',
  'Qanairy.version',
  'AuthInterceptor'
]).
config(['$urlRouterProvider', 'authProvider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider',
  function($urlRouterProvider, authProvider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider) {
    $urlRouterProvider.otherwise('/domains');
    qanairyAuthProvider = authProvider;

    storeProvider.setStore("sessionStorage");
    authProvider.init({
      clientID: AUTH0_CLIENT_ID,
      domain:  AUTH0_DOMAIN,
      callbackUrl: location.href,
      theme: {
        logo: 'https://s3.amazonaws.com/qanairy.com/assets/images/qanairy_logo_300.png',
        primaryColor: '#fddc05'
      }
    });

    authProvider.on('loginSuccess', function($location, profilePromise, idToken, store) {
      console.log("success token stuff : "+idToken);
      store.set('token', idToken);

        profilePromise.then(function(profile) {
          store.set('profile', profile);
          //$rootScope.$broadcast('new-account');
          profile.app_metadata.plan = "alpha"
          if(profile.app_metadata && profile.app_metadata.status == "new"){
            console.log("navigating to account index");
            //broadcast event to trigger creating account
            $location.path("/accounts");
            //create account with user data
            //do something with it
          }
          // sessionStorage.set('token', idToken);
          console.log("profile token keys :: "+Object.keys(profile));
          console.log("app_metadata :: "+Object.keys(profile.app_metadata));
        });
      });

      authProvider.on('authenticated', function($location) {
        console.log("Authenticated ;; ")
        // This is after a refresh of the page
        // If the user is still authenticated, you get this event
      });

      authProvider.on('loginFailure', function($location, error) {
        console.log("ERROR !!");

      });

      authProvider.on('forbidden', function($location, error){
        console.log("forbidden request");
        $location.go('/login');
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

      $httpProvider.interceptors.push(
        	function($q) {
        		return {
            	'request': function(config) {
                //if(store.get('token')){
                  //$httpProvider.defaults.headers.common['Authorization'] = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZW1haWwiOiJia2luZHJlZEBxYW5haXJ5LmNvbSIsImNsaWVudElEIjoid1Q3UGhqczlCcHdFZm5aZUZMdksxaHdIV1Aya1U3TFYiLCJ1cGRhdGVkX2F0IjoiMjAxNy0wOC0wN1QyMjoyNzoxOC44NjNaIiwibmFtZSI6ImJraW5kcmVkQHFhbmFpcnkuY29tIiwicGljdHVyZSI6Imh0dHBzOi8vcy5ncmF2YXRhci5jb20vYXZhdGFyLzZlMWY2NTMxNzM1NmJiODdjZTI3ZTIxNjY0MmRjYjgyP3M9NDgwJnI9cGcmZD1odHRwcyUzQSUyRiUyRmNkbi5hdXRoMC5jb20lMkZhdmF0YXJzJTJGYmsucG5nIiwidXNlcl9pZCI6ImF1dGgwfDU5N2JjMTAwNDk3NDI1Nzk2YTgyNzU0ZiIsIm5pY2tuYW1lIjoiYmtpbmRyZWQiLCJpZGVudGl0aWVzIjpbeyJ1c2VyX2lkIjoiNTk3YmMxMDA0OTc0MjU3OTZhODI3NTRmIiwicHJvdmlkZXIiOiJhdXRoMCIsImNvbm5lY3Rpb24iOiJVc2VybmFtZS1QYXNzd29yZC1BdXRoZW50aWNhdGlvbiIsImlzU29jaWFsIjpmYWxzZX1dLCJjcmVhdGVkX2F0IjoiMjAxNy0wNy0yOFQyMjo1NjowMC4yODVaIiwiYXBwX21ldGFkYXRhIjp7InJvbGVzIjpbInFhbmFpcnkiXSwic3RhdHVzIjoiYWNjb3VudF9vd25lciJ9LCJyb2xlcyI6WyJxYW5haXJ5Il0sInN0YXR1cyI6ImFjY291bnRfb3duZXIiLCJwZXJzaXN0ZW50Ijp7fSwiaXNzIjoiaHR0cHM6Ly9xYW5haXJ5LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1OTdiYzEwMDQ5NzQyNTc5NmE4Mjc1NGYiLCJhdWQiOiJ3VDdQaGpzOUJwd0VmblplRkx2SzFod0hXUDJrVTdMViIsImV4cCI6MTUwMjE4MDgzOSwiaWF0IjoxNTAyMTQ0ODM5fQ.UzOqhFGmoEukXMdmN7pwv2iRvtZ6GLwEf2_ss1CUVlE";
                  //$httpProvider.defaults.headers.common['Token-Type'] = auth_headers['token-type'];
        			    //$httpProvider.defaults.headers.common['Client'] = auth_headers['client'];
        					//$httpProvider.defaults.headers.common['Expiry'] = auth_headers['expiry'];
        					//$httpProvider.defaults.headers.common['Uid'] = auth_headers['uid'];


        		    return config;
        			}
        		};
          }
        );
  }])

.run(['$rootScope', 'auth', 'store', 'jwtHelper', '$state', '$location', function($rootScope, auth, store, jwtHelper, $state , $location){

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

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
      console.log("state changed");
     //var requireLogin = toState.data.requireLogin || false;
     if (!auth.isAuthenticated) {
       // get me a login modal!
       console.log("going back to signin")
       auth.signin({
         authParams: {
           scope: 'openid profile email' // This is if you want the full JWT
         }
       }, function(profile, idToken, accessToken, state, refreshToken) {
         store.set('profile', profile);
       }, function(err) {
         console.log("Sign in Error :(", err);
       });
     }
     else{
       if(fromState.name == 'main.domains' && store.get('domain') == null){
         e.preventDefault();
       }
     }
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
      e.preventDefault();
      $location.path('/accounts');
    })
  // Put the authService on $rootScope so its methods
  // can be accessed from the nav bar
  auth.hookEvents();
}]);
