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

.controller('PricingCtrl', ['$rootScope', '$scope','StripeCheckout',
  function($rootScope, $scope, StripeCheckout) {
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

    var handler = StripeCheckout.configure({
                  name: "Plan",
                  token: function(token, args) {
                    $log.debug("Got stripe token: " + token.id);
                  }
              });


    this.checkout = function(token, discovery_cnt, test_cnt) {

      //set package name based on #-disc-#-test
      var package_name = discovery_cnt+"-disc-"+test_cnt+"-test";

      var options = {
        description: "Ten dollahs!",
        amount: 1000
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
          Account.save({service_package: account_type, payment_acct: result[0].id});
        },function() {
          alert("Stripe Checkout closed without making a sale :(");
        });
    };

    this._init();
  }
]);
