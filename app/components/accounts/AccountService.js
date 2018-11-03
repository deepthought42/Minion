'use strict';

var pastPathService = angular.module('Qanairy.AccountService', ['ngResource', 'Qanairy.serviceConfig']);

pastPathService.factory('Account', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/accounts', {id: '@id'}, {
    getAccount:  {url: config.basePath +"/accounts/find", method:'GET', isArray:false},
    update: { method: 'PUT'},
    save: { method: 'POST' , params: {token: '@token'}},
    getOnboardingSteps: {url: config.basePath + '/accounts/onboarding_steps_completed', method: 'GET', isArray: true},
    addOnboardingStep: {url: config.basePath + '/accounts/onboarding_step', method: 'POST', params: {step_name: '@step_name'}, isArray: true},
    usageStats: {url: config.basePath + '/accounts/usage', method: 'GET'}
  });
}]);
