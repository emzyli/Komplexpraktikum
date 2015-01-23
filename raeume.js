if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault("counter", 0);

    /*  Template.hello.helpers({
        counter: function () {
          return Session.get("counter");
        }
      });
    
      Template.hello.events({
        'click button': function () {
          // increment the counter when button is clicked
          Session.set("counter", Session.get("counter") + 1);
        }
      });*/

    Template.navi.events({
        'click div#roomBtn': function () {
            toggleMenuR();
        },
        'click div#filterBtn': function () {
            toggleMenuF();
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
}
