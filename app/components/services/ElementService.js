'use strict';

angular.module('Qanairy.ElementService', ['ngResource', 'Qanairy.serviceConfig'])

.factory('Element', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/elements', {id: '@id'}, {
    addRule: {url: config.basePath + '/elements/:id/rules', method: 'POST', params: {type: '@type', value: '@value'}},
    removeRule: {url: config.basePath + '/elements/:id/rules/:rule_key', method: 'DELETE', params: {rule_key: '@rule_key'}},
    update: { method: 'PUT'},
    updateFormElement: {url: config.basePath + '/forms/:key/elements', method: 'PUT', params: {key: '@key'}}
  });
}]);
