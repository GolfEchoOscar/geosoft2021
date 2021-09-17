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
				//console.log(jsonHaltestellen);
				//JSON.stringify(jsonHaltestellen);
			
				//JSONArray busStops = obj.getJSONArray("nr");
				//let text = arr.toString();
			
				//TEST printingArea.innerHTML = xhr.responseText;
				let arr = Object.entries(jsonHaltestellen);
				let arr2 = arr[1];
				let arr3 = arr2[1]; //Enthaelt jetzt nur noch 1119 Arrays mit den verschiedenen properties
				//var elem = arr.shift();
				console.log(jsonHaltestellen);
				printingArea.innerHTML = JSON.stringify(arr3);
				
				//flatten(jsonHaltestellen);
				//var jsonObject = JSON.parse(xhReq.responseText);
		}
	}
	xhr.send();
}

/**
 * starts a xhr request to get the city name for given coordinates, also calls createWeatherWidget
 * @param {*} lat coordiante/ number
 * @param {*} lng coordiante/ number
 */
