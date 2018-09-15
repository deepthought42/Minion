'use strict';

angular.module('Qanairy.form', ['ui.router', 'Qanairy.FormService', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.form', {
    url: "/form",
    templateUrl: 'components/form/index.html',
    controller: 'FormCtrl'
  });
}])

.controller('FormCtrl', ['$rootScope', '$scope', 'Form', 'Domain', 'store', '$state',
  function($rootScope, $scope, Form, Domain, store, $state) {
    $scope.forms = [];

    this._init = function(){
      var domain_key = store.get('domain')['key'];
      Domain.getForms({key: domain_key}).$promise.
        then(function(response){
          $scope.forms = response;
          console.log("forms :: "+$scope.forms);
        });
    };

    $scope.editForm = function(form){
      $state.go("main.form_edit", {form: form});
    }

    var pusher = new Pusher('77fec1184d841b55919e', {
      cluster: 'us2',
      encrypted: true
    });

    var channel = pusher.subscribe($scope.extractHostname($scope.domain_url));
    channel.bind('discovered-form', function(data) {
      var reported_form = JSON.parse(data);
      console.log("reported form :: "+reported_form);
      for(var idx=0; idx<$scope.tests.length; idx++){
        var test = $scope.tests[idx];
        if(test.key == reported_test.key){
          $scope.tests[idx] = reported_test;
          break;
        }
      }
      $scope.waitingOnTests = false;
      $scope.$apply();
    });

    this._init();
  }
]);
