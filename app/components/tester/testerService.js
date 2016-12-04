'use strict';

var testerService = angular.module('Minion.TesterService', ['ngResource', 'Minion.serviceConfig']);

testerService.factory('Tester', ['$resource', 'Minion.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/tester', {key: '@key'}, {
    update: { method: 'PUT'},
    findByName: {url : config.basePath + '/tester/name', method: 'GET', isArray: true},
    updateCorrectness: {url : config.basePath + '/tester/updateCorrectness/:key', method: 'PUT', params: {key: '@key', correct: '@correct'}},
    runTest: {url : config.basePath + '/tester/runTest/:key', method: 'POST', params: {key: '@key'}},
    addGroup: {url : config.basePath + '/tester/addGroup/:group/:key', method: 'POST', params: {key: '@key', group: '@group'}},
    getGroups: {url: config.basePath + '/tester/groups', method: 'GET', isArray: true, params: {url: '@url'}},
    runTestsByGroup: {url: config.basePath + '/tester/runTestGroup/:group', method: 'POST', params: { group: '@group', url: '@url'}}
  });
}]);
