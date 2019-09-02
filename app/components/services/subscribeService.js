'use strict';

angular.module('Qanairy.SubscribeService', ['ngResource', 'Qanairy.serviceConfig'])

.factory('Subscribe', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/subscribe', {id: '@id'}, {
    update: { method: 'PUT', params: {plan: '@plan', source_token: '@source_token'}}
  });
}]);
