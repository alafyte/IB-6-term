import * as fs from "fs";
import path from "path";
// @ts-ignore
import XLSXChart from "xlsx-chart";

const CAESAR_KEYWORD = "інфарматыка";
const TRITHEMIUS_KEYWORD = "іван";
export const BELARUSIAN_ALPHABET = "абвгдеёжзійклмнопрстуўфхцчшыьэюя";
const xlsxChart = new XLSXChart();

export const caesarEncode = (text: string, cipherAlphabet: string) => {
    let resultCipher: string = "";
    text = text.toLowerCase();

    for (let i = 0; i < text.length; i++) {
        if (BELARUSIAN_ALPHABET.includes(text[i])) {
            let originalIndex = BELARUSIAN_ALPHABET.indexOf(text[i]);
            resultCipher += cipherAlphabet[originalIndex];
        }
    }

    return resultCipher;
}

export const caesarDecode = (text: string, cipherAlphabet: string): string => {
    let originalText: string = "";

    for (let i = 0; i < text.length; i++) {
        let originalIndex = cipherAlphabet.indexOf(text[i]);
        originalText += BELARUSIAN_ALPHABET[originalIndex];
    }

    return originalText
}

export const formAlphabet = (a: number): string => {
    let result: string = "";
    let buffer: string = "";
    let processedKeyword = Array.from(new Set(CAESAR_KEYWORD)).join('');
    let separatorIndex: number = BELARUSIAN_ALPHABET.length - a;


    for (let i = 0; i < BELARUSIAN_ALPHABET.length; i++) {
        if (i < separatorIndex) {
            if (!processedKeyword.includes(BELARUSIAN_ALPHABET[i])) {
                result += BELARUSIAN_ALPHABET[i];
            }
        } else if (i === separatorIndex) {
            result = processedKeyword + result;
            buffer += BELARUSIAN_ALPHABET[i];
        } else {
            buffer += BELARUSIAN_ALPHABET[i];
        }
    }
    result = buffer + result;
    return result;
}

export const trithemiusEncode = (text: string, trithemiusTable: string[][]): string => {
    const k = trithemiusTable.length;
    let result: string = "";

    text = text.toLowerCase();

    for (let i = 0; i < text.length; i++) {
        if (BELARUSIAN_ALPHABET.includes(text[i])) {
            let currentIndex: [number, number] = getIndexOfK(trithemiusTable, text[i]);

            let newIndex: number[] = [];

            if (currentIndex[0] === k - 1) {
                newIndex = [0, currentIndex[1]];
            } else {
                newIndex = [currentIndex[0] + 1, currentIndex[1]];
            }
            result += trithemiusTable[newIndex[0]][newIndex[1]];
        }
    }

    return result;
}

export const trithemiusDecode = (text: string, trithemiusTable: string[][]): string => {
    const k = trithemiusTable.length;
    let originalText: string = "";

    for (let i = 0; i < text.length; i++) {
        let currentIndex: [number, number] = getIndexOfK(trithemiusTable, text[i]);

        let newIndex: number[] = [];

        if (currentIndex[0] === 0) {
            newIndex = [k - 1, currentIndex[1]];
        } else {
            newIndex = [currentIndex[0] - 1, currentIndex[1]];
        }
        originalText += trithemiusTable[newIndex[0]][newIndex[1]];
    }

    return originalText;
}

const getIndexOfK = (arr: string[][], k: string): [number, number] => {
    for (let i = 0; i < arr.length; i++) {
        let index = arr[i].indexOf(k);
        if (index > -1) {
            return [i, index];
        }
    }
    return [-1, -1];
}

export const formTrithemiusTable = (k: number, m: number) => {
    let resultTable: string[][] = [];
    let keyword: string[] = TRITHEMIUS_KEYWORD.split('');
    let alphabet: string[] = BELARUSIAN_ALPHABET.split('');

    for (let i = 0; i < k; i++) {
        let row: string[] = [];
        for (let j = 0; j < m; j++) {
            if (keyword.length !== 0) {
                row.push(keyword.shift()!);
            } else {
                let symbol = alphabet.shift()!;
                while (TRITHEMIUS_KEYWORD.includes(symbol)) {
                    symbol = alphabet.shift()!;
                }
                row.push(symbol);
            }
        }
        resultTable.push(row);
    }

    return resultTable;
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