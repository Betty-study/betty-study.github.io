//用 JavaScript 实现斐波那契数列函数,返回第n个斐波那契数。 f(1) = 1, f(2) = 1 等
function fibonacci(n) {
    if(n==0){
        return 0;
    } else if(n==1){
        return 1  
    } else {
        return  fibonacci(n-1)+fibonacci(n-2);
    }
}