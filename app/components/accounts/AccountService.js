'use strict';

var pastPathService = angular.module('Qanairy.AccountService', ['ngResource', 'Qanairy.serviceConfig']);

pastPathService.factory('Account', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/accounts', {id: '@id'}, {
    update: { method: 'PUT'},
    save: { method: 'POST' , params: {service_package: '@service_package', payment_acct: '@payment_acct'}}
  });
}]);
