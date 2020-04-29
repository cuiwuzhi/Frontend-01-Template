function convertStringToNumber(string, radix = 10) {
    const numberRegex = /^(\.\d+|(0|[1-9]\d*)(\.\d*)?)([eE][-\+]?\d+)?$|^0[bB][01]+$|^0[oO][0-7]+$|^0[xX][0-9a-fA-F]+$/

    if (!string) {
        return NaN
    }
    if (typeof string !== 'string') {
        throw new Error('str 只能为字符串')
    }
    if (!numberRegex.test(string)) {
        throw new Error('数字不合法')
    }

    if (radix > 10) {
        return;
    }
    let flag = /e|E/.test(string);
    // 判  带 e ||  E 
    if (!flag) {
        let chars = string.split('');
        let number = 0;
        let i = 0;
        while (i < chars.length && chars[i] != '.') {
            number = number * radix;
            number += chars[i].codePointAt(0) - '0'.codePointAt(0);
            i++;
        }
        // 忽略小数
        if (chars[i] === '.') {
            i++;
        }

        // 计算小数位
        let fraction = 1;
        while (i < chars.length) {
            fraction /= radix;
            number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * fraction;
            i++;
        }
        return number;
    } else {
        let logNumber = Number(string.match(/\d+$/)[0]);

        let number = string.match(/^[\d\.]+/)[0].replace(/\./, '');
        if (/e-|E-/.test(string)) {
            return Number(number.padEnd(logNumber + 1, 0));
        } else if (/e+|E+/.test(string)) {
            return Number(number.padEnd(logNumber + 1, 0));
        } else {
            return Number(number.padStart(logNumber + number.length, 0).replace(/^0/, '0.'));
        }
    }
}

