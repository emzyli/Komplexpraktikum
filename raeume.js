if (Meteor.isClient) {

    //setTimeout(hideStart(), 500 );


    Template.navi.events({
        'click div#roomBtn': function () {
            toggleMenuR();
        },
        'click div#filterBtn': function () {
            toggleMenuF();
        }
    });

    Template.content.events({
       'mouseover iframe' : function() {
           interactWithSVG();
       }
    });

  Template.start.events({
      'mouseover div#start': function () {
            hideStart();
       }
   });

    if (Meteor.isServer) {
        Meteor.startup(function () {
            // code to run on server at startup

        });
    }

    //rollt Menu ein/aus
    function toggleMenuR() {
        var menuR = $('#menu').text();
        if (!$('menuR:contains("R&auml;ume")')){
            $('#menu').effect('slide', { direction: 'left', mode: 'show' });
            $('#menu').html('<p>R&auml;ume</p>');
        }
        else
            $('#menu').effect('slide', { direction: 'right', mode: 'hide' });
    }
    function toggleMenuF() {
        var menuF = $('#menu').text();
        if (!"menuF:contains('Filter')") {
            $('#menu').effect('slide', { direction: 'left', mode: 'show' });
            $('#menu').html('<p>Filter</p>');
        }
        else
            $('#menu').effect('slide', { direction: 'right', mode: 'hide' });
      
    }

    //schließt Anfangsbild
    function hideStart(){
            $('#icon').fadeOut("slow");
            $('#start').fadeOut("slow");
            $('#content').css('visibility','visible').hide().fadeIn('slow');//.css('visibility', 'visible');
            $('nav').css('visibility','visible').hide().fadeIn('slow');
         // /   $('#start').delay(1000).fadeIn(250).delay(5000).fadeOut(250);
    }

    //dafür wird das jQuery SVG benötigt --> hab ich für meteor noch nicht gefunden
    function interactWithSVG() {
        var svg = $('#frameContent').svg('get');
        $("#backgroundcolor", svg.root()).bind('click', function () {
            alert('path clicked');
        });
    }
}
