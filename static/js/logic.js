/**
 * Utilizing Geological Data from US Geological Survey to create an geomapping visualization 
 * to locate number of earthquake occurences based on coordiantes of it's orgin points
 */

//importing JSON Data **Gathering All Earthquakes for past 24 hours
let geoJsonQuery = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
//BONUS: Adding secondary mapping to display the tectonic plates
let plateQuery = "static/PB2002_plates.json"
//using D3 to GET Data request 
    d3.json(geoJsonQuery).then(function(earthQuake) {
        d3.json(plateQuery).then(function(plateData) { 
        //test data
            console.log(earthQuake);
            console.log(plateData)
            createFeatures(earthQuake.features, plateData.features);

        });
    });

//function to create an markerpoints
function createMarker(feature, latLong) {
    return L.circleMarker(latLong, {
        radius: markerSize(feature.properties.mag),
        fillColor: colorMarker(feature.geometry.coordinates[2]), 
        color: "#000",
        weight: 0.6,
        opacity: 0.5,
        fillOpacity:1
    });
}

//function to execute each feature array list
function createFeatures(earthQuake, plateData) {
    //including an popup on the that describes time and place of the earthquake when hover mouse over the marker point
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location:</h3> ${feature.properties.place}<h3> Magnitude:</h3> ${feature.properties.mag}<h3> Depth:</h3> ${feature.geometry.coordinates[2]}`);
    }

    //implement on-point marker to trigger the popup box
    let earthquakes = L.geoJSON(earthQuake, {
        onEachFeature: onEachFeature,
        pointToLayer: createMarker
    });

    let plates = L.geoJSON(plateData, {
        style: function() {
            return {
                color: "orange",
                weight: 2.7
           }
        }
    });

    //CREATE FUNCTION TO PASS LAYER POP TO CREATE MAP
    mapCreate(earthquakes, plates)
}

function mapCreate(earthquakes, plates) {
    //adding the layers for street topography over the maps
    /**
     *  NOTE: using attribution control allows displaying 
     *  attribution data in a small text box on a map 
     */
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topography = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });

    //create baseMap Object for street display
    let baseMaps = {
        "Street Map": street, 
        "Topographic Map": topography
    };

    //adds the overlay of the streetmap including earthquakes and fault lines 
    let overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": plates
    };

    //Map Creation
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 7,
        layers: [street, earthquakes, plates]
    });

    /**
     * Create map control to pass the base and
     * overlay Maps and include UI Controls to the map
     */

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    
    let legend = L.control({position: 'bottomright'}); //creating an legend box
    //adding the legend to the myMap
    legend.onAdd = function(myMap) {
        //creating div variable to add in the HTML element tags
        let div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 60, 90] //magnitude scale
        labels = [],
        legendInfo = "<h5>Magnitude</h5>";

        for (let i = 0; i < grades.length; i++) { 
            div.innerHTML +=
            '<i style="background:' + colorMarker(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div
    };
    
    //append the legend to the map
    legend.addTo(myMap);
}

//add function to increase marker size based on the magnitude
function markerSize(magnitude) {
    return magnitude * 5;
}

//alternate colors for markers base on depth of magenitudue bigger the depth the darker the colorscale
function colorMarker(depth) {
    return  depth > 90 ? '#d73027' :
            depth > 70 ? '#fc8d59' :
            depth > 50 ? '#fee08b' :
            depth > 30 ? '#d9ef8b' :
            depth > 10 ? '#91cf60' :
                         '#1a9850' ; 

}