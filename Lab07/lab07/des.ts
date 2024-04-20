import {Bytes, Hex, util} from "node-forge";
const forge = require('node-forge');
const hexToBinary = require('hex-to-binary');


const iv = forge.random.getBytesSync(8);

export const encrypt = (msg: string, key: Bytes) => {
    const cipher = forge.cipher.createCipher('DES-ECB', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(msg));
    cipher.finish();
    return cipher.output;
};

export const decrypt = (encrypted: util.ByteStringBuffer, key: string) => {
    const decipher = forge.cipher.createDecipher('DES-ECB', key);
    decipher.start({iv: iv});
    decipher.update(encrypted);
    decipher.finish();
    return hex2a(decipher.output.toHex());
};

const hex2a = (hexNumber: Hex) => {
    const hex = hexNumber.toString();
    let str = '';
    for (let i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

export const textToBytes = (text: string): Bytes => {
    return forge.util.hexToBytes(Buffer.from(text).toString('hex'))
}


export const avalancheEffect = (originalText: string, key: Bytes) => {
    let changedBits: number = 0;

    const encryptedText1: string = hexToBinary(encrypt(originalText, key).toHex());

    let stringWithOneBitChanged = convertBinaryToString(invertLastBit(convertStringToBinary(originalText)));
    const encryptedText2: string = hexToBinary(encrypt(stringWithOneBitChanged, key).toHex());

    for (let i = 0; i < encryptedText1.length; i++) {
        if (encryptedText1[i] !== encryptedText2[i]) {
            changedBits++;
        }
    }

    const avalancheEffect = changedBits / encryptedText1.length * 100;
    return {
        avalancheEffect: avalancheEffect,
        stringChanged: stringWithOneBitChanged
    };
}

const invertLastBit = (binaryString: string): string => {
    const lastBit = binaryString[binaryString.length - 1];
    const invertedLastBit = lastBit === "0" ? "1" : "0";
    return binaryString.slice(0, -1) + invertedLastBit;
}


const convertStringToBinary = (str: string): string => {
    let binaryString = "";
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i).toString(2);
        charCode = charCode.length < 8 ? charCode.padStart(8, '0') : charCode;
        binaryString += charCode;
    }

    return binaryString;
}

const convertBinaryToString = (binaryString: string): string => {
    let text = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8);
        const charCode = parseInt(byte, 2);
        const char = String.fromCharCode(charCode);
        text += char;
    }
    return text;
}
