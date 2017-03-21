function count(str){
 var o={}
 str.replace(/\S/g, function(w){
    !o[w]?o[w]=1:o[w]++;
 });
    
 return o;
}