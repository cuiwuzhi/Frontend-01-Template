function convertNumberToString(number: number, radix: number = 10) {
    let integer = Math.floor(number);
    let fraction: any = String(number).match(/\.\d+$/);
    if (fraction) {
        fraction = fraction[0].replace('.', '');
    }
    let string = '';
    while (integer > 0) {
        string = String(integer % radix) + string;
        integer = Math.floor(integer / radix);
    }
    return fraction ? `${string}.${fraction}` : string;
}

// 快捷方法
let num = 12.323;
let eNum = 1e+33;
let numToStr = num + '';
console.log(numToStr) // "12.323"
console.log(eNum + '') // "1e+33"
console.log(eNum.toString())  // "1e+33"
console.log(1e+33.toString() == 1e+33 + '') // true