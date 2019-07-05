'use strict';

var elementService = angular.module('Qanairy.ElementService', ['ngResource', 'Qanairy.serviceConfig']);

elementService.factory('Element', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/elements', {id: '@id'}, {
    addRule: {url: config.basePath + '/elements/:id/rules', method: 'POST', params: {type: '@type', value: '@value'}}
  });
}]);
