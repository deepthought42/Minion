// app/auth/auth.service.js
'use strict';

var authService = angular.module('Qanairy.authService', []);

authService.factory('Auth', ['$state', 'angularAuth0', '$timeout', 'store', 'Account', function ($state, angularAuth0, $timeout, store, Account) {

    function login() {
      angularAuth0.authorize();
    }

    function handleAuthentication() {
      angularAuth0.parseHash(function(err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
          console.log("auth result 2");
          angularAuth0.client.userInfo(authResult.accessToken, function(err, user){
            console.log("user :: "+user);
            if(user){
              var account = {
                service_package: "alpha",
              }
              console.log("Token :: "+authResult.accessToken);
              store.set('token', authResult.accessToken);
              console.log("session token :: "+store.get('token'));
              Account.save(account);
            }
            else if(err){
              console.log("Error :: "+Object.keys(err));
              console.log("Error :: "+ err.name);
              console.log("Error :: "+ err.description);
            }
          });
          setSession(authResult);
          $state.go('main.domains');
        } else if (err) {
          $timeout(function() {
            $state.go('main.domains');
            //angularAuth0.login();
          });
          console.log(err);
        }
      });
    }

    function setSession(authResult) {
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
    }

    function isAuthenticated() {
      // Check whether the current time is past the
      // access token's expiry time
      let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }

    return {
      login: login,
      handleAuthentication: handleAuthentication,
      logout: logout,
      isAuthenticated: isAuthenticated
    }
}]);
