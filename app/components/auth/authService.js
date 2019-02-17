// app/auth/auth.service.js
'use strict';

var authService = angular.module('Qanairy.authService', []);

authService.factory('Auth', ['$state', 'angularAuth0', '$timeout', 'store', 'segment', 'Account',
  function ($state, angularAuth0, $timeout, store, segment, Account) {

    function login() {
      angularAuth0.authorize();
    }

    function handleAuthentication() {
      angularAuth0.parseHash(function(err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {

          setSession(authResult);

          getProfile(function(err, profile) {
            sessionStorage.setItem('profile', JSON.stringify(profile));

            segment.identify(profile.id, {
              name : profile.name,
              nickname : profile.nickname,
              email : profile.email
            });
          });

          if(store.get('domain')){
            $state.go('main.discovery');
          }
          else{
            $state.go('main.domains');
          }
        } else if (err) {
          console.log(err);
          login();
        }
      });
    }

    function setSession(authResult) {
      sessionStorage.setItem('token', authResult.accessToken);

      // Set the time that the access token will expire at
      let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
    }

    function logout() {
      // Remove tokens and expiry time from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      sessionStorage.clear();
    }

    function isAuthenticated() {
      // Check whether the current time is past the
      // access token's expiry time
      let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      console.log("is authenticated???   "+(new Date().getTime() < expiresAt));
      return new Date().getTime() < expiresAt;
    }

    /******************** User profile **********************/
    var userProfile;

    function getProfile(cb) {
      var accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        login();
        //throw new Error('Access Token must exist to fetch profile');
      }
      angularAuth0.client.userInfo(accessToken, function(err, profile) {
        if (profile) {
          setUserProfile(profile);
        }
        cb(err, profile);
      });
    }

    function setUserProfile(profile) {
      userProfile = profile;
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
