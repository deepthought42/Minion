'use strict';

angular.module('Qanairy.domain', ['ui.router', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.domain', {
    url: "/domains",
    templateUrl: 'components/domain/index.html',
    controller: 'DomainCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('DomainCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog', 'store',
  function($rootScope, $scope, Domain,  $mdDialog, store) {
    this._init = function(){
      $scope.domains = Domain.query();
      $scope.domain_url = "";
    }

    $scope.createDomain = function(domain_url){
      Domain.save(domain_url);
      store.set('domain', domain_url);
      console.log("domain data store :: "+store.get('domain'));
    }

    $scope.openCreateDomainDialog = function(event) {
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          template: '<md-dialog>' +
                      '  <md-dialog-content>' +
                      '     Start a new project by adding a domain.' +
                      '  </md-dialog-content>' +
                      '  <md-dialog-content>' +
                      '    <input id="domain_input" ng-model="domain_url" class="" placeholder="yourdomain.com" />' +
                      '  </md-dialog-content>' +
                      '  <md-dialog-content>' +
                      '    <button id="create_domain_button" ng-click="createDomain(domain_url)" class="btn">Create Project</button>' +
                      '  </md-dialog-content>' +
                      '</md-dialog>',
          controller: function DialogController($scope, $mdDialog) {
             $scope.closeDialog = function() {
                $mdDialog.hide();
             }
          }
       });
    };

    this._init();
  }
]);
