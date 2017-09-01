((function(id){
"use strict";

var observers = [];

var templates = {};

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
             if (form.parentElement) form.parentElement.parentElement.parentElement.updateTotalScore();
        }, true);
    }
    // on update
    if (updateFn){
        updateFn(function(data){
            if (form.parentElement) console.log();
            data = (data)? data : '';
            form.getElementsByTagName('input')[0].value = data;
            if (form.parentElement) form.parentElement.parentElement.parentElement.updateTotalScore();
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
}

function getRubrics(){
    return new Promise(function(resolve, reject){
        firebase.database().ref('schemes/' + id + '/rubrics').once('value').then(function(snapshot){
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

function getPrivileges(user){
    return new Promise(function(resolve, reject){
        firebase.database().ref('schemes/' + id + '/privileges/' + user.email.replace(/\./g, '%2E')).once('value').then(function(snapshot){
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

function getReleased(){
    return new Promise(function(resolve, reject){
        firebase.database().ref('schemes/' + id + '/released').once('value').then(function(snapshot){
            resolve(snapshot.val());
        }).catch(function(error){
            console.log(error);
        });
    });
}

function getSheetIDs(privileges, released){
    return new Promise(function(resolve, reject){
        var admin = ('admin' in privileges)? privileges['admin'] : false;
        if (admin){
            firebase.database().ref('schemes/' + id + '/sheets').once('value').then(function(snapshot){
                resolve(Object.keys(snapshot.val()));
            }).catch(function(error){
                console.log(error);
            });
        }
        else{
            var searchedPrivileges = (released)? ['write','audit','read'] : ['write','audit'];
            var sheetIDs = Object.keys(privileges).filter(function(k){
                return (['write','audit','read'].indexOf(privileges[k])>-1);
            });
            resolve(sheetIDs);
        }
    });
}

var SheetObserver = function(sheetID){
    var self = this;
    self.sheetID = sheetID;
    self.listeners = [];
    self.data = null;
    firebase.database().ref('schemes/' + id + '/sheets/' + sheetID).on('value', function(snapshot){
        self.data = snapshot.val();
        self.listeners.map(function(f){
            f(self.data); 
        });
    });
};

SheetObserver.prototype.update = function(rubricID, questionID, data){
    firebase.database().ref('schemes/' + id + '/sheets/' + sheetID + '/questions/' + questionID).set(data);
};

SheetObserver.prototype.addListener = function(f){
    this.listeners.push(f);
    f(this.data);
};

function generateData(user){
    return new Promise(function(resolve, reject){
        Promise.all([getRubrics(), getReleased(), getPrivileges(user)]).then(function(l){
            var rubrics = l[0];
            var released = l[1];
            var privileges = l[2];
            getSheetIDs(privileges, released).then(function(sheetIDs){
                var sheets = {};
                sheetIDs.forEach(function(sheetID){
                    sheets[sheetID] = {rubrics: {}, observer: new SheetObserver(sheetID)};
                    Object.keys(rubrics).forEach(function(rubricID){
                        var rubric = rubrics[rubricID];
                        sheets[sheetID].rubrics[rubricID] = {caption: rubric.rubric, questions: []};
                        rubric.questions.forEach(function(question, i){
                            var active = (privileges[sheetID] === 'write' || privileges['admin'])
                            var updateFn = function(f){
                                sheets[sheetID].observer.addListener(function(data){
                                    try{
                                        f(data.rubrics[rubricID].questions[i]);
                                    }catch(e){
                                        f(null);
                                    }
                                });
                            };
                            var changeFn = function(data){
                                console.log('update-sent', data);
                                firebase.database().ref('schemes/' + id + '/sheets/' + sheetID + '/rubrics/' + rubricID + '/questions/' + i).set(data);
                            };
                            sheets[sheetID].rubrics[rubricID].questions[i] = templates[question.type](rubricID, question, changeFn, updateFn, active);
                        });
                    });
                });
                resolve({
                    rubrics: rubrics,
                    released: released,
                    privileges: privileges,
                    sheets: sheets
                });
            });
        });
    })
};

function nonAuthenticatedView(){
    document.getElementById("main-panel"). innerHTML = '';
    document.getElementById("sidebar"). innerHTML = '';
    getRubrics().then(function(rubrics){
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
    });
};

function sheetView(data){
    document.getElementById("main-panel"). innerHTML = '';
    document.getElementById("sidebar"). innerHTML = '';
    Object.keys(data.sheets).map(function(sheetID){
        var sheet = data.sheets[sheetID];
        // nav
        var li = document.createElement('li');
        li.innerHTML = `<a href="#sheet${sheetID}"></a><ul class="nav nav-stacked"></ul>`;
        document.getElementById("sidebar").appendChild(li);
        sheet.observer.addListener(function(data){
            if (data && 'sheet' in data) li.getElementsByTagName('a')[0].innerHTML = data.sheet;
        });
        // main
        var section = document.createElement('section');
        section.className = 'group';
        section.id = `sheet${sheetID}`;
        var h1 = document.createElement('h1');
        sheet.observer.addListener(function(data){
            if (data && 'sheet' in data) h1.innerHTML = data.sheet;
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

function rubricView(data){
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
                sheet.observer.addListener(function(data){
                    if (data && 'caption' in data) h4.innerHTML = data.caption;
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

function activateCompareButton(data){
    $(".bs-docs-sidebar > .nav").css("margin-top", 50);
    $('#view-toggle').show().click(function() {
        $(this).toggleClass('btn-primary').toggleClass('btn-default').toggleClass('active');
        var compare = $(this).hasClass('active');
        if (compare){
            rubricView(data);
        }else{
            sheetView(data);
        }
    });
}

function init() {
  // var mode = getParameterByName('mode');
  firebase.auth().onAuthStateChanged(function(user) {
    var alerts = document.getElementsByClassName('alert');
    for(var i=0; i < alerts.length; i++){
            alerts[i].style.display = "none";
    }
    if (!user) {
        document.getElementById('main-warning').style.display = 'inline-block';
        nonAuthenticatedView();
    } else {
        generateData(user).then(function(data){
            if (Object.keys(data.sheets).length === 0){
                document.getElementById('main-error').style.display = 'inline-block';
                nonAuthenticatedView();
            }else{
                if (Object.keys(data.sheets).length > 1) activateCompareButton(data);
                if (data.released){
                     document.getElementById('main-success').style.display = 'inline-block';
                }else{
                     document.getElementById('main-info').style.display = 'inline-block';
                }
                sheetView(data);
            }
        });
    }
  });
  $('body').scrollspy({
      target: '.bs-docs-sidebar',
      offset: 40
  });
  
}

window.addEventListener("load", init, true);
    
})(
   ((function(){
       // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
       function getParameterByName(name, url) {
           if (!url) url = window.location.href;
           name = name.replace(/[\[\]]/g, "\\$&");
           var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
               results = regex.exec(url);
           if (!results) return null;
           if (!results[2]) return '';
           return decodeURIComponent(results[2].replace(/\+/g, " "));
       };
       return getParameterByName('id');
   })())
));

