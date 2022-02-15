let map;
var mapLoaded = false;
let jsonFeat;

const startPos = { lat: 42.318870, lng: -71.588521 };
let initOpacity = 0.10;
let hoverOpacity = 0.30;
let clickOpacity = 0.45;

var isClicked = false;

initFirebase();

class TownDoc {
    constructor(id, data){
        this.id = id;
        this.data = data;
    }
}

async function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyCUb8ha9pqPsqU2wUxHneGMHt3Ne774e-g",
        authDomain: "map-project-340905.firebaseapp.com",
        projectId: "map-project-340905",
        storageBucket: "map-project-340905.appspot.com",
        messagingSenderId: "796916181236",
        appId: "1:796916181236:web:cd2ea174b71e07b54016a1",
        measurementId: "G-NG3MZ5ZMCB"
      };
    
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
    
    //   firebase.auth.Auth.Persistence.LOCAL;
    
      const db = firebase.firestore();
      const docs = await db.collection('towns').get();
      docs.forEach(function(doc) {
        var id = doc.id;
        var data = doc.data();
        const town = new TownDoc(id, data);
        // console.log(town);
      });
}

function AddHomeControl(controlDiv, map) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
  
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "1px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginBottom = "8px";
    controlUI.style.marginLeft = "8px";
    controlUI.style.textAlign = "center";
    controlUI.style.color = "rgb(100, 100, 100)";
    controlUI.title = "Click to reset view";
    controlUI.style.backgroundImage = "/images/cdp_logo.jpeg";
    controlDiv.appendChild(controlUI);
  
    const controlIcon = document.createElement("i");
    controlIcon.className = "fa fa-home fa-10x";
    controlIcon.style = "font-size: 35px;";
    controlUI.appendChild(controlIcon);


    // Set CSS for the control interior.
    // const controlText = document.createElement("div");
  
    // controlText.style.color = "rgb(25,25,25)";
    // controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    // controlText.style.fontSize = "16px";
    // controlText.style.lineHeight = "38px";
    // controlText.style.paddingLeft = "5px";
    // controlText.style.paddingRight = "5px";
    // controlText.innerHTML = "Home";
    // controlUI.appendChild(controlText);
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener("click", () => {
        isClicked = false;
        map.setZoom(9);
        map.setCenter(startPos);
    });

    controlUI.addEventListener("mouseover", () => {
        controlUI.style.color = "rgb(52, 52, 52)";
    });

    controlUI.addEventListener("mouseout", () => {
        controlUI.style.color = "rgb(100, 100, 100)";
    });
}

// Initialize and add the map
function initMap() {
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

    const controlDiv = document.createElement("div");

    AddHomeControl(controlDiv, map);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

    // createSwitches();
    switchChanged();

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
            fillOpacity: initOpacity,
        };
    });

    map.data.addListener("mouseover", (event) => {
        map.data.overrideStyle(event.feature, { fillOpacity: hoverOpacity });
        if(isClicked)
            return;
        updateSelectedTown(event);
    });

    map.data.addListener("mouseout", (event) => {
        map.data.revertStyle();
    });

    map.data.addListener("click", (event) => {
        isClicked = true;
        var bounds = new google.maps.LatLngBounds();
        map.data.overrideStyle(event.feature, { fillOpacity: clickOpacity});
        updateSelectedTown(event);
        event.feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
        map.fitBounds(bounds, 0);
    });

}

function updateSelectedTown(event) {
    var townName = event.feature.getProperty("TOWN");
    document.getElementById("info-box").textContent = townName;
    document.getElementById("town-header").textContent = townName;
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