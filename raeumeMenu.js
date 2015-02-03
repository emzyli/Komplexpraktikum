//btnType: 0:Zurueck|Kamera, 'ort', 'filter', 'info'
toggleMenu = function toggleMenu(btnType) {
    if (Session.get("toggled") == 'filter') {
        //wir schlie�en jetzt Filter, muessen also ausgewaehlte Kriterien speichern
        saveCriteria();
    }
    if (Session.get("toggled") != btnType && btnType != 0) {
        //ver�ndere zuletzt geklickten Button
        $('#' + Session.get("toggled") + ' a div').css('background', "url('icon_" + Session.get("toggled") + ".svg') no-repeat");
        $('#' + Session.get("toggled") + ' a div').css('background-size', "125px");
        $('#' + Session.get("toggled") + ' a label').css('color', '#4defff');
        Session.set("toggled", btnType);
        //�ffne men�
        $('#menu').effect('slide', { direction: 'left', mode: 'show' });
        //   $('#menu').html('<p>' + btnType + '</p>');sav
        toggleMenuContent(btnType);
        //verschiebe den roten Balken
        $('nav').css('border', 'none');
        //�ndere den Button
        $('#' + btnType + ' a div').css('background', "url('icon_" + btnType + "Rot.svg') no-repeat");
        $('#' + btnType + ' a div').css('background-size', "125px");
        //�ndere Label
        $('#' + btnType + ' a label').css('color', '#c00');
    }
    else {        
        $('#' + Session.get("toggled") + ' a div').css('background', "url('icon_" + Session.get("toggled") + ".svg') no-repeat");
        $('#' + Session.get("toggled") + ' a div').css('background-size', "125px");
        $('#' + Session.get("toggled") + ' a label').css('color', '#4defff');
        Session.set("toggled", 0);
        $('#menu').effect('slide', { direction: 'left', mode: 'hide' });
        //roten Balken wieder zeigen
        $('nav').css('border-right', '10px solid #cc0000');
        $('#' + btnType + ' a div').css('background-image', "url('icon_" + btnType + ".svg')");
        $('#' + btnType + ' a div').css('background-size', "125px");
    }
}


toggleMenuContent = function toggleMenuContent(btnType) {
    getInfoXml(); //speichere Rauminfos
    if (btnType == 'ort' && !Session.get("position")) {
        btnType = 'bibos'; //teste ob Campus-Ansicht -> zweigbibos
    }
    if (btnType == 'filter') {
        toggleMenuFilter(Session.get('filterList'));  //Liste erstellen & Filterkriterien uebergeben    
    }
    if (btnType != 'filter') {
        //hole xml-Daten
        $(document).ready(function () {
            $.ajax({
                type: "GET",
                url: btnType+".xml",
                dataType: "xml",
                success: function (data) {
                    switch (btnType) {
                        case 'info': showRoomInfo(Session.get('roomId'), data); break;
                        case 'bibos': fillList(data); break;
                        case 'ort': get_fRooms(data); break; //falls Rauminfo schon gespeichert                        
                    }
                }
            });
        });
    }
}

//hole Daten aller Raeume (info.xml)
function getInfoXml() {
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url: "info.xml",
            dataType: "xml",
            success: function (data) {
                saveRoomInfo(data);
            }
        });
    });
}

//fuege dem Menu-Div Liste hinzu
updateList = function updateList(list) {
    $('#menu').empty();
    $('#menu').append(list);
}


//fuelle Menue
fillList = function fillList(xmlFile) {
    var list = $('<ul>').attr('id', 'menuList'); list.addClass(($(xmlFile).find(":root")).tagName);
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
                liE.attr('id', $(this).text().substr(8, $(this).text().length-1)); //damit Raumnummer als Id hinzugefuegt wird
                list.append(liE);
            });
        }
    });
    updateList(list);
}


toggleMenuFilter = function toggleMenuFilter(filterList) {
    var list = $('<ul>').attr('id', 'menuList');
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
    inp2 = $("<input type=\"number\" id=\"bea\" />");
    lb2 = $("<label for=\"bea\">").text('Beamer');
    inp3 = $("<input type=\"number\" id=\"pc\" />");
    lb3 = $("<label for=\"pc\">").text('Computer');
    inp4 = $("<input type=\"checkbox\" class=\"checkb\" id=\"teilen\" />");
    lb4 = $("<label for=\"teilen\">").text('Raum teilen');

    //vorherige Filterauswahl uebernehmen
    inp1.attr('value', filterList[0]);
    inp2.attr('value', filterList[1]);
    inp3.attr('value', filterList[2]);
    inp4.attr('checked', filterList[3]);

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

    updateList(list);   
}


//speichert ausgewaehlte Filterkriterien in filterList
function saveCriteria() {
    fList = [];
    fList[0] = parseInt($('#noPers').val());
    fList[1] = parseInt($('#bea').val());
    fList[2] = parseInt($('#pc').val());
    fList[3] = $('#teilen').is(":checked");
    Session.set('filterList', fList); //globale Variable setzen
    adapt_fRooms();
}


//fuegt alle Raeume inkl Info in "rooms" ein
saveRoomInfo = function saveRoomInfo(data) {    
    var rooms = [];
    var entries = $(data).find('entry');
    entries.each(function () {
        var room = [];
        //id
        room.push($(this).find('id').text());
        //personenanzahl
        room.push($(this).find('pers').text());
        //pc falls vorhanden
        if ($(this).find('computer').length > 0)
            room.push($(this).find('computer').text());
        //beamer falls vorhanden
        if ($(this).find('beamer').length > 0)
            room.push($(this).find('beamer').text());
        rooms.push(room);
    });
    Session.set('rooms', rooms);
}

//zeigt die Informationen fuer den ausgewaehlten Raum in ul an (hole Raum per Id)
showRoomInfo = function showRoomInfo(roomId, data) {
    $(data).find('entry').each(
        function(){
            if($(this).find('id').eq(roomId))
                fillList($(this)); return;
        });    
}

//gibt Raum-Index in rooms mit roomId zurueck 
function getRoomInd(roomId) {
    var rooms = Session.get('rooms');
    for (var i = 0; i < rooms.length; i++) {//fuer jeden Raum
        if (rooms[i][0] == roomId) return i; //wenn Id des Raumes roomId entspricht: Treffer
    }
}

//fuellt fRooms mit den Raeumen aus rooms die den Filterkriterien entsprechen
function adapt_fRooms() {
    var list = Session.get('filterList');
    var fRooms = [];
    var rooms = Session.get('rooms');
    for (var i = 0; i < rooms.length; i++) {//fuer jeden Raum
        if ((parseInt(rooms[i][1]) >= list[0] || list[0] == 0) //personenzahl
        && (parseInt(rooms[i][2]) >= list[1] || list[1] == 0) //beamer
        && (parseInt(rooms[i][3]) >= list[2]|| list[2] == 0) //pc
        )
            fRooms[fRooms.length] = rooms[i];
    }
    Session.set('fRooms', fRooms);
}

//gibt fRooms als xml aus, also Raeume aus rooms die den Filterkriterien entsprechen
function get_fRooms(data) {
    adapt_fRooms();
    var fRooms = Session.get('fRooms');
    if (Session.get('filterList')[0] == 2 &&
          Session.get('filterList')[1] == 0 &&
          Session.get('filterList')[2] == 0)
        fRooms = Session.get('rooms'); //FilterListe noch initial
    if (fRooms.length == 0) {
        //keine den Kriterien entsprechenden Raeume
        var entry = $('<entry />');
        entry.append('<eintrag>Keine den Kriterien</eintrag><eintrag>entsprechenden R&auml;ume</eintrag><eintrag>gefunden</eintrag>');
        fRooms = $('<XMLDocument />').append(entry);
        fillList(fRooms);
    }
    else {
        var roomsXml = $('<XMLDocument />');
        var entry = $('<entry />');
        for (var i = 0; i < fRooms.length; i++) {
            $(data).find('eintrag').each(
             function () {
                 if ($.trim(($(this).text())) == 'Raum ' + fRooms[i][0])
                     entry.append($(this));
             });
        }
        roomsXml.append(entry);
        fillList(roomsXml);
    }
}






