function logout_js() {
    logout();
}

function requestConfirmation() {
    alert('Requested, Please make sure you contact the driver and plan accordingly!');
}

function requestTheUserForRide(requestToUser) {

    console.log('in user request ride', requestToUser);

}



/* ---------------------------------------------------------------- */
function openMyDetails_js() {
    openMyDetails();
}

function openSearch_js() {
    openSearch();
}



/* ---------------------------------------------------------------- */



var searchCoords;

var opened = 0;


var map;
var geocoder;
var counter = 0;
var coordArr = [];
var markers = [];

var isMarkerChanged = true;

/* ---------------------------------------------------------------- */
var listObj;

function suggest(proximity) {


    clearuidList();
    removeCurrentSuggestions();
    if (markers.length > 0 && isMarkerChanged && coordArr.length) {

        listObj = [];
        //OPEN THE NAV BAR
        openNav();

        //SHOW SPINNER


        var coordinates = coordArr[0].toString().split(',');

        var coordlat = parseFloat(coordinates[0].trim());
        var coordlng = parseFloat(coordinates[1].trim());

        keysEntered = false;

        registerGeoQuery(coordlat, coordlng, parseInt(proximity.trim()));
        runGeoQuery();



    } else {
        alert('Choose a point on the map and click search');
    }
}

/* -------------------------------------------------------------- */

function getCurrentUserUID() {
    return firebase.auth().currentUser.uid;
}

var geoFire;

function initialiseGeoQuery() {
    var ref = firebase.database().ref().child("userroutes");
    geoFire = new GeoFire(ref);

}

var uidList;
function clearuidList() {
    uidList = [];
}



var geoQuery;
var keysEntered = false;

function registerGeoQuery(coordlat, coordlng, radius) {
    geoQuery = geoFire.query({
        center: [coordlat, coordlng],
        radius: radius
    });
}

function runGeoQuery() {
    if (!(j$('.NoDataFound').is(":visible"))) {
        var noDataFound = '<div class="col-md-12 NoDataFound" id="NoDataFound">  <div  style="padding: 10px 30px;text-align: center; ">No users are travelling near your destination.</div>           </div>';
        j$(noDataFound).insertAfter(j$("#proximityBar"));
    }
    var onReadyRegistration = geoQuery.on("ready", function () {
        console.log("GeoQuery has loaded and fired all other events for initial data");
        if (!keysEntered) {
            //SET NO DATA FOUND

            // var noDataFound = '<div class="col-md-12 NoDataFound" id="NoDataFound">  <div  style="padding: 10px 30px;text-align: center; ">No users are travelling near your destination.</div>           </div>';
            // j$(noDataFound).insertAfter(j$("#proximityBar"));

            console.log("There was no initial data, so there are no business in range (yet).");
        }
    });

    var onKeyEnteredRegistration = geoQuery.on("key_entered", function (key, location, distance) {
        keysEntered = true;

        console.log(key + " entered query at " + location + " (" + distance + " km from center)");

        var useridKey = key.split('__');

        if (uidList.indexOf(useridKey[0]) < 0) {
            uidList.push(useridKey[0]);

            var userRef = firebase.database().ref().child('users').child(useridKey[0].trim());
            userRef.once('value').then(function (snapshot) {

                if ((snapshot.val().remainingSeats > 0 || !snapshot.hasChild('remainingSeats')) && snapshot.key !== getCurrentUserUID()) {

                    populateTable(snapshot.val(), snapshot.key);

                }
            }).then(function (success) {
                console.log('finished reading ');
                enableDropdown();
            }).catch(function (error) {
                console.log('error reading user data: ', error)
            });

        }

    });

    var onKeyExitedRegistration = geoQuery.on("key_exited", function (key, location, distance) {
        console.log(key + " exited query to " + location + " (" + distance + " km from center)");
    });

    var onKeyMovedRegistration = geoQuery.on("key_moved", function (key, location, distance) {
        console.log(key + " moved within query to " + location + " (" + distance + " km from center)");
    });

}

/* -------------------------------------------------------------- */
function disableDropdown() {
    // var proximitySelectList = document.getElementById('proximityList');
    // var att = document.createAttribute("disabled");
    // att.value = "";
    // proximitySelectList.setAttributeNode(att);
}

function enableDropdown() {
    // document.getElementById('proximityList').removeAttribute("disabled");
}

function removeCurrentSuggestions() {
    var currentSuggestions = document.getElementsByClassName('userInfoCard');

    if (currentSuggestions) {
        for (var i = 0; i < currentSuggestions.length; i++) {
            currentSuggestions[i].remove();
        }
    }
}
/* -------------------------------------------------------------- */
function populateTable(carpooluser, carpooluserKey) {

    var HTMLCard = '<div onclick=\"prepareTheRequest(this);\" class="col-md-4 userInfoCard"  data-userkey=' + carpooluserKey + ' data-usermailid= ' + carpooluser.shellMailId + '><div class="suggestionsCard col-md-12"> <div class="mailIdInfo" > ' + carpooluser.shellMailId + ' </div> <div class="pd3"> <span> ' + carpooluser.car + ' </span> <span style="float: right;"> ' + carpooluser.vehicleNumber + '</span> </div> <div class="pd3"> Going to:  <span> ' + carpooluser.homeLocation + '</span> </div> <div class="pd3"> Leaves Home at: <span> ' + carpooluser.leaveHomeAt + '</span> </div><div class="pd3"> Leaves Office at: <span> ' + carpooluser.leaveOfficeAt + '</span> </div> <div> <button class="requestBtn"> request </button> </div> </div> </div> ';
    console.log('creating card');
    if (j$('.NoDataFound').is(":visible")) {
        console.log('removing no data found');
        j$('.NoDataFound').hide();
    }
    j$(HTMLCard).insertAfter(j$("#proximityBar"));


    // if (listObj.length > 2) {
    //     geocoder.geocode({
    //         'location': listObj[2]
    //     }, function (results, status) {
    //         if (status === 'OK') {
    //             if (results.length > 1) {
    //                 destination = results[1].formatted_address;
    //                 destination = destination.replace('Bengaluru, Karnataka', '');
    //                 destination = destination.replace('India', '');

    //             }
    //         } else {


    //         }
    //     });
    // } else {
    //     enableDropdown();
    // }



}


/* ---------------------------------------------------------------- */

function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}


/* ---------------------------------------------------------------- */

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

/* ---------------------------------------------------------------- */

var j$;

function setTheTable() {
    j$ = jQuery.noConflict();

}

/* ---------------------------------------------------------------- */

function setSearchCoords(cord) {
    searchCoords = cord.lat() + ',' + cord.lng();
}

/* ---------------------------------------------------------------- */


/* ---------------------------------------------------------------- */

function removeTheRoute(cord) {



}

/* ---------------------------------------------------------------- */

function addTheRoute(addr, cord) {
    coordArr = [];
    coordArr.push(cord.lat() + ',' + cord.lng());
}

/* ---------------------------------------------------------------- */

function deleteMarkers() {
    clearMarkers();
    markers = [];
}

/* ---------------------------------------------------------------- */

function clearMarkers() {
    setMapOnAll(null);
}

/* ---------------------------------------------------------------- */

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

/* ---------------------------------------------------------------- */
const city = {};
city.lat = 12.9681417;
city.lng = 77.6119801;

function initialize() {
    var mapProp = {
        center: new google.maps.LatLng(city.lat, city.lng),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
    };
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

    google.maps.event.addListener(map, 'click', function (event) {

        placeMarker(event.latLng);

        map.setCenter(event.latLng);
    });

    geocoder = new google.maps.Geocoder;
}


/* ---------------------------------------------------------------- */

function loadScript() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://maps.googleapis.com/maps/api/js?key=&sensor=false&callback=initialize";
    document.body.appendChild(script);
}

/* ---------------------------------------------------------------- */

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.DROP,

    });

    deleteMarkers();
    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function () {
        var coords = '' + marker.position.lat() + ',' + marker.position.lng();
        var index = coordArr.indexOf(coords);
        coordArr.splice(index, 1);


        removeTheRoute(marker.position);
        marker.setMap(null);
        google.maps.event.clearInstanceListeners(marker);
    });

    var infoWinAddrs = '';
    geocoder.geocode({
        'location': location
    }, function (results, status) {
        if (status === 'OK') {
            if (results.length > 1) {


                infoWinAddrs = results[1].formatted_address;
                addTheRoute(infoWinAddrs, location);
            }
            var infowindow = new google.maps.InfoWindow({
                content: infoWinAddrs
            });
            infowindow.open(map, marker);
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });


}

/* ---------------------------------------------------------------- */
function getFirebaseRef() {
    return firebase.database().ref();
}

function getCurrentUser() {
    return firebase.auth().currentUser;
}

function getCurrentUserUID() {
    return firebase.auth().currentUser.uid;
}


//should we check for remaining seats here?!
function requestForTheRide(requestTo) {

    if (requestTo != getCurrentUserUID()) {


        var firebaseRef = getFirebaseRef().child("requests").child(getCurrentUserUID());

        firebaseRef.once('value').then(function (snapshot) {
            console.log('', snapshot.val());

            if (snapshot.val()) {
                if (snapshot.val().requestedTo === requestTo) {
                    //REQUESTING FOR ALREADY REQUESTED PERSON
                    //PUT A SNACKBAR
                    console.log('put a snackbar REQUESTING FOR ALREADY REQUESTED PERSON');
                    return;
                }
                console.log('val', snapshot.val());
                //increase number of seats the counter then call update
                updateRemainingSeats(snapshot.val().requestedTo, 1);
                updateRequests(firebaseRef, requestTo);
                //run the transaction
            } else {
                updateRequests(firebaseRef, requestTo);
            }
        });

    }
}

function updateRemainingSeats(userId, counter) {


    var firebaseRef = getFirebaseRef().child("users").child(userId).child('remainingSeats');

    firebaseRef.transaction(function (remainingSeats) {
        return remainingSeats + counter;
    }).then(function (sucess) {
        closeNav();
        checkIfAlreadyRequested();
        if (requestToUser.getAttribute('data-usermailid')){
            var mailToId = requestToUser.getAttribute('data-usermailid');
            openMailWindow(mailToId);
        }
    }).catch(function (error) {
        console.log('error', error);
    });


}

function updateRequests(firebaseRef, requestTo) {
    firebaseRef.update({
        //Just the id or the whole info			
        requestedTo: requestTo,
    }).then(function (result) {
        //send push notification
        //run transaction decrement and increment
        //DO A COLOR ENCODING FOR REQUESTED RIDE WITH LITTLE ANIMATION COLOR GRADUAL CHANGE
        updateRemainingSeats(requestTo, -1);

    });
}


function prepareTheRequest(requestToUser) {

    if (requestToUser.getAttribute('data-userkey')) {
        var requestToKey = requestToUser.getAttribute('data-userkey');

        requestForTheRide(requestToKey);
    } else {
        console.warn('requestto user has missing params');
    }


}


function openMailWindow(mailToId) {
    var mailWindow = window.open("mailto:" + mailToId + '?subject= New passenger request' + '&body=Hello! %0A%0AI would like to join with you for the carpool.%0A %0A Thanks!');
    setTimeout(function () {
        try {
            mailWindow.close();
        } catch (err) { }

    }, 1200);


}

//SERVER/DB CALL BEGINS
requestRide = function (reqId) {
    A4J.AJAX.Submit('j_id0:j_id26', null, {
        'similarityGroupingId': 'j_id0:j_id26:j_id29',
        'oncomplete': function (request, event, data) {
            requestConfirmation();
        },
        'parameters': {
            'j_id0:j_id26:j_id29': 'j_id0:j_id26:j_id29',
            'reqId': (typeof reqId != 'undefined' && reqId != null) ? reqId : ''
        }
    })
};

logout = function () {
    A4J.AJAX.Submit('j_id0:j_id26', null, {
        'similarityGroupingId': 'j_id0:j_id26:j_id31',
        'parameters': {
            'j_id0:j_id26:j_id31': 'j_id0:j_id26:j_id31'
        }
    })
};

function checkIfAlreadyRequested() {

    var firebaseRef = getFirebaseRef().child("requests").child(getCurrentUserUID());

    firebaseRef.once('value').then(function (snapshot) {

        if (snapshot.val()) {
            var requestedToRef = getFirebaseRef().child("users").child(snapshot.val().requestedTo);
            requestedToRef.once('value').then(function (requestedToUser) {
                console.log('this is the user', requestedToUser.val());

                j$("#Rmail").text(requestedToUser.val().shellMailId);
                j$("#Rcar").text(requestedToUser.val().car);
                j$("#Rnum").text(requestedToUser.val().vehicleNumber);
                j$("#Rhome").text(requestedToUser.val().homeLocation);
                j$("#Rleavehome").text(requestedToUser.val().leaveHomeAt);
                j$("#Rleaveoff").text(requestedToUser.val().leaveOfficeAt);


            }).then(function (success) {
                j$(".exisitingRequest").css("top", "60px");
            });

        }

    });
}



//SERVER/DB CALL ENDS
function handleRedirect() {

    firebase.auth().getRedirectResult().then(function (result) {
        if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
        }
        // The signed-in user info.
        var user = result.user;
    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

    });


    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log('this is the change');
            initialiseGeoQuery();
            clearuidList();
            checkIfAlreadyRequested();
        } else {
            // No user is signed in.
            console.log('no user');
            redirect(homePageURL);

        }
    });




}

var homePageURL = 'https://sbo-car-pool.firebaseapp.com';
function signOut() {
    if (getCurrentUser()) {
        firebase.auth().signOut().then(function () {

            redirect(homePageURL);

        }).catch(function (error) {

        });
    }

}

function redirect(URL) {
    window.location = URL;
}

j$('.navbar-toggle').on('click', function () {
    console.log('===', typeof j$(".exisitingRequest").css("top"));
    if (j$(".exisitingRequest").css("top") != "-360px")
        j$(".exisitingRequest").css("top") == "200px" ? j$(".exisitingRequest").css("top", "60px") : j$(".exisitingRequest").css("top", "200px");



});
window.onload = function () {
    loadScript();
    handleRedirect();

};
