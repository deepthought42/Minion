'use strict';

var testService = angular.module('Qanairy.TesterService', ['ngResource', 'Qanairy.serviceConfig']);

testService.factory('Tester', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/tests', {key: '@key'}, {
    update: { method: 'PUT'},
    findByName: {url : config.basePath + '/tests/name', method: 'GET', isArray: true},
    updateCorrectness: {url : config.basePath + '/tests/updateCorrectness/:key', method: 'PUT', params: {key: '@key', correct: '@correct'}},
    runTest: {url : config.basePath + '/tests/runTest/:key', method: 'POST', params: {key: '@key'}},
    addGroup: {url : config.basePath + '/tests/addGroup/:group/:key', method: 'POST', params: {key: '@key', group: '@group'}},
    getGroups: {url: config.basePath + '/tests/groups', method: 'GET', isArray: true, params: {url: '@url'}},
    runTestsByGroup: {url: config.basePath + '/tests/runTestGroup/:group', method: 'POST', params: { group: '@group', url: '@url'}}
  });
}]);
