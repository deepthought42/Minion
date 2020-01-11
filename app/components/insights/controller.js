'use strict';

angular.module('Qanairy.insights', ['ui.router', 'Qanairy.PageService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.insights', {
    url: "/insights",
    params: {
       page_key: null
    },
    templateUrl: 'components/insights/index.html',
    controller: 'InsightCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('InsightCtrl', ['$rootScope', '$scope', 'Page',  '$mdDialog', 'store', '$state', '$stateParams',
  function($rootScope, $scope, Page,  $mdDialog, store, $state, $stateParams) {
    this._init = function(){
      console.log("initializing insight page");
      $scope.errors = [];
      Page.getInsights({page_key: $stateParams.page_key}).$promise.
        then(function(data){
          console.log("data returned");
          $scope.insights = data;
        })
        .catch(function(err){
          console.log("error returned")
          $scope.errors.push(err);
        });
    };

    this._init();
  }
]);
