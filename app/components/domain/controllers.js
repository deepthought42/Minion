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
      Domain.query().$promise
        .then(function(data){
          $scope.domains = data;
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

    $scope.createDomain = function(protocol, host, default_browser){
      if(default_browser){
        Domain.save({protocol: protocol, url: host, logo_url: "", discoveryBrowser: default_browser}).$promise
          .then(function(successResult){
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

    $scope.openCreateDomainDialog  = function(event) {
       $mdDialog.show({
          clickOutsideToClose: $scope.domains.length,
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
