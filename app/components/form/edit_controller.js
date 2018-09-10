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
    $scope.forms = [];

    this._init = function(){
      $scope.form = $stateParams.form;
      console.log("form : "+$scope.form);
    };

    this._init();
  }
]);
