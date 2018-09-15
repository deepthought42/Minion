'use strict';

angular.module('Qanairy.form_edit', ['ui.router', 'Qanairy.FormService', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.form_edit', {
    url: "/form/edit",
    templateUrl: 'components/form/edit.html',
    controller: 'FormEditCtrl',
    params: {form: null}
  });
}])

.controller('FormEditCtrl', ['$rootScope', '$scope', 'Form', 'Domain', 'store', '$state', '$stateParams',
  function($rootScope, $scope, Form, Domain, store, $state, $stateParams) {

    this._init = function(){
      $scope.domain = state.get('domain');
      if($stateParams.form){
        $scope.form = $stateParams.form;
        store.set('current_form', $scope.form);
      }
      else{
        $scope.form = store.get('current_form');
      }
      console.log("form : "+$scope.form);
    };

    $scope.discoverTests = function(form){
      Domain.updateForm($scope.domain.id, form).$promise
        then(function(data){
          console.log("Successfully updated form");
        })
        .catch(function(err){
          console.log("error occured while saving form");
        })
    }

    $scope.updateField = function(){
      if(required_rule){
        //create required rule

      }

      if(min_max_characters_rules){
          //create min max rules
      }

      if(min_max_value_rules){
          //
      }

      if(special_character_restriction){
          //
      }

      if(alphabetic_character_restriction){
          //
      }

      if(numeric_restriction){
          //
      }

      if(whitespace_restriction){
          //
      }

      if(case_sensitive){
          //
      }

      if(email_pattern_rule){
          //
      }
    }
    this._init();
  }
]);
