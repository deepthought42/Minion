'use strict';

var WorkAllocationService = angular.module('Qanairy.WorkAllocationService', ['ngResource', 'Qanairy.serviceConfig']);

WorkAllocationService.factory('WorkAllocation', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/discovery', {id: '@id'}, {
    update: { method: 'PUT'},
    startWork: {url: config.basePath+"/discovery/start", method: 'GET' },
    stopWork: {url: config.basePath+"/discovery/stop", method: 'GET' }
  });
}]);
