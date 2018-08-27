var templates = (function(){
    
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
            form.querySelector('input').addEventListener("input", function(e){
                changeFn(form.querySelector('input').value);
                // form.dispatchEvent(scoreUpdate);
            }, true);
        }
        // on update
        if (updateFn){
            updateFn(function(data){
                data = (data)? data : '';
                form.querySelector('input').value = data;
                // form.dispatchEvent(scoreUpdate);
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
            var elements = form.querySelectorAll('input');
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
                var elements = form.querySelectorAll('input');
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
            var elements = form.querySelectorAll('input');
            for(var i=0; i<elements.length; i++){
                elements[i].addEventListener("change", function(e){
                    changeFn(parseInt(form.querySelector('input:checked').value));
                }, true);
            }
        }
        // on update
        if (updateFn){
            updateFn(function(data){
                var elements = form.querySelectorAll('input');
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
            form.querySelector('textarea').addEventListener("input", function(e){
                changeFn(form.querySelector('textarea').value);
            }, true);
        }
        // on update
        if (updateFn){
            updateFn(function(data){
                data = (data)? data : '';
                form.querySelector('textarea').value = data;
            });
        }
        return form;
    };
   
    return templates; 

}());


