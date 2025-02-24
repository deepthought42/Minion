'use strict';

var pastPathService = angular.module('Qanairy.EventService', []);

pastPathService.factory('Events', ['segment', function (segment) {
  return {
    identify: function(profile){
      segment.identify(profile.id, {
        name : profile.name,
        nickname : profile.nickname,
        email : profile.email
      });
    }
  };
}]);
