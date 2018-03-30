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
      $scope.domains = [];
      $scope.host = "";
      $scope.disclaimerOptin = false;
      $scope.current_domain = {};

      Domain.query().$promise
        .then(function(data){
          $scope.domains = data;
          store.remove('domain');
          if($scope.domains == null || !$scope.domains.length){
            $scope.openCreateDomainDialog();
          }
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
      $scope.protocol = "";
      $scope.domain_url = "";
      $scope.domain_error = "";
      $scope.domain_creation_err = "An error occurred while saving the domain";
    }

    $scope.createDomain = function(protocol, host, default_browser, logo_url){
      if(default_browser){
        Domain.save({protocol: protocol, url: host, logoUrl: logo_url, discoveryBrowser: default_browser}).$promise
          .then(function(successResult){
            $scope.show_create_domain_err = false;
            store.set('domain', successResult);
            $scope.domains.push(successResult);
            $scope.closeDialog();
            $rootScope.$broadcast("domain_updated", successResult);
          },
          function(errorResult){
            if(errorResult.status === 303){
              $scope.closeDialog();
            }
            else{
              $scope.show_create_domain_err = true;
            }
          });
      }
      else{
        $scope.show_create_domain_err = true;
      }
    }

    $scope.updateDomain = function(key, protocol, host, default_browser, logo_url){
      if(default_browser){
        Domain.update({key: key, protocol: protocol, url: host, logoUrl: logo_url, discoveryBrowser: default_browser}).$promise
          .then(function(successResult){
            $scope.show_create_domain_err = false;
            store.set('domain', successResult);
            for(var idx=0; idx < $scope.domains.length; idx++){
              if($scope.domains[idx].key == key){
                $scope.domains[idx] = successResult;
              }
            }
            $scope.closeDialog();
          },
          function(errorResult){
            $scope.show_create_domain_err = true;
          });
      }
      else{
        $scope.show_create_domain_err = true;
      }
    }

    /**
     * Sets domain for session
     */
    $scope.selectDomain = function(domain){
      store.set('domain', domain);
      //get default browser for domain
      //if default browser is not set then show default browser selection dialog box
      $rootScope.$broadcast("domain_updated", domain);
      $state.go("main.discovery");
    }

    $scope.openCreateDomainDialog  = function(domain) {
      $scope.current_domain = {};
       $mdDialog.show({
          clickOutsideToClose: $scope.domains.length>0,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/domain/create_domain_modal.html",
          controller: function DialogController($scope, $mdDialog) {
             $scope.closeDialog = function() {
                $mdDialog.hide();
             }
          }
       });
    };

    $scope.openDisclaimerDomainDialog  = function() {
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/domain/domain_disclaimer_modal.html",
          controller: function DialogController($scope, $mdDialog) {
             $scope.closeDialog = function() {
                $mdDialog.hide();
             }
          }
       });
    };

    $scope.openEditDomainDialog  = function(domain) {
      $scope.current_domain = domain;
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/domain/edit_domain_modal.html",
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
        $scope.current_domain.logo_url = response.filesUploaded[0].url;
        $scope.$apply();
      });
    }

    $scope.removeDomain = function(domain, index){
      var confirmed_delete = confirm("Are you sure you want to remove "+domain.url);

      if(confirmed_delete){
        Domain.delete({key: domain.key}).$promise
          .then(function(data){
            $scope.domains.splice(index, 1);
            $rootScope.$broadcast('domain_updated');
            if(!$scope.domains.length){
              $scope.openCreateDomainDialog();
            }
          })
          .catch(function(err){
            $scope.errors.push(err);
          })
      }
    }

    this._init();

    $scope.$on('domainRequiredError', function(){
      $scope.domain_error = "Start by adding and selecting a domain.";
    })

  }
]);
