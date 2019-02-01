(function (){
    "use strict";

    var firebase = (typeof window === 'undefined')? require('firebase') : window.firebase;
    
    var config = {
        apiKey: "AIzaSyAP37fnOs4N5yhRhuCL7LsK0Ev2iv6Rh6I",
        authDomain: "ugrade-cb832.firebaseapp.com",
        databaseURL: "https://ugrade-cb832.firebaseio.com",
        projectId: "ugrade-cb832",
        storageBucket: "ugrade-cb832.appspot.com",
        messagingSenderId: "1075414492997"
    };

    firebase.initializeApp(config);
    
    var normalize = function(data){
        if (Array.isArray(data)) 
               return data.reduce((acc, e, i) =>{
                   acc[i] = normalize(e);
                   return acc;
               }, {});
        else if ((typeof data === "object") && (data !== null)){ 
               Object.keys(data).forEach(key =>{
                   data[key] = normalize(data[key]);
               });
               return data;
        } else return data; 
    };
    
    var gmw = {};
    
    gmw.close = function(){
        firebase.database().goOffline();
    }

    gmw.signUp = function(email, password){
        return firebase.auth().createUserWithEmailAndPassword(email, password);
    }
    
    gmw.signIn = function(email, password){
        return firebase.auth().signInWithEmailAndPassword(email, password);
    }
    
    gmw.signOut = function(){
        firebase.auth().signOut();
    }
    
    gmw.resetPassword = function(email){
        return firebase.auth().sendPasswordResetEmail(email);
    }
    
    gmw.getCurrentUser = function(){
        var user = firebase.auth().currentUser;
        if (user) return user; 
        else return null;
    }
    
    var listeners = [];
    
    gmw.onUserChange = function(f){
        listeners.push(f);
        firebase.auth().onAuthStateChanged(function(user) {
           Promise.all(listeners.map(async (f) => {
               if (user) f(user); 
               else f(null);    
           }));
       });
    }
    
    var Scheme = function(schemeID){
        this.schemeID = schemeID;
    }
        
    gmw.getSchemes = function(){
        return firebase.database().ref('schemes').once('value').then(function(snapshot){
                var schemes = normalize(snapshot.val());
                return Object.keys(schemes).map(function(schemeID){
                    return new Scheme(schemeID);
                });
        });
    }
    
    gmw.removeScheme = function(id){
        return firebase.database().ref('schemes').child(id).remove();
    }
    
    gmw.getScheme = async function(schemeID){
        return new Scheme(schemeID);
    };
    
    Scheme.prototype.getRubrics = function(){
        return firebase.database().ref('schemes/' + this.schemeID + '/rubrics').once('value').then(function(snapshot){
            return normalize(snapshot.val());
        });  
    };
    
    gmw.addScheme = async function(schemeID, rubrics, sheets){
        var schemes = await gmw.getSchemeIDs();
        if (schemes.indexOf(schemeID)>-1) return Promise.reject(new Error('scheme ' + schemeID + ' already exists'));
        var user = gmw.getCurrentUser();
        var privileges = {};
        privileges[user.email.replace(/\./g, '%2E')] = {'admin': true};
        var assign = function(index, role){
            return function(user){
                var k = user.email.replace(/\./g, '%2E');
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
        return firebase.database().ref('schemes/' + schemeID).set(scheme).then(function(){
            return gmw.getScheme(schemeID);
        });
    }
    
    Scheme.prototype.isReleased = function(){
        return firebase.database().ref('schemes/' + this.schemeID + '/released').once('value').then(function(snapshot){
            return snapshot.val();
        });   
    };
    
    Scheme.prototype.setReleased = function(value){
        return firebase.database().ref('schemes/' + this.schemeID + '/released').set(value);
    }
    
    Scheme.prototype.setPrivilege = async function(email, sheetId, privilege){
        return firebase.database().ref('schemes/' + this.schemeID + '/privileges/' + email.replace(/\./g, '%2E') + '/' + sheetId).set(privilege);
    }
    
    Scheme.prototype.getPrivileges = async function(){  
        var user = gmw.getCurrentUser();
        if (!user) return Promise.reject(new Error('you must be logged in to see the privileges'));
        return firebase.database().ref('schemes/' + this.schemeID + '/privileges/' + user.email.replace(/\./g, '%2E')).once('value').then(function(snapshot){
            var privileges = {};
            var hasPrivileges = false;
            snapshot.forEach(function(child) {
                privileges[child.key] = child.val();
                hasPrivileges = true;
            });
            if (!hasPrivileges) return Promise.reject(new Error('you do not have any privilege on this scheme'));
            return privileges;
        });
    }
    
    var Sheet = function(scheme, sheetID, sheet){
        var self = this;
        self.scheme = scheme;
        self.sheetID = sheetID;
        self.sheet = sheet;
    }
    
    Scheme.prototype.getSheets = async function(){
        var self = this;
        var privileges = await self.getPrivileges();
        var isReleased = await self.isReleased();
        var admin = ('admin' in privileges)? privileges['admin'] : false;
        if (admin){
            return firebase.database().ref('schemes/' +  self.schemeID + '/sheets').once('value').then(function(snapshot){
                var sheets = normalize(snapshot.val());
                return Object.keys(sheets).map(function(sheetID){
                    return new Sheet(self, sheetID, sheets[sheetID].sheet);
                });
            });
        }else{
            var searchedPrivileges = (isReleased)? ['write','audit','read'] : ['write','audit'];
            var sheetIDs = Object.keys(privileges).filter(function(k){
                return (searchedPrivileges.indexOf(privileges[k])>-1);
            });
            return Promise.all(sheetIDs.map(function(sheetID){
                return firebase.database().ref('schemes/' +  self.schemeID + '/sheets/' + sheetID).once('value').then(function(snapshot){
                    return new Sheet(self, sheetID, snapshot.val().sheet);
                });
            }));
        }
    };
    
    // Scheme.prototype.getSheet = async function(sheetID){
    //     var sheetIDs = Object.keys(await this.getSheets());
    //     if (sheetIDs.indexOf(sheetID)<0) return Promise.reject(new Error('you do not have access to sheet ' + sheetID));
    //     return new Sheet(this, sheetID, sheets[sheetID].sheet);
    // }
    
    Sheet.prototype.getAnswers = async function(){
        return firebase.database().ref('schemes/' + this.scheme.schemeID + '/sheets/' + this.sheetID + '/rubrics').once('value').then(function(snapshot){
            return normalize(snapshot.val());
        });
    }
    
    Sheet.prototype.setAnswer = async function(rubricID, questionID, value){
       return firebase.database().ref('schemes/' + this.scheme.schemeID + '/sheets/' + this.sheetID + '/rubrics/' + rubricID + '/questions/' + questionID).set(value);
    }
    
    Sheet.prototype.onAnswerChange = async function(rubricID, questionID, f){
        firebase.database().ref('schemes/' + this.scheme.schemeID + '/sheets/' + this.sheetID + '/rubrics/' + rubricID + '/questions/' + questionID).on('value', function(snapshot){
                f(snapshot.val());
        });
    }

    if (typeof exports === 'undefined') window['grademywork']=gmw;
    else module.exports = gmw;

}());
