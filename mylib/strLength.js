//如果第二个参数 bUnicode255For1 === true，则所有字符长度为 1
//否则如果字符 Unicode 编码 > 255 则长度为 2 
function strLength(s, bUnicode255For1) {
    var len=0;
    if(bUnicode255For1){
        len=s.length;
    } else {
        for(var i=0,l=s.length;i<l;i++){
            if(s.charCodeAt(i)>255){
                len+=2;
            } else {
                len++;
            }
        }
    }
    return len;
}