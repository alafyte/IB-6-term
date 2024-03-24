const base64chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export const base64Encode = (s: string) => {
    let r = "";
    let p = "";
    let c = s.length % 3;
    if (c > 0) {
        for (; c < 3; c++) {
            p += '=';
            s += "\0";
        }
    }

    for (c = 0; c < s.length; c += 3) {
        if (c > 0 && (c / 3 * 4) % 76 == 0) {
            r += "\r\n";
        }
        let n: number = (s.charCodeAt(c) << 16) + (s.charCodeAt(c + 1) << 8) + s.charCodeAt(c + 2);
        let chars: number[] = [(n >>> 18) & 63, (n >>> 12) & 63, (n >>> 6) & 63, n & 63];
        r += base64chars[chars[0]] + base64chars[chars[1]] + base64chars[chars[2]] + base64chars[chars[3]];
    }
    return r.substring(0, r.length - p.length) + p;
}

export const convertBase64ToBinary = (base64String: string) => {
    let binaryString = "";
    for (let i = 0; i < base64String.length; i++) {
        let base64Char = base64String[i];
        if (base64Char === "=") {
            binaryString += '0'.repeat(6);
        } else {
            let index = base64chars.indexOf(base64Char);
            let charBinary = index.toString(2);
            charBinary = charBinary.length < 6 ? charBinary.padStart(6, '0') : charBinary;
            binaryString += charBinary;
        }
    }
    return binaryString;
}

export const convertBinaryToBase64String = (binaryString: string): string => {
    let text = convertBinaryToString(binaryString).replace(/\x00/g, '');
    return base64Encode(text);
}


export const convertStringToBinary = (str: string): string => {
    let binaryString = "";
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i).toString(2);
        charCode = charCode.length < 8 ? charCode.padStart(8, '0') : charCode;
        binaryString += charCode;
    }

    return binaryString;
}

export const convertBinaryToString = (binaryString: string): string => {
    let text = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8);
        const charCode = parseInt(byte, 2);
        const char = String.fromCharCode(charCode);
        text += char;
    }
    return text;
}

export const xorBinaryStrings = (a: string, b: string) => {
    const maxLength = Math.max(a.length, b.length);
    let result = '';
    for (let i = 0; i < maxLength; i++) {
        const charCodeA = i < a.length ? Number(a.charAt(i)) : 0;
        const charCodeB = i < b.length ? Number(b.charAt(i)) : 0;
        result += +((charCodeA && !charCodeB) || (!charCodeA && charCodeB));
    }
    return result;
}

export const adjustBinaryStrings = (a: string, b: string) => {
    if (a.length > b.length) {
        b += "0".repeat(a.length - b.length);
    } else if (a.length < b.length) {
        a += "0".repeat(b.length - a.length);
    }
    return {a: a, b: b};
}