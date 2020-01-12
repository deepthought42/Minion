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
          $scope.insight = data;

          $scope.insight.audits.forEach(function(part, index) {
            var details = JSON.stringify(this[index].details).replace('\\"', '');
            details = JSON.parse(details);
            if(details.headers !== undefined){
              details.headers = JSON.parse(details.headers);
            }
            if(details.items !== undefined){
              details.items = JSON.parse(details.items);
            }
            this[index].details = details;
          }, $scope.insight.audits);
        })
        .catch(function(err){
          console.log("error returned")
          $scope.errors.push(err);
        });
    };

    this._init();
  }
]);
