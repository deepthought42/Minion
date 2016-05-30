angular.module("Minion.PathRealtimeService", ['Minion.serviceConfig'])
.service("PathRealtimeService", ['$q', '$timeout', 'Minion.serviceConfig', function($q, $timeout, config) {
    return service = {
      connect: function(url, acct_key, callback) {
        var source = new EventSource(config.basePath+url+"?account_key="+acct_key);
        return source.addEventListener("message", callback, false);
      }
    }
}]);
