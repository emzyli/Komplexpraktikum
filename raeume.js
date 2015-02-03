
if (Meteor.isClient) {

    //um Startdiv nach 2s auszublenden
    Meteor.setTimeout(function(){hideStart()}, 2000);

    // Ebenennummer
    Session.setDefault("floor", 0);
    Session.setDefault("position", 0);

    //Ausklappmenue nicht ausgerollt
    Session.setDefault("toggled", 0);

    //Zoomstufe [0-2]
    // wird in zoomIn, zoomOut verringert/erhoeht
    Session.setDefault("zoomLevel", 0);

    //die ID des momentan ausgewaehlten Raums (Raumansicht)
    Session.setDefault("roomId", '');

    //speichert alle Raeume, inkl Info
    //[(id, kapazitaet, ausstattung)]
    Session.setDefault("rooms", []);

    //speichert alle Raeume die den Filterkriterien entsprechen
    Session.setDefault("fRooms", []);

    //Filterkriterien {pers[2,20], beamer[0,1], computer[0,1], teilen[0,1]}
    Session.setDefault("filterList", [2, 0, 0, false]);

    //Navigationsbuttons auf Karte
    var upBtn =  $('#levelUp');
    upBtn.disabled = true;
    /*    var downBtn =  $('#levelDown');
 
     downBtn.disabled = false;*/

    Template.maphome.rendered = function() {
        var mapHome = L.map('map-home', 'map1.svg');
        mapHome.setView([30.28, -97.73], 13);

        var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        })
    };
    //Interaktion mit der NaviLeiste
    Template.navi.events({
        'click div#first': function () {
            changeSVG(0, 2, Session.get("position"));
            toggleMenu(0);
        },
        'click div#ort': function () {
            if(Session.get("position"))
                toggleMenu("ort");
            else  toggleMenu("ort");
        },
        'click div#filter': function () {
            toggleMenu("filter");
        },
        'click div#info': function () {
            toggleMenu("info");
        },
        'click ul.ort li.menuel': function(){ //wir kommen in Raumansicht
            Session.set("position", 2);
            Session.set('roomId', $(this).attr('id')); //ausgewaehlter Raum
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
        //mach es draggable
        /*'click div#frameContent': function(){
            $('#frameContent').mousedown(handle_mousedown($(this)));
        },*/
        'click div#levelDown' : function() {
            changeSVG(Session.get("floor"), 1, 1);
        },
        'click div#levelUp' : function() {
            changeSVG(Session.get("floor"), 0, 1);
        },
        'click a#in': function () {
            zoomIn();
        },
        'click a#out': function () {
            zoomOut();
    }
    });

    //reinZoomen
    function zoomIn() {
        zlevel = Session.get('zoomLevel');
        if (zlevel == 2) {
            // ignore
        }
        else {
            if (zlevel == 1) {
                //weiter geht es nicht, +Link deaktivieren
                $('#in').addClass('disabled');
                $('#in').attr('style', 'opacity: 0.1; cursor: default');
            }
            if (zlevel == 0) {
                //es geht nun zurueck, -Link aktivieren
                $('#out').removeClass('disabled');
                $('#out').attr('style', 'opacity: 1; cursor: pointer');
            }
            zlevel++;
            Session.set("zoomLevel", zlevel);
            $('#frameContent').css("background-size", (zlevel + 1) * 100 + '%');
            $('#frameContent').css("-webkit-transform:", "scale(1.4)");
            $('#frameContent').css("-moz-transform:", "scale(1.4)");
        }
    }

    //rausZoomen
    function zoomOut() {
        zlevel = Session.get('zoomLevel');
        if (zlevel == 0) {
            // ignore
        }
        else {
            if (zlevel == 1) {
                //weiter geht es nicht, -Link deaktivieren
                $('#out').addClass('disabled');
                $('#out').attr('style', 'opacity: 0.1; cursor: default');
            }
            if (zlevel == 2) {
                //wieder hineinzoomen mgl, +Link aktivieren
                $('#in').removeClass('disabled');
                $('#in').attr('style', 'opacity: 1; cursor: pointer');
            }
            zlevel--;
            Session.set("zoomLevel", zlevel);
            $('#frameContent').css("background-size", (zlevel + 1) * 100 + '%');
            $('#frameContent').css("-webkit-transform:", "scale(0.4)");
            $('#frameContent').css("-moz-transform:", "scale(0.4)");
        }
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
    //@param: p->0: Campus, 1->Ebene, 2->Raum
    function changeBtns(p) {
        if (p == 2) {
            $('#info').css('visibility', 'visible');
            $('#kamera').css('visibility', 'visible');
        }
        if (p == 1) {
            $('#backBtn').css('transform', 'scaleX(1)');
            $('#filter').css('visibility', 'visible');
            $('#info').css('visibility', 'hidden');
            $('.tower').css('visibility', 'visible');
        }
        if(!p){
            $('#backBtn').css('transform', 'scaleX(-1)');
            $('#filter').css('visibility', 'hidden');
            $('#info').css('visibility', 'hidden');
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
        var up =  $('#up');
        var downBtn =  $('#levelDown');
        var down =  $('#down');
        var iframe = $('#frameContent');
        var buttons = $('.levelBtn');
        if(i==1) {
            if (f == 0) {
                iframe.css('background', "url('ebene-1.svg') no-repeat");
                //floor = -1
                Session.set("floor", Session.get("floor") - 1);
                Session.set("zoomLevel", 0);
                upBtn.disabled =  downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(0%)');
                down.css('-webkit-filter', 'grayscale(0%)');
            } else if (f == -1) {
                iframe.css('background', "url('ebene-2.svg') no-repeat");
                //floor = -2
                Session.set("floor", Session.get("floor") - 1);
                Session.set("zoomLevel", 0);
                upBtn.disabled = false;
                downBtn.disabled = true;

                tower.css('background', "url('stapel-2.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(0%)');
                down.css('-webkit-filter', 'grayscale(100%)');
            }
        }else if(i==0){
            if (f ==  -1) {
                iframe.css('background', "url('Ebene0.svg') no-repeat");
                //floor = 0
                Session.set("floor", Session.get("floor") + 1);
                Session.set("zoomLevel", 0);
                upBtn.disabled = true;
                downBtn.disabled = false;

                tower.css('background', "url('stapel.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(100%)');
                downBtn.css('-webkit-filter', 'grayscale(0%)');

            } else if (f == -2) {
                iframe.css('background', "url('ebene-1.svg') no-repeat");
                //floor = -1
                Session.set("floor", Session.get("floor") + 1);
                Session.set("zoomLevel", 0);
                upBtn.disabled = downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(0%)');
                down.css('-webkit-filter', 'grayscale(0%)');
            }
        }else{
            if (p){
                Session.set("position", 0);
                Session.set("zoomLevel", 0);
                iframe.css('background', "url('map1.svg') no-repeat");
                buttons.css('visibility', 'hidden');
            }else {
                Session.set("position", 1);
                Session.set("zoomLevel", 0);
                iframe.css('background', "url('Ebene0.svg') no-repeat");
                buttons.css('visibility', 'visible');
            }
        }

        //http://stackoverflow.com/questions/2424191/how-to-make-a-element-draggable-use-jquery
        //draggable fkt //geht noch nicht

    }


if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup

    });
    Meteor.onload = function () {
        L.mapbox.accessToken = 'pk.eyJ1IjoiYWxleG5ldHNjaCIsImEiOiJsX0V6Wl9NIn0.i14NX5hv3bkVIi075nOM2g';
        var map = L.mapbox.map('frameContent', 'map1.svg') .setView([40, -74.50], 9);;
    };
}

