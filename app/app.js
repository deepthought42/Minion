'use strict';

var AUTH0_DOMAIN='qanairy.auth0.com';
var AUTH0_CLIENT_ID='wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV';
var API_SERVER_URL='api.qanairy.com:80';  // default server url for Java Spring Security API sample
var DELEGATION_ENABLED=false;
var API_SERVER_CLIENT_ID='';  // set to '' if DELEGATION_ENABLED=false
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
  'stripe.checkout',
  'Qanairy.authService',
  'Qanairy.user_profile',
  'Qanairy.subscribe',
  'Qanairy.authCallback',
  'Qanairy.AccountService',
  'rzModule',
  'ngRaven'
]).
config(['$urlRouterProvider', 'angularAuth0Provider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider', 'StripeCheckoutProvider',
  function($urlRouterProvider, angularAuth0Provider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider, StripeCheckoutProvider) {
    $urlRouterProvider.otherwise('/domains');

    StripeCheckoutProvider.defaults({
      key: "pk_test_9QwakrlLpcLEYO5Ui0JoYHvC" /*pk_live_44mv3UzkcOxPpEk0LSXSQxsE"*/
    });

    angularAuth0Provider.init({
      clientID: 'wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV',
      domain: 'qanairy.auth0.com',
      responseType: 'token id_token',
      audience: 'https://staging-api.qanairy.com',
      redirectUri: 'http://localhost:8001/#/authenticate',
      scope: 'openid profile email read:domains delete:domains update:domains create:domains create:accounts delete:accounts update:accounts read:tests update:tests read:groups update:groups create:groups delete:groups run:tests start:discovery'
    });

    storeProvider.setStore("sessionStorage");

      jwtOptionsProvider.config({
        tokenGetter: function(auth) {
          return localStorage.getItem("access-token"); //storeProvider.get("token");
        },
        whiteListedDomains: ['localhost', 'api.qanairy.com', 'staging-api.qanairy.com'],
      //  unauthenticatedRedirectPath: '/login'
      });


      $httpProvider.interceptors.push('jwtInterceptor');
  }])

.run(['$rootScope', 'store', 'jwtHelper', '$state', '$location', '$window', 'Auth', 'Account',
  function($rootScope, store, jwtHelper, $state , $location, $window, Auth, Account){
    Auth.handleAuthentication();

    Account.getOnboardingSteps().$promise
      .then(function(data){
        console.log("data :::    "+data);
        store.set('onboarded_steps', data);
      })
      .catch(function(data){

      });

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
     //var requireLogin = toState.data.requireLogin || false;
       if(store.get('domain') == null && toState.name != 'subscribe' && toState.name != 'main.account'){
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
    });

    $rootScope.$on('auth:forbidden', function (e, toState, toParams, fromState, fromParams) {

    });

    $rootScope.$on('resource_conflict', function (e, toState, toParams, fromState, fromParams) {
      //$state.go('subscribe');
    });

    $rootScope.$on('account-missing', function (e){
      //    NOTE TO IMPLEMENT --- NAVIGATE TO ACCOUNT SIGN UP PAGE

      //e.preventDefault();
      //$location.path('/accounts');
    })
  // Put the authService on $rootScope so its methods
  // can be accessed from the nav bar
  //auth.hookEvents();
}]);
