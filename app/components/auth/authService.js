// app/auth/auth.service.js
'use strict';

var authService = angular.module('Qanairy.authService', []);

authService.factory('Auth', ['$state', 'lock', '$timeout', 'store', 'segment',
  function ($state, lock, $timeout, store, segment) {

    function login() {
      // Display the Lock widget using the
      // instance initialized in the app.js config
      lock.show();
    }


    function logout() {
      sessionStorage.removeItem('token');

      // Remove tokens and expiry time from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
    }

    function handleAuthentication() {
      //lock.interceptHash();
      console.log("handling authentication");
      lock.on('authenticated', function(authResult) {

        console.log("user was authenticated");
        _setSession(authResult);
        localStorage.setItem('id_token', authResult.idToken);


        if(store.get('domain')){
          console.log("going to discovery");
          $state.go('main.discovery');
        }
        else{
          console.log("going to domains");
          $state.go('main.domains');
        }
      });

      lock.on('authorization_error', function(err) {
        console.log(err);
        login();
      });

      lock.on('signup submit', function(authResult) {
        _setSession(authResult);

        console.log("Lock returned a signup submitted event");
        localStorage.setItem('id_token', authResult.idToken);

        lock.getProfile(authResult.idToken, function(error, profile) {
          if (error) {
            console.log(error);
          }
          localStorage.setItem('profile', JSON.stringify(profile));
        });
      });
    }

    function _setSession(authResult) {
      sessionStorage.setItem('token', authResult.accessToken);
      console.log("Setting session");
      // Set the time that the access token will expire at
      let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());

      // Save tokens and expiration to localStorage
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
    }


    function isAuthenticated() {
      // Check whether the current time is
      // past the Access Token's expiry time
      var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }

    /******************** User profile **********************/
    function getProfile(cb) {
      var accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Access Token must exist to fetch profile');
      }
      lock.getUserInfo(accessToken, function(err, profile) {
        cb(err, profile);
      });
    }

    function getCachedProfile() {
      return userProfile;
    }

    return {
      login: login,
      handleAuthentication: handleAuthentication,
      logout: logout,
      isAuthenticated: isAuthenticated,
      getProfile: getProfile,
      getCachedProfile: getCachedProfile
    }
}]);
