// JavaScript Document
// author: Dominik Zubel
var x = document.getElementById("informationDisplay"); //making a shorter reference with x
var y = document.getElementById("informationControlDisplay"); //""
var lat = 0; //{float} stores the determined coordinates (latitude)
var lng = 0; //{float} stores the determined coordinates (latitude)
const weatherApi = ""; //insert here your Api-Key as a constant
var reqTerm = ""; //placeholder for the later compound expression (Api Request)


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
  x.innerHTML = "Latitude: " + position.coords.latitude +  "<br>Longitude: " + position.coords.longitude;
	insertLatLngApi(); //showing
}

/**
* This function composes the expression from the following previously obtained data: requestAdress, lat, lng and the Api-Key
*/
function insertLatLngApi() {
	reqTerm = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + "&exclude=current&appid=" + weatherApi;
	console.log(reqTerm);
	y.innerHTML = "" + reqTerm;
}

/**
* This function starts a request
*/
function startApiReq() {
	let xhr = new XMLHttpRequest();
	xhr.open(GET, reqTerm);
	xhr.send();
	xhr.onload = function() {
	x.innerHTML = "Wetter gefunden";
	}
}
