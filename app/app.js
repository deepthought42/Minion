'use strict';

var AUTH0_DOMAIN='staging-qanairy.auth0.com';
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
  'auth0.lock',
  'angular-jwt',
  'angular-storage',
  'ngMaterial',
  'Qanairy.version',
  'AuthInterceptor',
  'stripe.checkout',
  'Qanairy.authService',
  'Qanairy.subscribe',
  'Qanairy.authCallback',
  'Qanairy.user',
  'Qanairy.form',
  'Qanairy.form_edit',
  'ngOnboarding',
  'Qanairy.AccountService',
  'Qanairy.authCallback',
  'Qanairy.user_edit',
  'rzModule',
  'ngRaven',
  'ngSegment',
  'Qanairy.EventService',
  'Qanairy.user_form_discovery'
]).
config(['$urlRouterProvider', 'lockProvider', '$httpProvider', 'jwtOptionsProvider', 'jwtInterceptorProvider','storeProvider', 'StripeCheckoutProvider', 'ngOnboardingDefaultsProvider', '$locationProvider', 'segmentProvider',
  function($urlRouterProvider, lockProvider, $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, storeProvider, StripeCheckoutProvider, ngOnboardingDefaultsProvider, $locationProvider, segmentProvider) {
    segmentProvider.setKey('DkANikjZ5P3CDa4rahz8PmyawVteNyiX');

    $urlRouterProvider.otherwise('/domains');

    StripeCheckoutProvider.defaults({
      key: "pk_test_9QwakrlLpcLEYO5Ui0JoYHvC" /*"pk_live_44mv3UzkcOxPpEk0LSXSQxsE" */
    });

    // Configure Auth0 Lock instance
    // Read more about configuration here:
    // https://auth0.com/docs/libraries/lock/v11
    lockProvider.init({
       domain: AUTH0_DOMAIN,
       clientID: 'mMomHg1ZhzZkM4Tsz2NGkdJH3eeJqIq6',
       options: {
         languageDictionary: {
           title: "",
           signUpTerms: "I agree to the <a href='https://app.qanairy.com/terms.html' target='_blank'>terms of use</a> and <a href='https://app.qanairy.com/privacy.html' target='_blank'>privacy policy</a>"
         },
         autoclose: true,
         auth: {
           responseType: 'token id_token',
           audience: 'https://staging-api.qanairy.com',
           params: {
             scope: 'openid profile email read:domains delete:domains update:domains create:domains create:accounts read:accounts delete:accounts update:accounts read:tests update:tests read:groups update:groups create:groups delete:groups run:tests start:discovery read:actions'
           }
         },
         theme: {
           logo: 'https://qanairy.com/assets/images/qanairy_logo_small.png',
           primaryColor: '#ffdc05',
           foregroundColor: '#111111'
         },
         mustAcceptTerms: true,
         closable: true,
         rememberLastLogin: true
      }

     });

   /*
    angularAuth0Provider.init({
      clientID: 'wT7Phjs9BpwEfnZeFLvK1hwHWP2kU7LV', //'mMomHg1ZhzZkM4Tsz2NGkdJH3eeJqIq6',
      domain: 'qanairy.auth0.com',
      responseType: 'token id_token',
      audience: 'https://api.qanairy.com',
      redirectUri: 'https://app.qanairy.com/authenticate',//http://localhost:8001/#/authenticate
      scope: 'openid profile email read:domains delete:domains update:domains create:domains create:accounts read:accounts delete:accounts update:accounts read:tests update:tests read:groups update:groups create:groups delete:groups run:tests start:discovery read:actions'
    });
*/
    storeProvider.setStore("sessionStorage");

    //ngOnboardingDefaultsProvider.set('overlay', 'false');
    ngOnboardingDefaultsProvider.set({
      overlayOpacity: '0.2',
      showStepInfo: false
    });

    //$locationProvider.html5Mode(true);
  }])

.run(['$rootScope', 'store', 'jwtHelper', '$state', '$location', '$window', 'Auth', 'Events',
  function($rootScope, store, jwtHelper, $state , $location, $window, Auth, Events){
    Auth.handleAuthentication();

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {

     //var requireLogin = toState.data.requireLogin || false;
       if(store.get('domain') == null && toState.name != 'authenticate' && toState.name != 'subscribe' && toState.name != 'main.account' && toState.name != 'main.dashboard'){
         $rootScope.$broadcast('domainRequiredError');
         if(toState.name != 'main.domains' && fromState.name == 'main.domains'){
           console.log("navigating to nowhere");
           e.preventDefault();
         }
         else if(toState.name != 'main.domains' && fromState.name != 'main.domains'){
           console.log("navigating to domain page");
           e.preventDefault();
           $state.go('main.domains');
         }
       }
    });

    $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
      var path = $location.path();
      var queryString = '';
      var referrer = '';

      //check if there is a query string
      if(path.indexOf('?') !== -1){
        queryString = path.substring(path.indexOf('?'), path.length);
      }

      //Check if there is a referrer
      if(fromState.name){
        referrer = $location.protocol() + "://" + $location.host() + "/#" + fromState.url;
      }

      analytics.page({
        path: path,
        referrer: referrer,
        search: queryString,
        url: $location.absUrl()
      });
    });

    $rootScope.$on('auth:unauthorized', function (e, toState, toParams, fromState, fromParams) {
      console.log("checking if authenticated");
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
