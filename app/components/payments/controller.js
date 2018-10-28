'use strict';

angular.module('Qanairy.subscribe', ['ui.router', 'Qanairy.AccountService', 'Qanairy.SubscribeService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.buy', {
    url: "/buy",
    templateUrl: 'components/payments/index.html',
    controller: 'paymentCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('paymentCtrl', ['$rootScope', '$scope','StripeCheckout', 'Subscription',
  function($rootScope, $scope, StripeCheckout, Subscription) {
    this._init = function(){

    }

    var handler = null;
    StripeCheckout.load()
      .then(function() {
        handler = StripeCheckout.configure();
      });

    $scope.updateSubscription = function(discovery_cnt, test_cnt) {

      //set package name based on #-disc-#-test
      var package_name = "pro";

      var options = {
        description: package_name,
        amount: 99
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
