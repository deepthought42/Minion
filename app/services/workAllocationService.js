'use strict';

var WorkAllocationService = angular.module('Minion.WorkAllocationService', ['ngResource', 'Minion.serviceConfig']);

WorkAllocationService.factory('WorkAllocation', ['$resource', 'Minion.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/workAllocation', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
