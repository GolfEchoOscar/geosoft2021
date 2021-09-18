// JavaScript Document
// author: Dominik Zubel
var x = document.getElementById("informationDisplay"); //making a shorter reference with x
var y = document.getElementById("informationControlDisplay"); //""
var lat = 0; //{float} stores the determined coordinates (latitude)
var lng = 0; //{float} stores the determined coordinates (longitude)
const weatherApi = ""; //insert here your Api-Key as a constant
var reqTerm = ""; //placeholder for the later compound expression (Api Request)
let jsonHaltestellen;
var geocoder;
let cityJSON;
var xTest;
var coords;


/**
* This function locates the browsers location by coordinates and displays it using "showPosition"
*/
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

/**
* This function displays the location of the browser
* (for testing this function also uses the "insertLatLngApi" function for checking the composition of the api request adress
*/
function showPosition(position) {
	lat = position.coords.latitude;
	lng = position.coords.longitude;
	startApiReq();
}

/**
* This function starts a request of all bus stops in muenster and stores it in an array.
*/
	function startApiReq() {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", "https://rest.busradar.conterra.de/prod/haltestellen");
		xhr.onload=function(){
			if(xhr.status===200){
			jsonHaltestellen=JSON.parse(xhr.responseText);
				let arr = Object.entries(jsonHaltestellen);
				let arr2 = arr[1];
				let arr3 = arr2[1]; //Enthaelt jetzt nur noch 1119 Arrays mit den verschiedenen properties
				
				console.log(jsonHaltestellen); //Testzwecke
				
				printingArea.innerHTML = JSON.stringify(arr3[0]);
				//console.log(arr3);
				var allBusStops = arr3[0];
				var coords= allBusStops.geometry.coordinates[0];
				console.log(coords); //Testzwecke
				
				testingArea.innerHTML = JSON.stringify(coords);
				
				
				
				//Hilfvariable h, um Entfernungen zu speichern und zu Sortierne
				let h = [];
				//Hilfvariable k, um Entfernungen zu speichern (in ursprünglicher Anordnung) um nachher die Bushaltestelle wiederzufinden
				let k = [];
				/*
				* Iteriert durch alle Bushaltestellen und speichert die Entfernung aller Bushaltestellen zur Sehenswürdigkeit 
				*
				* To-Do: Ergänzung eines weiteren gespeicherten Werts zum Identifizieren der Bushaltestelle (2D Array?)
				*/
				for(i=0; i< arr3.length; i ++) {
					
					var xAxes = arr3[i].geometry.coordinates[1];
					var yAxes = arr3[i].geometry.coordinates[0];

					
					var from = turf.point([51.953029, 7.614783]);
					var to = turf.point([xAxes, yAxes]);
					var options = {units: 'kilometers'};
					var distance = turf.distance(from, to, options);
					h[i] = distance;
					k[i] = distance;
					var entfernung = distance.toFixed(3);
					//console.log(entfernung);
					
					/*if(distance < vgl){
						vgl = distance;
					}*/
				} 
				h.sort(function(a, b){return a - b});
				//console.log(h);
				var nearest = h[0];
				var indexOfNearest = k.indexOf(nearest);
				console.log("Index of: " + indexOfNearest); //Testzwecke
				var nextBusStop = arr3[indexOfNearest].properties.lbez;
				var nearestInMeters = nearest*1000;
				distanceArea.innerHTML = "Nearest bus stop: " + nextBusStop + " in " + nearestInMeters.toFixed(0) + " meters.";
				
		}
	}
	xhr.send();
}

/**
 * starts a xhr request to get the city name for given coordinates, also calls createWeatherWidget
 * @param {*} lat coordiante/ number
 * @param {*} lng coordiante/ number
 */
