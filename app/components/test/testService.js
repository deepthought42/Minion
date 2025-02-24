'use strict';

var testerService = angular.module('Qanairy.TestService', ['ngResource', 'Qanairy.serviceConfig']);

testerService.factory('Test', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/tests', {key: '@key'}, {
    update: { method: 'PUT', params:  {key: '@key', name: '@name', firefox: '@firefox', chrome: '@chrome', url: '@url'}},
    findByName: {url : config.basePath + '/tests/name', method: 'GET', isArray: true},
    setPassingStatus: {url : config.basePath + '/tests/setPassingStatus', method: 'PUT', params: {key: '@key', status: '@status', browser: '@browser_name', url: '@url'}},
    archive: {url : config.basePath + '/tests/archive', method: 'PUT', params: { key: '@key', url: '@url'}},
    updateName: {url : config.basePath + '/tests/updateName', method: 'PUT', params: { key: '@key', name: '@name', url: '@url'}},
    addGroup: {url : config.basePath + '/tests/addGroup', method: 'POST', params: {key: '@key', description: '@description', name: '@name', url: '@url'}},
    removeGroup: {url : config.basePath + '/tests/remove/group', method: 'POST', params: {group_key: '@group_key', test_key: '@test_key', url: '@url'}},
    getGroups: {url: config.basePath + '/tests/groups', method: 'GET', isArray: true, params: {url: '@url'}},
    runTestsByGroup: {url: config.basePath + '/tests/runTestGroup/:group', method: 'POST', params: { group: '@group', url: '@url'}},
    runTests: {url: config.basePath + '/tests/run', method: 'POST', params: {test_keys: '@test_keys', browser: '@browser', host_url: '@host_url'}},
    sendTestToIde: {url: config.basePath + '/tests/:test_key/edit', method: 'POST', params: {test_key: '@test_key', url: '@url'}},
    getUnverified: {url: config.basePath + '/tests/unverified', method: 'GET', isArray: true, params: {url : '@url'}},
    getFailingCount: {url: config.basePath + '/tests/failing', method: 'GET', params: {url : '@url'}},
    getPath: {url: config.basePath + '/tests/paths', method: 'GET', params: {key : '@key'}}
  });
}]);
