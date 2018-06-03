'use strict';

var pastPathService = angular.module('Qanairy.ActionService', ['ngResource', 'Qanairy.serviceConfig']);

pastPathService.factory('Action', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/actions', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
