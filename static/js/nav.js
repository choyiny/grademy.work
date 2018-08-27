// Initialize Firebase
var config = {
    apiKey: "AIzaSyAP37fnOs4N5yhRhuCL7LsK0Ev2iv6Rh6I",
    authDomain: "ugrade-cb832.firebaseapp.com",
    databaseURL: "https://ugrade-cb832.firebaseio.com",
    projectId: "ugrade-cb832",
    storageBucket: "ugrade-cb832.appspot.com",
    messagingSenderId: "1075414492997"
};
firebase.initializeApp(config);

function hideLoginBox(){
    Array.from(document.querySelectorAll("#nav-alert-panel .alert")).forEach(function(e){
        e.classList.add("hidden");
    });
    $('#loginModal').modal('hide');
}

function showAlert(type, message){
    var e =  document.querySelector('#nav-alert-panel .alert-' + type);
    e.classList.remove("hidden");
    e.innerHTML = message;
};

function resetPassword (e){
    e.preventDefault();
    // retrieve
    var email = document.getElementById('email').value;
    // reset password
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        showAlert('success', 'email was sent');
    }).catch(function(error) {
        showAlert('danger', '[' + error.code + '] ' + error.message);
    });
}

function signOut (e){
    e.preventDefault();
    firebase.auth().signOut();
}

function signIn (e){
      e.preventDefault();
      // retrieve
      var email = document.getElementById('email').value;
      var password = document.getElementById('password').value;
      // authenticate
      firebase.auth().signInWithEmailAndPassword(email, password).then(function(res){
          hideLoginBox();
      }).catch(function(error) {
          showAlert('danger', '[' + error.code + '] ' + error.message);
      });
};

function signUp (e) {
  e.preventDefault();
  // retrieve
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  // create
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function(res){
          hideLoginBox();
      }).catch(function(error) {
          showAlert('danger', '[' + error.code + '] ' + error.message);
      });
}

function init() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById('userEmail').innerHTML = user.email;
        document.getElementById('show-modal-button').style.display = "none";
        document.getElementById('user-button').style.display = "inline-block";
    } else {
        document.getElementById('show-modal-button').style.display = "inline-block";
        document.getElementById('user-button').style.display = "none";
    }
  });
  document.getElementById('sign-in-button').addEventListener('click', signIn);
  document.getElementById('sign-out-button').addEventListener('click', signOut);
  document.getElementById('sign-up-button').addEventListener('click', signUp);
  document.getElementById('reset-password-button').addEventListener('click', resetPassword);
}

window.addEventListener("load", init, true);