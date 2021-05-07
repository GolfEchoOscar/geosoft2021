//author: Jan Seemann (basecode), Dominik Zubel (functions: useOwnInput(), backConversion())
//content: This script intersects a given route with a given polygon. It returns the resulting subsequences sorted by length and the total length of the route. It also states whether a subsequence is inside oder outside the polygon

"use strict" 

//variables


let pointsInOrOutsideArray = []; // [boolean] Array stores if a point lies inside or outside the polygon
let intersectionIndexArray = []; // [integer] Array stores the indices, where the route intersects the polygon
let distancesPointToPoint = []; // [float] Array stores all distances between consecutive points 
let distancesSubsequences = []; // [float] Array stores the distances of the subsequences formed by the polygon
let resultTable = []; // array stores information about the route section, the length of the section, the start- and end points and if the section lies inside or outside the given polygon


//constants

const lengthRoute = route.length // Length of the route array. The array is not changed therefore its length is constant

//the coordinates corners of the polygon are constants because the polygon remains unchanged for all points
const leftBottomCorner = polygon[0]; //left Bottom corner of the polygon
const rightTopCorner = polygon[2]; //right Top corner of the polygon 


//functions


/**
 * This function converts coordinates in degrees into coordinates in radians.
 * @param {float} deg coordinates (deg)
 * @returns converted coordinates (rad)
 */
 function degToRad(deg) {
    return deg * (Math.PI/180);  //conversion formula
  }


/**
 * This function calculates the shortest distance in m between two points using the haversine formula.
 * Link: http://www.movable-type.co.uk/scripts/latlong.html
 * @param {[float,float]} point1 coordinates [lng/lat] 
 * @param {[float,float]} point2 coordinates [lng/lat] 
 * @returns shortest distance between the two points in meters.
 */
function distanceInMeter(point1,point2) {
    var earthRadius = 6371; // Radius of the earth in km
    var distanceLongitude = degToRad(point2[0]- point1[0]); // Distance on the longitude in rad
    var distanceLatitude = degToRad(point2[1]- point1[1]);  //Distance on the latitude in rad

    var a = 
      Math.sin(distanceLatitude/2) * Math.sin(distanceLatitude/2) +
      Math.cos(degToRad(point1[1])) * Math.cos(degToRad(point2[1])) * 
      Math.sin(distanceLongitude/2) * Math.sin(distanceLongitude/2)
      ; //a is the square of half the chord length between the points
    
      var distanceRad = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // Distance in rad
   
      var distanceKM = earthRadius * distanceRad; // Distance in km
    
      return distanceKM*1000; //factor 1000 to convert the unit of the result into meter
  }


/**
 * This function calculates if a point is in- or outside a given polygon.
 * It only works with rectangles are parellel to longitude and latitude.
 * the coordinates of point are checked against the left top corner and the right bottom corner of the polygon
 * @param {[float,float]} coordinates of one point [lng/lat] 
 * @returns true if the point is inside the polygon or false if the point is outside the polygon
 * @todo execption handling for uneligble polygons (probably needs the other two corners as variables)
 */
function isPointInPolygon(coordinates){
    return (coordinates[0] >= leftBottomCorner[0]) && (coordinates[0] <= rightTopCorner[0]) //the longitude of a point in the rectangle lies between the longitude of the left bottom and the right top corner
    && (coordinates[1] >= leftBottomCorner[1]) && (coordinates[1] <= rightTopCorner[1]); //the latitude of a point in the rectangle lies between the latitude of the left bottom and the right top corner
}

/**
 * This function fills the PointsInOrOutsideArray 
 */
function fillingPointsInOrOutside(){
    for (let index_route = 0; index_route < lengthRoute; index_route++) { //iterating over each point in the route
        pointsInOrOutsideArray[index_route] = isPointInPolygon(route[index_route]); 
}
}

/**
 * The goal of the function is to find the indices where the route enters or leaves the polygon and to store the result in the IntersectionIndexArray. 
 */
function fillingIntersectionIndexArray(){
    for (let index = 0; index < pointsInOrOutsideArray.length; index++) {
        if(index == 0  || index == pointsInOrOutsideArray.length - 1 // setting the start and the end point of the route as part of the array
            ||(!pointsInOrOutsideArray[index] && (pointsInOrOutsideArray[index+1] || pointsInOrOutsideArray[index-1]))){ //The route intersects the polygon when the boolean pointsInOrOutsideArray[index] is false and the next or previous is true
            intersectionIndexArray.push(index); 
        } 
       
    }

}




  /**
 * This function calculates all distances in meter between consecutive points and saves them in the distancesPointToPoint Array.
 * The functions uses the distanceInMeter function.
 */
function pointToPointDistances(){
    for (let index_route = 0; index_route < lengthRoute-1; index_route++) {
        distancesPointToPoint[index_route] = distanceInMeter(route[index_route], route[index_route+1]);
    }
  }

  /**
 * This function calculates the distances of the subsequences in meter that were formed by the polygon.
 * It saves the distances in the distancesSubsequences-Array.
 */
function subsequenceDistances(){
    for (let index = 0; index < intersectionIndexArray.length-1; index++) { //iterating over the subsequences
        var distanceSum = 0  //intialising the distance sum for a subsequence
        for (let i = intersectionIndexArray[index]; i < intersectionIndexArray[index + 1]; i++) { //iterating over the points in the subsequence
            distanceSum += distancesPointToPoint[i]; //adding up the distances
        }
        distancesSubsequences.push(distanceSum);
    }
    
} 

/**
 * This function calculates the total length of the route in meter rounded down to three decimals.
 * @returns total distance of the route in meter
 */
function totalDistance(){
    var distanceSum = 0;
    for (let index = 0; index < distancesPointToPoint.length; index++) { //iterationg over the distances
        distanceSum += distancesPointToPoint[index]; //add the distance
    }
    distanceSum = Math.round(distanceSum * 1000) / 1000;
    return distanceSum;
}

/**
 * This function fills the resultTable with all attributes that shall be displayed.
 * The array stores date about the route section, the length of the route section, the start- and end-points and if the route section lies in- or outside the given polygon
 */
function fillingResultTable(){ 
    for (let index = 0; index < distancesSubsequences.length; index++) { //iterating over the subsequences
        var tableRow = [];
        tableRow[0] = index+1;  //index
        tableRow[1] = distancesSubsequences[index]; //length of the subsquence
        tableRow[2] = pointsInOrOutsideArray[intersectionIndexArray[index] + 1] // position to polygon
        tableRow[3] = route[intersectionIndexArray[index]]; // start-point
        tableRow[4] = route[intersectionIndexArray[index + 1]]; //end-point

        resultTable.push(tableRow);
    }
}

/**
 * This function converts the values in the result table.
 * The function rounds the lengths to three decimal places.
 * The Function converts the boolean true to "Inside" and the boolean false to "Outside".
 * The function brackets the coordinates of the start- and end-points.
 * @param {Array[][]} arrayToConvert two-dimensional Array
 */
function convertArrayValues(arrayToConvert) {
    for(var row =0; row < arrayToConvert.length; row++) {

                arrayToConvert[row][1] = Math.round(arrayToConvert[row][1] * 1000) / 1000; //round lengths to two decimal places

                if (arrayToConvert[row][2] == true) {  
                    arrayToConvert[row][2] = "Inside"; // convert true to "Inside"
               }
               else if (arrayToConvert[row][2] == false) {
                    arrayToConvert[row][2] = "Outside"; //convert false to "Outside"
               }

                arrayToConvert[row][3] = "(" + arrayToConvert[row][3] + ")"; //bracket start-pointcoordinates
                arrayToConvert[row][4] = "(" + arrayToConvert[row][4] + ")"; //bracket end-point coordinates
   
               
    }
}

/**
 * This function creates html-code to display a table out of a two-dimensional JavaScript array.
 * @param {Array[][]} convertedArray two-dimensional array
 * @returns HTML-code to display the table
 */
function createTableHTML(convertedArray) {
    var result = "<table border=1>";
    for(var i=0; i<convertedArray.length; i++) {
        result += "<tr>";
        for(var j=0; j<convertedArray[i].length; j++){
            result += "<td>"+convertedArray[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}


// Commands

fillingPointsInOrOutside(); //check whether the points are in- or outside the polygon
fillingIntersectionIndexArray(); //check where the intersections are
pointToPointDistances(); //calculate all distances
subsequenceDistances(); //calculate the distances of the subaequences
fillingResultTable(); // fill the resultTable
resultTable.sort((a,b) => b[1]-a[1]); //Sort the resultTable
convertArrayValues(resultTable); //convert the values in the resultTable



//Display the results in console for debugging
console.log(leftBottomCorner); //Display constants in console
console.log(rightTopCorner);
console.table(pointsInOrOutsideArray); //Display arrays in console
console.table(intersectionIndexArray);
console.table(distancesPointToPoint);
console.table(distancesSubsequences);
console.log(totalDistance()); //Display total length
console.table(resultTable); //Display final result table

//results to HTML

document.getElementById("tbody").innerHTML = createTableHTML(resultTable); //Refers to the table body from the html-document. Inserts the code generated by the createTableHTML-function
document.getElementById("pbody").innerHTML = "Total length: " + totalDistance() + " m"; //Refers to the paragraph of the html-document and creates the output for the total length