
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

    //Kamera nicht aktiviert
    Session.setDefault("toggledCam", 0);

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

    //Raum in ebene0 46...ganz links, 66...ganz rechts
    // räume mitte: 40-43von rechts nach inks
    Session.setDefault('raum', 0.43);

    //Navigationsbuttons auf Karte
    var upBtn = $('#levelUp');
    upBtn.disabled = true;

    //Zoombuttons
    $('#out').disabled = true;


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

        'click div#roomR' : function() {
            changeRoom(Session.get("floor"), 1, Session.get('raum'));
        },
        'click div#roomL' : function() {
            changeRoom(Session.get("floor"), 0,  Session.get('raum'));
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
            changeSVG( Session.get("floor"), 3, Session.get("position"));
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
            var id = $(event.currentTarget).prop('id');
            Session.set('roomId', $.trim(id)); //ausgewaehlter Raum
            Session.set("position", 2);
            changeSVG(1, 2,  Session.get("position"));
        },
        'click #kamera' : function(){
            showPic();
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

 function showPic() {
     if (Session.get('toggledCam') == 0) {
            Session.set('toggledCam', 1);
            var raum = Session.get('raum');
            var iframe =  $('#frameContent');
            $('#camBtn').css({
                'background': "url('icon_kameraRot.svg') no-repeat",
                'background-size' :"125px"
            });
            $('#kamera label').css('color', '#cc0000');

            if (Session.get('floor') == 0) {
                 iframe.css({
                     'background': "url('Gruppenraum_"+ raum + ".jpg') no-repeat",
                     'background-size':'cover'
                 });
            }
            if (Session.get('floor') == -1) {
             iframe.css({
                     'background': "url('Gruppenraum_-1_116.jpg') no-repeat",
                     'background-size':'cover'
                 });
         }
     //hidePic
    }else if(Session.get('toggledCam') == 1){
         Session.set('toggledCam', 0);
         $('#camBtn').css({
             'background': "url('icon_kamera.svg') no-repeat",
             'background-size' :"125px"
         });
         $('#kamera label').css('color', '#4defff');

         if (Session.get('floor') == 0) {
             changeSVG(0, 2, Session.get("position"));
         }
         if (Session.get('floor') == -1) {
             changeSVG(-1, 2, Session.get("position"));
         }
     }
 }

//reinZoomen
    function zoomIn() {
        zlevel = Session.get('zoomLevel');
        if (zlevel == 3) {
            // ignore

        }
        else {
            //von Karte zu raum/ins Haus
            if (zlevel == 2) {
                if(Session.get('position') == 1) {
                    //weiter geht es nicht, +Link deaktivieren
                    $('#in').addClass('disabled');
                    $('#in').attr('style', 'opacity: 0.1; cursor: default');
                    Session.set("position", 2);

                    if (Session.get('floor') == -1) {
                        changeSVG(-1, 2, Session.get("position"));
                    }
                    if (Session.get('floor') == -2)
                        changeSVG(-2, 2, Session.get("position"));
                    if (Session.get('floor') == 0)
                        changeSVG(0, 2, Session.get("position")); ;

                    //geh von Campus zu Ebene0
                }else if (Session.get('position') == 0) {
                    Session.set("zoomLevel", 0);
                    //zommlevel wird auf 0 gesetzt, buttons dementsprechend aktiviert/deaktiviert
                    $('#in').removeClass('disabled');
                    $('#out').addClass('disabled');
                    $('#out').attr('style', 'opacity: 0.1; cursor: default');

                    changeSVG(0, 3, 0);
                    toggleMenu(0);
                }

            }else if (zlevel == 1) {
                //weiter geht es nicht, +Link deaktivieren
              //  $('#in').addClass('disabled');
               // $('#in').attr('style', 'opacity: 0.1; cursor: default');
                if(Session.get('position') == 0)
                        $('#frameContent').css("background-position", '-1500px -1250px');
                if(Session.get('floor')== -1)
                    $('#frameContent').css("background-position", '-700px -150px');
                if(Session.get('floor')== -2)
                    $('#frameContent').css("background-position", '-1000px 350px');
                if(Session.get('floor')== 0 && Session.get('position'))
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
                if(Session.get('floor')== 0 && Session.get('position'))
                    $('#frameContent').css("background-position", '-200px -300px');
            }
            if(zlevel != 2) {
                zlevel++;
                Session.set("zoomLevel", zlevel);
                $('#frameContent').css("background-size", (zlevel + 1) * 100 + '%');
                $('#frameContent').css("-webkit-transform:", "scale(1.4)");
                $('#frameContent').css("-moz-transform:", "scale(1.4)");
            }
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

                $('#frameContent').css({
                        'background-position' : '0px 0px',
                        "background-size" : 'cover'
                });
                if(Session.get('floor')==-2)
                    $('#frameContent').css({
                        'background-position' : '0px 100px',
                        "background-size" : 'cover'
                });
            }
            if (zlevel == 2) {
                //wieder hineinzoomen mgl, +Link aktivieren
                $('#in').removeClass('disabled');
                $('#in').attr('style', 'opacity: 1; cursor: pointer');
                $('#frameContent').css("background-size", (zlevel) * 100 + '%');

                //Zoom aus Campuskarte
                if(Session.get('position') == 0)
                    $('#frameContent').css("background-position", '-500px -500px');
                if(Session.get('floor')== 0 && Session.get('position')==1)
                    $('#frameContent').css( "background-position",'-200px -300px');
                if(Session.get('floor')== -1)
                    $('#frameContent').css("background-position",'-100px -150px');
                if(Session.get('floor')== -2)
                    $('#frameContent').css("background-position", '-500px 500px');
            }

            zlevel--;
            Session.set("zoomLevel", zlevel);
            $('#frameContent').css("-webkit-transform:", "scale(0.4)");
            $('#frameContent').css("-moz-transform:", "scale(0.4)");
        }
        }

    //schließt Anfangsbild
    function hideStart() {
        $('#icon').fadeOut("slow");
        $('#start').fadeOut("slow");
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
    // @param p: aktuelle Position: 0..Campus, 1..SLUB, 2..Raum
    function changeSVG(f, i, p) {
        var tower = $('#tower');
        var upBtn = $('#levelUp');
        var up = $('#up');
        var downBtn = $('#levelDown');
        var down = $('#down');
        var iframe = $('#frameContent');
        var buttons = $('.levelBtn');
        var buttonsRoom = $('.changeRoom');
        var right = $('#right');
        var left = $('#left');
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
                upBtn.css('cursor', 'pointer');
                downBtn.css('cursor', 'pointer');

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");

                up.css({
                    '-webkit-filter': 'grayscale(0%)',
                    'cursor' : 'pointer'
                });
                down.css({
                    '-webkit-filter': 'grayscale(0%)',
                    'cursor' : 'pointer'
                });
            } else if (f == -1) {
                iframe.css('background', "url('ebene-2.svg') no-repeat");
                iframe.css('background-position-y', "100px");
                iframe.css('background-size', "120%");

                //floor = -2
                Session.set("floor", Session.get("floor") - 1);
                Session.set("zoomLevel", 0);
                upBtn.disabled = false;
                downBtn.disabled = true;
                upBtn.css('cursor', 'pointer');
                downBtn.css('cursor', 'default');
                up.css({
                    '-webkit-filter': 'grayscale(0%)',
                    'cursor' : 'pointer'
                });
                down.css({
                    '-webkit-filter': 'grayscale(100%)',
                    'cursor' : 'default'
                });

                tower.css('background', "url('stapel-2.svg') no-repeat");
                tower.css('background-size', "111px");

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
                upBtn.css('cursor', 'default');
                downBtn.css('cursor', 'pointer');
                up.css({
                    '-webkit-filter': 'grayscale(100%)',
                    'cursor' : 'default'
                });
                down.css({
                    '-webkit-filter': 'grayscale(0%)',
                    'cursor' : 'pointer'
                });

                tower.css('background', "url('stapel.svg') no-repeat");
                tower.css('background-size', "111px");


            } else if (f == -2) {
                iframe.css('background', "url('ebene-1.svg') no-repeat");
                iframe.css('background-position', "cover");
                iframe.css('background-size', "120%");
                //floor = -1
                Session.set("floor", Session.get("floor") + 1);
                Session.set("zoomLevel", 0);
                upBtn.disabled = downBtn.disabled = false;
                upBtn.css('cursor', 'pointer');
                downBtn.css('cursor', 'pointer');

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");

                up.css({
                    '-webkit-filter': 'grayscale(0%)',
                    'cursor' : 'pointer'
                });
                down.css({
                    '-webkit-filter': 'grayscale(0%)',
                    'cursor' : 'pointer'
                });
            }
           //Raumansicht
        }else if(i==2){
                //wenn aus Menü auf Raum geklickt
                 if(f==1){
                     var raum =  Session.get('roomId');
                     //Wenn in Ebene -1 oder -2
                     if(raum == '-1.116'){
                         Session.set("floor", -1);
                         Session.set('raum', -1.116);

                         right.css({ '-webkit-filter': 'grayscale(0%)',  'cursor':'pointer' });
                         $('#roomR').css({ 'cursor':'pointer'  });
                         left.css({ '-webkit-filter': 'grayscale(0%)',  'cursor':'pointer' });
                         $('#roomL').css({ 'cursor':'pointer'  });

                         changeSVG(-1, 2, Session.get("position"));
                     }
                     else if(raum == '-2.115' ){
                         Session.set("floor", -2);
                         Session.set('raum', -2.115);

                         right.css({ '-webkit-filter': 'grayscale(100%)','cursor':'default' });
                         $('#roomR').css({'cursor':'default' });
                         left.css({ '-webkit-filter': 'grayscale(0%)',  'cursor':'pointer' });
                         $('#roomL').css({ 'cursor':'pointer'});

                         changeSVG(-2, 2, Session.get("position"));
                     }
                     else {
                         Session.set("floor",0);
                         Session.set('raum',  Session.get('roomId'));

                        if(raum == '0.46'){
                            left.css({ '-webkit-filter': 'grayscale(100%)',  'cursor':'default' });
                            $('#roomL').css({ 'cursor':'default'});
                        }else{
                            left.css({ '-webkit-filter': 'grayscale(0%)',  'cursor':'pointer' });
                            $('#roomL').css({ 'cursor':'pointer'});
                        }
                         right.css({ '-webkit-filter': 'grayscale(0%)','cursor':'pointer' });
                         $('#roomR').css({ 'cursor':'pointer'});

                         changeSVG(0,2,Session.get('position'));
                     }
                 }
                //Ebene0
                else if(f==0){
                     var raum =  Session.get('raum');

                    $('#kamera').disabled = false;
                    $('#camBtn').css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor' : 'pointer'
                    });
                    $('#kamera label').css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor' : 'pointer'
                    });

                    if(Session.get('toggledCam')==0){
                        iframe.css("background" , "url('raum"+raum+".svg') no-repeat");

                    if(raum == 0.46 || raum == 0.42 || raum == 0.66 ) {
                        iframe.css({
                            "background-size": '100%',
                            "background-position": '0px 230px'
                        });
                    }
                    if(raum == 40){
                        iframe.css({
                            "background-size": '94%',
                            "background-position": '10px -5px'
                        });
                    }
                    }else {
                        iframe.css({
                           // 'background': "url('Gruppenraum_0_" + raum + ".jpg') no-repeat",
                            'background': "url('Gruppenraum_" + raum + ".jpg') no-repeat",
                            'background-size':'cover'
                        });
                    }
                    //Zoom ausblenden
                    $('#in').css('visibility', 'hidden');
                    $('#out').css('visibility', 'hidden');

                    tower.css('background', "url('stapel.svg') no-repeat");
                    tower.css('background-size', "111px");
                    buttons.css('visibility', 'hidden');
                    buttonsRoom.css('visibility', 'visible');
                    changeBtns(2);
                }
                else if(f == -1){

                    $('#kamera').disabled = false;
                    $('#camBtn').css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor' : 'pointer'
                    });
                    $('#kamera label').css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor' : 'pointer'
                    });

                    if(Session.get('toggledCam')==0) {
                        iframe.css({
                            "background": "url('raum-1.116.svg') no-repeat",
                            "background-size": '100%',
                            "background-position": '0px 230px'
                        });
                    }else{
                        iframe.css({
                            'background': "url('Gruppenraum-1_116.jpg') no-repeat",
                            'background-size':'cover'
                        });
                    }
                    //Zoom ausblenden
                    $('#in').css('visibility', 'hidden');
                    $('#out').css('visibility', 'hidden');
                    //Turm anpassen
                    tower.css('background', "url('stapel-1.svg') no-repeat");
                    tower.css('background-size', "111px");

                    buttons.css('visibility', 'hidden');
                    buttonsRoom.css('visibility', 'visible');
                    changeBtns(2);


                }else if(f == -2) {
                    //Kamera Button ausgrauen, da es keine Bilder für diesen Raum gibt
                    Session.set('toggledCam', 0);
                    $('#camBtn').css({
                        'background': "url('icon_kamera.svg') no-repeat",
                        'background-size' :"125px"
                    });
                    $('#kamera label').css('color', '#4defff');
                    $('#kamera').disabled = true;
                    $('#camBtn').css({
                        '-webkit-filter': 'grayscale(100%)',
                        'cursor' : 'default'
                    });
                    $('#kamera label').css({
                        '-webkit-filter': 'grayscale(100%)',
                        'cursor' : 'default'
                    });

                    iframe.css({
                        "background": "url('raum-2.115.svg') no-repeat",
                        "background-size": '95%',
                        "background-position": '20px -20px'
                    });
                    //Zoom ausblenden
                    $('#in').css('visibility', 'hidden');
                    $('#out').css('visibility', 'hidden');
                    tower.css('background', "url('stapel-2.svg') no-repeat");
                    tower.css('background-size', "111px");
                    buttons.css('visibility', 'hidden');
                    buttonsRoom.css('visibility', 'visible');
                    $('#roomR').css('cursor','default');
                    $('#right').css({
                        '-webkit-filter': 'grayscale(100%)',
                        'cursor' : 'default'
                    });
                    changeBtns(2);
                }
         //zurück Button, Zoom der Stufe 3
        }else if(i==3){
            //aus Ebenenübersicht
            if (p == 1) {
                Session.set("position", 0);
                Session.set("zoomLevel", 0);
                iframe.css({
                    'background':"url('map1.svg') no-repeat",
                    'background-size' : 'cover'
                });
                buttons.css('visibility', 'hidden');
                changeBtns(1);

             //aus Campusplan in den Ebenenplan
            } else if(p == 0) {
                Session.set("position", 1);
                Session.set("zoomLevel", 0);
                iframe.css({
                    'background-size': "cover",
                    'background': "url('Ebene0.svg') no-repeat"

                });
                buttons.css('visibility', 'visible');

             //aus Raum in den Ebenenplan
            }else if(p == 2){
                Session.set("position", 1);
                Session.set("zoomLevel", 0);
                $('#in').css('visibility', 'visible');
                $('#in').removeClass('disabled');
                $('#in').attr('style', 'opacity: 1; cursor: pointer');
                $('#out').css('visibility', 'visible');
                $('#out').addClass('disabled');
                $('#out').attr('style', 'opacity: 0.1; cursor: default');

                if (f == 0) {
                    iframe.css({
                        'background': "url('Ebene0.svg') no-repeat",
                        'background-size' : "100%"
                    });

                    buttons.css('visibility', 'visible');
                    upBtn.disabled = true;
                    downBtn.disabled = false;
                    upBtn.css('cursor', 'default');
                    downBtn.css('cursor', 'pointer');
                    up.css({
                        '-webkit-filter': 'grayscale(100%)',
                        'cursor' : 'default'
                    });
                    down.css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor' : 'pointer'
                    });
                    buttonsRoom.css('visibility', 'hidden');
                }
                else if(f == -1){
                    Session.set("zoomLevel", 0);

                    iframe.css({
                        'background': "url('ebene-1.svg') no-repeat",
                        'background-size': "cover"
                    });
                  //  iframe.css('background-size', "100%");
                    buttons.css('visibility', 'visible');
                    buttonsRoom.css('visibility', 'hidden');

                    upBtn.disabled = downBtn.disabled = false;
                    upBtn.css('cursor', 'pointer');
                    downBtn.css('cursor', 'pointer');
                    up.css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor' : 'pointer'
                    });
                    down.css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor' : 'pointer'
                    });

                }
                else if(f == -2){
                    Session.set("zoomLevel", 0);
                    iframe.css({
                        'background': "url('ebene-2.svg') no-repeat",
                        'background-position' : '0px 100px',
                        'background-size': "cover"
                    });

                   // iframe.css('background-size', "100%");
                    buttons.css('visibility', 'visible');
                    buttonsRoom.css('visibility', 'hidden');

                    upBtn.disabled = false;
                    downBtn.disabled = true;
                    upBtn.css('cursor', 'pointer');
                    downBtn.css('cursor', 'default');
                    up.css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor' : 'pointer'
                    });
                    down.css({
                        '-webkit-filter': 'grayscale(100%)',
                        'cursor' : 'default'
                    });

                }
            }
        }

    }

    // @param f: Ebene
    // @param i: ist 1 bei rechts und 0 bei links
    // @param r: aktueller Raum (nur bei Ebene 0 wichtig), 1..Raum links außen,...
    function changeRoom(f, i, r){
        var right = $('#right');
        var left = $('#left');
        if(f == 0){
            //Ebene0 nach rechts
            if(i == 1) {
                if(r == 0.66){
                    Session.set("floor", Session.get("floor") - 1);
                    changeSVG(-1, 2, Session.get("position"));
                }else if(r == 0.41){
                    Session.set("raum", 0.40);
                    changeSVG(0, 2, Session.get("position"));

                }else if(r == 0.40){
                    Session.set("raum", 0.66);
                    changeSVG(0, 2, Session.get("position"));
                }else if(r == 0.46){
                    Session.set("raum", 0.43);
                    changeSVG(0, 2, Session.get("position"));
                    //es kann wieder nach links gklickt werden
                    left.css({
                        '-webkit-filter': 'grayscale(0%)',
                        'cursor':'pointer'
                    });
                    $('#roomL').css({
                        'cursor':'pointer'
                    });
                }else{
                    Session.set("raum", Session.get("raum")-0.01);
                    changeSVG(0, 2, Session.get("position"));
                }

            //Ebene0 nach links
            }else {
                if(r == 0.46){
                }
                else if (r == 0.66) {
                    Session.set("raum", 0.40);
                    changeSVG(0, 2, Session.get("position"));
                }else if(r == 0.4){
                    Session.set("raum", 0.41);
                    changeSVG(0, 2, Session.get("position"));
                }else if (r == 0.43) {
                    Session.set("raum", 0.46);
                    changeSVG(0, 2, Session.get("position"));

                    //geht nicht weiter, desktiviere button nach links
                    left.css({
                        '-webkit-filter': 'grayscale(100%)',
                        'cursor': 'default'
                    });
                    $('#roomL').css({
                        'cursor': 'default'
                    });
                }else{
                    Session.set("raum", Session.get("raum")+0.01);
                    changeSVG(0, 2, Session.get("position"));
                }
            }
        }//Ebene -1
        else if (f == -1){
            if(i == 1){
                Session.set("floor", Session.get("floor") - 1);
                right.css({
                    '-webkit-filter': 'grayscale(100%)',
                    'cursor':'default'
                });
                $('#roomR').css({
                    'cursor':'default'
                });
                left.css('-webkit-filter', 'grayscale(0%)');
                changeSVG(-2, 2, Session.get("position"));
            }else{
                Session.set("floor", Session.get("floor") + 1);
                Session.set('raum', 0.66);
                changeSVG(0, 2, Session.get("position"));
            }
        //Ebene -2
        }else if(f == -2){
            if(i == 0){
                Session.set("floor", Session.get("floor") + 1);
                right.css({
                    '-webkit-filter': 'grayscale(0%)',
                    'cursor':'pointer'
                });
                $('#roomR').css({
                    'cursor':'pointer'
                });
                left.css('-webkit-filter', 'grayscale(0%)');
                changeSVG(-1, 2, Session.get("position"));
            }else{

            }
        }
    }


    /*ES GEHT NCIHT!!!!!!!*/
    function drag(){
        /*  so will es nicht...
         var myPosX = $('#frameContent').css("background-position-x");
         var myPosY = $('#frameContent').css("background-position-y");*/

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

    if (Meteor.isServer) {
        Meteor.startup(function () {
            // code to run on server at startup

        });

    }
}
