'use strict';

var testerService = angular.module('Qanairy.TestService', ['ngResource', 'Qanairy.serviceConfig']);

testerService.factory('Test', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/tests', {key: '@key'}, {
    update: { method: 'PUT', params:  {key: '@key', name: '@name', firefox: '@firefox', chrome: '@chrome'}},
    findByName: {url : config.basePath + '/tests/name', method: 'GET', isArray: true},
    updateCorrectness: {url : config.basePath + '/tests/updateCorrectness', method: 'PUT', params: {key: '@key', browser_name: '@browser_name', correct: '@correct'}},
    setPassingStatus: {url : config.basePath + '/tests/setPassingStatus', method: 'PUT', params: {key: '@key', correct: '@correct', browser: '@browser_name'}},
    updateName: {url : config.basePath + '/tests/updateName', method: 'PUT', params: { key: '@key', name: '@name'}},
    addGroup: {url : config.basePath + '/tests/addGroup', method: 'POST', params: {key: '@key', description: '@description', name: '@name'}},
    removeGroup: {url : config.basePath + '/tests/remove/group', method: 'POST', params: {group_key: '@group_key', test_key: '@test_key'}},
    getGroups: {url: config.basePath + '/tests/groups', method: 'GET', isArray: true, params: {url: '@url'}},
    runTestsByGroup: {url: config.basePath + '/tests/runTestGroup/:group', method: 'POST', params: { group: '@group', url: '@url'}},
    runTests: {url: config.basePath + '/tests/run', method: 'POST', params: {test_keys: '@test_keys', browser_name: '@browser_type'}},
    getUnverified: {url: config.basePath + '/tests/unverified', method: 'GET', isArray: true, params: {url : '@url'}},
    getFailingCount: {url: config.basePath + '/tests/failing', method: 'GET', params: {url : '@url'}},
    getPath: {url: config.basePath + '/tests/paths', method: 'GET', params: {key : '@key'}}
  });
}]);
