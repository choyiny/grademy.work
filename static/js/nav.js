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
          $('#loginModal').modal('hide');
          document.getElementById('login-alert').style.display = "none";
      }).catch(function(error) {
          document.getElementById('login-alert').innerHTML = '[' + error.code + '] ' + error.message;
          document.getElementById('login-alert').style.display = "block";
      });
};

function signUp (e) {
  e.preventDefault();
  // retrieve
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  // create
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function(res){
          $('#loginModal').modal('hide');
          document.getElementById('login-alert').style.display = "none";
      }).catch(function(error) {
          document.getElementById('login-alert').innerHTML = '[' + error.code + '] ' + error.message;
          document.getElementById('login-alert').style.display = "block";
      });
}

function init() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById('show-modal-button').style.display = "none";
        document.getElementById('sign-out-button').style.display = "inline-block";
    } else {
        document.getElementById('show-modal-button').style.display = "inline-block";
        document.getElementById('sign-out-button').style.display = "none";
    }
  });
  document.getElementById('sign-in-button').addEventListener('click', signIn);
  document.getElementById('sign-out-button').addEventListener('click', signOut);
  document.getElementById('sign-up-button').addEventListener('click', signUp);
}

window.addEventListener("load", init, true);