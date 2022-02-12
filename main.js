let map;
var mapLoaded = false;
let jsonFeat;
// Initialize and add the map
function initMap() {
    // The location of Uluru
    const startPos = { lat: 42.318870, lng: -71.588521};
    // The map, centered at Uluru
    var defaultZoom = 9;
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: defaultZoom,
      minZoom: 8,
      restriction: {
        latLngBounds: {
          north: 43.72438437915228,
          south: 40.881246315347106,
          east: -69.8142290078125,
          west: -73.3628129921875,
        },
      },
      center: startPos,
      gestureHandling: 'greedy',
        streetViewControl: false,
        mapTypeControl: false,
    });

    google.maps.Polygon.prototype.getBounds = function() {
        var bounds = new google.maps.LatLngBounds();
        var paths = this.getPaths();
        var path;        
        for (var i = 0; i < paths.getLength(); i++) {
            path = paths.getAt(i);
            for (var ii = 0; ii < path.getLength(); ii++) {
                bounds.extend(path.getAt(ii));
            }
        }
        return bounds;
    }

    google.maps.event.addListener(map, 'idle', function() {
        if(!mapLoaded){
            mapLoaded = true;
        }
    });
    jsonFeat = map.data.addGeoJson(data); //From towns.js script

    jsonFeat.forEach(element => {
        element.setProperty("TOWN", formatFeatString(element.h.TOWN));
        if(element.getGeometry().getType());
    });

    var colorArray = ['red', 'green', 'blue', 'grey'];

    map.data.setStyle(function (feature) {
        var color = colorArray[feature.getProperty('FOURCOLOR')];
        return {
            fillColor: color,
            strokeWeight: 1,
            fillOpacity: 0.35
        };
    });

    var infoWindow = new google.maps.InfoWindow();

    map.data.addListener("mouseover", (event) => {
        map.data.overrideStyle(event.feature, {fillOpacity: 0.5});
        console.log("hover, " + event.feature.getProperty("TOWN"));
    });

    map.data.addListener("mouseout", (event) => {
        map.data.revertStyle();
    });

    map.data.addListener("click", (event) => {
        var bounds = new google.maps.LatLngBounds();
        map.data.overrideStyle(event.feature, {fillOpacity: 0.75});
        console.log("click, " + event.feature.getProperty("TOWN"));
        event.feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
        map.fitBounds(bounds, -5);
    });

    // The marker, positioned at Uluru
    // const marker = new google.maps.Marker({
    //   position: startPos,
    //   map: map,
    // });
  }

  function formatFeatString (string) {
    string = string.toLowerCase();
    var index = string.indexOf(' ');
    if(index!=-1){
        string = string.slice(0, index+1) + string.charAt(index+1).toUpperCase() + string.slice(index+2);
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  }