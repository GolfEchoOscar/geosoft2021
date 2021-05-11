// JavaScript Document
// author: Dominik Zubel, Tobias Brand
var x = document.getElementById("informationDisplay"); //making a shorter reference with x
var y = document.getElementById("informationControlDisplay"); //""
var lat = 0; //{float} stores the determined coordinates (latitude)
var lng = 0; //{float} stores the determined coordinates (longitude)
const weatherApi = ""; //insert here your Api-Key as a constant
var reqTerm = ""; //placeholder for the later compound expression (Api Request)
let jsonWeather;
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
* This function starts a request
*/
function startApiReq() {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lng + "&exclude=minutely,hourly,daily&appid=" + weatherApi+"&units=metric");
	
	xhr.onload=function(){
		if(xhr.status===200){
			jsonWeather=JSON.parse(xhr.responseText);
			console.log(jsonWeather);
			getCity(lat,lng);
			
		}
	}
	xhr.send();
}

/**
 * starts a xhr request to get the city name for given coordinates, also calls createWeatherWidget
 * @param {*} lat coordiante/ number
 * @param {*} lng coordiante/ number
 */
function getCity(lat, lng){
    const Http = new XMLHttpRequest();
    bdcApi = "https://api.bigdatacloud.net/data/reverse-geocode-client"+ "?latitude=" + lat+ "&longitude=" + lng+ "&localityLanguage=en";
    getApi(bdcApi);
    function getApi(bdcApi) {
        Http.open("GET", bdcApi);
        Http.send();
        Http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                cityJSON=JSON.parse(Http.responseText);
				createWeatherWidget(jsonWeather,cityJSON);
            }
        };
    }
}
