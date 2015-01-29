
if (Meteor.isClient) {

    //um Startdiv nach 2s auszublenden
    Meteor.setTimeout(function(){hideStart()}, 2000);

    // Ebenennummer
    Session.setDefault("floor", 0);
    Session.setDefault("position", 0);

    //Navigationsbuttons auf Karte
    var upBtn =  $('#levelUp');
    upBtn.disabled = true;
   /*    var downBtn =  $('#levelDown');

    downBtn.disabled = false;*/

    //Interaktion mit der NaviLeiste
    Template.navi.events({
        'click div#backBtn': function () {
            changeSVG(0, 2, Session.get("position"));
        },
        'click div#roomBtn': function () {
           toggleMenuR();
        },
        'click div#filterBtn': function () {
           toggleMenuF();
        }
    });
    Template.navi.helpers({
        firstBtn : function () {
            if(Session.get("position")){
                changeBtns(Session.get("position"));
                return 'zurück';
            } else {
                changeBtns(Session.get("position"));;
                return 'Zentralbibliothek';
            }
        },
        position : function () {
            if( !Session.get("position")){
                return 'Standorte';
            }else return 'Räume';
        },
        floor: function () {
            return Session.get("floor");
        }
    });

    //Interaktion mit dem Inhalt (SVG-Karten und Buttons)
   Template.content.events({
        'click div#levelDown' : function() {
           changeSVG(Session.get("floor"), 1, 1);
       },
       'click div#levelUp' : function() {
           changeSVG(Session.get("floor"), 0, 1);
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
            $('#start').fadeOut("slow");
           // $('#start').effect('slide', { direction: 'right', mode: 'hide' });
            $('#content').css('visibility','visible').hide().fadeIn('slow');//.css('visibility', 'visible');
            $('nav').css('visibility','visible').hide().fadeIn('slow');
    }

    //Buttons in der Ebenenansicht einblenden
    //@param:
    function changeBtns(p){
        if(p) {
            $('#backBtn').css('transform', 'scaleX(1)');
            $('#Filter').css('visibility', 'visible');
            $('#Info').css('visibility', 'visible');
            $('.tower').css('visibility', 'visible');
        }else{
            $('#backBtn').css('transform', 'scaleX(-1)');
            $('#Filter').css('visibility', 'hidden');
            $('#Info').css('visibility', 'hidden');
            $('.tower').css('visibility', 'hidden');
        }
    }
    //ändert Karte und Turm
    // @param f: Ebene
    // @param i: ist 1 bei down und 0 bei up
    // @param p: aktuelle Position: 0..Campus, 1..SLUB
    function changeSVG(f, i, p){
        var tower = $('#tower');
        var upBtn =  $('#levelUp');
        var downBtn =  $('#levelDown');
        var iframe = $('#frameContent');
        var buttons = $('.levelBtn');
        if(i==1) {
            if (f == 0) {
                iframe.attr('src', 'ebene-1.svg');
                //floor = -1
                Session.set("floor", Session.get("floor") - 1);
                upBtn.disabled =  downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");
                upBtn.css('-webkit-filter', 'grayscale(0%)');
                downBtn.css('-webkit-filter', 'grayscale(0%)');
            } else if (f == -1) {
                iframe.attr('src', 'ebene-2.svg');
                //floor = -2
                Session.set("floor", Session.get("floor") - 1);
                upBtn.disabled = false;
                downBtn.disabled = true;

                tower.css('background', "url('stapel-2.svg') no-repeat");
                tower.css('background-size', "111px");
                upBtn.css('-webkit-filter', 'grayscale(0%)');
                downBtn.css('-webkit-filter', 'grayscale(100%)');
            }
        }else if(i==0){
            if (f ==  -1) {
                iframe.attr('src', 'Ebene0.svg');
                //floor = 0
                Session.set("floor", Session.get("floor") + 1);
                upBtn.disabled = true;
                downBtn.disabled = false;

                tower.css('background', "url('stapel.svg') no-repeat");
                tower.css('background-size', "111px");
                upBtn.css('-webkit-filter', 'grayscale(100%)');
                downBtn.css('-webkit-filter', 'grayscale(0%)');

            } else if (f == -2) {
                iframe.attr('src', 'ebene-1.svg');
                //floor = -1
                Session.set("floor", Session.get("floor") + 1);
                upBtn.disabled = downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");
                upBtn.css('-webkit-filter', 'grayscale(0%)');
                downBtn.css('-webkit-filter', 'grayscale(0%)');
            }
        }else{
            if (p){
                Session.set("position", 0);
                iframe.attr('src', 'map1.svg');
                buttons.css('visibility', 'hidden');
            }else {
                Session.set("position", 1);
                iframe.attr('src', 'Ebene0.svg');
                buttons.css('visibility', 'visible');
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
