'use strict';

var domainService = angular.module('Qanairy.DomainService', ['ngResource', 'Qanairy.serviceConfig']);

domainService.factory('Domain', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/domains', {domain_id: '@domain_id'}, {
    update: { method: 'PUT', params: {key: '@key', protocol: '@protocol', browser_name: '@browser_name', logoUrl: '@logoUrl'}},
    save: { method: 'POST', params: {protocol: '@protocol', browser_name: '@browser_name', url: '@url', logoUrl: '@logoUrl'}},
    saveUser:{url: config.basePath + '/domains/:domain_id/users', method: 'POST', params: {username: '@username', password: '@password', role: '@role', enabled: '@enabled'}},
    getUsers: {url: config.basePath + '/domains/:domain_id/users', method: 'GET', isArray: true},
    getForms: {url: config.basePath + '/domains/:key/forms', method: 'GET', isArray: true, params:{key: '@key'}},
    updateForm: {url: config.basePath + '/domains/:key/forms', method: 'PUT', params: {key: '@key', form: '@form'}},
    getAllPageStates: {url: config.basePath + '/domains/page_states', method: 'GET', isArray: true, params: {host: '@host'}},
    getAllPageElements: {url: config.basePath + '/domains/page_elements', method: 'GET', isArray: true, params: {host: '@host'}},
    getAllPathObjects: {url: config.basePath + '/domains/path', method: 'GET', isArray: true, params: {host: '@host'}}
  });
}]);
