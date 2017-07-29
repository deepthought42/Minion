'use strict';

angular.module('Qanairy.domain', ['ui.router', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.domains', {
    url: "/domains",
    templateUrl: 'components/domain/index.html',
    controller: 'DomainCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('DomainCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog',
  function($rootScope, $scope, Domain,  $mdDialog) {
    this._init = function(){
      $scope.domains = Domain.query();
      $scope.domain_url = "";
      $scope.domain_error = "";
      $scope.domain_creation_err = "An error occurred while saving the domain";
    }

    $scope.createDomain = function(domain_url){
      Domain.save(domain_url).$promise.then(function(successResult){
        $scope.show_create_domain_err = false;
        var domain = successResult;
        store.set('domain', domain_url);
      },
      function(errorResult){
        $scope.show_create_domain_err = true;
      });
    }

    /**
     * Sets domain for session
     */
    $scope.selectDomain = function(domain){
      store.set('domain', domain);
      $rootScope.domain = domain;
      $state.go("main.tests");
    }

    $scope.showCustom = function(event) {
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

    $scope.$on('domainRequiredError', function(){
      console.log("domain error "+$scope.domain_error);
      $scope.domain_error = "A domain must be selected first";
      //$scope.$apply();
    })

  }
]);
