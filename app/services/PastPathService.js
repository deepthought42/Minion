'use strict';

var pastPathService = angular.module('Minion.PastPathService', ['ngResource', 'Minion.serviceConfig']);

pastPathService.factory('PastPath', ['$resource', 'Minion.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/pastPaths', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
