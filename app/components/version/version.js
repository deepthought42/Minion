'use strict';

angular.module('Qanairy.version', [
  'Qanairy.version.interpolate-filter',
  'Qanairy.version.version-directive'
])

.value('version', 'alpha');
