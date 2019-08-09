'use strict';
/* global angular Pusher */
angular.module('Qanairy.form', ['ui.router', 'Qanairy.FormService', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.form', {
    url: "/form",
    templateUrl: 'components/form/index.html',
    controller: 'FormCtrl'
  });
}])

.controller('FormCtrl', ['$rootScope', '$scope', 'Form', 'Domain', 'store', '$state', 'segment',
  function($rootScope, $scope, Form, Domain, store, $state, segment) {
    $scope.forms = [];

    this._init = function(){
      var domain_id = store.get('domain').id;
      Domain.getForms({domain_id: domain_id}).$promise.
        then(function(response){
          $scope.forms = response;
          var needs_attention = false;
          $scope.forms.forEach(form => {
            if(form.status === "DISCOVERED"){
              needs_attention = true;
            }
          });

          $rootScope.$broadcast("updateFormClassificationAlert", needs_attention);
        });

      $scope.domain_id = store.get('domain').id;
      Domain.getUsers({domain_id: $scope.domain_id}).$promise
        .then(function(users){
          $scope.users = users;
          store.set('users', users);
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push(err.data);
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });

        //ERRORS
        $scope.unresponsive_server_err = "Qanairy servers are currently unresponsive. Please try again in a few minutes.";
    };

    $scope.editForm = function(form){
      $state.go("main.form_edit", {form: form});
    };

    var pusher = new Pusher('77fec1184d841b55919e', {
      cluster: 'us2',
      encrypted: true
    });

    var channel = pusher.subscribe($scope.extractHostname($scope.domain_url));
    channel.bind('discovered-form', function(data) {
      var reported_form = JSON.parse(data);
      var already_exists = false;
      for(var idx=0; idx<$scope.forms.length; idx++){
        var form = $scope.forms[idx];
        if(form.key === reported_form.key){
          $scope.forms[idx] = reported_form;
          already_exists = true;
          break;
        }
      }

      if(!already_exists){
        $scope.forms.push(reported_form);
      }

      var discovered_form_count = 0;
      $scope.forms.forEach((form) => {
        if(form.status === "DISCOVERED"){
          discovered_form_count += 1;
        }
      })

      $rootScope.$broadcast("updateFormDiscoveredCountAlert", discovered_form_count);
      $scope.waitingOnForms = false;
      $scope.$apply();
    });

    this._init();
  }
]);
