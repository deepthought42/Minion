'use strict';

var auth = angular.module('AuthInterceptor', [])
  .config(['$httpProvider',
    function($httpProvider){
      $httpProvider.interceptors.push('AuthInterceptor');
    }
  ]);

// register the interceptor as a service
auth.factory('AuthInterceptor', ['$q', '$rootScope', function($q, $rootScope) {
  return {
    // optional method
    'request': function(config) {
      config.headers = config.headers || {};
      var encodedString = btoa("priya:priya");
      //config.headers.Authorization = 'Basic '+encodedString;
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
      console.log("REJECTED :: "+rejection.status);

      if(rejection.status === 403){
        $rootScope.$broadcast("auth:forbidden");
      }
      else if(rejection.status = 401){
        $rootScope.$broadcast("auth:unauthorized");
      }

      return $q.reject(rejection);
    }
  };
} ]);
