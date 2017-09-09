function addNewScheme (e){
    e.preventDefault();
    // retrieve
    var user = firebase.auth().currentUser;
    var id = document.getElementById('scheme-name').value;
    var rubrics = jsyaml.load(document.getElementById('scheme-rubrics').value);
    var sheets = jsyaml.load(document.getElementById('scheme-sheets').value);
    // create scheme
    var privileges = {};
    privileges[user.email.replace(/\./g, '%2E')] = {'admin': true};
    var assign = function(index, role){
        return function(user){
            var k = user.replace(/\./g, '%2E');
            if (!(k in privileges)) privileges[k] = {};
            privileges[k][index] = role;
        };
    };
    var s = sheets.map(function(sheet, i){
        sheet.read.forEach(assign(i, 'read'));
        sheet.audit.forEach(assign(i, 'audit'));
        sheet.write.forEach(assign(i, 'write'));
        return {sheet: sheet.sheet};
    });
    var scheme = {
        privileges: privileges,
        rubrics: rubrics,
        sheets: s,
        released: false
    };
    // create if it does not already exists
    var db = firebase.database();
    var schemes = db.ref('schemes');
    schemes.once('value', function(schemes) {
      if (schemes.hasChild(id)) {
          document.getElementById('new-error').innerHTML = 'The scheme "' + id + '" already exists!';
          document.getElementById('new-error').style.display = "block";
      }else{
          db.ref('schemes/' + id).set(scheme).then(function(res){
                document.getElementById('new-error').style.display = "none";
                window.location = "../rubric/?id=" + id;
            }).catch(function(error) {
                document.getElementById('new-error').innerHTML = '[' + error.code + '] ' + error.message;
                document.getElementById('new-error').style.display = "block";
          });
      };
    });
};

function init() {
  document.getElementById('new-scheme-form').addEventListener('submit', addNewScheme);
  document.getElementById('scheme-name').value = "test";
  $.ajax({
      url : "/static/examples/rubrics.yaml",
             dataType: "text",
             success : function (data) {
                 $("#scheme-rubrics").text(data);
             }
  });
  $.ajax({
      url : "/static/examples/sheets.yaml",
             dataType: "text",
             success : function (data) {
                 $("#scheme-sheets").text(data);
             }
  });
}

window.addEventListener("load", init, true);