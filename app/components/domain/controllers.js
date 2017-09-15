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

.controller('DomainCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog', 'store', '$state',
  function($rootScope, $scope, Domain,  $mdDialog, store, $state) {
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
      console.log("set domain");
      $state.go("main.tests");
    }

    $scope.openCreateDomainDialog  = function(event) {
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          template: '<md-dialog class="col-sm-4" style="">' +
                      '<div class="col-sm-12 domain-dialogue-close" ng-click="closeCreateDomainDialog()">' +
                      '  <md-dialog-content>' +
                      '     <h3 style="text-align:right;"><i class="fa fa-times"></i></h3>' +
                      '  </md-dialog-content>' +
                      '</div>' +
                      '<div class="col-sm-12 domain-dialogue-header">' +
                      '  <md-dialog-content>' +
                      '     <h3>Start a new project by adding a&nbsp;domain.</h3>' +
                      '  </md-dialog-content>' +
                      '</div>' +
                      '<form>' +
                      '<div class ="col-sm-12 domain-dialogue-input" >' +
                      '  <input id="domain_input" class="form-control" ng-model="domain_url" class="" placeholder="yourdomain.com" />' +
                      '</div>' +
                      '<div class="col-sm-12 text-center">' +
                      '  <button id="create_domain_button" class="btn-lg btn--green domain-dialogue-button" ng-click="createDomain(domain_url)">Create Project</button>' +
                      '</div>' +
                      '</form>' +
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
