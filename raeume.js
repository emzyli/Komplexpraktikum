
if (Meteor.isClient) {

    //um Startdiv nach 2s auszublenden
    Meteor.setTimeout(function(){hideStart()}, 2000);

    // Ebenennummer
    Session.setDefault("floor", 0);

    //aktuelle Karte im iframe
    var iframe = $('#frameContent');
    if(Session.get("floor") == 0)
        iframe.attr('src', 'Ebene0.svg');
    else if(Session.get("floor") == -1)
        iframe.attr('src', 'ebene-1.svg');
    else if(Session.get("floor") == -2)
        iframe.attr('src', 'ebene-2.svg');



    //Navigationsbuttons auf Karte
    var upBtn =  $('#levelUp');
    var downBtn =  $('#levelDown');
    upBtn.disabled = true;
    downBtn.disabled = false;

    //Interaktion mit der NaviLeiste
    Template.navi.events({
        'click div#roomBtn': function () {
           toggleMenuR();
        },
        'click div#filterBtn': function () {
           toggleMenuF();
        }
    });
    Template.navi.helpers({
        floor: function () {
            return Session.get("floor");
        }
    });

    //Interaktion mit dem Inhalt (SVG-Karten und Buttons)
   Template.content.events({
        'click div#levelDown' : function() {
           changeSVG(Session.get("floor"), 1);
       },
       'click div#levelUp' : function() {
           changeSVG(Session.get("floor"), 0);
       }
    });

    if (Meteor.isServer) {
        Meteor.startup(function () {
            // code to run on server at startup

        });
    }

    //rollt Menu ein/aus
    function toggleMenuR() {
        toggleMenu("R&auml;ume");
    }

    function toggleMenuF() {
        toggleMenu("Filter");      
    }

    //btnType: Raeume oder Filter
    function toggleMenu(btnType) {
        if ($('#menu:contains('+btnType+')').length <= 0) {
            $('#menu').effect('slide', { direction: 'left', mode: 'show' });
            $('#menu').html('<p>' + btnType + '</p>');
            //verschiebe den roten Balken
            $('nav').css('border', 'none');
        }
        else {
            $('#menu').effect('slide', { direction: 'right', mode: 'hide' });
            //roten Balken wieder zeigen
            $('nav').css('border-right', '5px solid #cc0000');
        }
    }


    //schließt Anfangsbild
    function hideStart(){
            $('#icon').fadeOut("slow");
            $('#start').effect('slide', { direction: 'right', mode: 'hide' });
            $('#content').css('visibility','visible').hide().fadeIn('slow');//.css('visibility', 'visible');
            $('nav').css('visibility','visible').hide().fadeIn('slow');
         // /   $('#start').delay(1000).fadeIn(250).delay(5000).fadeOut(250);
    }

    //ändert Karte und Turm
    // @param i: ist 1 bei down und 0 bei up
    function changeSVG(f, i){
        var tower = $('#tower');
        var iframe = $('#frameContent');
        if(i==1) {
            if (f == 0) {
                iframe.attr('src', 'ebene-1.svg');
                //floor = -1
                Session.set("floor", Session.get("floor") - 1);
                upBtn.disabled =  downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
            } else if (f == -1) {
                iframe.attr('src', 'ebene-2.svg');
                //floor = -2
                Session.set("floor", Session.get("floor") - 1);
                upBtn.disabled = false;
                downBtn.disabled = true;

                tower.css('background', "url('stapel-2.svg') no-repeat");
            }
        }else{
            if (f ==  -1) {
                iframe.attr('src', 'Ebene0.svg');
                //floor = 0
                Session.set("floor", Session.get("floor") + 1);
                upBtn.disabled = true;
                downBtn.disabled = false;

                tower.css('background', "url('stapel.svg') no-repeat");
            } else if (f == -2) {
                iframe.attr('src', 'ebene-1.svg');
                //floor = -1
                Session.set("floor", Session.get("floor") + 1);
                upBtn.disabled = downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
            }
        }

    }
   /* //dafür wird das jQuery SVG benötigt --> hab ich für meteor noch nicht gefunden
    function interactWithSVG() {
        var svg = $('#frameContent').svg('get');
        $("#backgroundcolor", svg.root()).bind('click', function () {
            alert('path clicked');
        });
    }*/


 //   var hammer = new Hammer(document.getElementById("filterBtn"));
 //   hammer.onTap = function(ev) {
 //       alert("ontap recognised");
 //   };


}
