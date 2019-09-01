'use strict';

angular.module('Qanairy.ActionService', ['ngResource', 'Qanairy.serviceConfig']);

.factory('Action', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/actions', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
