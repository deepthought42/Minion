'use strict';

var auth = angular.module('AuthInterceptor', []);

// register the interceptor as a service
auth.factory('AuthInterceptor', ['$q', '$rootScope', '$injector', 'store', function($q, $rootScope, $injector, store) {
  return {
    // optional method
    'request': function(config) {
      config.headers = config.headers || {};

      config.headers['Authorization'] = "Bearer "+store.get('token');

        //$httpProvider.defaults.headers.common['Token-Type'] = auth_headers['token-type'];
        //$httpProvider.defaults.headers.common['Client'] = auth_headers['client'];
        //$httpProvider.defaults.headers.common['Expiry'] = auth_headers['expiry'];
        //$httpProvider.defaults.headers.common['Uid'] = auth_headers['uid'];

      return config;
    },

    // optional method
   'requestError': function(rejection) {

      return $q.reject(rejection);
    },

    // optional method
    'response': function(response) {
      // do something on success
      return response;
    },

    // optional method
   'responseError': function(rejection) {
      if(rejection.status === 403){
        $rootScope.$broadcast("auth:forbidden");
      }
      else if(rejection.status = 401){
        $rootScope.$broadcast("auth:unauthorized");
      }
      else if(rejection.status === 404){
        if(rejection.data.message == "Unable to find account in database"){
          $rootScope.$emit("account-missing");
        }
      }

      return $q.reject(rejection);
    }
  };
} ]);


auth.config(['$httpProvider',
    function($httpProvider){
      $httpProvider.interceptors.push('AuthInterceptor');
    }
  ]);
