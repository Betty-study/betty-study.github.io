//找出数组 arr 中重复出现过的元素 
//输入例子:
//duplicates([1, 2, 4, 4, 3, 3, 1, 5, 3]).sort()
//
//输出例子:
//[1, 3, 4]

function duplicates(arr) {
    var res=[];
    arr.forEach(function(item,index,arr){
        if(arr.indexOf(item)!==arr.lastIndexOf(item) && res.indexOf(item)==-1){
            res.push(item);
        }
    })
    return res;
}