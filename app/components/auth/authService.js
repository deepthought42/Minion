'use strict';

var authService = angular.module('Qanairy.auth', ['ngResource', 'Qanairy.serviceConfig']);

authService.factory('Auth', ['$state', 'angularAuth0', '$timeout', function ($state, angularAuth0, $timeout) {

    function login(username, password) {
      angularAuth0.client.login({
        realm: 'Username-Password-Authentication',
        username: username,
        password: password,
      }, function(err, authResult) {
        if (err) {
          console.log(err);
          alert('Error: ' + err.description + '. Check the console for further details.');
          return;
        }
        if (authResult && authResult.idToken) {
          setSession(authResult);
          $state.go('main.domains');
        }
      });
    }

    function signup(username, password) {
      angularAuth0.redirect.signupAndLogin({
        connection: 'Username-Password-Authentication',
        email: username,
        password: password
      }, function(err) {
        if (err) {
          console.log(err);
          alert(`Error: ${err.description}. Check the console for further details.`);
          return;
        }
      });
    }

    function loginWithGoogle() {
      angularAuth0.authorize({
        connection: 'google-oauth2'
      });
    }

    function handleAuthentication() {
      console.log("Handling authentication")
      angularAuth0.parseHash(function(err, authResult) {
        if (authResult && authResult.idToken) {
          setSession(authResult);
          $state.go('main.domains');
        } else if (err) {
          $timeout(function() {
            $state.go('main.domains');
          });
          console.log(err);
          alert('Error: ' + err.error + '. Check the console for further details.');
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
      $state.go('main.login');
    }

    function isAuthenticated() {
      // Check whether the current time is past the
      // access token's expiry time
      let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }

    return {
      login: login,
      signup: signup,
      loginWithGoogle: loginWithGoogle,
      handleAuthentication: handleAuthentication,
      logout: logout,
      isAuthenticated: isAuthenticated
    }
}])
