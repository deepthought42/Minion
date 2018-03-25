'use strict';

var subscribeService = angular.module('Qanairy.SubscribeService', ['ngResource', 'Qanairy.serviceConfig']);

subscribeService.factory('Subscribe', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/subscribe', {id: '@id'}, {
    update: { method: 'PUT', params: {plan: '@plan'}}
  });
}]);
