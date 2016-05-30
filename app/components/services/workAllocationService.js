'use strict';

var WorkAllocationService = angular.module('Minion.WorkAllocationService', ['ngResource', 'Minion.serviceConfig']);

WorkAllocationService.factory('WorkAllocation', ['$resource', 'Minion.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/work', {id: '@id'}, {
    update: { method: 'PUT'},
    stopWork: {url: config.basePath+"/work/stop", method: 'GET' }
  });
}]);
