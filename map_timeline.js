
var sliderControl = null;

var map = L.map( 'map', {
	fullscreenControl: true,
	 center: [50,10],
	 zoom: 4,
	 minZoom: 3
 });

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


//Fetch some data from a GeoJSON file
$.getJSON("maps/Event.json", function(json) {

	var event = L.geoJson(json, {
    onEachFeature: function (feature, layer) {
        layer.bindPopup('<b>Title: </b>' + feature.properties.title +
				 								'<br/><b>Start: </b> ' + feature.properties.start +
				                 '<br/><b>End: </b> ' + feature.properties.end );
    }
	});

	//var Clusters = L.markerClusterGroup.layerSupport().addTo(map);


	//Clusters.checkIn(event);

	// Check into MCG Layer Support!
	// Add to map first before checking in.
//	L.markerClusterGroup.layerSupport().addTo(map).checkIn(event);

	var sliderControl = L.control.sliderControl({
		position: "topright",
		layer: event,
		range: true,
		timeAttribute: "start"

	});

	//Make sure to add the slider to the map ;-)
	map.addControl(sliderControl);
	//And initialize the slider
	sliderControl.startSlider();

	var Clusters = L.markerClusterGroup.layerSupport().addTo(map);
	Clusters.checkIn(event);
});


var country_boundary =  L.geoJson(null,{style: areaStyle});

function getAreaColor(feature){
	console.log(feature)
	switch (feature.properties.NAME){
		case 'East Germany' : return 'pink' ;
		case 'West Germany' : return 'yellow' ;
			break;
	}
};

function areaStyle(feature){
	return {
		fillColor: getAreaColor(feature),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.3
	}
};

country_boundary.addTo(map);

	 $.ajax({
	 dataType: "json",
	 url: "maps/Germany.geojson",
	 success: function(data) {
			 $(data.features).each(function(key, data) {
					 country_boundary.addData(data);
			 });
	 }
	 }).error(function() {});



	//var Clusters = L.markerClusterGroup.layerSupport().addTo(map);


	//Clusters.checkIn(event);

	// Check into MCG Layer Support!
	// Add to map first before checking in.
//	L.markerClusterGroup.layerSupport().addTo(map).checkIn(event);
