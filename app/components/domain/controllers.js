'use strict';

angular.module('Qanairy.domain', ['ui.router', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.domains', {
    url: "/domains",
    templateUrl: 'components/domain/index.html',
    controller: 'DomainCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('DomainCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog', 'store', '$state', 'Account',
  function($rootScope, $scope, Domain,  $mdDialog, store, $state, Account) {
    this._init = function(){
      $scope.errors = [];
      $scope.domains = [];
      $scope.host = "";
      $scope.disclaimerOptin = false;
      $scope.current_domain = {};

      Domain.query().$promise
        .then(function(data){
          $scope.domains = data;
          store.set("domains", data);
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
      $scope.protocol = "";
      $scope.domain_url = "";
      $scope.domain_error = "";
      $scope.domain_creation_err = "An error occurred while saving the domain";

      //check if domain welcome onboarding has already been seen
      $scope.welcomeOnboardingEnabled = false;
      $scope.welcomeOnboardingIndex = 0;
    }


    $scope.welcomeSteps = [
      {
        title: "Welcome to Qanairy!",
        position: "right",
        description: "Start by adding a domain to begin testing. Once you’re done, select a domain and go to ‘Discovery’ to start finding tests.",
        attachTo:"#add_domain_card",
        top: 100,
        width: 400
      }
    ];

    $scope.hasUserAlreadyOnboarded = function(onboard_step_name){
      var onboard = null;
      if(store.get("onboard")){
        onboard = store.get("onboard").indexOf(onboard_step_name) > -1;
      }
      //check if discovery onboarding has already been seen
      if(!onboard || onboard == null){
        Account.addOnboardingStep({step_name: onboard_step_name}).$promise
          .then(function(data){
            store.set("onboard", data);
          })
          .catch(function(err){

          });
      }
      return onboard;
    }
    /**
    *
    */
    $scope.createDomain = function(protocol, host, default_browser, logo_url){
      var created_successfully = false;
      Domain.save({protocol: protocol, url: host, logoUrl: logo_url, browser_name: default_browser}).$promise
        .then(function(successResult){
          $scope.show_create_domain_err = false;
          store.set('domain', successResult);
          $scope.domains.push(successResult);
          $scope.closeDialog();
          created_successfully = true;
          $rootScope.$broadcast("domain_updated", successResult);
        },
        function(errorResult){
          created_successfully = false
          if(errorResult.status === 303){
            $scope.closeDialog();
          }
          else{
            $scope.show_create_domain_err = true;
          }
        });

      analytics.track("Created Domain", {
        successful: !$scope.show_create_domain_err
      }, function(success){  });

    }

    $scope.updateDomain = function(key, protocol, default_browser, logo_url){
      Domain.update({key: key, protocol: protocol, logoUrl: logo_url, browser_name: default_browser}).$promise
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

        analytics.track("Updated Domain", {
          key : key,
          successful: !$scope.show_create_domain_err
        }, function(success){  });
    }

    /**
     * Sets domain for session
     */
    $scope.selectDomain = function(domain){
      store.set('domain', domain);
      //get default browser for domain
      //if default browser is not set then show default browser selection dialog box
      $rootScope.$broadcast("domain_selected", domain);

      //Load all page states

      Domain.getAllPathObjects({host: domain.url}).$promise
                .then(function(data){
                    store.set('path_objects', data);
                });

      analytics.track("Updated Domain", {
        domain, domain,
        successful: !$scope.show_create_domain_err
      }, function(success){  });

      $state.go("main.discovery");

    }

    $scope.openCreateDomainDialog  = function(domain) {
      analytics.track("Clicked Create Domain", {
          domain: domain
        }, function(success){  });

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

    $scope.openEditDomainDialog  = function(domain) {
      analytics.track("Clicked Edit Domain", {
          domain : domain
        }, function(success){  });

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
      analytics.track("Clicked Logo Upload", {
          domain: domain
        }, function(success){  });

      fsClient.pick({
        fromSources:["local_file_system","url","imagesearch","facebook","instagram","googledrive","dropbox","onedrive","clouddrive"],
        accept:["image/*"],
        transformations:{}
      }).then(function(response) {
        analytics.track("Uploaded Logo", {
          }, function(success){  });
        // declare this function to handle response
        //set filestack url somewhere

        console.log("response :: "+Object.keys(response));
        console.log("response :: "+Object.keys(response.filesUploaded));

      //  console.log("response failed:: "+Object.keys(response.filesFailed));
      //  console.log("response failed:: "+Object.keys(response.filesFailed[0]));

        console.log("response :: "+response.filesUploaded[0]);
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

      analytics.track("Deleted Domain", {
          confirmed: confirmed_delete,
          successful : !$scope.errors.length,
          domain : domain
        }, function(success){  });
    }

    this._init();

    $scope.$on('domainRequiredError', function(){
      $scope.domain_error = "Start by adding and selecting a domain.";
    });

    $scope.$on('onboardingStepsAcquired', function(){
      $scope.welcomeOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('domain-welcome');
    })

    /* EVENTS */
    $rootScope.$on('missing_resorce_error', function (e){
      $scope.errors.push("We seem to have misplaced that ");
    });

    $rootScope.$on('internal_server_error', function (e){
      $scope.errors.push("There was an error while processing your request. Please try again.");
    });
  }
]);
