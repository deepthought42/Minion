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
      $scope.users = store.get('users');

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
      if($scope.users.length == 0){
        console.log("sending form :: "+form);
        $state.go('main.user_form_discovery', {form: form});
      }
      else{
        Domain.updateForm({domain_id: $scope.domain.id, key: form.key, name: form.name, form_type: form.type}).$promise
          .then(function(data){
            console.log("Successfully updated form");
            segment.track("Updated form", {
                form_key: form.key,
                successful : true
              }, function(success){  });

            segment.track("Start form discovery", {
                form_key: form.key,
                successful : true
              }, function(success){  });
            $state.go("main.form");
          })
          .catch(function(err){
            segment.track("Updated form", {
                form_key: form.key,
                domain: $scope.domain.id,
                successful : false
              }, function(success){  });
          })
      }
    }

    this._init();
  }
]);
