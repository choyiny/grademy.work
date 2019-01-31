(function(){
"use strict";


let showSheet = function(rubrics, privileges, sheet){
    // title 
    document.getElementById('title-panel').innerHTML = `<h1>${sheet.sheet}</h1>`;
    document.getElementById("main-panel").innerHTML = '';
    // main
    var section = document.createElement('section');
    section.className = 'group';
    section.id = `sheet${sheet.sheetID}`;
    var totalScore = document.createElement('div');
    totalScore.className = 'total-score';
    totalScore.innerHTML = `Total : <span class='student-score'>0</span> / <span class='max-score'>0</span></div>`;
    section.appendChild(totalScore);
    section.updateTotalScore = function(){
        var self = this;
        var score = [].reduce.call(self.querySelectorAll('.score-input'), function(acc, e){
            return acc + parseInt(e.value? e.value : 0);
        }, 0);
        self.getElementsByClassName('student-score')[0].innerHTML = score;
        var max = [].reduce.call(self.querySelectorAll('.max-input'), function(acc, e){
            return acc + parseInt(e.innerHTML? e.innerHTML : 0);
        }, 0);
        self.getElementsByClassName('max-score')[0].innerHTML = max;
    };
    section.addEventListener('score-update', section.updateTotalScore);
    var li = document.querySelector('#sidebar #sheetlink' + sheet.sheetID);
    Object.keys(rubrics).map(function(rubricID){
        var rubric = rubrics[rubricID];
        // nav
        var subli = document.createElement('li');
        subli.innerHTML = `<a href="#sheet${sheet.sheetID}-rubric${rubricID}">${rubrics[rubricID].rubric}</a>`;
        li.getElementsByTagName('ul')[0].appendChild(subli);
        // main
        var rubricElement = document.createElement('div');
        rubricElement.className = 'subgroup';
        rubricElement.id = `sheet${sheet.sheetID}-rubric${rubricID}`;
        rubricElement.innerHTML = `<h2>${rubrics[rubricID].rubric}</h2>`;
        Object.keys(rubric.questions).forEach(function(questionID){
            var question = rubric.questions[questionID];
            var questionElement = document.createElement('div');
            questionElement.innerHTML = `<h3>${question.caption}</h3>`;
            var active = (privileges[sheet.sheetID] === 'write' || privileges['admin'])            
            var updateFn = function(f){
                sheet.onAnswerChange(rubricID, questionID, f);
            };
            var changeFn = function(value){
                console.log('change:', rubricID, questionID, value);
                sheet.setAnswer(rubricID, questionID, value);
            };
            questionElement.appendChild(templates[question.type](rubricID, question, changeFn, updateFn, active));
            rubricElement.appendChild(questionElement);
        });
        section.appendChild(rubricElement);
    });
    section.updateTotalScore();
    document.getElementById("main-panel").appendChild(section);
    // panel.scrollTop = 0;
    // $('body').scrollspy("refresh");
    // window.scrollTo(0, 1);
}

var views = {};

views.sheetView = function (rubrics, privileges, sheets){
    console.log("sheetView");
    var first = null;
    sheets.forEach(function(sheet){
        if (!first) first=sheet.sheetID;
        // nav
        var li = document.createElement('li');
        li.id = "sheetlink" + sheet.sheetID;
        li.innerHTML = `<a href="#sheet${sheet.sheetID}">${sheet.sheet}</a><ul class="nav nav-stacked"></ul>`;
        document.getElementById("sidebar").appendChild(li);
    });
    window.addEventListener("hashchange", function(){
        var clean = window.location.hash.split('-')[0];
        var sheetID = clean.split('#sheet')[1];
        var sheet = sheets.find(function(sheet){
            return sheetID == sheet.sheetID;
        });
        showSheet(rubrics, privileges, sheet);
        window.scrollTo(0, 0);
    });
    
    var currentSheetID = window.location.hash.split('#sheet')[1];
    if (currentSheetID == null) return location.hash = "#sheet" + first;
    var currentSheet = sheets.find(function(sheet){
        return currentSheetID == sheet.sheetID;
    });
    if (!currentSheet) return location.hash = "#sheet" + first;
    window.dispatchEvent(new Event('hashchange'));
};

views.rubricOnlyView = function(rubrics){
    console.log("rubricOnlyView");
    Object.keys(rubrics).map(function(rubricID){
        var rubric = rubrics[rubricID];
        // nav
        var li = document.createElement('li');
        li.innerHTML = `<a href="#rubric${rubricID}">${rubric.rubric}</a>`;
        document.getElementById("sidebar").appendChild(li);
        // main-panel
        var section = document.createElement('section');
        section.className = 'group';
        section.id = `rubric${rubricID}`;
        var rubricElement = document.createElement('div');
        rubricElement.innerHTML = `<h2>${rubric.rubric}</h2>`;
        Object.keys(rubric.questions).forEach(function(questionID){
            var question = rubric.questions[questionID];
            var questionElement = document.createElement('div');
            questionElement.innerHTML = `<h3>${question.caption}</h3>`;
            questionElement.appendChild(templates[question.type](rubricID, question, null, null, false));
            rubricElement.appendChild(questionElement);
        });
        section.appendChild(rubricElement);
        document.getElementById("main-panel").appendChild(section);
    });
};

// views.compareView = function (rubrics, sheets){
//     Object.keys(data.rubrics).forEach(function(rubricID){
//         var rubric = rubrics[rubricID];
//         // nav
//         var li = document.createElement('li');
//         li.innerHTML = `<a href="#rubric${rubricID}">${rubric.rubric}</a><ul class="nav nav-stacked"></ul>`;
//         document.getElementById("sidebar").appendChild(li);
//         // main
//         var section = document.createElement('section');
//         section.className = 'group';
//         section.id = `rubric${rubricID}`;
//         var rubricElement = document.createElement('div');
//         rubricElement.innerHTML = `<h2>${rubric.rubric}</h2>`;
//         rubric.questions.forEach(function(question, i){
//             var questionElement = document.createElement('div');
//             questionElement.innerHTML = `<h3>${question.caption}</h3>`;
//             Object.keys(sheets).forEach(function(sheetID){
//                 var sheet = sheets[sheetID];
//                 var sheetElement = document.createElement('div');
//                 var h4 = document.createElement('h4');
//                 sheet.observer.addListener(function(value){
//                     if (value && 'sheet' in value) h4.innerHTML = value.sheet;
//                 });
//                 sheetElement.appendChild(h4);
//                 sheetElement.appendChild(sheet.rubrics[rubricID].questions[i]);
//                 questionElement.appendChild(sheetElement);
//             });
//             rubricElement.appendChild(questionElement);
//         });
//         section.appendChild(rubricElement);
//         document.getElementById("main-panel").appendChild(section);
//     });
// };

var showAlert = function(type, message){
    var e =  document.querySelector('#rubric-alert-panel .alert-' + type);
    e.classList.remove("hidden");
    e.innerHTML = message;
};

var updateView = function(isReleased, rubrics, user, privileges, sheets){
    document.getElementById('title-panel').innerHTML = '';
    document.getElementById("sidebar").innerHTML = '';
    document.getElementById("main-panel");
    Array.from(document.querySelectorAll("#rubric-alert-panel .alert")).forEach(function(e){
        e.classList.add("hidden");
    });
    document.querySelector("#releaseToggle").classList.remove("invisible");
    // document.querySelector('#viewToggle').classList.add("invisible");
    var e = document.querySelector("#releaseToggle input");
    e.checked = isReleased;
    e.disabled = !(privileges && privileges['admin']);
    if (!user){
        showAlert('info', "Please sign in to the see the results of this grading scheme.");
        return views.rubricOnlyView(rubrics);
    }else{
        if (!user.emailVerified){
            showAlert('danger', "Your email is not verified. <a href='#' id='send-email-button'> Click here to send a verification email </a>");            
            document.getElementById('send-email-button').addEventListener('click', function(e){
                e.preventDefault();
                gmw.resetPassword(user.email).then(function() {
                    showAlert('success', 'Email was sent, please check your email');
                }).catch(function(error) {
                   showAlert('danger', '[' + error.code + '] ' + error.message);
                });
            });
        }else{
            if (Object.keys(sheets).length == 0){
                if (!isReleased) showAlert('info', "This grading scheme has not been released yet.");
                else showAlert('danger', "You do not have any access to this grading scheme. Please contact your instructor.");
                return views.rubricOnlyView(rubrics);
            }else{
                return views.sheetView(rubrics, privileges, sheets);
                // document.querySelector('#viewToggle').classList.remove("invisible");
                // var view = document.querySelector("#viewToggle input[name='options']:checked").value;
                // views[view](rubrics, sheets);
            }
        }
    }
}

var schemeID = (function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}('id'));
    
window.addEventListener("load", async function(){
        
    var scheme = await grademywork.getScheme(schemeID);
    var rubrics = await scheme.getRubrics();
    var isReleased = await scheme.isReleased();
    
    document.querySelector("#releaseToggle input").addEventListener('change', function(){
        var e = document.querySelector("#releaseToggle input");
        var value = e.checked;
        scheme.setReleased(value);
    });
    
    grademywork.onUserChange(async function(user) {
       if (!user) return updateView(isReleased, rubrics);
       var privileges = await scheme.getPrivileges();
       var sheets = await scheme.getSheets();
       return updateView(isReleased, rubrics, user, privileges, sheets);
    });
    
//     Array.from(document.querySelectorAll("#viewToggle input[name='options']")).forEach(function(radio){
//         radio.addEventListener('focus', function(){
//             updateView();
//         });
//     });

});

// window.addEventListener("load", function(){
//     $('body').scrollspy({
//         target: '.bs-docs-sidebar',
//         // offset: 150
//     });
// });

}());

