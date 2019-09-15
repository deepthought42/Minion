'use strict';

var domainService = angular.module('Qanairy.DomainService', ['ngResource', 'Qanairy.serviceConfig']);

domainService.factory('Domain', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/domains', {domain_id: '@domain_id'}, {
    delete: { url: config.basePath + '/domains/:domain_id', method: 'DELETE'},
    update: { method: 'PUT', params: {key: '@key', protocol: '@protocol', browser_name: '@browser_name', logo_url: '@logoUrl'}},
    save: { method: 'POST', params: {protocol: '@protocol', browser_name: '@browser_name', url: '@url', logo_url: '@logoUrl'}},
    addUser:{url: config.basePath + '/domains/:domain_id/users', method: 'POST', params: {username: '@username', password: '@password', role: '@role', enabled: '@enabled'}},
    updateUser:{url: config.basePath + '/domains/:domain_id/users', method: 'PUT', params: {user_id: '@user_id', username: '@username', password: '@password', role: '@role', enabled: '@enabled'}},
    deleteUser: { url: config.basePath + '/domains/test_users/:user_id', method: 'DELETE', params: {domain_key: '@domain_key', username: '@username'}},
    getUsers: {url: config.basePath + '/domains/:domain_id/users', method: 'GET',  params: {key: '@key'}, isArray: true},
    getForms: {url: config.basePath + '/domains/:domain_id/forms', method: 'GET', isArray: true},
    updateForm: {url: config.basePath + '/domains/:domain_id/forms', method: 'PUT', params: {id: '@id',name: '@name', type: '@form_type'}},
    getAllPageStates: {url: config.basePath + '/domains/page_states', method: 'GET', isArray: true, params: {host: '@host'}},
    getAllPageElements: {url: config.basePath + '/domains/page_elements', method: 'GET', isArray: true, params: {host: '@host'}},
    getAllPathObjects: {url: config.basePath + '/domains/path', method: 'GET', isArray: true, params: {host: '@host'}}
  });
}]);
