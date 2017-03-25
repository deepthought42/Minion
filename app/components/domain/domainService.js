'use strict';

var domainService = angular.module('Qanairy.DomainService', ['ngResource', 'Qanairy.serviceConfig']);

domainService.factory('Domain', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/domains', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
