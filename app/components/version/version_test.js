'use strict';

describe('Qanairy.version module', function() {
  beforeEach(module('myApp.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('alpha');
    }));
  });
});
