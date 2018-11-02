'use strict';

angular.module('Qanairy.upgrade', ['ui.router', 'Qanairy.AccountService', 'Qanairy.SubscribeService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.upgrade', {
    url: "/upgrade",
    templateUrl: 'components/upgrade/index.html',
    controller: 'UpgradeCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('UpgradeCtrl', ['$rootScope', '$scope','StripeCheckout','Subscribe',
  function($rootScope, $scope, StripeCheckout, Subscribe) {
    this._init = function(){

    }

    var handler = null;
    StripeCheckout.load()
      .then(function() {
        handler = StripeCheckout.configure();
      });

    $scope.freeAccess = function() {
      console.log("free access");
      Subscribe.update({"plan" : "free"});
    }

    $scope.updateSubscription = function(plan_name) {
      console.log("update subscription ");
      //set package name based on #-disc-#-test
      var package_name = "pro";

      var options = {
        description: package_name,
        amount: 9900
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
