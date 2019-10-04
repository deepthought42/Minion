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

.controller('DomainCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog', 'store', '$state', 'Account', 'segment',
  function($rootScope, $scope, Domain,  $mdDialog, store, $state, Account, segment) {
    this._init = function(){
      $scope.errors = [];
      $scope.domains = [];
      $scope.host = "";
      $scope.disclaimerOptin = false;
      $scope.current_domain = {};
      $scope.protocols = ['http', 'https'];
      $scope.current_domain.protocol = 'http';
      $scope.show_create_domain_err = false;
      $scope.show_edit_domain_err = false;

      //ERRORS
      $scope.unresponsive_server_err = "Qanairy servers are currently unresponsive. Please try again in a few minutes.";

      Domain.query().$promise
        .then(function(data){
          $scope.domains = data;
          store.set("domains", data);
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push(err.data);
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });
      $scope.protocol = "";
      $scope.domain_url = "";
      $scope.domain_error = "";
      $scope.domain_creation_err = "An error occurred while saving the domain";
      $scope.domain_edit_err = "An error occurred while saving the domain";

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
            if(err.data){
              $scope.errors.push(err.data);
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }
          });
      }
      return onboard;
    };

    $scope.createDomain = function(protocol, host, default_browser, logo_url){
      //check if host is a localhost and prevent creation
      if(host.includes("127.0.0.1") || host.toLowerCase().includes("localhost")){
        segment.track("Create Localhost Failed", {
          browser: default_browser,
          domain: host
        }, function(success){  });

        $scope.domain_creation_err = "Sorry, we don't currently support localhost environments";
        $scope.show_create_domain_err = true;
        return;
      }

        var created_successfully = false;
        Domain.save({protocol: protocol, url: host, logoUrl: logo_url, browser_name: default_browser}).$promise
          .then(function(successResult){
            $scope.show_create_domain_err = false;
            store.set('domain', successResult);
            $scope.domains.push(successResult);
            $scope.closeDialog();
            created_successfully = true;
            $rootScope.$broadcast("domain_added", successResult);
            $rootScope.$broadcast("domain_selected", successResult);
            segment.track("Created Domain", {
              domain: host,
              browser: default_browser
            }, function(success){  });

            $state.go("main.discovery");
          },
          function(errorResult){
            created_successfully = false
            segment.track("Create Domain Failed", {
              browser: default_browser,
              domain: host
            }, function(success){  });

            if(errorResult.status === 303){
              $scope.closeDialog();
            }
            else{
              $scope.show_create_domain_err = true;
            }
          });
      }

    }

    $scope.updateDomain = function(key, protocol, default_browser, logo_url){
      Domain.update({key: key, protocol: protocol, logoUrl: logo_url, browser_name: default_browser}).$promise
        .then(function(successResult){
          $scope.show_edit_domain_err = false;
          store.set('domain', successResult);
          for(var idx=0; idx < $scope.domains.length; idx++){
            if($scope.domains[idx].key == key){
              $scope.domains[idx] = successResult;
            }
          }
          $scope.closeDialog();
          segment.track("Updated Domain", {
            key : key
          }, function(success){  });
        },
        function(errorResult){
          created_successfully = false

          if(errorResult.status === 303){
            $scope.closeDialog();
          }
          else{
            $scope.show_edit_domain_err = true;
          }

          segment.track("Updated Domain Failed", {
            key : key
          }, function(success){  });
        });


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
                })
                .catch(function(err){
                  if(err.data){
                    $scope.errors.push("An error occurred retrieving domains");
                  }
                  else{
                    $scope.errors.push({message: $scope.unresponsive_server_err });
                  }
                });

      segment.track("Selected Domain", {
        domain: domain.url
      }, function(success){  });

      $state.go("main.discovery");
    }

    $scope.openCreateDomainDialog  = function() {
      $scope.current_domain = {};
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/domain/create_domain_modal.html",
          controller: function DialogController($scope, $mdDialog) {
             $scope.show_create_domain_err = false;
             $scope.closeDialog = function() {
                $mdDialog.hide();
             }
          }
       });

       segment.track("Clicked Add Domain", {
       }, function(success){  });
    };

    $scope.openEditDomainDialog  = function(domain) {
      $scope.current_domain = domain;
       $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/domain/edit_domain_modal.html",
          controller: function DialogController($scope, $mdDialog) {
             $scope.show_edit_domain_err = false;
             $scope.closeDialog = function() {
                $mdDialog.hide();
             }
          }
       });

       segment.track("Clicked Edit Domain", {
         domain: domain
       }, function(success){  });
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
        segment.track("Uploaded Logo", {
          domain : domain
        }, function(success){  });
        $scope.current_domain.logo_url = response.filesUploaded[0].url;
        $scope.$apply();
      })
      .catch(function(err){
        if(err.data){
          $scope.errors.push(err.data);
        }
        else{
          $scope.errors.push({message: $scope.unresponsive_server_err });
        }
      });
    }

    $scope.removeDomain = function(domain, index){
      var confirmed_delete = confirm("Are you sure you want to remove "+domain.url);

      if(confirmed_delete){
        Domain.delete({domain_id: domain.id}).$promise
          .then(function(data){
            $scope.domains.splice(index, 1);
            $rootScope.$broadcast('domain_updated');
            if(!$scope.domains.length){
              segment.track("Deleted Domain", {
                  domain : domain
                }, function(success){  });
              $scope.openCreateDomainDialog();
            }
          })
          .catch(function(err){
            if(err.data){
              $scope.errors.push("An error occurred deleting "+domain.url);
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }
          });
      }
    }

    this._init();

    $scope.$on('domainRequiredError', function(){
      var domain_error = "Start by adding and selecting a domain.";
      $scope.errors.push({message: domain_error});
      setTimeout(function(errors){ errors.pop(); }, 30, $scope.errors);
    });

    $scope.$on('onboardingStepsAcquired', function(){
      $scope.welcomeOnboardingEnabled = !$scope.hasUserAlreadyOnboarded('domain-welcome');
    });

    /* EVENTS */
    $rootScope.$on('missing_resorce_error', function (e){
      $scope.errors.push("We seem to have misplaced that ");
    });

    $rootScope.$on('internal_server_error', function (e){
      $scope.errors.push("There was an error while processing your request. Please try again.");
    });
  }
]);
