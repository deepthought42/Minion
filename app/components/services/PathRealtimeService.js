angular.module("Qanairy.PathRealtimeService", ['Qanairy.serviceConfig'])
.service("PathRealtimeService", ['$q', '$timeout', 'Qanairy.serviceConfig', function($q, $timeout, config) {
    return service = {
      connect: function(url, acct_key, callback) {
        var source = new EventSource(config.basePath+url+"?account_key="+acct_key, { withCredentials: false });
        source.addEventListener("message", callback, false);

        source.onmessage = function (event) {
          var data = event.data.split('\n');
          console.log("MESSAGE DATA RECEIVED :  "+data);
          //updateStocks(data[0], data[1], data[2]);
        };
        return source;
      }
    }
}]);
