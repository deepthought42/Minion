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
      $scope.messages = [];
      $scope.new_rule = $scope.newRule();
      $scope.waiting_for_response = false;
      $scope.typeOptions = ["LOGIN", "REGISTRATION", "CONTACT_COMPANY", "SUBSCRIBE", "LEAD", "SEARCH", "PASSWORD_RESET", "PAYMENT", "UNKNOWN"];

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
      ];
    };

    $scope.removeRule = function(element_id, rule) {
      //call Element.removeRule(rule.key)
      Element.removeRule({id: element_id, rule_key: rule.key}).$promise
        .then(function(data){
          $scope.current_field = data;
          $scope.form.formFields[$scope.selected_element_idx] = data;
          $scope.errors = [];
          $scope.messages.push("Successfully deleted " + rule.type + " rule");

          segment.track("Removed rule", {
              element_id: element_id,
              rule_key: rule.key
            }, function(success){  });
        }, function(err){
          $scope.errors.push("An error occurred while removing rule "+rule.type);
        });

/*
      for(var i = 0; i< $scope.current_field.rules.length; i++){
        if($scope.current_field.rules[i].type === rule.type){
            //remove rule at idx
            $scope.current_field.rules.splice(i, 1);
        }
      }
      */
    };

    $scope.newRule = function(){
      return {
        type: "",
        value: ""
      }
    }

    $scope.addRuleToElement = function(current_field, new_rule) {
      var exists = false;
      for(var i = 0; i< $scope.current_field.rules.length; i++){
        if($scope.current_field.rules[i].type === new_rule.type){
            exists = true;
        }
      }

      if(!exists){
        if("MIN_LENGTH" === new_rule.type || "MAX_LENGTH" === new_rule.type || "MIN_VALUE" === new_rule.type || "MAX_VALUE" === new_rule.type ){
          if(isNaN(new_rule.value)){
            $scope.addError($scope.toTitleCase(new_rule.type)+" rule value must be a number");
            return;
          }
          else if(new_rule.value < 0){
            $scope.addError($scope.toTitleCase(new_rule.type)+" rule value cannot be negative");
            return;
          }
        }
        //check if rule is min or max value and that both min and max are isDefined and that min is not greater than or equal to max value
        if("MIN_VALUE" === new_rule.type || "MAX_VALUE" === new_rule.type){
              if(new_rule.value.length === 0){
                $scope.addError("Value is required for Min/Max value rules");
                return;
              }
              if(new_rule.value < 0){
                $scope.addError("Min/Max value rule cannot be negative ");
                return;
              }

              if(!$scope.bothMinMaxValueRulesExistAndMinIsLessThanMax($scope.current_field.rules, new_rule)){
                if( "MAX_VALUE" === new_rule.type ){
                  $scope.addError("Maximum value rule cannot be less than minimum value rule");
                }
                else{
                  $scope.addError("Minimum value rule cannot be greater than maximum value rule");
                }
                return;
              }
        }


        //check if rule is min or max length and that both min and max are isDefined and that min is not greater than or equal to max length
        if( "MIN_LENGTH" === new_rule.type || "MAX_LENGTH" === new_rule.type ){
            if(new_rule.value.length === 0){
              $scope.addError("Value is required for Min/Max length rules");
              return;
            }
            if(new_rule.value < 0){
              $scope.addError("Min/Max length rule value cannot be negative ");
              return;
            }

            if(!$scope.bothMinMaxLengthRulesExistAndMinIsLessThanMax($scope.current_field.rules, new_rule)){
              if( "MAX_LENGTH" === new_rule.type){
                $scope.addError("Maximum length cannot be less than minimum length");
              }
              else{
                $scope.addError("Minimum length rule value cannot be greater than maximum length");
              }

              return;
            }
        }

        $scope.createRule(current_field, new_rule.type, new_rule.value);
      }
      else{
        //show duplicate record error
        $scope.addError("Cannot add duplicate rules");
      }
    }

    $scope.isRuleValueEditable = function(rule){
      return "MIN_LENGTH" === rule.type || "MAX_LENGTH" === rule.type || "MIN_VALUE" === rule.type || "MAX_VALUE" === rule.type;
    }

    $scope.toTitleCase = function(str) {
      if(str == null){
        return "";
      }
      str = str.replace(/_/g, " ");
      return str.replace(
          /\w\S*/g,
          function(txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
      );
    }

    $scope.cancel = function(){
      $state.go("main.form");
    }

    $scope.discoverTests = function(form){
      var user_bypass = false;
      if($scope.users.length === 0 && (form.type.toLowerCase()==="login" || form.type.toLowerCase()==="registration")){
        $state.go('main.user_form_discovery', {form: form});
        user_bypass = true;
      }

      $scope.waiting_for_response = true;
      Domain.updateForm({domain_id: $scope.domain.id, id: form.id, name: form.name, form_type: form.type}).$promise
        .then(function(data){
          $scope.waiting_for_response = false;

          segment.track("Start form discovery", {
              form_key: form.key,
            }, function(success){  });

          if(!user_bypass){
            $state.go("main.form");
          }
        }, function(err){
          $scope.waiting_for_response = false;
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
    };

    /*
      Makes call to API endpoint to add rule to element
    */
    $scope.createRule = function(element_id, type, value){
      Element.addRule({id: element_id, type: type, value: value}).$promise
        .then(function(data){
          $scope.current_field = data;
          $scope.form.formFields[$scope.selected_element_idx] = data;
          $scope.new_rule = $scope.newRule();
          $scope.errors = [];
          $scope.messages.push("Successfully added " + type + " rule");

          segment.track("Added rule", {
              element_id: element_id,
              type: type,
              value: value
            }, function(success){
            });
        }, function(err){
          $scope.errors.push("Error occurred while saving rule");
        });
    }

    $scope.openEditElementDialog  = function(element, idx) {
      $scope.selected_element_idx = idx;
      $scope.current_field =  JSON.parse(JSON.stringify(element));
      $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          templateUrl: "components/form/edit_element_modal.html",
          controller: function DialogController($scope, $mdDialog) {
             $scope.show_edit_element_err = false;
             $scope.closeDialog = function() {
                $mdDialog.hide();
                $scope.form.formFields[$scope.selected_element_idx] = $scope.current_field;
             };

             $scope.saveElement = function(elementstate){
               $scope.errors = [];
               Element.updateFormElement($scope.form.key, elementstate).$promise
                 .then(function(data){
                   $scope.form.formFields[$scope.selected_element_idx] = data;

                   $scope.closeDialog();
                 }, function(err){
                   $scope.addError("Error occurred while updating element");
                 });
             }
          }
       });
    };

    $scope.getFieldType = function(element){
      for(var i = 0;i<element.attributes.length; i++){
        if("type" === element.attributes[i].name ){
          return element.attributes[i].vals[0];
        }
      }
    }

    $scope.addError = function(err){
      //check for error
      for(var i=0; i < $scope.errors.length; i++){
        if(err === $scope.errors[i]){
          return;
        }
      }

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
        if("MIN_VALUE" === rules[i].type ){
          min_rule = rules[i];
        }
        if("MAX_VALUE" === rules[i].type){
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
        if( "MIN_LENGTH" === rules[i].type){
          min_rule = rules[i];
        }
        if("MAX_LENGTH" === rules[i].type){
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
