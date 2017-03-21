//获取 url 中的参数
//1. 指定参数名称，返回该参数的值 或者 空字符串
//2. 不指定参数名称，返回全部的参数对象 或者 {}
//3. 如果存在多个同名参数，则返回数组 

function getUrlParam(sUrl, sKey) {
			    var paramStr=sUrl.slice(sUrl.indexOf('?')+1, sUrl.indexOf('#'));
			    var paramArr=paramStr.split('&');
			    var keyObj={};
			    
			    //{key:[1,2,3], test:4};
			    for(var i=0,len=paramArr.length; i < len;i++){
			        (function(i){
			            var k=paramArr[i].slice(0,paramArr[i].indexOf('=')),
			                v=paramArr[i].slice(paramArr[i].indexOf('=')+1); 
			            
			            if(keyObj[k]){
			            	var t=keyObj[k];
			            	keyObj[k]=[].concat(t,v);
			            } else {
							keyObj[k]=v;
			            }
			            
			        })(i)
			    }
			   if(sKey){
			   	return keyObj[sKey] || '';
			   } else {
                   return keyObj || {};
			   }
			}