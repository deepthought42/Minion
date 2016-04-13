'use strict';

describe('Minion.tester module', function() {

  beforeEach(module('Minion.tester'));

  describe('tester controller', function(){

    it('should ....', inject(function($controller) {
      //spec body
      var TesterIndexCtrl = $controller('TesterIndexCtrl');
      expect(TesterIndexCtrl).toBeDefined();
    }));

  });
});
