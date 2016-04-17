angular.module("Minion.PathRealtimeService", ['Minion.serviceConfig'])
.service("PathRealtimeService", ['$q', '$timeout', 'Minion.serviceConfig', function($q, $timeout, config) {
    return service = {
      connect: function(url, callback) {
        var source = new EventSource(config.basePath+url);
        return source.addEventListener('message', callback, false);
      }
    }
}]);
