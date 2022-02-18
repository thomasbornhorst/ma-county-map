// GLOBAL VARIABLES
let map;
var mapLoaded = false;
let jsonFeat;

const startPos = { lat: 42.318870, lng: -71.588521 };
const initOpacity = 0.1;
const hoverOpacity = 0.15;
const clickOpacity = 0.45;
const minZoom = 8;
const defaultZoom = 9;

var townSelected = null;
var townList = [];

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
    
    getFirebaseData();
}

async function getFirebaseData() {
    const db = firebase.firestore();
    const docs = await db.collection('towns').get();
    docs.forEach(function(doc) {
        var id = doc.id;
        var data = doc.data();
        const town = new TownDoc(id, data);
        // console.log(town);
        townList.push(town);
    });
}

function createMap() {
    // Creating the map
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: defaultZoom,
        minZoom: minZoom,
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
}

// Initialize and add the map
function initMap() {
    createMap();

    // const transitLayer = new google.maps.TransitLayer();
    // transitLayer.setMap(map);

    var kmzLayer = new google.maps.KmlLayer('./mbta_layer.kmz');
    kmzLayer.setMap(map);

    const controlDiv = document.createElement("div");
    addHomeControl(controlDiv, map);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

    // createSwitches();
    switchChanged(); //Set features of map based on switches

    google.maps.event.addListener(map, 'idle', function () {
        if(!mapLoaded) {
            mapLoaded = true;
        }
    });
    
    addMapData();
}

function addMapData() {
    jsonFeat = map.data.addGeoJson(data); //From towns.js script

    jsonFeat.forEach(element => {
        var newName = formatFeatString(element.getProperty("TOWN"));
        element.setProperty("TOWN", newName);

        configTownSearchBar(newName);
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

    addDataListeners();
}

function configTownSearchBar(newName) {
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
}

function addDataListeners() {
    map.data.addListener("mouseover", (event) => {
        if(townSelected!=null && townSelected.id==event.feature.getProperty("TOWN")) {
            return;
        }
        map.data.overrideStyle(event.feature, { fillOpacity: hoverOpacity });
        if(townSelected!=null)
            return;
        updateSelectedTown(event);
    });

    map.data.addListener("mouseout", (event) => {
        if(townSelected!=null && townSelected.id==event.feature.getProperty("TOWN")) {
            map.data.overrideStyle(event.feature, {fillOpacity: 0});
        }
        map.data.revertStyle();
    });

    map.data.addListener("click", (event) => {
        map.data.overrideStyle(event.feature, { fillOpacity: clickOpacity});

        updateSelectedTown(event);

        var bounds = new google.maps.LatLngBounds();
        event.feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
        map.setOptions({minZoom: 0});
        var ctr = bounds.getCenter();
        map.fitBounds(bounds);
        map.fitBounds(bounds);
        map.setOptions({minZoom: minZoom});

        console.log(townSelected);
        if(townSelected!=null){
            setTownInfoData(townSelected);
        }else{
            hideTownInfo();
        }
    });
}

function setTownInfoData(townObject) {
    var townInfoParent = document.getElementById("town-info-parent");
    document.getElementById("town-info-none").style.display = "none";
    townInfoParent.style.display = "block";
}

function hideTownInfo() {
    document.getElementById("town-info-none").style.display = "block";
    document.getElementById("town-info-parent").style.display = "none";
}

function updateSelectedTown(event) {
    townSelected = null;
    var townName = event.feature.getProperty("TOWN");

    //This way of looking for the right town is a little scuffed / not optimal but it works
    townList.forEach(function(townObject){
        if(townObject.id==townName){
            townSelected = townObject;
        }
    })
    
    // document.getElementById("info-box").textContent = townName;
    document.getElementById("town-header").textContent = townName;
}

function addHomeControl(controlDiv, map) {
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

    controlUI.addEventListener("click", () => {
        townSelected = null;
        map.setZoom(defaultZoom);
        map.setCenter(startPos);
        hideTownInfo();
    });

    controlUI.addEventListener("mouseover", () => {
        controlUI.style.color = "rgb(52, 52, 52)";
    });

    controlUI.addEventListener("mouseout", () => {
        controlUI.style.color = "rgb(100, 100, 100)";
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