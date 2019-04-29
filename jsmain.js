window.onload = function () {


    function drawRoutes(journey){
        for (var i = 0; i < markers.intermediates.length; i++) {
            mymap.removeLayer(markers.intermediates[i]);
        }
        for (var i = 0; i < lines.length; i++) {
            mymap.removeLayer(lines[i]);
        }
        const colours = ['#2980b9','#f39c12','#16a085'];
        var currLeg = 0;
        var currRoute = journey.Segments[0].RoutePath.route_code;


        
        markers.intermediates.push(L.marker([journey.Segments[0].FromStop.Location.Latitude,journey.Segments[0].FromStop.Location.Longitude], {icon: myIcon2}).addTo(mymap));

        markers.intermediates.push(L.marker([journey.Segments[journey.Segments.length-1].ToStop.Location.Latitude,journey.Segments[journey.Segments.length-1].ToStop.Location.Longitude], {icon: myIcon2}).addTo(mymap));

        lines.push(L.polyline([[locs.from.lat,locs.from.lng],[journey.Segments[0].FromStop.Location.Latitude,journey.Segments[0].FromStop.Location.Longitude]], {color: '#c0392b',dashArray: '1 5'}).addTo(mymap));

        lines.push(L.polyline([[locs.to.lat,locs.to.lng],[journey.Segments[journey.Segments.length-1].ToStop.Location.Latitude,journey.Segments[journey.Segments.length-1].ToStop.Location.Longitude]], {color: '#c0392b',dashArray: '1 5'}).addTo(mymap));



        journey.Segments.forEach(function(d){
            if (currRoute!=d.RoutePath.route_code){
                currLeg+=1;
                currRoute = d.RoutePath.route_code;
                markers.intermediates.push(L.marker([d.FromStop.Location.Latitude,d.FromStop.Location.Longitude], {icon: myIcon2}).addTo(mymap));

            }
            lines.push(L.polyline([[d.FromStop.Location.Latitude,d.FromStop.Location.Longitude],
                [d.ToStop.Location.Latitude,d.ToStop.Location.Longitude]], {color: colours[currLeg]}).addTo(mymap));


        })
    }

    function populateCard(journey,id){
        $('#'+id+'-time').html((journey.TotalTime/60000).toFixed(0)+' mins');
        // $('#'+id+'-comfort').innerHTML = 2000;
        $('#'+id+'-distance').html((journey.TotalDistance/1000).toFixed(0)+' kms');
        // $('#'+id+'-distance').innerHTML = 3000;

        $('#'+id+'-options').html('');
        $('#'+id+'-prompt').html('');
        $('#'+id+'-options').append('<div><img class="icon-imgs" src="nec/family.png"></div>');

        // $('#prompt-buttons').append("<div class='btn btn-dark prompts' id='start'>Start Journey</div>");
        
        var currLeg = 0;
        var currRoute = journey.Segments[0].RoutePath.route_code;

        journey.Segments.forEach(function(d){
            console.log(d.RoutePath.route_code);
            if (currRoute!=d.RoutePath.route_code){
                currLeg+=1;
                currRoute = d.RoutePath.route_code;
            }
        });

        console.log('currleg',currLeg);

        for (var j =0;j<=currLeg;j++){
            $('#'+id+'-options').append('<div><img class="icon-imgs" src="res/bus (2).png"></div>');
            // $('#prompt-buttons').append("<div class='btn btn-dark prompts' id='bus-'"+j+">Begin Bus Leg "+(j+1)+"</div>");
        }


        // $('#prompt-buttons').append("<div class='btn btn-dark prompts'>End Journey</div>");
        $('#'+id+'-options').append('<div><img class="icon-imgs" src="res/rickshaw.png"></div>');
    
        
        $(".prompts").hide();
        $("#start").show();






    }

    function estimateRoutes(){
    
    
            $.ajax({
                url: "https://mock-server.ppsreejith.net/routes/" + locs.from.lat + "," + locs.from.lng + "/" + locs.to.lat + "," + locs.to.lng,
                type: 'GET',
                crossOrigin: true,
                success: function (result) {
                    console.log(JSON.parse(result));
                    var journey_time = JSON.parse(result)['journeys'][0];
                    var journey_comfort = JSON.parse(result)['journeys'][1];
                    
                    
                    console.log(journey_time);
                    console.log(journey_comfort);

                    populateCard(journey_time,'time');
                    populateCard(journey_comfort, 'comfort');



    
                    $('#time').click(function(){
                        drawRoutes(journey_time);
                        $('#time').css('border','2px solid green');
                        $('#comfort').css('border','2px solid #333');
                    })
                    
                    $('#comfort').click(function(){
                        drawRoutes(journey_comfort);
                        $('#time').css('border','2px solid #333');
                        $('#comfort').css('border','2px solid green');
                    })

                    $('#time').click();
                    
                    
                    
                    
    
                    // markers.from = L.marker([locs.from.lat, locs.from.lng], { icon: myIcon_from }).addTo(mymap);
                    // markers.to = L.marker([locs.to.lat, locs.to.lng], { icon: myIcon_to }).addTo(mymap);
    
                }
            });
    
    
            var group = new L.featureGroup([markers.from, markers.to]);
            mymap.fitBounds(group.getBounds());
            $('#time').show();
            $('#comfort').show();
    
    }

    var autocomplete_from = new google.maps.places.Autocomplete(document.getElementById('search_from'));
    var autocomplete_to = new google.maps.places.Autocomplete(document.getElementById('search_to'));

    autocomplete_from.setFields(['geometry', 'name']);
    autocomplete_to.setFields(['geometry', 'name']);

    var locs = {
        'from': {},
        'to': {},
        'intermediates': []
    }

    var markers = {
        'from': '',
        'to': '',
        'intermediates': []
    }
    var lines = [];

    var mymap = L.map('mapid').setView([23.032941, 72.564470], 11);
    var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mymap);

    // Plot bus stops 
    // $.getJSON("nec/stops.json", function (json) {
    //     // console.log(json); // this will show the info it in firebug console
    //     // json.forEach(function (d) {
    //     //     var temp = L.circle([d.Location.Latitude, d.Location.Longitude], { radius: 1, opacity: 0.2 }).addTo(mymap);
    //     //     // temp.bindPopup(d.StopPointName);


    //     // })
    // });



    // var encoded = "qobkCg~izL_@{AcTzDoZnGnBxOb@nFj@fG|@lHt@hF`@xDp@rH^tFfCzY`@nIzC`b@PhDEbDc@jFiCbRg@|CmDvWiEl[iAxHuFpa@DNURqAx@kAd@_JpCqAN_BDeZ\\cAd@MXQPWH[@OESKg@Ai@@m@DsSdGiInCu@JeADqHWoAH}ANg@PmCt@c@Pa@^s@z@eCfDk@p@_EvC{@b@cAX}Dp@g@BoBVkDVk@EyC}@c@Io@Es@BkBl@aAl@eHvF_Al@{@b@aFfBgQfGOFSRe@{@u@KiCo@}Bq@aAU}AIkC?aQb@eC@wCMwD]uBc@sC_A{D}@uKeBCf@s@`Hs@fEYhAOrAyDbb@SlBcAzF]dB[vB{@bDoC~IuAtDa@^c@x@w@g@wB_BwGkFcIaGwCaCmD{CyDiC{@w@gAoAg@c@e@[o@M]C{@@w@Jm@BsDBmCAoOd@s@?}AJ{AZ{EjA_BAiBG}@KgBAaALgFbBsHfCkEpAUDs@H_BDcB?_DMsPmAk@GmCKmNiAcGo@_Ge@qAW]HSLKZ^tJI@UJc@X_EdDgDpBaCpAlAjDz@lB";

    // var polyline = L.Polyline.fromEncoded(encoded);
    // console.log(polyline.getLatLngs());
    // L.polyline(polyline.getLatLngs(), {color: '#2980b9'}).addTo(mymap);

    var myIcon_from = L.icon({
        iconUrl: 'nec/home.png',
        iconSize: [30, 30],
        iconAnchor: [10, 30],
        popupAnchor: [-3, -76]
    });
    var myIcon_to = L.icon({
        iconUrl: 'nec/flag.png',
        iconSize: [30, 30],
        iconAnchor: [10, 30],
        popupAnchor: [-3, -76]
    });

    var myIcon2 = L.icon({
        iconUrl: 'nec/marker.png',
        iconSize: [30, 30],
        iconAnchor: [10, 30],
        popupAnchor: [-3, -76]
    });

    autocomplete_from.addListener('place_changed', function () {
        var place = autocomplete_from.getPlace();
        latlng = place.geometry.location.toJSON();
        console.log(latlng, place.name);
        if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }


        if (markers.from != '') {
            mymap.removeLayer(markers.from);
            for (var i = 0; i < markers.intermediates.length; i++) {
                mymap.removeLayer(markers.intermediates[i]);
            }
            for (var i = 0; i < lines.length; i++) {
                mymap.removeLayer(lines[i]);
            }
        }

        // document.getElementById('resp').innerHTML = place;
     
        markers.from = L.marker([latlng.lat, latlng.lng], { icon: myIcon_from }).addTo(mymap);
        mymap.setView([latlng.lat, latlng.lng], 13);
        locs.from = latlng;

        console.log(locs, markers);

        if (markers.to !=''){
            estimateRoutes();
        }

    });


    autocomplete_to.addListener('place_changed', function () {
        var place = autocomplete_to.getPlace();
        latlng = place.geometry.location.toJSON();
        console.log(latlng, place.name);
        if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        if (markers.to != '') {
            mymap.removeLayer(markers.to);
            for (var i = 0; i < markers.intermediates.length; i++) {
                mymap.removeLayer(markers.intermediates[i]);
            }
            for (var i = 0; i < lines.length; i++) {
                mymap.removeLayer(lines[i]);
            }
        }

       

        markers.to = L.marker([latlng.lat, latlng.lng], { icon: myIcon_to }).addTo(mymap);

        locs.to = latlng

        console.log(locs, markers);
        if (markers.from !=''){
            estimateRoutes();
        }

    });


    // $("#start").click(function(){
    //     markers.from = L.marker([locs.intermediates[0].lat, locs.from.lng], { icon: myIcon_from }).addTo(mymap);
    // })


}


