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

  $('.backBtn').click(
         function () {
             toggleMenu1();
         }
       )
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  });
}

//rollt Menu ein/aus
function toggleMenu1() {
    if($('#menu').css('display') == 'none')
        $('#menu').effect('slide', { direction: 'right', mode: 'show' });
    else
        $('#menu').effect('slide', { direction: 'left', mode: 'hide' });
}
