let map;
var mapLoaded = false;
let jsonFeat;

// Initialize and add the map
function initMap() {
    // The location of Uluru
    const startPos = { lat: 42.318870, lng: -71.588521 };
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

    // createSwitches();
    switchChanged();

    google.maps.Polygon.prototype.getBounds = function () {
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

    google.maps.event.addListener(map, 'idle', function () {
        if (!mapLoaded) {
            mapLoaded = true;
        }
    });
    jsonFeat = map.data.addGeoJson(data); //From towns.js script

    jsonFeat.forEach(element => {
        var newName = formatFeatString(element.h.TOWN);
        element.setProperty("TOWN", newName);

        var newListItem = document.createElement('li');
        newListItem.innerHTML = newName;
        var searchList = document.getElementById("search-list")
        var elementList = searchList.getElementsByTagName("li");
        if (elementList.length == 0 || newName > elementList[elementList.length - 1].innerHTML) {
            searchList.appendChild(newListItem);
        } else {
            for (var i of elementList) {
                if (newName < i.innerHTML) {
                    searchList.insertBefore(newListItem, i);
                    break;
                }
            }
        }
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

    map.data.addListener("mouseover", (event) => {
        map.data.overrideStyle(event.feature, { fillOpacity: 0.5 });
        document.getElementById("info-box").textContent =
            event.feature.getProperty("TOWN");
    });

    map.data.addListener("mouseout", (event) => {
        map.data.revertStyle();
    });

    map.data.addListener("click", (event) => {
        var bounds = new google.maps.LatLngBounds();
        map.data.overrideStyle(event.feature, { fillOpacity: 0.75 });
        document.getElementById("info-box").textContent =
            event.feature.getProperty("TOWN");
        event.feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
        map.fitBounds(bounds, 0);
    });

}

//search bar
function search_bar() {
    let input = document.getElementById('search-bar').value
    input = input.toLowerCase();
    var searchList = document.getElementById("search-list")
    var elementList = searchList.getElementsByTagName("li");

    for (var i of elementList) {
        if (!i.innerHTML.toLowerCase().includes(input)) {
            i.style.display = "none";
        }
        else {
            i.style.display = "list-item";
        }
    }
}

function formatFeatString(string) {
    string = string.toLowerCase();
    var index = string.indexOf(' ');
    if (index != -1) {
        string = string.slice(0, index + 1) + string.charAt(index + 1).toUpperCase() + string.slice(index + 2);
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createSwitches() {
    var switchParent = document.getElementById("switch-parent");
    switchParent.appendChild(createSwitch("show-labels"));
}

function createSwitch(switchID) {
    var newDiv = document.createElement("div");
    var newInput = document.createElement("input");
    var newLabel = document.createElement("label");

    newDiv.className = "form-check form-switch";

    newInput.className = "form-check-input";
    newInput.type = "checkbox";
    newInput.id = switchID;
    newInput.onchange = "switchChanged()";

    newLabel.className = "form-check-label";
    newLabel.setAttribute("for", switchID);
    newLabel.innerHTML = switchID;

    newDiv.appendChild(newInput);
    newDiv.appendChild(newLabel);
    return newDiv;
}

function switchChanged() {
    var customStyled = [
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                { visibility: getCheckedState("show-labels")}
            ]
        },
        {
            featureType: "road",
            elementType: "labels",
            stylers: [
              {
                visibility: getCheckedState("show-road-labels")
              }
            ]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
              {
                visibility: getCheckedState("show-roads")
              }
            ]
        }
    ];

    map.set('styles', customStyled);
}

function getCheckedState(switchID) {
    return document.getElementById(switchID).checked?"on":"off";
}