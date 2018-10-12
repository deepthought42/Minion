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
      $scope.domain = store.get('domain');
      if($stateParams.form){
        $scope.form = $stateParams.form;
        store.set('current_form', $scope.form);
      }
      else{
        $scope.form = store.get('current_form');
      }
      console.log("form : "+$scope.form);
    };

    $scope.cancel = function(){
      $state.go("main.form");
    }

    $scope.discoverTests = function(form){
      Domain.updateForm({domain_id: $scope.domain.id, key: form.key, name: form.name, form_type: form.type}).$promise
        .then(function(data){
          console.log("Successfully updated form");
          $state.go("main.form");
        })
        .catch(function(err){
          console.log("error occured while saving form");
        })
    }

    this._init();
  }
]);
