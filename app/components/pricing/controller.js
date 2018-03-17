'use strict';

angular.module('Qanairy.pricing', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('pricing', {
    url: "/pricing",
    templateUrl: 'components/pricing/index.html',
    controller: 'PricingCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('PricingCtrl', ['$rootScope', '$scope',
  function($rootScope, $scope) {
    this._init = function(){

    }

    $scope.discovery_slider = {
      value: 2,
      options: {
        floor: 2,
        ceil: 10,
        step: 2
      },
    };

    $scope.test_slider = {
      value: 1000,
      options: {
        floor: 1000,
        ceil: 50000,
        stepsArray: [1000, 10000, 20000, 30000, 40000, 50000]
      },
    };

    this._init();
  }
]);
