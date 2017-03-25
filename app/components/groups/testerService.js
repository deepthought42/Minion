'use strict';

var testerService = angular.module('Minion.TesterService', ['ngResource', 'Qanairy.GroupService']);

testerService.factory('Tester', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/tester', {key: '@key'}, {

  });
}]);
