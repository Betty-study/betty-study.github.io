function rgb2hex(sRGB) {
    var arr=['#'];
    var reg=/^rgb\((\d){1,3}\,\s*(\d){1,3}\,\s*(\d){1,3}\)$/;
    var flag;
    
    
    if(reg.test(sRGB)){
        sRGB.replace(/(\d+)/g,function(s,n){
             var num= Number(n);
             if(num>=0 && num<=255){
                 flag=true;
                 n=num.toString(16);
                 n=(n.length==1)?(0+n):n;
                 arr.push(n);    
             }
             else {
                 flag=false;
             }
         }); 
        return flag ? arr.join(''):sRGB
    } else {
        return sRGB;
    }   
}