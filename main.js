var courses;
var coursesWithIDs = {};
var courseNames = [];
var courseHoles = {};
var holesWithIDs = {};
var numOfHoles = 0;
var gHoleLoc = "";
var uLat, uLon;

const Http = new XMLHttpRequest();
const url='https://tiemposystems.com/courselist_json.php';
Http.open("GET", url);
Http.send();

Http.onreadystatechange = (e) => {
  //console.log(Http.responseText);
  courses = JSON.parse(Http.responseText);
  //console.log(JSON.parse(courses));
}

function searchCourses(searchName) {
    coursesWithIDs = {};
    var results = courses.filter(obj => {
        var objFix = obj;
        if (objFix.coursename.toLowerCase().startsWith(searchName.toLowerCase())) {
            coursesWithIDs[objFix.coursename.trim()] = objFix.courseid;
            return true;
        }
      });
    //console.log(results);
    console.log(coursesWithIDs);
    updateDropdown(coursesWithIDs, "select-course");
}

function updateDropdown(array, element_id) {
    var select = document.getElementById(element_id);
    removeOptions(select);
    for(index in array) {
        select.options[select.options.length] = new Option(index, array[index]);
}
}

async function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
 }

function courseSelected(courseID) {
    const Http2 = new XMLHttpRequest();
    const url2= 'https://tiemposystems.com/coursedetail_json.php?courseid=' + courseID;
    Http2.open("GET", url2);
    Http2.send();
    
    Http2.onreadystatechange = (e) => {
      //console.log(Http.responseText);
      courseHoles = JSON.parse(Http2.responseText);
      numOfHoles = courseHoles.length;
      var select = document.getElementById('select-hole');
      removeOptions(select);
      select.options.length = 0;
      for (var i = 1; i < numOfHoles+1; i++) {
        holesWithIDs[i] = [courseHoles[i-1].longitude, courseHoles[i-1].latitude].toString();
      }
      updateDropdown(holesWithIDs, 'select-hole');
      //console.log(JSON.parse(courses));
      console.log(holesWithIDs);
    }
}

function calcCrow(lat1, lon1, lat2, lon2) 
{
  var R = 20902000; // 20902000 is for feet, for miles use 6371`
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d/3;//Divided by 3 so its yards!
}

async function updateHoleDistance(holeLoc) {
  if (holeLoc == undefined) {
    holeLoc = gHoleLoc;
  }
  gHoleLoc = holeLoc;
  await getLocation();
  // uLat = 39.4786276;
  // uLon = -106.0757863;
  //console.log("***" + holeLoc.split(" "));
  holeLoc = holeLoc.split(",");
  //holeLoc = holeLoc
  console.log(holeLoc);
  console.log(typeof holeLoc);
  lat1 = parseFloat(holeLoc[1]);
  lon1 = parseFloat(holeLoc[0]);
  console.log(lon1, lat1, "---", uLon, uLat);

  console.log(`Distance to hole (yrds): ${calcCrow(lat1, lon1, uLat, uLon)}`);
  document.getElementById('hole-distance').innerHTML = `${calcCrow(lat1, lon1, uLat, uLon)} yards`;
}

function toRad(Value) 
{
    return Value * Math.PI / 180;
}

async function getLocation() {
  if (navigator.geolocation) {
      var lat_lng = navigator.geolocation.getCurrentPosition(showPosition);
      console.log(lat_lng);
  } else {
      alert("Geolocation is not supported by this browser.");
  }
  return true;
}

function showPosition(position) {
  uLat = position.coords.latitude;
  uLon = position.coords.longitude;
  // var user_position = {};
  // user_position.lat = position.coords.latitude; 
  // user_position.lng = position.coords.longitude; 
  // return user_position;
  return true;
}