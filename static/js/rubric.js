((function(){
"use strict";

var templates = {};

var scoreUpdate = new CustomEvent("score-update", {bubbles: true});

templates.Points = function(rubricID, question, changeFn, updateFn, active){
    var disabled = (active)? '' : 'disabled';
    var form = document.createElement('form');
    form.className = "form-inline";
    form.innerHTML = `<div class="form-group">
                        <input type="text" class="form-control score-input" value="" ${disabled}/>
                        <label>/ <span class="max-input">${question.max}</span></label>
                      </div>`;
    // on change
    if (changeFn){   
        form.getElementsByTagName('input')[0].addEventListener("input", function(e){
            changeFn(form.getElementsByTagName('input')[0].value);
            form.dispatchEvent(scoreUpdate);
        }, true);
    }
    // on update
    if (updateFn){
        updateFn(function(data){
            data = (data)? data : '';
            form.getElementsByTagName('input')[0].value = data;
            form.dispatchEvent(scoreUpdate);
        });
    }
    return form;
};

templates.SelectAll = function(rubricID, question, changeFn, updateFn, active){
    var disabled = (active)? '' : 'disabled';
    var form = document.createElement('form');
    form.innerHTML = question.options.map(function(option, i){
        return `<div class="checkbox ${disabled}">
                  <label>
                    <input type="checkbox" value="${i}" ${disabled}>${option}</input>
                  </label>
                </div>`;
    }).join('');
    // on change
    if (changeFn){
        var elements = form.getElementsByTagName('input');
        for(var i=0; i<elements.length; i++){
            elements[i].addEventListener("change", function(e){
                var data = [];
                for(var j=0; j<elements.length; j++){
                    if (elements[j].checked) data.push(parseInt(elements[j].value));
                }
                changeFn(data);
            }, true);
        }
    }
    // on update
    if (updateFn){
        updateFn(function(data){
            data = (data)? data : [];
            var elements = form.getElementsByTagName('input');
            for(var i=0; i<elements.length; i++){
                elements[i].checked = (data.indexOf(parseInt(elements[i].value))>-1)? 'checked' : '';
            };
        });
    };
    return form;
}

templates.SelectOne = function(rubricID, question, changeFn, updateFn, active){
    var disabled = (active)? '' : 'disabled';
    var form = document.createElement('form');
    form.innerHTML = question.options.map(function(option, i){
        return `<div class="radio">
                  <label>
                    <input type="radio" name="optionsRadios" value="${i}" ${disabled}>${option}</input>
                  </label>
                </div>`;
    }).join('');
    // on change
    if (changeFn){
        var elements = form.getElementsByTagName('input');
        for(var i=0; i<elements.length; i++){
            elements[i].addEventListener("change", function(e){
                changeFn(parseInt(form.querySelector('input:checked').value));
            }, true);
        }
    }
    // on update
    if (updateFn){
        updateFn(function(data){
            var elements = form.getElementsByTagName('input');
            for(var i=0; i<elements.length; i++){
                elements[i].checked = (data === parseInt(elements[i].value))? 'true' : '';
            };
        });
    }
    return form;
}

templates.Comment = function(rubricID, question, changeFn, updateFn, active){
    var disabled = (active)? '' : 'disabled';
    var form = document.createElement('form');
    form.innerHTML = `<textarea class="form-control" rows="5" ${disabled}></textarea>`;
    // on change
    if (changeFn){
        form.getElementsByTagName('textarea')[0].addEventListener("input", function(e){
            changeFn(form.getElementsByTagName('textarea')[0].value);
        }, true);
    }
    // on update
    if (updateFn){
        updateFn(function(data){
            data = (data)? data : '';
            form.getElementsByTagName('textarea')[0].value = data;
        });
    }
    return form;
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

var data = {};

function getSchemeID(){
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    return new Promise(function(resolve, reject){
        resolve(getParameterByName('id'));
    });
}

function getRubrics(){
    return new Promise(function(resolve, reject){
        firebase.database().ref('schemes/' + data.schemeID + '/rubrics').once('value').then(function(snapshot){
            var result = {};
            snapshot.forEach(function(child) {
                result[child.key] = child.val();
            });
            resolve(result);
        }).catch(function(error){
            console.log(error);
        });
    });
};

function getReleased(){
    return new Promise(function(resolve, reject){
        firebase.database().ref('schemes/' + data.schemeID + '/released').once('value').then(function(snapshot){
            resolve(snapshot.val());
        }).catch(function(error){
            console.log(error);
        });
    });
}

function getPrivileges(){
    return new Promise(function(resolve, reject){
        firebase.database().ref('schemes/' + data.schemeID + '/privileges/' + data.user.email.replace(/\./g, '%2E')).once('value').then(function(snapshot){
            var result = {};
            snapshot.forEach(function(child) {
                result[child.key] = child.val();
            });
            resolve(result);
        }).catch(function(error){
            console.log(error);
        });
    });
}

function getSheetIDs(){
    return new Promise(function(resolve, reject){
        var admin = ('admin' in data.privileges)? data.privileges['admin'] : false;
        if (admin){
            firebase.database().ref('schemes/' + data.schemeID + '/sheets').once('value').then(function(snapshot){
                resolve(Object.keys(snapshot.val()));
            }).catch(function(error){
                console.log(error);
            });
        }
        else{
            var searchedPrivileges = (data.released)? ['write','audit','read'] : ['write','audit'];
            var sheetIDs = Object.keys(data.privileges).filter(function(k){
                return (['write','audit','read'].indexOf(data.privileges[k])>-1);
            });
            resolve(sheetIDs);
        }
    });
}

var views = {};

views.rubricOnlyView = function(){
    document.getElementById("main-panel"). innerHTML = '';
    document.getElementById("sidebar"). innerHTML = '';
    Object.keys(data.rubrics).map(function(rubricID){
        var rubric = data.rubrics[rubricID];
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

views.userView = function (){
    document.getElementById("main-panel"). innerHTML = '';
    document.getElementById("sidebar"). innerHTML = '';
    Object.keys(data.sheets).map(function(sheetID){
        var sheet = data.sheets[sheetID];
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
            subli.innerHTML = `<a href="#sheet${sheetID}-rubric${rubricID}">${data.rubrics[rubricID].rubric}</a>`;
            li.getElementsByTagName('ul')[0].appendChild(subli);
            // main
            var rubricElement = document.createElement('div');
            rubricElement.className = 'subgroup';
            rubricElement.id = `sheet${sheetID}-rubric${rubricID}`;
            rubricElement.innerHTML = `<h2>${data.rubrics[rubricID].rubric}</h2>`;
            rubric.questions.forEach(function(question, i){
                var questionElement = document.createElement('div');
                questionElement.innerHTML = `<h3>${data.rubrics[rubricID].questions[i].caption}</h3>`;
                questionElement.appendChild(question);
                rubricElement.appendChild(questionElement);
            });
            section.appendChild(rubricElement);
        });
        section.updateTotalScore();
        document.getElementById("main-panel").appendChild(section);
    });
};

views.compareView = function (){
    document.getElementById("main-panel"). innerHTML = '';
    document.getElementById("sidebar"). innerHTML = '';
    Object.keys(data.rubrics).forEach(function(rubricID){
        var rubric = data.rubrics[rubricID];
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
            Object.keys(data.sheets).forEach(function(sheetID){
                var sheet = data.sheets[sheetID];
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
    })
};

function resetAlerts(){
    [].map.call(document.getElementsByClassName('alert'), function(e){
        e.style.display = "none";
    });
}

function showAlert(type){
    resetAlerts();
    document.getElementById(type).style.display = 'inline-block';
}

function resetReleaseButton(){
    $('#release-toggle  > input').prop( "checked", data.released);
    if (data.privileges && data.privileges['admin']){
        $('#release-toggle > input').prop("disabled", false).click(function(e){
            data.released = $('#release-toggle > input').is(":checked");
            firebase.database().ref('schemes/' + data.schemeID + '/released').set(data.released);
        });
    }else{
        $('#release-toggle > input').prop("disabled", true);
    }
}

function resetViewButton(){
    $('#viewToggle').hide();
    $('.view input[type=radio]:radio[name="userView"]').prop('checked',true);
    $('.view input[type=radio]').on('change', function() {
        views[this.value]();
    });
};

// function resetDownloadButton(){
//     $('#download').hide();
// }

function updateView(){
    // reset alerts
    resetAlerts();
    // reset release button
    resetReleaseButton();
    // reset view button
    resetViewButton();
    // reset download button
    // resetDownloadButton();
    if (!data.user){
        showAlert('main-warning');
        views.rubricOnlyView();
    }else{
        if (Object.keys(data.sheets).length == 0){
            showAlert('main-error');
            views.rubricOnlyView();
        }else{
            // $('#download').show();
            if (Object.keys(data.sheets).length > 1){
                $('#viewToggle').show();
            }
            views.userView();
        }
    }
};

function init(){
    getSchemeID().then(function(schemeID){
        data.schemeID = schemeID;
        Promise.all([getRubrics(), getReleased()]).then(function(l){
            data.rubrics = l[0];
            data.released = l[1];
            firebase.auth().onAuthStateChanged(function(user) {
                data.user = user;
                data.privileges = null;
                data.sheets = null;
                if (!user) updateView();
                else getPrivileges().then(function(privileges){
                    data.privileges = privileges;
                    getSheetIDs().then(function(sheetIDs){
                        data.sheets = {};
                        sheetIDs.forEach(function(sheetID){
                            data.sheets[sheetID] = {rubrics: {}, observer: new SheetObserver(data.schemeID, sheetID)};
                            Object.keys(data.rubrics).forEach(function(rubricID){
                                var rubric = data.rubrics[rubricID];
                                data.sheets[sheetID].rubrics[rubricID] = {caption: rubric.rubric, questions: []};
                                rubric.questions.forEach(function(question, i){
                                    var active = (data.privileges[sheetID] === 'write' || data.privileges['admin'])
                                    var updateFn = function(f){
                                        data.sheets[sheetID].observer.addListener(function(value){
                                            try{
                                                f(value.rubrics[rubricID].questions[i]);
                                            }catch(e){
                                                f(null);
                                            }
                                        });
                                    };
                                    var changeFn = function(value){
                                        console.log('update-sent', value);
                                        firebase.database().ref('schemes/' + data.schemeID + '/sheets/' + sheetID + '/rubrics/' + rubricID + '/questions/' + i).set(value);
                                    };
                                    data.sheets[sheetID].rubrics[rubricID].questions[i] = templates[question.type](rubricID, question, changeFn, updateFn, active);
                                });
                            });
                        });
                        updateView();
                    });
                });
            });
        });
    });
}

window.addEventListener("load", function(){
    init();
    $('body').scrollspy({
        target: '.bs-docs-sidebar',
        offset: 40
    });
}, true);
    
})());

