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

.controller('UpgradeCtrl', ['$rootScope', '$scope','StripeCheckout','Subscribe', 'store',
  function($rootScope, $scope, StripeCheckout, Subscribe, store) {
    this._init = function(){
      console.log("setting current plan");
      $scope.current_plan = store.get('account').subscriptionType;

      console.log("setting current plan ::  "+$scope.current_plan);
    }

    var handler = null;
    StripeCheckout.load()
      .then(function() {
        handler = StripeCheckout.configure();
      });

    $scope.getFreeAccess = function() {
      console.log("free access");
      Subscribe.update({plan : "free", "source_token": ""});
    };

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
          console.log("result :: "+JSON.stringify(result));
          console.log("payment token : "+result[0].id);
          Subscribe.update({"plan" : package_name, "source_token": result[0].id});
        },function() {
          alert("Stripe Checkout closed without processing your payment.");
        });
    };

    this._init();
  }
]);
