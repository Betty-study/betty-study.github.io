function formatDate(oDate, sFormation) {
    var weeks=['日', '一', '二', '三', '四', '五', '六'];
    var res;
    
    var yy=oDate.getFullYear(),
        mth=oDate.getMonth()+1,
        dd=oDate.getDate(),
        hh=oDate.getHours(),
    	mm=oDate.getMinutes(),
        ss=oDate.getSeconds(),
    	ww=oDate.getDay();
    
   //格式化日期，补位
    var dFormat=function(date,format){
			return format.length==2 && date<10?'0'+date:date;
	     };
	     
	//查找退换
    res=sFormation.replace(/(y{2}){1,2}/,function(y){
                    y=y.length==2?yy.toString().slice(2):yy;
                    return y;
                })
                .replace(/M{1,2}/,function(M){
                    return dFormat(mth,M);
                })
                .replace(/d{1,2}/,function(d){
                    return dFormat(dd,d);
                })
    			.replace(/[hH]{1,2}/,function(h){
 					if(h.indexOf('h')!=-1 && hh>12){
        				hh=hh-12;
    				}
    				return dFormat(hh,h);
    			})
    			.replace(/m{1,2}/,function(m){
                  	return dFormat(mm,m);  
                })
    			.replace(/s{1,2}/,function(s){
                    return dFormat(ss,s);
                })
    			.replace(/[w]/,function(w){
                    return weeks[ww];
                });
    return res; 
}
formatDate(new Date(1409894060000), 'yyyy-MM-dd h:mm:ss 星期w')