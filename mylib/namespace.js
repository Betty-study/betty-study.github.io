//根据包名，在指定空间中创建对象 
function namespace(oNamespace, sPackage) {
    var objArr=sPackage.split('.');
    for(var i=0,len=objArr.length;i<len;i++){
        if(!(objArr[i] in oNamespace)){
            oNamespace[objArr[i]]={};
        }
        oNamespace=oNamespace[objArr[i]];
    }
    return oNamespace;
}