'use strict';

angular.module('Qanairy.pricing', ['ui.router', 'Qanairy.AccountService'])

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

.controller('PricingCtrl', ['$rootScope', '$scope','StripeCheckout', 'Account',
  function($rootScope, $scope, StripeCheckout, Account) {
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

var handler = null;
    StripeCheckout.load()
      .then(function() {
        handler = StripeCheckout.configure();
      });

    $scope.checkout = function(discovery_cnt, test_cnt) {
      Account.save();

      //set package name based on #-disc-#-test
      var package_name = discovery_cnt+"-disc-"+test_cnt+"-test";
      var cost = (discovery_cnt*25) + (test_cnt/100);

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
          alert("Got Stripe token on success : " + result[0].id);
        },function() {
          alert("Stripe Checkout closed without making a sale :(");
        });
    };

    this._init();
  }
]);
