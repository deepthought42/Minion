'use strict';
/* global angular */

var domainService = angular.module('Qanairy.FormService', ['ngResource', 'Qanairy.serviceConfig']);

domainService.factory('Form', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/form', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
