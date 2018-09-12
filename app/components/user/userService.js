'use strict';

var domainService = angular.module('Qanairy.UserService', ['ngResource', 'Qanairy.serviceConfig']);

domainService.factory('User', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/users', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
