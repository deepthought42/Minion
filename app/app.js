'use strict';
var AUTH0_DOMAIN='qanairy.auth0.com';
var AUTH0_CLIENT_ID='wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV';
var API_SERVER_URL='api.qanairy.com:8080';  // default server url for Java Spring Security API sample
var DELEGATION_ENABLED=true;
var API_SERVER_CLIENT_ID='';  // set to '' if DELEGATION_ENABLED=false
var LOCK_OPTIONS = {
    theme: {
      logo: 'https://s3.amazonaws.com/qanairy.com/assets/images/qanairy_logo_300.png',
      primaryColor: '#fddc05'
    },
    languageDictionary: {
      signUpTerms: "I agree to the <a href='/terms' target='_new'>terms of service</a> and <a href='/privacy' target='_new'>privacy policy</a>."
    },
    mustAcceptTerms: true,
    redirectUrl: 'http://localhost:8001/*'
    /*avatar: {
      url: function(email, cb) {
        // Obtain the avatar url for the email input by the user, Lock
        // will preload the image it before displaying it.
        // Note that in case of an error you call cb with the error in
        // the first arg instead of `null`.
        var url = obtainAvatarUrl(email);
        cb(null, url);
      },
      displayName: function(email, cb) {
        // Obtain the display name for the email input by the user.
        // Note that in case of an error you call cb with the error in
        // the first arg instead of `null`.
        var displayName = obtainDisplayName(email);
        cb(null, displayName);
      }
    }
    */
  }
var qanairyAuthProvider = null;
// Declare app level module which depends on views, and components
angular.module('Qanairy', [
  'ui.router',
  'Qanairy.discovery',
  'Qanairy.domain',
  'Qanairy.tests',
  'Qanairy.main',
  'Qanairy.account',
  'auth0.lock',
  'angular-jwt',
  'angular-storage',
  'ngMaterial',
  'Qanairy.version',
  'AuthInterceptor',
  'ngRaven'
]).
config(['$urlRouterProvider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider', 'lockProvider', '$locationProvider',
  function($urlRouterProvider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider, lockProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/domains');
    $locationProvider.html5Mode(true);

    lockProvider.init({
        clientID: AUTH0_CLIENT_ID,
        domain: AUTH0_DOMAIN,
        options: LOCK_OPTIONS
      });

    var options = {
      theme: {
        logo: 'https://s3.amazonaws.com/qanairy.com/assets/images/qanairy_logo_300.png'
      }
    };
    var lock = new Auth0Lock('wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV', 'qanairy.auth0.com', LOCK_OPTIONS);

      jwtOptionsProvider.config({
        /*tokenGetter: function(auth) {
          console.log("stored conf token :: " + sessionStorage.getItem("token"));//+storeProvider.get('className'));

          return sessionStorage.getItem("token"); //storeProvider.get("token");
        },*/
        whiteListedDomains: ['localhost', 'api.qanairy.com'],
        //unauthenticatedRedirectPath: '/login'
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
  }])

.run(['$rootScope', 'store', 'jwtHelper', '$state', '$location', 'Account', '$window', 'lock',
      function($rootScope, store, jwtHelper, $state , $location, Account, $window, lock){


  // For use with UI Router
    lock.interceptHash();

    lock.on('authenticated', function(authResult) {
      localStorage.setItem('id_token', authResult.idToken);

      lock.getProfile(authResult.idToken, function(error, profile) {
        if (error) {
          console.log(error);
        }
        localStorage.setItem('profile', JSON.stringify(profile));
      });
    });

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
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
     }
     */
    });

    $rootScope.$on('auth:unauthorized', function (e, toState, toParams, fromState, fromParams) {
        console.log("unauthorized user");
      /*  auth.signin({
          authParams: {
            scope: 'openid profile app_metadata' // This is if you want the full JWT
          }
        }, function(profile, idToken, accessToken, state, refreshToken) {
          console.log("successful sign in")
          //$state.go('/user-info')
        }, function(err) {
          console.log("Sign in Error :(", err);
        });
        */
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
