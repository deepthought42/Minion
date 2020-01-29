'use strict';

angular.module('Qanairy.page', ['ui.router', 'Qanairy.DomainService', 'Qanairy.insights'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.pages', {
    url: "/pages",
    templateUrl: 'components/page/index.html',
    controller: 'PageCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('PageCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog', 'store', '$state',
  function($rootScope, $scope, Domain,  $mdDialog, store, $state) {
    this._init = function(){
      $scope.errors = [];
      Domain.getPages({url: store.get("domain").url}).$promise
        .then(function(data){
          $scope.pages = data;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    };

    this._init();

    //navigate to page insights view and pass page_key as a stateParams variable
    $scope.showInsights = function(page_key){
      $state.go('main.insights', {
        page_key: page_key
      });
    }

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
  }
]);
