'use strict';

var testerService = angular.module('Qanairy.TestRecordService', ['ngResource', 'Qanairy.serviceConfig']);

testerService.factory('TestRecord', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/testrecords', {key: '@key'}, {
    findByKey: {url : config.basePath + '/testrecords/:key', method: 'GET', isArray: true}
  });
}]);
