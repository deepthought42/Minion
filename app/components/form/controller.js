'use strict';

angular.module('Qanairy.form', ['ui.router', 'Qanairy.FormService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.form', {
    url: "/form",
    templateUrl: 'components/form/index.html',
    controller: 'FormCtrl'
  });
}])

.controller('FormCtrl', ['$rootScope', '$scope', 'Form', 'store', '$state',
  function($rootScope, $scope, Form, store, $state) {

  }
]);
