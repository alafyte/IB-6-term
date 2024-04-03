import * as fs from "fs";
import path from "path";
// @ts-ignore
import XLSXChart from "xlsx-chart";

const xlsxChart = new XLSXChart();

enum Operation {
    ENCRYPT,
    DECRYPT,
}

class Enigma {
    private ALPHABET: string = "abcdefghijklmnopqrstuvwxyz";
    private R_ROTOR: string = "ekmflgdqvzntowyhxuspaibrcj";
    private M_ROTOR: string = "fkqhtlxocbjspdzramewniuygv";
    private L_ROTOR: string = "leyjvcnixwpbqmdrtakzgfuhos";
    private REFLECTOR: { [key: string]: string } = {
        a: 'e', b: 'n', c: 'k', d: 'q', e: 'a', f: 'u',
        g: 'y', h: 'w', i: 'j', j: 'i', k: 'c', l: 'o',
        m: 'p', n: 'b', o: 'l', p: 'm', q: 'd', r: 'x',
        s: 'z', t: 'v', u: 'f', v: 't', w: 'h', x: 'r',
        y: 'g', z: 's'
    }

    private ROTOR_LENGTH = this.ALPHABET.length;

    private L_SHIFT: number = 3;
    private M_SHIFT: number = 1;
    private R_SHIFT: number = 3;

    private lCurrentPosition: number = 0;
    private mCurrentPosition: number = 0;
    private rCurrentPosition: number = 0;

    constructor(lCurrentPosition: number = 0, mCurrentPosition: number = 0, rCurrentPosition: number = 0) {
        this.lCurrentPosition = lCurrentPosition;
        this.mCurrentPosition = mCurrentPosition;
        this.rCurrentPosition = rCurrentPosition;
    }

    public encrypt = (text: string): string => {
        let result: string = "";
        for (let s of text) {
            if (this.ALPHABET.includes(s)) {
                let afterDirect = this.directPath(s, Operation.ENCRYPT);
                let afterReflector = this.passThroughReflector(afterDirect);
                result += this.reversePath(afterReflector, Operation.ENCRYPT);
                this.shiftRotors();
            }
        }
        return result;
    }

    public decrypt = (encryptedText: string): string => {
        let result: string = "";
        for (let s of encryptedText) {
            if (this.ALPHABET.includes(s)) {
                let afterDirect = this.directPath(s, Operation.DECRYPT);
                let afterReflector = this.passThroughReflector(afterDirect);
                result += this.reversePath(afterReflector, Operation.DECRYPT);
                this.shiftRotors();
            }
        }
        return result;
    }

    private directPath = (letter: string, operation: Operation): string => {
        let afterRight;
        let afterMiddle
        switch (operation) {
            case Operation.ENCRYPT:
                afterRight = this.rotorEncrypt(letter, this.ALPHABET, this.R_ROTOR, this.rCurrentPosition);
                afterMiddle = this.rotorEncrypt(afterRight, this.ALPHABET, this.M_ROTOR, this.mCurrentPosition);
                return this.rotorEncrypt(afterMiddle, this.ALPHABET, this.L_ROTOR, this.lCurrentPosition);
            case Operation.DECRYPT:
                afterRight = this.rotorDecrypt(letter, this.ALPHABET, this.R_ROTOR, this.rCurrentPosition);
                afterMiddle = this.rotorDecrypt(afterRight, this.ALPHABET, this.M_ROTOR, this.mCurrentPosition);
                return this.rotorDecrypt(afterMiddle, this.ALPHABET, this.L_ROTOR, this.lCurrentPosition);
        }
    }

    private reversePath = (letter: string, operation: Operation): string => {
        let afterLeft;
        let afterMiddle
        switch (operation) {
            case Operation.ENCRYPT:
                afterLeft = this.rotorEncrypt(letter, this.L_ROTOR, this.ALPHABET, this.lCurrentPosition);
                afterMiddle = this.rotorEncrypt(afterLeft, this.M_ROTOR, this.ALPHABET, this.mCurrentPosition);
                return this.rotorEncrypt(afterMiddle, this.R_ROTOR, this.ALPHABET, this.rCurrentPosition);
            case Operation.DECRYPT:
                afterLeft = this.rotorDecrypt(letter, this.L_ROTOR, this.ALPHABET, this.lCurrentPosition);
                afterMiddle = this.rotorDecrypt(afterLeft, this.M_ROTOR, this.ALPHABET, this.mCurrentPosition);
                return this.rotorDecrypt(afterMiddle, this.R_ROTOR, this.ALPHABET, this.rCurrentPosition);
        }
    }

    private shiftRotors = (): void => {
        this.lCurrentPosition = (this.lCurrentPosition + this.L_SHIFT) % this.ROTOR_LENGTH;
        this.mCurrentPosition = (this.mCurrentPosition + this.M_SHIFT) % this.ROTOR_LENGTH;
        this.rCurrentPosition = (this.rCurrentPosition + this.R_SHIFT) % this.ROTOR_LENGTH;
    }

    private rotorEncrypt = (letter: string, originalAlphabet: string, encryptionAlphabet: string, currentOffset: number): string => {
        let originalIndex: number = originalAlphabet.indexOf(letter);
        return encryptionAlphabet[(originalIndex + currentOffset) % this.ROTOR_LENGTH];
    }

    private rotorDecrypt = (letter: string, originalAlphabet: string, encryptionAlphabet: string, currentOffset: number): string => {
        let originalIndex: number = originalAlphabet.indexOf(letter);
        return encryptionAlphabet[(originalIndex - currentOffset + this.ROTOR_LENGTH) % this.ROTOR_LENGTH];
    }

    private passThroughReflector = (letter: string) => {
        return this.REFLECTOR[letter];
    }
}


export const calculateSymbolsFrequency = (file: string, alphabet: string) => {
    let contents = fs.readFileSync(file, {encoding: "utf-8"});
    contents = contents.toLowerCase();

    let resultFrequency: any = {};
    let symbolsCount = 0;

    for (let i = 0; i < contents.length; i++) {
        let symbol = contents[i];
        if (alphabet.includes(symbol)) {
            if (symbol in resultFrequency) {
                resultFrequency[symbol]++;
            } else {
                resultFrequency[symbol] = 1;
            }
            symbolsCount++;
        }
    }

    for (let key in resultFrequency) {
        resultFrequency[key] = resultFrequency[key] / symbolsCount;
    }
    return {symbolsCount: symbolsCount, resultFrequency: resultFrequency};
}

export const exportHistogram = async (file: string, frequency: any, alphabet: string): Promise<void> => {
    const opts = {
        chart: "column",
        titles: [
            "Частота"
        ],
        fields: alphabet,
        data: {
            "Частота": frequency
        },
        chartTitle: "Частота появления символов в алфавите"
    };
    // @ts-ignore
    await xlsxChart.generate(opts, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                fs.writeFileSync(path.join(__dirname, 'charts', file), data);
                console.log("Chart created.");
            }
        }
    );
}

export default Enigma;