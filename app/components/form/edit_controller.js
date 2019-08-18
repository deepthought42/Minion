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

.controller('FormEditCtrl', ['$rootScope', '$scope', 'Form', 'Domain', 'store', '$state', '$stateParams', 'segment', 'Element', '$mdDialog',
  function($rootScope, $scope, Form, Domain, store, $state, $stateParams, segment, Element, $mdDialog) {

    this._init = function(){
      $scope.domain = store.get('domain');
      $scope.users = store.get('users');
      $scope.rule_form = {};
      $scope.rule_types = ["required", "disabled", "alphabetic_restriciton", "special_character_restriction", "read_only", "min_value", "max_value", "min_length", "max_length", "email_pattern", "pattern"];
      $scope.show_update_element_err = false;
      $scope.current_field = null;
      $scope.errors = [];

      if($stateParams.form){
        $scope.form = $stateParams.form;
        store.set('current_form', $scope.form);
      }
      else{
        $scope.form = store.get('current_form');
      }

      //ERRORS
      $scope.unresponsive_server_err = "Qanairy servers are currently unresponsive. Please try again in a few minutes.";

      //Rules declarartion
      $scope.rule_options = [
        {
          type:"EMAIL_PATTERN",
          value: "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$",
          key:"email_pattern::^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$",
        },
        {
          type: "ALPHABETIC_RESTRICTION",
          value: "[a-zA-Z]",
          key: "alphabetic_restriciton::[a-zA-Z]"
        },
        {
          type: "NUMERIC_RESTRICTION",
          value: "[0-9]",
          key: "numeric_restriction::[0-9]"
        },
        {
          type: "READ_ONLY",
          value: "",
          key: "read_only::"
        },
        {
          type: "REQUIRED",
          value: "",
          key: "required::"
        },
        {
          type: "SPECIAL_CHARACTER_RESTRICTION",
          value: "[^<>!@#$%&*()]",
          key: "special_character_restriction::[^<>!@#$%&*()]"
        },
        {
          type: "MIN_LENGTH",
          value: "",
          key: ""
        },
        {
          type: "MAX_LENGTH",
          value: "",
          key: ""
        },
        {
          type: "MIN_VALUE",
          value: "",
          key: ""
        },
        {
          type: "MAX_VALUE",
          value: "",
          key: ""
        }
      ]
    };

    $scope.removeRule = function(rule) {
      for(var i = 0; i< $scope.current_field.rules.length; i++){
        if($scope.current_field.rules[i].type == rule.type){
            //remove rule at idx
            $scope.current_field.rules.splice(i, 1);
        }
      }
    };

    $scope.addRuleToElement = function(current_field, new_rule) {
      var exists = false;
      for(var i = 0; i< $scope.current_field.rules.length; i++){
        if($scope.current_field.rules[i].type == new_rule.type){
            exists = true;
        }
      }

      if(!exists){
        //check if rule is min or max value and that both min and max are isDefined and that min is not greater than or equal to max value
        if((new_rule.type == "MIN_VALUE" || new_rule.type == "MAX_VALUE")){
              if(new_rule.value.length == 0){
                $scope.addError("Value is required for Min/Max value rules");
                return;
              }
              if(new_rule.value < 0){
                $scope.addError("Min/Max value rule cannot be negative ");
                return;
              }

              if(!$scope.bothMinMaxValueRulesExistAndMinIsLessThanMax($scope.current_field.rules, new_rule)){
                  $scope.addError("Minimum value rule cannot be greater than max value rule");
                  return;
              }
        }


        //check if rule is min or max length and that both min and max are isDefined and that min is not greater than or equal to max length
        if( (new_rule.type == "MIN_LENGTH" || new_rule.type == "MAX_LENGTH")){
            if(new_rule.value.length == 0){
              $scope.addError("Value is required for Min/Max length rules");
              return;
            }
            if(new_rule.value < 0){
              $scope.addError("Min/Max length rule value cannot be negative ");
              return;
            }

            if(!$scope.bothMinMaxLengthRulesExistAndMinIsLessThanMax($scope.current_field.rules, new_rule)){
              $scope.addError("Minimum length rule value cannot be greater than max length rule value");
              return;
            }
        }

        $scope.current_field.rules.push(new_rule);
      }
    }

    $scope.cancel = function(){
      $state.go("main.form");
    }

    $scope.discoverTests = function(form){
      if($scope.users.length == 0 && (form.type.toLowerCase()==="login" || form.type.toLowerCase()==="registration")){
        $state.go('main.user_form_discovery', {form: form});
      }
      else{
        Domain.updateForm({domain_id: $scope.domain.id, key: form.key, name: form.name, form_type: form.type}).$promise
          .then(function(data){
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
    };

    $scope.createRule = function(element_id, type, value){
      Element.addRule({id: element_id, type: type, value: value}).$promise
        .then(function(data){
          //$scope.successes.push("Successfully saved rule");
        })
        .catch(function(err){
          $scope.errors.push("Error occurred while saving rule")
        })
    }

    $scope.openEditElementDialog  = function(element) {
      $scope.current_field = element;
      $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/form/edit_element_modal.html",
          controller: function DialogController($scope, $mdDialog) {
             $scope.show_edit_element_err = false;
             $scope.closeDialog = function() {
                $mdDialog.hide();
             }

             $scope.saveElement = function(elementstate){
               Element.update(elementstate).$promise
                 .then(function(data){
                   elementstate = data;
                   $scope.closeDialog();
                 })
                 .catch(function(err){
                   console.log("element update err  :  "+err);
                 })
             }
          }
       });
    };

    $scope.getFieldType = function(element){
      for(var i = 0;i<element.attributes.length; i++){
        if(element.attributes[i].name == "type"){
          return element.attributes[i].vals[0];
        }
      }
    }

    $scope.addError = function(err){
      $scope.errors.push(err);
      setTimeout(function(){
          $scope.errors.shift();
          $scope.$apply();
        }, 10000);
    }

    $scope.bothMinMaxValueRulesExistAndMinIsLessThanMax = function(rules, new_rule){
      //get min and max rules
      var min_rule = null;
      var max_rule = null;

      for(var i=0; i< rules.length; i++){
        if(rules[i].type == "MIN_VALUE"){
          min_rule = rules[i];
        }
        if(rules[i].type == "MAX_VALUE"){
          max_rule = rules[i];
        }
      }
      if(min_rule !== null ){
        max_rule = new_rule;
      }
      else if(max_rule !== null ){
        min_rule = new_rule;
      }

      if(min_rule !== null && max_rule !== null && min_rule.value > max_rule.value){
        return false;
      }
      return true;
    }

    $scope.bothMinMaxLengthRulesExistAndMinIsLessThanMax = function(rules, new_rule){
      var min_rule = null;
      var max_rule = null;

      //get min and max rules
      for(var i=0; i< rules.length; i++){
        if(rules[i].type == "MIN_LENGTH"){
          min_rule = rules[i];
        }
        if(rules[i].type == "MAX_LENGTH"){
          max_rule = rules[i];
        }
      }

      if(min_rule !== null ){
        max_rule = new_rule;
      }
      else if(max_rule !== null ){
        min_rule = new_rule;
      }

      if(min_rule !== null && max_rule !== null && min_rule.value > max_rule.value){
        return false;
      }

      return true;
    }

    this._init();
  }
]);
