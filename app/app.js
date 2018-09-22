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
  'Qanairy.dashboard',
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
  'ngOnboarding',
  'Qanairy.AccountService',
  'Qanairy.authCallback',
  'rzModule',
  'ngRaven'
]).
config(['$urlRouterProvider', 'angularAuth0Provider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider', 'StripeCheckoutProvider', 'ngOnboardingDefaultsProvider', '$locationProvider',
  function($urlRouterProvider, angularAuth0Provider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider, StripeCheckoutProvider, ngOnboardingDefaultsProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/domains');

    StripeCheckoutProvider.defaults({
      key: "pk_test_9QwakrlLpcLEYO5Ui0JoYHvC" /*"pk_live_44mv3UzkcOxPpEk0LSXSQxsE" */
    });

    angularAuth0Provider.init({
      clientID: 'mMomHg1ZhzZkM4Tsz2NGkdJH3eeJqIq6', //'wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV',
      domain: 'staging-qanairy.auth0.com',
      responseType: 'token id_token',
      audience: 'https://staging-api.qanairy.com',
      redirectUri: 'https://staging-app.qanairy.com/authenticate',//'https://app.qanairy.com',
      scope: 'openid profile email read:domains delete:domains update:domains create:domains create:accounts read:accounts delete:accounts update:accounts read:tests update:tests read:groups update:groups create:groups delete:groups run:tests start:discovery read:actions'
    });

    storeProvider.setStore("sessionStorage");

    //ngOnboardingDefaultsProvider.set('overlay', 'false');
    ngOnboardingDefaultsProvider.set({
      overlayOpacity: '0.2',
      showStepInfo: false
    });

    $locationProvider.html5Mode(true);
  }])

.run(['$rootScope', 'store', 'jwtHelper', '$state', '$location', '$window', 'Auth',
  function($rootScope, store, jwtHelper, $state , $location, $window, Auth){
    Auth.handleAuthentication();

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
     //var requireLogin = toState.data.requireLogin || false;
       if(store.get('domain') == null && toState.name != 'authenticate' && toState.name != 'subscribe' && toState.name != 'main.account' && toState.name != 'main.dashboard'){
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
