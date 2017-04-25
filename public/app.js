if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw-cache.js')
        .then(console.log)
        .catch(console.error);
}



/***************FIREBASE **********************/

function login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);

}

function handleRedirect() {
    loadSpinner(signInAnimate);

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
        hideSpinner(signInAnimate, 'SIGN IN WITH GOOGLE');
    });


    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log('this is the change');

            createUserIfDoesntExist();
        } else {
            // No user is signed in.
            console.log('no user');
            hideSpinner(signInAnimate, 'SIGN IN WITH GOOGLE');
        }
    });




}

function getFirebaseRef() {
    return firebase.database().ref();
}

function getCurrentUser() {
    return firebase.auth().currentUser;
}

function getCurrentUserUID() {
    return firebase.auth().currentUser.uid;
}

function getCurrentUserEmail() {
    return firebase.auth().currentUser.email;
}
function createUser() {
    var currentUser = getCurrentUser();
    var users = getFirebaseRef().child("users");
    users.child(currentUser.uid).set({
        personalEmail: getCurrentUserEmail()
    }).then(function (sucess) {
        $("#myModalVerifyUser").modal();
    }).catch(function (error) {
        alert('error cannot create user', error);
    });
}


function createUserIfDoesntExist() {
    console.log('*****************************checking', getCurrentUserUID());
    var user = getFirebaseRef().child("users").child(getCurrentUserUID());

    user.once('value', function (snapshot) {

        console.log('snapshot', snapshot.val());
        if (snapshot.val()) {
            console.log('user exists');
            if (snapshot.val().isVerified) {
                //redirectToHomePge
                console.log('user is verfied');
                redirect();

            } else {
                $("#myModalVerifyUser").modal();
                //bringupmodalwindow
                //place to enter shell mail id
                //send mail button
                //function to store the mail id and verification token against user
                //send mail
                //second screen to verify token
                //verify button
                //call to function 
                //redirect from function


            }
        }
        else {
            createUser();

        }
    }).then(function (success) {
        console.log('isVerified read successful');
    }).catch(function (error) {
        console.log('Error isVerified read ', error);
        hideSpinner(signInAnimate, 'SIGN IN WITH GOOGLE');
    });
}


function signOut() {
    if (getCurrentUser()) {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
            if ($('#myModalVerifyUser').hasClass('in')) {
                $("#myModalVerifyUser").modal().hide();
                $('.modal-backdrop').hide();
            }
            if ($('#myModalVerifyToken').hasClass('in')) {
                $("#myModalVerifyToken").modal().hide();
                $('.modal-backdrop').hide();
            }

            hideSpinner(signInAnimate, 'SIGN IN WITH GOOGLE');
        }).catch(function (error) {
            // An error happened.
            hideSpinner(signInAnimate, 'SIGN IN WITH GOOGLE');
        });
    }

}

function saveShellMailId() {
    var emailDomain = '@shell.com';
    var shellMailId = document.getElementById('userShellMailId');

    if (shellMailId.value) {
        shellMailId = shellMailId.value;
        if (shellMailId.indexOf(emailDomain) < 0) {
            shellMailId += emailDomain;
        }
        var userRef = getFirebaseRef().child("users").child(getCurrentUserUID());
        userRef.update({
            shellMailId: shellMailId,
        }).then(function (result) {
            console.log('shell mail id is is updated');
            var mailIdDisplay = '<span class="mailIdDisplay"> ' + shellMailId + ' </span>';
            $(mailIdDisplay).insertAfter($("#emailIdPlaceHolder"));
            $("#myModalVerifyUser").modal().hide();
            $("#myModalVerifyToken").modal();
        }).catch(function (error) {
            console.log('error: mail id not updated,', error);
            alert('Please enter correct mail id');
        });
    } else {
        alert('please enter the Shell mail id');
    }

}
var verifyTokenAnimate = 'verifyTokenAnimate';
var signInAnimate = 'signInAnimate';

function loadSpinner(elementId) {
    var verifyTokenAnimate = document.getElementById(elementId);
    if (verifyTokenAnimate) {
        verifyTokenAnimate.previousSibling.previousSibling.innerHTML = '';
        verifyTokenAnimate.style.visibility = 'visible';
        verifyTokenAnimate.parentNode.disabled = true;
    }

}
function hideSpinner(elementId, verificationMessage) {
    var verifyTokenAnimate = document.getElementById(elementId);
    if (verifyTokenAnimate) {
        verifyTokenAnimate.previousSibling.previousSibling.innerHTML = verificationMessage;
        verifyTokenAnimate.style.visibility = 'hidden';
        verifyTokenAnimate.parentNode.disabled = false;
    }

}

function verifyTheUserToken() {

    if (!document.getElementById('usertoken')) {
        alert('Element not found');
        return;
    }

    if (document.getElementById('usertoken').value) {

        loadSpinner(verifyTokenAnimate);

        var receivedToken = document.getElementById('usertoken').value;
        receivedToken = receivedToken.trim();
        console.log('this is the received token', receivedToken);

        var currentUser = getCurrentUserUID();
        var firebaseUserToken = firebase.auth().currentUser.getToken();
        var verifyTokenURL = 'https://us-central1-sbo-car-pool.cloudfunctions.net/verifyToken';
        firebase.auth().currentUser.getToken(/* forceRefresh */ true).then(function (firebaseUserToken) {
            fetch(verifyTokenURL, {

                'method': 'POST',
                'headers': {
                    'Authorization': 'Bearer ' + firebaseUserToken,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'uid': currentUser,
                    'token': receivedToken,
                })
            }).then(function (response) {
                console.log('fetched', response.body);
                listenForIsVerified();
            }).catch(function (error) {
                console.error('error in fetch', error);
                hideSpinner(verifyTokenAnimate, 'VERIFY');
            });

        }).catch(function (error) {
            console.error('error in reading', error);
            alert('Error! Please try after some time');
            hideSpinner(verifyTokenAnimate, 'VERIFY');
        });
    } else {
        alert('Enter a value in the token field');
        return;
    }


}

function listenForIsVerified() {
    console.log('in listen');
    getFirebaseRef().child("users").child(getCurrentUserUID()).child('isVerified').once('value', function (snapshot) {
        console.log('listen snapshot', snapshot);
        console.log('listen snapshot', snapshot.val());
        if (snapshot.val()) {
            console.log('========user verified=========');
            redirect();
        } else {
            console.log('========user not verified=========');
            hideSpinner(verifyTokenAnimate, 'VERIFY');
            alert('The entered the Token doesnt match !! Please Enter the correct token');

        }
    });
}







function redirect() {
    console.log('in redirect');
    var myDetailsURL = '/mydetails.html';
    window.location = myDetailsURL;
}

window.onload = function () {
    handleRedirect();
};