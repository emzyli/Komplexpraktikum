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
       'mouseover iframe#frameContent' : function() {
              $("#Raum046").mouseenter(function () {
                  $("#Raum046").css
              })
       }
    });

  Template.start.events({
      'click div#start': function () {
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
            $('#start').fadeOut("slow");
        //   $('#start').css('visibility', 'hidden');
            $('#content').css('visibility', 'visible');
            $('nav').css('visibility', 'visible');
         // /   $('#start').delay(1000).fadeIn(250).delay(5000).fadeOut(250);
    }
}
