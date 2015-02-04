
if (Meteor.isClient) {

    //um Startdiv nach 2s auszublenden
    Meteor.setTimeout(function () {
        hideStart()
    }, 2000);

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
    //background-position X und Y
    Session.setDefault("bgx", 0);
    Session.setDefault("bgy", 0);
    //mousedown X und mousedown Y
    Session.setDefault("downX", 0);
    Session.setDefault("downY", 0);
    //mouseup X und mouseup Y
    Session.setDefault("upX", 0);
    Session.setDefault("upY", 0);
    //prüfe ob grad gedraggt wird
    Session.setDefault('dragging', false)
    //Navigationsbuttons auf Karte
    var upBtn = $('#levelUp');
    upBtn.disabled = true;


//Interaktion mit dem Inhalt (SVG-Karten und Buttons)
    Template.content.events({
        //mach es draggable
        'mousedown div#frameContent': function() {
            if (!Session.get('dragging')) {
                Session.set('dragging', true);
                //liest position der Maus aus
                Session.set("downX", event.pageX);
                Session.set("downY", event.pageY);
                $('#frameContent').css('cursor', 'move');
            }
        },
        'mouseup div#frameContent': function() {
            if( Session.get('dragging')){
                Session.set('dragging', false)
                //liest position der Maus aus
                Session.set("upX", event.pageX);
                Session.set("upY", event.pageY);
                $('#frameContent').css('cursor', 'auto');
                drag(event);
            }
        },
        'dblclick div#frameContent': function(){
            if(  Session.get("position"))  zoomRoom(event.pageX, event.pageY);

        },
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
    //Interaktion mit der NaviLeiste
    Template.navi.events({
        'click div#first': function () {
            changeSVG(0, 3, Session.get("position"));
            toggleMenu(0);
        },
        'click div#ort': function () {
           toggleMenu("ort");
        },
        'click div#filter': function () {
            toggleMenu("filter");
        },
        'click div#info': function () {
            toggleMenu("info");
        },
        'click ul.menuort li.menuel': function (event) { //wir kommen in Raumansicht
            var id = $(event.target).prop('id');
            Session.set('roomId', $.trim(id)); //ausgewaehlter Raum
            Session.set("position", 2);
        }
    });
    Template.navi.helpers({
        firstBtn: function () {
            if (Session.get("position")) {
                changeBtns(Session.get("position"));
                return 'zurück';
            } else {
                changeBtns(Session.get("position"));
                ;
                return 'Zentralbibliothek';
            }
        },
        position: function () {
            if (!Session.get("position")) {
                return 'Standorte';
            } else return 'Räume';
        },
        floor: function () {
            return Session.get("floor");
        }
    });


    function drag(){
        /*  so will es nicht...
         var myPosX = $('#frameContent').css("background-position-x");
         var myPosY = $('#frameContent').css("background-position-y");*/

        /*ES GEHT NCIHT!!!!!!!*/

        //x2-x1 und y2-y1
        var deltaX =Session.get('upX')-Session.get('downX');
        var deltaY =Session.get('upY')-Session.get('downY');
        if(deltaX=0){
            //ziehen nach oben
            if(deltaY < 0){
                $('#frameContent').css({"background-position": (Session.get("bgx")+0)+'px '+(Session.get("bgy")-20)+'px'});
                Session.set("bgy",   Session.get("bgy")-20);

                Session.set('downX', 0);
                Session.set('upX', 0);
                Session.set('downY', 0);
                Session.set('upY', 0);
                return;
                //ziehen nach unten
            }else  if(deltaY > 0){
                $('#frameContent').css({"background-position": (Session.get("bgx")+0)+'px '+(Session.get("bgy")+20)+'px'});
                Session.set("bgy",   Session.get("bgy")+20);

                Session.set('downX', 0);
                Session.set('upX', 0);
                Session.set('downY', 0);
                Session.set('upY', 0);
                return;
            }
        }else if(deltaX>0){
            //nach oben rechts
            if(deltaY<0){
                $('#frameContent').css({"background-position": (Session.get("bgx")+20)+'px '+(Session.get("bgy")-20)+'px'});
                Session.set("bgx",   Session.get("bgx")+20);
                Session.set("bgy",   Session.get("bgy")-20);

                Session.set('downX', 0);
                Session.set('upX', 0);
                Session.set('downY', 0);
                Session.set('upY', 0);
                return;
            }
            //nach rechts
            else if(deltaY=0){
                $('#frameContent').css({"background-position": (Session.get("bgx")+20)+'px '+(Session.get("bgy")+0)+'px'});
                Session.set("bgx",   Session.get("bgx")+20);

                Session.set('downX', 0);
                Session.set('upX', 0);
                Session.set('downY', 0);
                Session.set('upY', 0);
                return;
            }
            //nach unten rechts
            else if(deltaY>0){
                $('#frameContent').css({"background-position": (Session.get("bgx")+20)+'px '+(Session.get("bgy")+20)+'px'});
                Session.set("bgx",   Session.get("bgx")+20);
                Session.set("bgy",   Session.get("bgy")+20);

                Session.set('downX', 0);
                Session.set('upX', 0);
                Session.set('downY', 0);
                Session.set('upY', 0);
                return;
            }
        }else{
            //nach oben links
            if(deltaY<0){
                $('#frameContent').css({"background-position": (Session.get("bgx")-20)+'px '+(Session.get("bgy")-20)+'px'});
                Session.set("bgx",   Session.get("bgx")-20);
                Session.set("bgy",   Session.get("bgy")-20);

                Session.set('downX', 0);
                Session.set('upX', 0);
                Session.set('downY', 0);
                Session.set('upY', 0);
                return;
            }
            //nach links
            else if(deltaY=0){
                $('#frameContent').css({"background-position": (Session.get("bgx")-20)+'px '+(Session.get("bgy"))+'px'});
                Session.set("bgx",   Session.get("bgx")-20);

                Session.set('downX', 0);
                Session.set('upX', 0);
                Session.set('downY', 0);
                Session.set('upY', 0);
                return;
            }
            //nach unten links
            else if(deltaY>0){
                $('#frameContent').css({"background-position": (Session.get("bgx")-20)+'px '+(Session.get("bgy")+20)+'px'});
                Session.set("bgx",   Session.get("bgx")-20);
                Session.set("bgy",   Session.get("bgy")+20);

                Session.set('downX', 0);
                Session.set('upX', 0);
                Session.set('downY', 0);
                Session.set('upY', 0);
                return;
            }
        }
    }
//in den Raum zoomen
    function zoomRoom(x, y){

        $('#frameContent').css({//"background-size" : '800%',
            "background-position": '-'+(x-550)+'px -'+(y)+'px'});

        Session.set("zoomLevel", 3);
        $('#out').removeClass('disabled');
        $('#out').attr('style', 'opacity: 1; cursor: pointer');
        return;
    }


//reinZoomen
    function zoomIn() {
        zlevel = Session.get('zoomLevel');
        if (zlevel == 3) {
            // ignore

        }
        else {
            if (zlevel == 2) {
                //weiter geht es nicht, +Link deaktivieren
                $('#in').addClass('disabled');
                $('#in').attr('style', 'opacity: 0.1; cursor: default');
                if (!Session.get('position')) {
                  //  $('#frameContent').css("background-position", '0px 0px');
                    changeSVG(0, 3, 0);
                    toggleMenu(0);
                }
                if (Session.get('floor') == -1) {
                    changeSVG(-1, 2, Session.get("position"));
                }
                if (Session.get('floor') == -2)
                    $('#frameContent').css("background-position", '-1000px 350px');
                if (Session.get('floor') == 0)
                    $('#frameContent').css("background-position", '-1100px -600px');
            }else if (zlevel == 1) {
                //weiter geht es nicht, +Link deaktivieren
              //  $('#in').addClass('disabled');
               // $('#in').attr('style', 'opacity: 0.1; cursor: default');
                if(!Session.get('position'))
                        $('#frameContent').css("background-position", '-1350px -1100px');
                if(Session.get('floor')== -1)
                    $('#frameContent').css("background-position", '-700px -150px');
                if(Session.get('floor')== -2)
                    $('#frameContent').css("background-position", '-1000px 350px');
                if(Session.get('floor')== 0)
                    $('#frameContent').css("background-position", '-1100px -600px');
            }
            if (zlevel == 0) {
                //es geht nun zurueck, -Link aktivieren
                $('#out').removeClass('disabled');
                $('#out').attr('style', 'opacity: 1; cursor: pointer');
                if(!Session.get('position'))
                        $('#frameContent').css("background-position", '-500px -500px');
                //Zoom Ebene -1
                if(Session.get('floor')== -1)
                    $('#frameContent').css("background-position", '-100px -150px');
                if(Session.get('floor')== -2)
                    $('#frameContent').css("background-position", '-500px 500px');
                if(Session.get('floor')== 0)
                    $('#frameContent').css("background-position", '-200px -300px');
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

                if(!Session.get('position')) {
                    $('#frameContent').css("background-position", '0px 0px');
                    $('#frameContent').css("background-size", 'cover');
                }
                if(Session.get("floor") == -1){
                   // $('#frameContent').css('background-size', "120%");
                }
            }
            if (zlevel == 2) {
                //wieder hineinzoomen mgl, +Link aktivieren
                $('#in').removeClass('disabled');
                $('#in').attr('style', 'opacity: 1; cursor: pointer');

                //Zoom in Campuskarte
                if(!Session.get('position')) {
                    $('#frameContent').css("background-position", '-500px -500px');
                }


            }
            zlevel--;
            Session.set("zoomLevel", zlevel);
            $('#frameContent').css("background-size", (zlevel + 1) * 100 + '%');
            $('#frameContent').css("-webkit-transform:", "scale(0.4)");
            $('#frameContent').css("-moz-transform:", "scale(0.4)");
        }
        S}

    //schließt Anfangsbild
    function hideStart() {
        $('#icon').fadeOut("slow");
        $('#start').fadeOut("slow");
        // $('#start').effect('slide', { direction: 'right', mode: 'hide' });
        $('#content').css('visibility', 'visible').hide().fadeIn('slow');//.css('visibility', 'visible');
        $('nav').css('visibility', 'visible').hide().fadeIn('slow');
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
            $('#kamera').css('visibility', 'hidden');
            $('.tower').css('visibility', 'visible');
        }
        if (!p) {
            $('#backBtn').css('transform', 'scaleX(-1)');
            $('#filter').css('visibility', 'hidden');
            $('#info').css('visibility', 'hidden');
            $('#kamera').css('visibility', 'hidden');
            $('.tower').css('visibility', 'hidden');
        }
    }

    //ändert Karte und Turm
    // @param f: Ebene
    // @param i: ist 1 bei down und 0 bei up und 2 bei zoom=3
    // @param p: aktuelle Position: 0..Campus, 1..SLUB
    function changeSVG(f, i, p) {
        var tower = $('#tower');
        var upBtn = $('#levelUp');
        var up = $('#up');
        var downBtn = $('#levelDown');
        var down = $('#down');
        var iframe = $('#frameContent');
        var buttons = $('.levelBtn');
        //ebene runter
        if (i == 1) {
            if (f == 0) {
                iframe.css('background', "url('ebene-1.svg') no-repeat");
                iframe.css('background-position', "cover");
                iframe.css('background-size', "120%");
                //floor = -1
                Session.set("floor", Session.get("floor") - 1);
                Session.set("zoomLevel", 0);
                upBtn.disabled = downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(0%)');
                down.css('-webkit-filter', 'grayscale(0%)');
            } else if (f == -1) {
                iframe.css('background', "url('ebene-2.svg') no-repeat");
             //   iframe.css('background-position', "cover");
                iframe.css('background-position-y', "100px");
                iframe.css('background-size', "120%");

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
            //ebene hoch
        } else if (i == 0) {
            if (f == -1) {
                iframe.css('background', "url('Ebene0.svg') no-repeat");
                iframe.css('background-position', "cover");
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
                iframe.css('background-position', "cover");
                iframe.css('background-size', "120%");
                //floor = -1
                Session.set("floor", Session.get("floor") + 1);
                Session.set("zoomLevel", 0);
                upBtn.disabled = downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(0%)');
                down.css('-webkit-filter', 'grayscale(0%)');
            }
            //Raumansicht
        }else if(i==2){
                if(f==0);
                else if(f == -1){
                    iframe.css('background-size', '100%');
                    iframe.css('background-position', '0 230px');
                    iframe.css('background', "url('raum-1.116.svg') no-repeat");

                }else if(f == -2){
                    iframe.css('background', "url('raum-2.115.svg') no-repeat");
                    iframe.css('background-size', '100%');
                    iframe.css('background-position', '0 230px');
                }
         }else {
            if (p == 1) {
                Session.set("position", 0);
                Session.set("zoomLevel", 0);
                iframe.css('background', "url('map1.svg') no-repeat");
                buttons.css('visibility', 'hidden');
                changeBtns(1);
            } else {
                Session.set("position", 1);
                Session.set("zoomLevel", 0);
                iframe.css('background', "url('Ebene0.svg') no-repeat");
                iframe.css('background-size', "100%");
                buttons.css('visibility', 'visible');
            }
        }

    }


    if (Meteor.isServer) {
        Meteor.startup(function () {
            // code to run on server at startup

        });

    }
}
