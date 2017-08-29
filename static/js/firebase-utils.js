(function(exports){

   exports.normalize = function normalize(data){
       if (data.isArray()) return data.reduce(function(acc, e, i){
           acc[i] = e;
           return acc;
       }, {});
    };
})(typeof exports === 'undefined'? this['mymodule']={}: exports);