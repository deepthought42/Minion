'use strict';

angular.module('Qanairy.ElementStateOutline', [])
.directive("elementOutline",function(){
  return{
    restrict: 'E',
    controller: function($scope){
      $scope.next = function() {
        $scope.pathIdx = $scope.pathIdx + 1;
        if($scope.pathIdx >= $scope.path.length){
          $scope.pathIdx = 0;
        }
        $scope.setCurrentNode($scope.path[$scope.pathIdx].page);
      };

      $scope.previous = function() {
        $scope.pathIdx -= 1;
        if($scope.pathIdx < 0){
          $scope.pathIdx = $scope.path.length - 1;
        }
        $scope.setCurrentNode($scope.path[$scope.pathIdx].page);
      };

      $scope.generateElementOutline = function(page, element){
        return buildElementOutlineStyle(page, element);
      };

      function buildElementOutlineStyle(page, element){
        var web_elem = document.getElementById('nonexpandable'+page.key);
        var elem = angular.element(web_elem);
        console.log("element width :: "+elem.parent().width());
        console.log("element height :: " +elem.parent().height());
        console.log("page viewport height :: "+page.fullPageHeight);
        console.log("page viewport width :: "+page.fullPageWidth);

        if($scope.width !== elem.width() && elem.width() !== 0){
          $scope.width = elem.width();
        }
        if($scope.height !== elem.height() && elem.height() !== 0){
          $scope.height = elem.height();
        }

        var marginRight = web_elem.offsetLeft;
        var scale_height = $scope.height/page.fullPageHeight;
        var scale_width = ($scope.width)/page.fullPageWidth;

        if(scale_height === 0){
          scale_height = scale_width;
        }


        console.log("margin right ::  "+marginRight);
        console.log("scale width  ::   "+scale_width);
        console.log("scale height  ::   "+scale_height);

        var element_width = element.width * (scale_width);
        element_width = element_width + (element_width/5);
        var element_height = element.height * scale_height;
        console.log("element outline width ::  " +element_width);
        console.log("element outline height :: "+element_height);
        console.log("element xlocation  :: " +element.xlocation);
        console.log("element ylocation :: " + element.ylocation);
        var x_offset = element.xlocation * scale_width + marginRight;
        var y_offset = (element.ylocation) * scale_height;

        console.log("element xlocation  :: " +x_offset);
        console.log("element ylocation :: " + y_offset);
        var outline_style = "top: "+ y_offset +"px;left: "+ x_offset +"px; width: "+ element_width +"px; height:"+ element_height +"px";
        return outline_style;
      }
    },
    link: function($scope, element) {

    },
    scope: false,
    transclude: true,
    templateUrl: 'components/organisms/nonExpandablePathToggle/path_toggle_panel.html'
  };

})
