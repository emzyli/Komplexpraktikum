
if (Meteor.isClient) {

    //um Startdiv nach 2s auszublenden
    Meteor.setTimeout(function(){hideStart()}, 2000);

    // Ebenennummer
    Session.setDefault("floor", 0);
    Session.setDefault("position", 0);
    //Ausklappmenue nicht ausgerollt
    Session.setDefault("toggled", 0);

    //Navigationsbuttons auf Karte
    var upBtn =  $('#levelUp');
    upBtn.disabled = true;
   /*    var downBtn =  $('#levelDown');

    downBtn.disabled = false;*/

    //Interaktion mit der NaviLeiste
    Template.navi.events({
        'click div#backBtn': function () {
            changeSVG(0, 2, Session.get("position"));
            toggleMenu(0);
        },
        'click div#roomBtn': function () {
            if(Session.get("position"))
                toggleMenu("ort");
            else  toggleMenu("ort");
        },
        'click div#filterBtn': function () {
            toggleMenu("filter");
        },
        'click div#infoBtn': function () {
            toggleMenu("info");
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


    //btnType: Raeume oder Filter
    function toggleMenu(btnType) {
        if (Session.get("toggled")!=btnType && btnType!=0) {
            //verändere zuletzt geklickten Button
            $('#'+Session.get("toggled")+ ' a div').css('background', "url('icon_"+Session.get("toggled")+".svg') no-repeat");
            $('#'+Session.get("toggled")+ ' a div').css('background-size', "125px");
            $('#'+Session.get("toggled") + ' a label').css('color', '#4defff');
            Session.set("toggled", btnType);
            //öffne menü
            $('#menu').effect('slide', { direction: 'left', mode: 'show' });
         //   $('#menu').html('<p>' + btnType + '</p>');
            toggleMenuContent(btnType);
            //verschiebe den roten Balken
            $('nav').css('border', 'none');
            //ändere den Button
            $('#'+btnType + ' a div').css('background', "url('icon_"+btnType+"Rot.svg') no-repeat");
            $('#'+btnType + ' a div').css('background-size', "125px");
            //ändere Label
            $('#'+btnType + ' a label').css('color', '#c00');
        }
        else {
            $('#'+Session.get("toggled")+ ' a div').css('background', "url('icon_"+Session.get("toggled")+".svg') no-repeat");
            $('#'+Session.get("toggled")+ ' a div').css('background-size', "125px");
            $('#'+Session.get("toggled") + ' a label').css('color', '#4defff');
            Session.set("toggled", 0);
            $('#menu').effect('slide', { direction: 'left', mode: 'hide' });
            //roten Balken wieder zeigen
            $('nav').css('border-right', '5px solid #cc0000');
            $('#'+btnType + ' a div').css('background', "url('icon_"+btnType+".svg') no-repeat");
            $('#'+btnType + ' a div').css('background-size', "125px");
        }
    }

    //fuegt den Tabellen-Inhalt ein
    function toggleMenuContent(btnType) {
        //toDo: hole XML (ausser Filter: hardcoded)
        if (btnType != 'filter') {
            if (!Session.get("position")) {
                //teste ob Campus oder Slub-Ansicht
                btnType = 'bibos'
            }
            xmlFile = getXML(btnType+'.xml');
            //lösche alle momentanen Elemente der Liste
            $('#menuList').empty();
            var list = $('#menuList');
            var entries = xmlFile.getElementsByTagName('entry');

            //fuer jeden Eintrag Listelemente einfuegen
            for (var i = 0; i < entries.length; i++) {
                //eine Heading
                liH = $('<li>').addClass('heading');
                li.html(entries[i].childNodes[0].nodeValue);
                list.append(liH);

                //gehe alle Elemente nach Heading durch
                for (var j = 0; j < entries[i].childNodes.length; j++) {
                    liE = $('<li>').addClass('menuel');
                    li.html(entries[i].childNodes[j].nodeValue);
                    list.append(liE);
                }
            }
        }
    }

    //gibt das XML fuer den jeweiligen geklickten Button zurueck
   function getXML(btnType) {
       $.ajax({
           url: btnType,
           data: '',
           dataType: 'xml',
           success: function (data) {
               return data.getElementsByTagName('item').length;
           }
       })
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
            $('#filter').css('visibility', 'visible');
            $('#info').css('visibility', 'visible');
            $('.tower').css('visibility', 'visible');
        }else{
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
                iframe.attr('src', 'ebene-1.svg');
                //floor = -1
                Session.set("floor", Session.get("floor") - 1);
                upBtn.disabled =  downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(0%)');
                down.css('-webkit-filter', 'grayscale(0%)');
            } else if (f == -1) {
                iframe.attr('src', 'ebene-2.svg');
                //floor = -2
                Session.set("floor", Session.get("floor") - 1);
                upBtn.disabled = false;
                downBtn.disabled = true;

                tower.css('background', "url('stapel-2.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(0%)');
                down.css('-webkit-filter', 'grayscale(100%)');
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
                up.css('-webkit-filter', 'grayscale(100%)');
                downBtn.css('-webkit-filter', 'grayscale(0%)');

            } else if (f == -2) {
                iframe.attr('src', 'ebene-1.svg');
                //floor = -1
                Session.set("floor", Session.get("floor") + 1);
                upBtn.disabled = downBtn.disabled = false;

                tower.css('background', "url('stapel-1.svg') no-repeat");
                tower.css('background-size', "111px");
                up.css('-webkit-filter', 'grayscale(0%)');
                down.css('-webkit-filter', 'grayscale(0%)');
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



}
