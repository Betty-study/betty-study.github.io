//为 Array 对象添加一个去除重复项的方法 
Array.prototype.uniq = function () {
    var hasNaN=function(e){
        return (e!==e)?true :false
    };
    for(var i=0,l=this.length;i<l;i++){
        for(var j=i+1;j<l;j++){
            if((hasNaN(this[i]) && hasNaN(this[j])) || (this[i]===this[j])){
                this.splice(j,1);
                l--;
                j--;
            }
        }
    }
    return this;
}