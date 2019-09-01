'use strict';

angular.module('Minion.PastPathService', ['ngResource', 'Qanairy.serviceConfig'])

.factory('PastPath', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/pastPaths', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
