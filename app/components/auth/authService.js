/*(function () {

  'use strict';

  angular
      .module('Qanairy.Auth')
      .service('AuthService', authService);


  authService.$inject = ['$state', 'lock', 'authManager'];

  function authService($state, lock, authManager) {

    function login() {
      console.log("show login stuff");
      lock.show();
    }

    // Logging out just requires removing the user's
    // id_token and profile
    function logout() {
      localStorage.removeItem('id_token');
      authManager.unauthenticate();
    }

    // Set up the logic for when a user authenticates
    // This method is called from app.run.js
    function registerAuthenticationListener() {
      lock.on('authenticated', function (authResult) {
        localStorage.setItem('id_token', authResult.idToken);
        authManager.authenticate();
      });

      lock.on('authorization_error', function (err) {
        console.log(err);
      });
    }

    return {
      login: login,
      logout: logout,
      registerAuthenticationListener: registerAuthenticationListener
    }
  }
})();
*/

/*
angular
    .module('Qanairy.Auth')
    .service('AuthService', authService);

  authService.$inject = ['$state', 'lock', 'authManager'];

  function authService($state, angularAuth0, authManager) {

    function login(username, password) {
      console.log("login");
      angularAuth0.redirect.loginWithCredentials({
        connection: 'Username-Password-Authentication',
        username: username,
        password: password,
      }, function(err) {
        if (err) return alert(err.description);
      },function(success){
        console.log('success');
      });
    }

    function signup(username, password) {
      angularAuth0.redirect.signupAndLogin({
        connection: 'Username-Password-Authentication',
        email: username,
        password: password
      }, function(err) {
        consol.log("error occurred while registering for service");
        if (err) return alert(err.description);
      },function(success){
        console.log('success');
      });
    }

    function loginWithGoogle() {
      angularAuth0.authorize({
        connection: 'google-oauth2'
      });
    }

    function handleParseHash() {
      angularAuth0.parseHash(
        { _idTokenVerification: false },
        function(err, authResult) {
        if (err) {
          console.log(err);
        }
        if (authResult && authResult.idToken) {
          setUser(authResult);
        }
      });
    }

    function logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
    }

    function setUser(authResult) {
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
    }

    function isAuthenticated() {
      return authManager.isAuthenticated();
    }

    return {
      login: login,
      signup: signup,
      loginWithGoogle: loginWithGoogle,
      handleParseHash: handleParseHash,
      logout: logout,
      isAuthenticated: isAuthenticated
    }
  }
})();
*/
