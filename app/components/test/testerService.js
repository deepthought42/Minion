'use strict';

var testerService = angular.module('Qanairy.TesterService', ['ngResource', 'Qanairy.serviceConfig']);

testerService.factory('Tester', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/tests', {key: '@key'}, {
    update: { method: 'PUT'},
    findByName: {url : config.basePath + '/tests/name', method: 'GET', isArray: true},
    updateCorrectness: {url : config.basePath + '/tests/updateCorrectness', method: 'PUT', params: {key: '@key', browser: '@browser', correct: '@correct'}},
    setDiscoveredPassingStatus: {url : config.basePath + '/tests/setDiscoveredPassingStatus', method: 'PUT', params: {key: '@key', correct: '@correct'}},
    updateName: {url : config.basePath + '/tests/updateName/:key', method: 'PUT', params: { name: '@name'}},
    runTest: {url : config.basePath + '/tests/runTest/:key', method: 'POST', params: {browser_type: '@browser_type'}},
    addGroup: {url : config.basePath + '/tests/addGroup', method: 'POST', params: {key: '@key', description: '@description', name: '@name'}},
    removeGroup: {url : config.basePath + '/tests/remove/group', method: 'POST', params: {group_key: '@group_key', test_key: '@test_key'}},
    getGroups: {url: config.basePath + '/tests/groups', method: 'GET', isArray: true, params: {url: '@url'}},
    runTestsByGroup: {url: config.basePath + '/tests/runTestGroup/:group', method: 'POST', params: { group: '@group', url: '@url'}},
    runTests: {url: config.basePath + '/tests/runAll', method: 'POST', params: {test_keys: '@test_keys', browser_type: '@browser_type'}},
    getUnverified: {url: config.basePath + '/tests/unverified', method: 'GET', isArray: true, params: {url : '@url'}},
    getFailingCount: {url: config.basePath + '/tests/failing', method: 'GET', params: {url : '@url'}},
    getPath: {url: config.basePath + '/tests/paths', method: 'GET', params: {key : '@key'}}
  });
}]);
