'use strict';

angular.module('Qanairy.subscribe', ['ui.router', 'Qanairy.AccountService', 'Qanairy.SubscribeService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('subscribe', {
    url: "/subscribe",
    templateUrl: 'components/subscribe/index.html',
    controller: 'SubscribeCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('SubscribeCtrl', ['$rootScope', '$scope','StripeCheckout', 'Subscribe',
  function($rootScope, $scope, StripeCheckout, Subscribe) {
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

    $scope.plans = {
      '2-disc-1000-test' : 79,
      '2-disc-10000-test' : 149,
      '2-disc-20000-test' : 249,
      '2-disc-30000-test' : 349,
      '2-disc-40000-test' : 449,
      '4-disc-1000-test' : 129,
      '4-disc-10000-test' : 199,
      '4-disc-20000-test' : 299,
      '4-disc-30000-test' : 399,
      '4-disc-40000-test' : 499,
      '6-disc-1000-test' : 179,
      '6-disc-10000-test' : 249,
      '6-disc-20000-test' : 349,
      '6-disc-30000-test' : 449,
      '6-disc-40000-test' : 549,
      '8-disc-1000-test' : 229,
      '8-disc-10000-test' : 299,
      '8-disc-20000-test' : 399,
      '8-disc-30000-test' : 499,
      '8-disc-40000-test' : 599,
    }
    var handler = null;
    StripeCheckout.load()
      .then(function() {
        handler = StripeCheckout.configure();
      });

    $scope.updateSubscription = function(discovery_cnt, test_cnt) {

      //set package name based on #-disc-#-test
      var package_name = discovery_cnt+"-disc-"+test_cnt+"-test";
      var cost = (discovery_cnt*50) + (test_cnt/100) - 1;

      var options = {
        description: package_name,
        amount: cost*100
      };
      // The default handler API is enhanced by having open()
      // return a promise. This promise can be used in lieu of or
      // in addition to the token callback (or you can just ignore
      // it if you like the default API).
      //
      // The rejection callback doesn't work in IE6-7.
      handler.open(options)
        .then(function(result) {
          Subscribe.update({"plan" : package_name});
        },function() {
          alert("Stripe Checkout closed without processing your payment.");
        });
    };

    this._init();
  }
]);
