'use strict';

var domainService = angular.module('Qanairy.PageService', ['ngResource', 'Qanairy.serviceConfig']);

domainService.factory('Page', ['$resource', 'Qanairy.serviceConfig', function ($resource, config) {
  return $resource(config.basePath + '/pages', {page_key: '@page_key'}, {
    getInsights: {url: config.basePath + '/pages/:page_key/insights', method: 'GET', isArray: true},
  });
}]);
