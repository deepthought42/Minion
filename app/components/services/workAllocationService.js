'use strict';

var WorkAllocationService = angular.module('Minion.WorkAllocationService', ['ngResource', 'Qanairy.serviceConfig']);

WorkAllocationService.factory('WorkAllocation', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/work', {id: '@id'}, {
    update: { method: 'PUT'},
    stopWork: {url: config.basePath+"/work/stop", method: 'GET' }
  });
}]);
