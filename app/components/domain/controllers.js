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
      $scope.errors = [];
      Domain.query().$promise
        .then(function(data){
          $scope.domains = data;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
      $scope.protocol = "";
      $scope.domain_url = "";
      $scope.domain_error = "";
      $scope.domain_creation_err = "An error occurred while saving the domain";
    }

    $scope.createDomain = function(protocol, domain){
      var url = protocol + "://" + domain;

      Domain.save(domain).$promise.then(function(successResult){
        $scope.show_create_domain_err = false;
        store.set('domain', successResult);
        $scope.domains.push(successResult);
        $scope.closeDialog();
        $rootScope.$broadcast("domain_updated", successResult);
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
      $rootScope.$broadcast("domain_updated", domain);
      $state.go("main.tests");
    }

    $scope.openCreateDomainDialog  = function(event) {
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          template: '<md-dialog class="col-sm-4" style="">' +
                      '<div class="col-sm-12 domain-dialogue-close" ng-click="closeDialog()">' +
                      '  <md-dialog-content>' +
                      '     <h3 style="text-align:right;"><i class="fa fa-times"></i></h3>' +
                      '  </md-dialog-content>' +
                      '</div>' +
                      '<div class="col-sm-12 domain-dialogue-header">' +
                      '  <md-dialog-content>' +
                      '     <h3>Start a new project by adding a&nbsp;domain.</h3>' +
                      '  </md-dialog-content>' +
                      '</div>' +
                      '<form name="domain_form" ng-submit="domain_form.$valid && createDomain(protocol, domain)" novalidate>' +
                        '<div class ="col-sm-12 domain-dialogue-input" >' +
                          '<div>' +
                            '<select id="domain_protocol" class="form-control" ng-model="protocol" required>' +
                              '<option value="http">http</option>' +
                              '<option value="https">https</option>' +
                            '</select>' +
                          '</div>' +
                          '<div>' +
                            '<input id="domain_input" class="form-control" ng-model="domain" placeholder="yourdomain.com" required/>' +
                          '</div>' +
                        '</div>' +
                        '<div ng-show="domain_creation_error" class="error">' +
                          'Something went wrong, Please try again' +
                        '</div>' +
                        '<div class="col-sm-12">' +
                          '<md-button id="create_domain_button" class="md-primary md-raised domain-dialogue-button" type="submit" ng-disabled="domain_form.$invalid">Create Project</md-button>' +
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

    var fsClient = filestack.init('AZ3Vgj49DQyOMFzbi5BsHz');
    $scope.openPicker = function(domain) {
      fsClient.pick({
        fromSources:["local_file_system","url","imagesearch","facebook","instagram","googledrive","dropbox","onedrive","clouddrive"],
        accept:["image/*"],
        transformations:{}
      }).then(function(response) {
        // declare this function to handle response
        //set filestack url somewhere
        domain.logoUrl = response.filesUploaded[0].url;
        Domain.save(domain).$promise
          .then(function(successResult){
            $scope.show_create_domain_err = false;
            store.set('domain', successResult);
            $rootScope.$broadcast("domain_updated", successResult);
          })
          .catch(function(err){
            $scope.errors.push(err);
          })
        console.log("domain url :: "+domain);
        console.log("response :: "+ Object.keys(response.filesUploaded[0]));
      });
    }

    $scope.removeDomain = function(domain, index){
      var confirmed_delete = confirm("Are you sure you want to remove "+domain.url);

      if(confirmed_delete){
        Domain.delete({key: domain.key}).$promise
          .then(function(data){
            $scope.domains.splice(index, 1);
          })
          .catch(function(err){
            $scope.errors.push(err);
          })
      }
    }

    this._init();

    $scope.$on('domainRequiredError', function(){
      $scope.domain_error = "A domain must be selected first";
      //$scope.$apply();
    })

  }
]);
