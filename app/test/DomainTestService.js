angular.module("Qanairy.DomainTestService", ['Qanairy.serviceConfig'])
.service("DomainTestService", ['$q', '$timeout', 'Qanairy.serviceConfig', function($q, $timeout, config) {
  return service = [{
    key: "http://test.com",
    url: "http://test.com"
  },
  {"tests":[],"groups":[],"key":"{\"url\":\"http://localhost:1000\"}","url":"{\"url\":\"http://localhost:1000\"}
  }];
}];
