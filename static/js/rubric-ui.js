(function(){
"use strict";

var views = {};

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
        rubric.questions.forEach(function(question){
            var questionElement = document.createElement('div');
            questionElement.innerHTML = `<h3>${question.caption}</h3>`;
            questionElement.appendChild(templates[question.type](rubricID, question, null, null, false));
            rubricElement.appendChild(questionElement);
        });
        section.appendChild(rubricElement);
        document.getElementById("main-panel").appendChild(section);
    });
};

views.sheetView = function (rubrics, sheets){
    console.log("sheetView");
    Object.keys(sheets).forEach(function(sheetID){
        var sheet = sheets[sheetID];
        // nav
        var li = document.createElement('li');
        li.innerHTML = `<a href="#sheet${sheetID}"></a><ul class="nav nav-stacked"></ul>`;
        document.getElementById("sidebar").appendChild(li);
        sheet.observer.addListener(function(value){
            if (value && 'sheet' in value) li.getElementsByTagName('a')[0].innerHTML = value.sheet;
        });
        // main
        var section = document.createElement('section');
        section.className = 'group';
        section.id = `sheet${sheetID}`;
        var h1 = document.createElement('h1');
        sheet.observer.addListener(function(value){
            if (value && 'sheet' in value) h1.innerHTML = value.sheet;
        });
        section.appendChild(h1);
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
        Object.keys(sheet.rubrics).map(function(rubricID){
            var rubric = sheet.rubrics[rubricID];
            // nav
            var subli = document.createElement('li');
            subli.innerHTML = `<a href="#sheet${sheetID}-rubric${rubricID}">${rubrics[rubricID].rubric}</a>`;
            li.getElementsByTagName('ul')[0].appendChild(subli);
            // main
            var rubricElement = document.createElement('div');
            rubricElement.className = 'subgroup';
            rubricElement.id = `sheet${sheetID}-rubric${rubricID}`;
            rubricElement.innerHTML = `<h2>${rubrics[rubricID].rubric}</h2>`;
            rubric.questions.forEach(function(question, i){
                var questionElement = document.createElement('div');
                questionElement.innerHTML = `<h3>${rubrics[rubricID].questions[i].caption}</h3>`;
                questionElement.appendChild(question);
                rubricElement.appendChild(questionElement);
            });
            section.appendChild(rubricElement);
        });
        section.updateTotalScore();
        document.getElementById("main-panel").appendChild(section);
    });
};

views.compareView = function (rubrics, sheets){
    Object.keys(data.rubrics).forEach(function(rubricID){
        var rubric = rubrics[rubricID];
        // nav
        var li = document.createElement('li');
        li.innerHTML = `<a href="#rubric${rubricID}">${rubric.rubric}</a><ul class="nav nav-stacked"></ul>`;
        document.getElementById("sidebar").appendChild(li);
        // main
        var section = document.createElement('section');
        section.className = 'group';
        section.id = `rubric${rubricID}`;
        var rubricElement = document.createElement('div');
        rubricElement.innerHTML = `<h2>${rubric.rubric}</h2>`;
        rubric.questions.forEach(function(question, i){
            var questionElement = document.createElement('div');
            questionElement.innerHTML = `<h3>${question.caption}</h3>`;
            Object.keys(sheets).forEach(function(sheetID){
                var sheet = sheets[sheetID];
                var sheetElement = document.createElement('div');
                var h4 = document.createElement('h4');
                sheet.observer.addListener(function(value){
                    if (value && 'sheet' in value) h4.innerHTML = value.sheet;
                });
                sheetElement.appendChild(h4);
                sheetElement.appendChild(sheet.rubrics[rubricID].questions[i]);
                questionElement.appendChild(sheetElement);
            });
            rubricElement.appendChild(questionElement);
        });
        section.appendChild(rubricElement);
        document.getElementById("main-panel").appendChild(section);
    });
};

var data = null;

var showError = function(type, message){
    var e =  document.querySelector('#alert-panel .alert-danger');
    e.classList.remove("hidden");
    e.innerHTML = message;
};

var showAlert = function(type, message){
    var e =  document.querySelector('#alert-panel .alert-' + type);
    e.classList.remove("hidden");
    e.innerHTML = message;
};

var updateView = function(){
    document.querySelector("#sidebar").innerHTML = '';
    document.querySelector("#main-panel").innerHTML = '';
    Array.from(document.querySelectorAll("#alert-panel .alert")).forEach(function(e){
        e.classList.add("hidden");
    });
    document.querySelector("#releaseToggle").classList.remove("invisible");
    document.querySelector('#viewToggle').classList.add("invisible");
    var e = document.querySelector("#releaseToggle input");
    e.checked = data.released;
    e.disabled = !(data.privileges && data.privileges['admin']);
    if (!data.user){
        showAlert('info', "Please sign in to the see the results of this grading scheme.");
        return views.rubricOnlyView(data.rubrics);
    }else{
        if (Object.keys(data.sheets).length == 0){
            if (!data.released) showAlert('info', "This grading scheme has not been released yet.");
            else showAlert('danger', "You do not have any access to this grading scheme. Please contact your instructor.");
            return views.rubricOnlyView(data.rubrics);
        }else{
            document.querySelector('#viewToggle').classList.remove("invisible");
            var view = document.querySelector("#viewToggle input[name='options']:checked").value;
            views[view](data.rubrics, data.sheets);
        }
    }
}

window.addEventListener("load", function(){
    api.onUpdate(function(result){
        data = result;
        updateView();
    });
    
    Array.from(document.querySelectorAll("#viewToggle input[name='options']")).forEach(function(radio){
        radio.addEventListener('focus', function(){
            updateView();
        });
    });
    
    document.querySelector("#releaseToggle input").addEventListener('change', function(){
        var e = document.querySelector("#releaseToggle input");
        var value = e.checked;
        api.setReleased(value);
    });
    
    document.querySelector("#main-panel").addEventListener('DOMSubtreeModified', function(){
        if (document.querySelector("#main-panel").innerHTML == ''){
            document.querySelector("#loading-panel").classList.add("hidden");
        };
    });
});

window.addEventListener("load", function(){
    $('body').scrollspy({
        target: '.bs-docs-sidebar',
        offset: 150
    });
});
  
}());

