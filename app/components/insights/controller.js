'use strict';

angular.module('Qanairy.insights', ['ui.router', 'Qanairy.PageService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.insights', {
    url: "/insights",
    templateUrl: 'components/insights/index.html',
    controller: 'InsightCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('InsightCtrl', ['$rootScope', '$scope', 'Page',  '$mdDialog', 'store', '$state',
  function($rootScope, $scope, Page,  $mdDialog, store, $state) {
    this._init = function(){
      $scope.errors = [];
      Page.getInsights({page_key: $stateParams.page_key}).$promise.
        then(function(data){
          $scope.insights = data;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    };

    this._init();
  }
]);
