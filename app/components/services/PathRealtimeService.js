angular.module("Qanairy.PathRealtimeService", ['Qanairy.serviceConfig'])
.service("PathRealtimeService", ['$q', '$timeout', 'Qanairy.serviceConfig', function($q, $timeout, config) {
    return {
      connect: function(url, acct_key, callback) {
        var source = new EventSource(config.basePath+url+"?account_key="+acct_key, { withCredentials: false });
        source.addEventListener("message", callback, false);

        source.onmessage = function (event) {
          var data = event.data.split('\n');
        };
        return source;
      }
    }
}]);
