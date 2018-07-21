'use strict';

var domainService = angular.module('Qanairy.TestUserService', ['ngResource', 'Qanairy.serviceConfig']);

domainService.factory('TestUser', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/test_user', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
