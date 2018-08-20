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
  }
]);
