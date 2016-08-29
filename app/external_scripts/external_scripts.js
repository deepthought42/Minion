// JavaScript Document


   

//$(document).ready(function() {
//  $('[data-toggle=offcanvas]').click(function() {
//    $('.row-offcanvas').toggleClass('active');
//  });
//});


    $("../components/starter/index.html#menu-toggle").click(function(e) {
        e.preventDefault();
        $("../components/starter/index.html#wrapper").toggleClass("toggled");
    });
   