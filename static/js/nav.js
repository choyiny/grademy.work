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
    grademywork.resetPassword(email).then(function() {
        showAlert('success', 'email was sent');
    }).catch(function(error) {
        showAlert('danger', '[' + error.code + '] ' + error.message);
    });
}

function signOut (e){
    e.preventDefault();
    grademywork.signOut();
}

function signIn (e){
      e.preventDefault();
      // retrieve
      var email = document.getElementById('email').value;
      var password = document.getElementById('password').value;
      // authenticate
      grademywork.signIn(email, password).then(function(res){
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
  grademywork.signUp(email, password).then(function(res){
          hideLoginBox();
      }).catch(function(error) {
          showAlert('danger', '[' + error.code + '] ' + error.message);
      });
 }

function init() {
  grademywork.onUserChange(function(user) {
    if (user) {
        document.getElementById('userEmail').innerHTML = user;
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