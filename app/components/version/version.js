'use strict';

angular.module('Minion.version', [
  'Minion.version.interpolate-filter',
  'Minion.version.version-directive'
])

.value('version', '0.1');
