'use strict';

var testerService = angular.module('Minion.TesterService', ['ngResource', 'Minion.serviceConfig']);

testerService.factory('Tester', ['$resource', 'Minion.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/testingCoordinator', {id: '@id'}, {
    update: { method: 'PUT'}
  });
}]);
