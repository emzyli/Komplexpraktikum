
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

    //Navigationsbuttons auf Karte
    var upBtn =  $('#levelUp');
    upBtn.disabled = true;
    /*    var downBtn =  $('#levelDown');
 
     downBtn.disabled = false;*/

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
        'click div#frameContent': function(){
            $('#frameContent').mousedown(handle_mousedown($(this)));
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
            $('nav').css('border-right', '10px solid #cc0000');
            $('#'+btnType + ' a div').css('background-image', "url('icon_"+btnType+".svg')");
            $('#'+btnType + ' a div').css('background-size', "125px");
        }
    }
    function toggleMenuContent(btnType) {
        var list = $('#menuList');
        //lösche alle momentanen Elemente der Liste
        list.empty();
       
        if (btnType == 'filter') toggleMenuFilter(list);
        if (btnType != 'filter') {
            if (!Session.get("position")) {
                //teste ob Campus oder Slub-Ansicht
                btnType = 'bibos'
            }

            //hole xml-Daten
            var xmlFile;
            $(document).ready(function () {
                $.ajax({
                    type: "GET",
                    url: btnType+".xml",
                    dataType: "xml",
                    success: fillList
                });
            });
        }
    }

//'find' braucht nen hack: http://stackoverflow.com/questions/15776529/jquery-ajax-xml-find-works-in-ie-but-not-chrome
    function fillList(xmlFile) {
        var list = $('#menuList');
        var entries = $(xmlFile).find('entry');

        //fuer jeden Entry Listelemente einfuegen
        //entry<heading(*), eintrag(*)>            
        entries.each(function () {
            //heading falls vorhanden
            if ($(this).find('heading').length > 0) {
                liH = $('<li>').addClass('heading');
                liH.html($(this).find('heading').text());
                list.append(liH);
            }
            //id falls vorhanden
            if ($(this).find('id').length > 0) {
                liH = $('<li>').addClass('menuel');
                liH.html($(this).find('id').text());
                list.append(liH);
            }
            //eintraege falls vorhanden
            if ($(this).find('eintrag').length > 0) {
                liEList = $(this).find('eintrag');
                liEList.each(function () {
                    liE = $('<li>').addClass('menuel');
                    liE.html($(this).text());
                    list.append(liE);
                });
            }
        });
    }

    function toggleMenuFilter(list) {
        liH1 = $('<li>').addClass('heading');
        liH2 = $('<li>').addClass('heading');
        liH4 = $('<li>').addClass('heading');
        li1 = $('<li>').addClass('menuel');
        li2 = $('<li>').addClass('menuel');
        li3 = $('<li>').addClass('menuel');
        li4 = $('<li>').addClass('menuel');

        liH1.html('Kapazit&auml;t');
        liH2.html('Ausstattung');
        liH4.html('Zusatz');

        inp1 = $("<input type=\"number\" id=\"noPers\" min=\"20\" max=\"20\" />");
        lb1 = $("<label for=\"noPers\">").text('Personen');
        inp2 = $("<input type=\"checkbox\" class=\"checkb\" id=\"bea\" />");
        lb2 = $("<label for=\"bea\">").text('Beamer');
        inp3 = $("<input type=\"checkbox\" class=\"checkb\" id=\"pc\" />");
        lb3 = $("<label for=\"pc\">").text('Computer');
        inp4 = $("<input type=\"checkbox\" class=\"checkb\" id=\"teilen\" />");
        lb4 = $("<label for=\"teilen\">").text('Raum teilen');

        li1.append(inp1);
        li1.append(lb1);
        li2.append(inp2)
        li2.append(lb2);
        li3.append(inp3)
        li3.append(lb3);
        li4.append(inp4);
        li4.append(lb4);

        list.append(liH1);
        list.append(li1);
        list.append(liH2);
        list.append(li2);
        list.append(li3);
        list.append(liH4);
        list.append(li4);
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
        //draggable fkt
        function handle_mousedown(e){
            window.my_dragging = {};
            my_dragging.pageX0 = e.pageX;
            my_dragging.pageY0 = e.pageY;
            my_dragging.elem = this;
            my_dragging.offset0 = $(this).offset();
            function handle_dragging(e){
                var left = my_dragging.offset0.left + (e.pageX - my_dragging.pageX0);
                var top = my_dragging.offset0.top + (e.pageY - my_dragging.pageY0);
                $(my_dragging.elem)
                .offset({top: top, left: left});
            }
            function handle_mouseup(e){
                $('body')
                .off('mousemove', handle_dragging)
                .off('mouseup', handle_mouseup);
            }
            $('body')
            .on('mouseup', handle_mouseup)
            .on('mousemove', handle_dragging);
        }

    }


if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup

    });
}

