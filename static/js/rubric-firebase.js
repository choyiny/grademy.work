var api = (function(){
    "use strict";
    
    var schemeID = (function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }('id'));

    if (!schemeID) return;
        
    function getRubrics(){
        return firebase.database().ref('schemes/' + schemeID + '/rubrics').once('value').then(function(snapshot){
            var rubrics = {};
            snapshot.forEach(function(child) {
                rubrics[child.key] = child.val();
            });
            return rubrics;
        });
    };
    
    function getReleased(){
        return firebase.database().ref('schemes/' + schemeID + '/released').once('value').then(function(snapshot){
            return snapshot.val(); 
        });
    };
    
    function getPrivileges(user){
        if (!user || !user.emailVerified) return Promise.resolve(null);
        return firebase.database().ref('schemes/' + schemeID + '/privileges/' + user.email.replace(/\./g, '%2E')).once('value').then(function(snapshot){
            var privileges = {};
            snapshot.forEach(function(child) {
                privileges[child.key] = child.val();
            });
            return privileges;
        });
    };
    
    function getSheetIDs(released, privileges){
        if (!privileges) return Promise.resolve(null);
        var admin = ('admin' in privileges)? privileges['admin'] : false;
        if (!admin){
            var searchedPrivileges = (released)? ['write','audit','read'] : ['write','audit'];
            var sheetIDs = Object.keys(privileges).filter(function(k){
                return (['write','audit','read'].indexOf(privileges[k])>-1);
            });
            return Promise.resolve(sheetIDs);
        }
        return firebase.database().ref('schemes/' +  schemeID + '/sheets').once('value').then(function(snapshot){
                var sheetIDs = Object.keys(snapshot.val());
                return sheetIDs;
        });
    };
    
    var SheetObserver = function(schemeID, sheetID){
        var self = this;
        self.sheetID = sheetID;
        self.listeners = [];
        self.value = null;
        firebase.database().ref('schemes/' + schemeID + '/sheets/' + sheetID).on('value', function(snapshot){
            self.value = snapshot.val();
            self.listeners.map(function(f){
                f(self.value);
            });
        });
    };

    SheetObserver.prototype.addListener = function(f){
        this.listeners.push(f);
        f(this.value);
    };
    
    function getSheets(rubrics, privileges, sheetIDs){
        if (!privileges) return null;
        var sheets = {};
        sheetIDs.forEach(function(sheetID){
            sheets[sheetID] = {rubrics: {}, observer: new SheetObserver(schemeID, sheetID)};
            Object.keys(rubrics).forEach(function(rubricID){
                var rubric = rubrics[rubricID];
                sheets[sheetID].rubrics[rubricID] = {caption: rubric.rubric, questions: []};
                rubric.questions.forEach(function(question, i){
                    var active = (privileges[sheetID] === 'write' || privileges['admin'])
                    var updateFn = function(f){
                        sheets[sheetID].observer.addListener(function(value){
                            try{
                                f(value.rubrics[rubricID].questions[i]);
                            }catch(e){
                                f(null);
                            }
                        });
                    };
                    var changeFn = function(value){
                        console.log('update-sent', value);
                        firebase.database().ref('schemes/' + schemeID + '/sheets/' + sheetID + '/rubrics/' + rubricID + '/questions/' + i).set(value);
                    };
                    sheets[sheetID].rubrics[rubricID].questions[i] = templates[question.type](rubricID, question, changeFn, updateFn, active);
                });
            });
        });
        return sheets;
    };
    
    var handlers = [];
    
    function notify(data){
        handlers.forEach(function(handler){
            handler(data);
        });
    };
    
    function onUpdate(handler){
        handlers.push(handler);
    };
    
    function setReleased(value){
        return firebase.database().ref('schemes/' + schemeID + '/released').set(value);
    }
    
    getRubrics().then(function(rubrics){
        getReleased().then(function(released){
            firebase.auth().onAuthStateChanged(function(user) {
                    getPrivileges(user).then(function(privileges){
                        getSheetIDs(released, privileges).then(function(sheetIDs){                        
                            var sheets = getSheets(rubrics, privileges, sheetIDs);
                            notify({user, rubrics, released, privileges, sheets});
                        });
                    });
            });
        });
    })
    
    return {onUpdate, setReleased};
    
}());

