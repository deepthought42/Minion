'use strict';

var pastPathService = angular.module('Qanairy.EventService', []);

pastPathService.factory('Events', [function () {
  return {
    identify: function(profile){
      analytics.identify(profile.id, {
        name : profile.name,
        nickname : profile.nickname,
        email : profile.email
      });
    }
  }
}]);
