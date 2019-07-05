'use strict';

angular.module('Qanairy.form_edit', ['ui.router', 'Qanairy.FormService', 'Qanairy.DomainService', 'Qanairy.ElementService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.form_edit', {
    url: "/form/edit",
    templateUrl: 'components/form/edit.html',
    controller: 'FormEditCtrl',
    params: {form: null}
  });
}])

.controller('FormEditCtrl', ['$rootScope', '$scope', 'Form', 'Domain', 'store', '$state', '$stateParams', 'segment', 'Element',
  function($rootScope, $scope, Form, Domain, store, $state, $stateParams,segment, Element) {

    this._init = function(){
      $scope.domain = store.get('domain');
      $scope.users = store.get('users');
      $scope.rule_form = {};
      $scope.rule_types = ["required", "disabled", "alphabetic_restriciton", "special_character_restriction", "read_only", "min_value", "max_value", "min_length", "max_length", "email_pattern", "pattern"];

      if($stateParams.form){
        $scope.form = $stateParams.form;
        store.set('current_form', $scope.form);
      }
      else{
        $scope.form = store.get('current_form');
      }

      //ERRORS
      $scope.unresponsive_server_err = "Qanairy servers are currently unresponsive. Please try again in a few minutes.";

    };

    $scope.cancel = function(){
      $state.go("main.form");
    }

    $scope.discoverTests = function(form){
      if($scope.users.length == 0 && (form.type.toLowerCase()==="login" || form.type.toLowerCase()==="registration")){
        console.log("sending form :: "+form);
        $state.go('main.user_form_discovery', {form: form});
      }
      else{
        Domain.updateForm({domain_id: $scope.domain.id, key: form.key, name: form.name, form_type: form.type}).$promise
          .then(function(data){
            console.log("Successfully updated form");

            segment.track("Start form discovery", {
                form_key: form.key,
              }, function(success){  });
            $state.go("main.form");
          })
          .catch(function(err){
            if(err.data){
              $scope.errors.push(err.data);
            }
            else{
              $scope.errors.push({message: $scope.unresponsive_server_err });
            }
          });
          segment.track("Updated form", {
              form_key: form.key,
              successful : true
            }, function(success){  });
      }
    }

    $scope.createRule = function(element_id, type, value){
      console.log("creating rule " + element_id + " : " + type + " : " + value);
      Element.addRule({id: element_id, type: type, value: value}).$promise
        .then(function(data){
          console.log("DATA RETURNED :: "+data);
        })
        .catch(function(err){
          console.log("error occurred :: " + err);
        })
    }

    this._init();
  }
]);
