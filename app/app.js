'use strict';

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
  'Minion.version'
]).
config(['$urlRouterProvider', 'authProvider','jwtInterceptorProvider', '$httpProvider',
  function($urlRouterProvider, authProvider, jwtInterceptorProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/');

    // app.js
    authProvider.init({
        domain: 'hypedrive.auth0.com',
        clientID: 'HBqtsV4ZHZPzzptfZTsaCkqTjQKadLT8',
        loginUrl: '/login'
    });

    //Called when login is successful
    authProvider.on('loginSuccess', function($location, profilePromise, idToken, store) {
      console.log("Login Success");
      profilePromise.then(function(profile) {
        store.set('profile', profile);
        store.set('token', idToken);
      });
      $location.path('/');
    });

    //Called when login fails
    authProvider.on('loginFailure', function() {
      console.log("Error logging in");
      $location.path('/login');
    });

    //Angular HTTP Interceptor function
    jwtInterceptorProvider.tokenGetter = function(store) {
        return store.get('token');
    }
    //Push interceptor function to $httpProvider's interceptors
    $httpProvider.interceptors.push('jwtInterceptor');
  }])
.run(function(auth){
  // This hooks all auth events to check everything as soon as the app starts
  auth.hookEvents();
});
