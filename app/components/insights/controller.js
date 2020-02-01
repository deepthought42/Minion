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
            if(details != null){
              if(details.headers !== undefined){
                details.headers = JSON.parse(details.headers);
              }
              if(details.items !== undefined){
                details.items = JSON.parse(details.items);
              }
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

    $scope.getColorClass = function(score){
      if(score >= 0.85){
        return 'green';
      }
      else if(score >= 0.7 && score < 0.85 ){
        return 'yellow';
      }
      else if(score >= 0.5 && score < 0.7 ){
        return 'orange';
      }
      else {
        return 'red';
      }
    }

    $scope.formatBytes = function(bytes){
      if(bytes < 1024){
        return Math.trunc(bytes) + " Bytes";
      }
      else if(bytes >= 1024  && bytes < (1024*1024)){
        //kilobytes
        return Math.trunc((bytes/1024)) + " KB";
      }
      else if(bytes >= (1024*1024)  && bytes < (1024*1024*1024)){
        //megabytes
        return Math.trunc((bytes/1024)/1024) + " MB";

      }
      else if(bytes >= (1024*1024*1024)  && bytes < (1024*1024*1024*1024)){
        //gigabytes
        return Math.trunc(((bytes/1024)/1024)/1024) + " GB";
      }
    }
  }
]);
