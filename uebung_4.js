//author: Jan Seemann
//content:




"use strict"

//variables

var api; //stores the API call


var userAPIKey //stores the users API key


var response // stores the response of api request

var earthRadius = 6371; // Radius of the earth in km

var polygon // stores the polygon
var route // stores the route

let pointsInsideOfPoly //stores the points inside the polygon
let pointsOutsideOfPoly //stores the points outside the polygon


//set of degrees with corresponding cardinal direction based on a classification
//Link: http://www.sternwarte-eberfing.de/Aktuell/Himmelsrichtung.html 
var degreesList = [[22.5,"N"],[67.5,"NE"],[112.5,"E"],[157.5,"SE"],[202.5,"S"],[247.5,"SW"],[292.5,"W"],[337.5,"NW"],[360.0,"N"]]


/**
 * This funtion constructs the  api vall to use it afterwards.
 * @param {String} key - The key has to be entered by the user himself.
 * @param {[double, double]} coordinates 
 */
function iniatializeAPI(key, coordinates){
    api = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat="
    api += coordinates[1]+"&lon="+coordinates[0]+"&exclude="+"hourly"+"&appid="+key
}


/**
* This function reads the users API key from the Input-Field
*/
function getAPIKey(){
    userAPIKey = document.getElementById("apiField").value //retrieve API-Key
}


var map = L.map('map').setView([51.975, 7.61], 13) // Setting map 


// Add an OpenStreetMap tile layer and keep reference in a variable
var osmLayer = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
	{attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map)

var geodata = L.geoJson(routeJson) // Adding the given route to the map

geodata.bindPopup(routeJson.features[0].properties.name).addTo(map) // naming the route for a popup

var drawnItems = new L.FeatureGroup() // initializings "FaetureGroup"-object for the drawn elements


map.addLayer(drawnItems) // adding drawn elements to the map

var drawControl = new L.Control.Draw({ // building the draw control
    draw:{
        marker: false, // deactivate every option except the rectangle
        polyline: false,
        circle: false,
        circlemarker: false,
        polygon: false,
        rectangle: {
            showArea: true,
            metric: true,
            drawError: 'orange'
        }
    },
    edit: {
        featureGroup: drawnItems, //everything drawn gets added to this FeatureGroup
        remove: true
    }
})

map.addControl(drawControl) // adding the control-element

// Showing the drawn rectangle on the map and saving the coordinates of the rectagle in the variable 'rectangle'
let rectangle
map.on('draw:created', function (e){
    var type = e.layerType, layer = e.layer
    rectangle = layer.getLatLngs()
    drawnItems.addLayer(layer)
    mainCalculation(routeJson)
})


/**
 * This function converts coordinates in degrees into coordinates in radians.
 * @param {float} deg coordinates (deg)
 * @returns converted coordinates (rad)
 */
 function degToRad(deg) {
    return deg * (Math.PI/180);  //conversion formula
  }


/**
*This function converts coordinates in radian into coordinates in degree.
*@param {double} radian coordinates
*@returns {double} coordinates in degree 
*/
function radToDeg(rad)
{
    return rad * (180/Math.PI) //conversion formula
}

/**
 * This function calculates the shortest distance in km between two points using the haversine formula.
 * Link: http://www.movable-type.co.uk/scripts/latlong.html
 * @param {[float,float]} point1 coordinates [lng/lat] 
 * @param {[float,float]} point2 coordinates [lng/lat] 
 * @returns shortest distance between the two points in kilometers.
 */
 function distanceInKM(point1,point2) {
    var distanceLongitude = degToRad(point2[0]- point1[0]); // Distance on the longitude in rad
    var distanceLatitude = degToRad(point2[1]- point1[1]);  //Distance on the latitude in rad

    var a = 
      Math.sin(distanceLatitude/2) * Math.sin(distanceLatitude/2) +
      Math.cos(degToRad(point1[1])) * Math.cos(degToRad(point2[1])) * 
      Math.sin(distanceLongitude/2) * Math.sin(distanceLongitude/2)
      ; //a is the square of half the chord length between the points
    
      var distanceRad = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // Distance in rad
   
      var distanceKM = earthRadius * distanceRad; // Distance in km
    
      return distanceKM
  }


/**
 *This functiom calcuates the bearing between two points
 *Link: https://www.movable-type.co.uk/scripts/latlong.html
 *@param {[double]} coord1 Coordinates of the first point
 *@param {[double]} coord2 Coordinates of the second point
 *@returns {String} bearing between the given points
*/
function getBearing(coord1, coord2)
{
    // transforming the coordinates into radians
    var lat1 = degToRad(coord1[0])
    var lon1 = degToRad(coord1[1])
    var lat2 = degToRad(coord2[0])
    var lon2 = degToRad(coord2[1])

    const y = Math.sin(lon2-lon1) * Math.cos(lat2)
    const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1)
    const theta = Math.atan2(y, x)
    const bearing = radToDeg(theta)
    return (bearing + 360) % 360
}

/**
 * This function calculates the crosstrackdistance. 
 * Crosstrackdistance is the distance distance between a path (coord1, coord2) and a point
 * Link: https://www.movable-type.co.uk/scripts/latlong.html
 * @param {[double, double]} coord1 start coordinate of a path
 * @param {[double, double]} coord2 end coordinate of the same path
 * @param {[double, double]} coord3 a third point 
 * @returns crosstrackdistance between the path and a point

 */
function crossTrackDistance(coord1, coord2, coord3) // calculates the distance between point (coord3) and line (coord1, coord2)
{
    var dstFstToThrd = distanceInKM(coord1, coord3) //distance from start point to third point
    var brgFstToThrd = getBearing(coord1, coord3) //bearing from start point to third point
    var brgFstToSnd = getBearing(coord1, coord2) //bearing from start point to end point

    var sigma = dstFstToThrd / earthRadius
    var ctDist = Math.asin(Math.sin(sigma)*Math.sin(brgFstToThrd-brgFstToSnd)) * R
    if(ctDist<0) return ctDist * (-1) // getting the absolute value
    else return ctDist
}

/**
 * This function calculates whether a point is located on a line
 * @param {[[double, double],[double, double]]} line 
 * @param {[double, double]} point 
 * @returns boolean
 */
function pointOnLine(line, point)
{
    if(crossTrackDistance(line[0], line[1], point) == 0) return true
    else return false
}

/**
* This function calculates the coordinate, where two sequences cross each other
*Link: https://www.movable-type.co.uk/scripts/latlong.html
* @param {[[double, double],[double, double]]} segment1 - one sequence
* @param {[[double, double],[double, double]]} segment2 - another sequence
* @returns the coordinates of the intersectionPoint 

*/
function intersect(segment1, segment2) 
{
    var coord11 = segment1[0]
    var lat11 = coord11[0]; var lon11 = coord11[1]
    var coord12 = segment1[1]
    var lat12 = coord12[0]; var lon12 = coord12[1]
    var coord21 = segment2[0]
    var lat21 = coord21[0]; var lon21 = coord21[1]
    var coord22 = segment2[1]
    var lat22 = coord22[0]; var lon22 = coord22[1]
     
    // transforming degree coordinates to radian coordinates
    var phi1 = degToRad(lat11), lambda1 = degToRad(lon11)
    var phi2 = degToRad(lat21), lambda2 = degToRad(lon21)
    var theta13 = degToRad(getBearing(coord11,coord12)), theta23 = degToRad(getBearing(coord21,coord22))
    var dphi = phi2-phi1, dlambda = lambda2-lambda1
 
    var gamma12 = 2 * Math.asin(Math.sqrt(Math.sin(dphi/2) * Math.sin(dphi/2)
        + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda/2) * Math.sin(dlambda/2)))
    if (Math.abs(gamma12) < Number.EPSILON) {
        return  [phi1, phi2]
    }
 
    var cosThetaA = (Math.sin(phi2)-Math.sin(phi1)*Math.cos(gamma12))/(Math.sin(gamma12)*Math.cos(phi1))
    var cosThetaB = (Math.sin(phi1)-Math.sin(phi2)*Math.cos(gamma12))/(Math.sin(gamma12)*Math.cos(phi2))
 
    var thetaA = Math.acos(Math.min(Math.max(cosThetaA, -1), 1))
    var thetaB = Math.acos(Math.min(Math.max(cosThetaB, -1), 1))
    
    var theta12, theta21
 
    if(Math.sin(lambda2-lambda1) > 0) {
        theta12 = thetaA
        theta21 = 2 * Math.PI - thetaB
    } else {
        theta12 = 2 * Math.PI - thetaA
        theta21 = thetaB
    }

    var alpha1 = theta13 - theta12
    var alpha2 = theta21 - theta23


    if(Math.sin(alpha1) == 0 && Math.sin(alpha2) == 0) { //infinte solutions
        return null
    }
    if(Math.sin(alpha1) * Math.sin(alpha2) < 0) { //ambiguous solutions
        return null
    }

    var alpha3 = Math.acos(-Math.cos(alpha1)*Math.cos(alpha2)+Math.sin(alpha1)*Math.sin(alpha2)*Math.cos(gamma12))
    var gamma13 = Math.atan2(Math.sin(gamma12)*Math.sin(alpha1)*Math.sin(alpha2), 
        Math.cos(alpha2)+Math.cos(alpha1)*Math.cos(alpha3))
    var phi3 = Math.asin(Math.min(Math.max(Math.sin(phi1)*Math.cos(gamma13) + Math.cos(phi1) * Math.sin(gamma13) * Math.cos(theta13), -1), 1))
    var deltaLambda13 = Math.atan2(Math.sin(theta13)*Math.sin(gamma13)*Math.cos(phi1), 
        Math.cos(gamma13)-Math.sin(phi1)*Math.sin(phi3))
    
    var lambda3 = lambda1 + deltaLambda13
    
    var intersectionPoint = [radToDeg(phi3), radToDeg(lambda3)%180]
    if(intersectionPoint[0] < 0) intersectionPoint[0] = intersectionPoint[0] * (-1)
    if(intersectionPoint[1] < 0) intersectionPoint[1] = intersectionPoint[1] * (-1)

    return intersectionPoint
}

/**
 * This function tests whether a point is located inside of a polygon
 * @param {[[double,double],[double,double],...,[double,double]]} polygon coordinates
 * @param {[double,double]} point  coordinates
 * @returns boolean
 */
function pointInPoly(polygon, point)
{
    var x = point[0], y = point[1]
    var inside = false
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0], yi = polygon[i][1]
        var xj = polygon[j][0], yj = polygon[j][1]
        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
*This function converts bearing from degree to string
*@param {double} degrees
*@returns {String} bearing 
*/
function toDirection(degrees){
	for(var i=0; i<degreesList.length; i++){
		if(degrees<degreesList[i][0]) {
            return degreesList[i][1]
        }
	}
}

/**
 * This function initializes the popup by sending an ajax-request 
 * @param {marker} marker where a popup should be initialized
 * @param {[double, double]} coordinates of the point the popup should be build up
 */
function initializePopup(marker, coordinates){
    response = null
    getAPIKey() // Get the users API key
    iniatializeAPI(userAPIKey, coordinates) // constructing the API call
    $.ajax(api) // sending request for whether information with the APi call
        .done(function(response){ // If the request is successfull
            marker.bindPopup("<b>temperature: </b>" + response.current.temp + " °C<br><b>humidity: </b>" + response.current.humidity + " %<br><b>air pressure: </b>" + response.current.pressure + " hPa<br><b>Wind: </b> " + toDirection(response.current.wind_deg) + " " + response.current.wind_speed + " km/h")
            marker.openPopup()
        })
        .fail(function(xhr, status, error){ // In case there is no API key given by the user
            marker.bindPopup("For weather information please enter an API key!")
            marker.openPopup()
        })
}

/**
 * This function calculates the point, where a sequence crosses the polygon
 * @param {JSONConstructor} polygon 
 * @param {JSONConstructor} route 
 * @param {int} counter counts the amount of coordinates which were added to the array of subsequences 
 * @param {[[double,double],[double,double],...,[double,dousble]]} subsection represents a subsection which lays either inside the polygon or outside
 * @param {int} i iterator to keep in memory the position in the route
 * @returns counter
 */
 function getBorderOfSubsection(polygon, route, i){ 
    var crossPointDist = new Array() //array to save the distances from the last point outside the polygon to all segments of the polygon
    for(var j=0; j<polygon.length-1; j++){
        // Calculate the intersection points with every site of the polygon
        crossPointDist[j] = intersect([route.features[0].geometry.coordinates[0][i-1], route.features[0].geometry.coordinates[0][i]], [polygon[j], polygon[j+1]]) 
        
    }
    crossPointDist[polygon.length] = intersect([route.features[0].geometry.coordinates[0][i-1], route.features[0].geometry.coordinates[0][i]], [polygon[polygon.length-1],polygon[0]])
    // Calculate the distance between every intersection-point and last point in- or outside if the polygon to get the nearest intersection-point
    for(j=0; j<crossPointDist.length; j++){
        if(crossPointDist[j]!= null) {

            crossPointDist[j] = [crossPointDist[j],distanceInKM(crossPointDist[j],route.features[0].geometry.coordinates[0][i-1])]
        }
        else crossPointDist[j] = [crossPointDist[j],999999999]
    }
    crossPointDist.sort(function([a,b],[c,d]){ return b-d }) // sort the array to get the nearest intersection
    return crossPointDist[0][0] // adds the nearest intersection-point to the subsection array   
}  

/**
 * This function switches long- and latitude of the coordinates
 * @param {[double, duoble]} coords where latitude and longitude should be switched
 * @return coordinates with switched lat and lon 
 */
 function turnAroundCoords(coords){
    var switchedCoords  = []
    switchedCoords[0] = coords[1]
    switchedCoords[1] = coords[0]
    return switchedCoords
}


/**
This function transform retangle in form of json to an array
 * @param {JSON} rectangle coordinates
 */
function rectangleToPolygon(rectangle){
    polygon = []
    for(var i=0; i<rectangle[0].length; i++){
        polygon[i] = [rectangle[0][i].lng, rectangle[0][i].lat]
    }
}

/**
 * This function constructs a markerat the given coordinates. This function also initializes a popup and adds it to map as well.
 * @param {*} coords where the marker should be placed.
 */
function addInteresectionMarker(coords){
    var marker = new L.marker(turnAroundCoords(coords)).addTo(map)
    drawnItems.addLayer(marker) // Adds the marker to the drawnItems-FeatureGroup to make it possible to remove them by activating the remove button on the control bar
    initializePopup(marker, coords) // Initialize the popup and send the request via jquery
}


/**
 * This function recognizes all points from route which are inside of the polygon and those laying outside. It also calculates the point where the line crosses the polygon
 * @param {JSON} route LineString GeoJSON
 */
function mainCalculation(route){
    pointsInsideOfPoly = new Array()
    pointsOutsideOfPoly = new Array() 
    //variables needed for the following calculations
    let pointsOutsideOfPolyLength = 0
    let pointsInsideOfPolyLength = 0
    let counter = 0

    rectangleToPolygon(rectangle) // transforming the rectangle to a polygon array

    for(var i=0; i<route.features[0].geometry.coordinates[0].length-1; i++){

        if(pointInPoly(polygon, route.features[0].geometry.coordinates[0][i]) == false){  
            var subsection = new Array()
            counter = 0
            // Checking whether the coordinate is the first in the array.
            // If true the "getBorderOfSubsection" algorithm will not work
            if(i!=0){
                // Calculate the intersection
                subsection[counter] = getBorderOfSubsection(polygon, route, i)
                counter++
            }
            subsection[counter] = route.features[0].geometry.coordinates[0][i]
            i++
            counter++
            while(pointInPoly(polygon, route.features[0].geometry.coordinates[0][i]) == false){
                subsection[counter] = route.features[0].geometry.coordinates[0][i]
                if(i<route.features[0].geometry.coordinates[0].length-1) i++
                else break
                counter++
            }
            // Calculate the intersection
            subsection[counter] = getBorderOfSubsection(polygon, route, i)
            counter++
            if(i>=route.features[0].geometry.coordinates[0].length) break
            pointsOutsideOfPoly[pointsOutsideOfPolyLength] = subsection
            pointsOutsideOfPolyLength+
            i--
        } else { 
            var subsection = new Array()
            counter = 0
            // Checking whether the coordinate is the first in the array.
            // If true, the "getBorderOfSubsection"-algorithm will not work       
            if(i!=0){
                subsection[counter] = getBorderOfSubsection(polygon, route, i)
                // Marking the intersection on the map
                // A minimal inaccuracy at the calculation of the intersection causes the intersect algorithm sometimes to not find the correct intersection point. 
                // If that is the case it defines another incorrect point as intersection. In these cases the algorithm chooses the last point 
                // inside or outside the polygon as the intersection point. As threshold to do so the algorithm uses 1 km distance.
                // Therefore it is possible that an intersection point might not be calculatet by this algorithm.
                if(distanceInKM(subsection[counter], route.features[0].geometry.coordinates[0][i]) > 1){ // threshold 1 km
                    if(i!=route.features[0].geometry.coordinates[0].length-1){
                        addInteresectionMarker(route.features[0].geometry.coordinates[0][i])
                        console.log("route.features[0].geometry.coordinates[0][i]: <b>"+route.features[0].geometry.coordinates[0][i]+", i: "+i) 
                    }
                } else{
                    if(i!=route.features[0].geometry.coordinates[0].length-1){
                        addInteresectionMarker(subsection[counter]) 
                        console.log("subsection[marker]: <b>"+route.features[0].geometry.coordinates[0][i]+", i: "+i) 

                    }
                }
                counter++
            }
            subsection[counter] = route.features[0].geometry.coordinates[0][i]   
            i++
            counter++
            while(pointInPoly(polygon, route.features[0].geometry.coordinates[0][i]) == true){ 
                subsection[counter] = route.features[0].geometry.coordinates[0][i] 
                if(i<route.features[0].geometry.coordinates[0].length-1) i++
                else break
                counter++
            }
            // Calculate the intersection
            subsection[counter] = getBorderOfSubsection(polygon, route, i)
            
            // Marking the intersection on the map
            // A minimal inaccuracy at the calculation of the intersection causes the intersect algorithm sometimes to not find the correct intersection point. 
            // If that is the case it defines another incorrect point as intersection. In these cases the algorithm chooses the last point 
            // inside or outside the polygon as the intersection point. As threshold to do so the algorithm uses 1 km distance.
            // Therefore it is possible that an intersection point might not be calculatet by this algorithm.
            if(distanceInKM(subsection[counter], route.features[0].geometry.coordinates[0][i]) > 1){ //threshold 1 km
                if(i!=route.features[0].geometry.coordinates[0].length-1){
                    addInteresectionMarker(route.features[0].geometry.coordinates[0][i]) 
                    console.log("route.features[0].geometry.coordinates[0][i]: <b>"+route.features[0].geometry.coordinates[0][i]+", i: "+i) 

                    }
            } else{
                if(i!=route.features[0].geometry.coordinates[0].length-1){
                    addInteresectionMarker(subsection[counter]) 
                    console.log("subsection[counter]: <b>"+route.features[0].geometry.coordinates[0][i]+", i: "+i) 

                }
            }
            
            counter++
            if(i>=route.features[0].geometry.coordinates[0].length) break
            pointsInsideOfPoly[pointsInsideOfPolyLength] = subsection
            pointsInsideOfPolyLength++
            i--
        }
    } 
}


