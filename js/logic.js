// *****************************
// David Kloepper
// Data Visualization Bootcamp, Cohort 3
// June 29th, 2019
// *****************************


// URL for earthquake data
var earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// URL for tectonic plate data
var platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Parse the earthquake JSON
d3.json(earthquakeLink, function(data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {       


  // Create a layer for the earthquake data from the geoJson
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: function (feature, layer){
      //For each data element, bind the popup with the earthquake information
      layer.bindPopup("<h4>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
      "</h4><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5
      })
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes)
}

function createMap(earthquakes) {

  // Define map layers for satellite, outdoors and light
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  noWrap: true,
  accessToken: API_KEY
  });

  var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  noWrap: true,
  accessToken: API_KEY
  });

  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  noWrap: true,
  accessToken: API_KEY
  });
  

  // Define a baseMaps object to hold the base layers
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Outdoor Map": outdoorMap,
    "Light Map": lightMap
  };

  // Add a new layer to hold teh tectonic plates data
  var tectonicPlates = new L.LayerGroup();

  // Create object to hold overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": tectonicPlates
  };

  // Create map, defaulting to streetmap view. Added settings for more reasonable zoom levels
  var myMap = L.map("map", {
    center: [31.7, -7.09],
    maxBounds: [[-90,-180], [90,180]],
    minZoom: 1.75,
    zoom: 2.5,
    zoomSnap: 0.25,
    zoomDelta: 0.25,
    wheelPxPerZoomLevel: 250,
    layers: [lightMap, earthquakes, tectonicPlates]
  });

   // Add Fault lines
   d3.json(platesLink, function(plateData) {
     L.geoJson(plateData, {
       color: "darkgray",
       weight: 2
     })
     .addTo(tectonicPlates);
   });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
              grades = [0, 1, 2, 3, 4, 5],
              labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}

//Function sets color based on magnitude and is used to color dots and legends
function getColor(magnitude) {
  switch (true) {
    case magnitude > 5:
      return "#ea2c2c";
    case magnitude > 4:
      return "#ea822c";
    case magnitude > 3:
      return "#ee9c00";
    case magnitude > 2:
      return "#eecc00";
    case magnitude > 1:
      return "#d4ee00";
    default:
      return "#98ee00";
  }
}

//Function sets radius of dots, scaled larger for visibility
function getRadius(value){
  return value*30000
}
