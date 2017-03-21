function cssStyle2DomStyle(sName) {
    return sName.replace(/(?!^)\b\-(\w)(\w+)/g,function(a,b,c){
           return b.toUpperCase()+c.toLowerCase();
        }).replace(/\-/g,'');
}