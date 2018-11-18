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
      $scope.current_plan = store.get("account").subscriptionType;
      $scope.user_email = store.get("account").username;
    }

    var handler = null;
    StripeCheckout.load()
      .then(function() {
        handler = StripeCheckout.configure();
      });

    $scope.getFreeAccess = function() {
      Subscribe.update({plan : "free", "source_token": ""}).$promise
        .then(function(){
          $scope.current_plan = "Basic - $99";
          $scope.$broadcast("updateAccount");
        })
        .catch(function(){
          //console.log("error updating subscription");
        });
    };

    $scope.updateSubscription = function(plan_name) {
      //set package name based on #-disc-#-test
      var package_name = "Basic";

      var options = {
        email: $scope.user_email,
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
          Subscribe.update({"plan" : package_name, "source_token": result[0].id}).$promise
            .then(function(){
              $scope.current_plan = "PRO";
              $scope.$broadcast("updateAccount");
            })
            .catch(function(){
              //console.log("error updating subscription");
            });
        },function() {
          alert("Stripe Checkout closed without processing your payment.");
        });
    };

    this._init();
  }
]);
