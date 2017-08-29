function init() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user){
        document.getElementById('close-modal-button').style.display = "none";
         $('#loginModal').modal({
                backdrop: 'static',
                keyboard: false
        }).modal('show');
    };
  });
};

window.addEventListener("load", init, true);