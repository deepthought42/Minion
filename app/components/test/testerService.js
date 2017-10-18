'use strict';

var testerService = angular.module('Qanairy.TesterService', ['ngResource', 'Qanairy.serviceConfig']);

testerService.factory('Tester', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/tests', {key: '@key'}, {
    update: { method: 'PUT'},
    findByName: {url : config.basePath + '/tests/name', method: 'GET', isArray: true},
    updateCorrectness: {url : config.basePath + '/tests/updateCorrectness', method: 'PUT', params: {key: '@key', correct: '@correct'}},
    runTest: {url : config.basePath + '/tests/runTest/:key', method: 'POST', params: {browser_type: '@browser_type'}},
    addGroup: {url : config.basePath + '/tests/addGroup', method: 'POST', params: {key: '@key', description: '@description', name: '@name'}},
    removeGroup: {url : config.basePath + '/tests/remove/group', method: 'POST', params: {group_key: '@group_key', test_key: '@test_key'}},
    getGroups: {url: config.basePath + '/tests/groups', method: 'GET', isArray: true, params: {url: '@url'}},
    runTestsByGroup: {url: config.basePath + '/tests/runTestGroup/:group', method: 'POST', params: { group: '@group', url: '@url'}},
    getUnverified: {url: config.basePath + '/tests/unverified', method: 'GET', isArray: true, params: {url : '@url'}}
  });
}]);
