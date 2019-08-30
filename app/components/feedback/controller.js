'use strict';

angular.module('Qanairy.feedback', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.feedback', {
    url: "/feedback",
    templateUrl: 'components/feedback/index.html',
    controller: 'FeedbackCtrl'
  });
}])

.controller('FeedbackCtrl', ['$rootScope', '$scope', 'store', 'segment',
  function($rootScope, $scope, store, segment) {

  }
]);
