import * as fs from "fs";
import path from "path";
// @ts-ignore
import XLSXChart from "xlsx-chart";

export const BELARUSIAN_ALPHABET = "абвгдеёжзійклмнопрстуўфхцчшыьэюя";

const NAME_KEYWORD = "іван";
const LASTNAME_KEYWORD = "іваноў";

const xlsxChart = new XLSXChart();

export const routeTranspositionEncode = (text: string, tableSize: [number, number]): string  => {
    let table = formEncryptionTable(text, tableSize);
    let result: string = "";

    for (let i = 0; i < table[0].length; i++) {
        for (let j = 0; j < table.length; j++) {
            result += table[j][i];
        }
    }

    return result;
}

export const routeTranspositionDecode = (text: string, tableSize: [number, number]): string  => {
    let table = formDecryptionTable(text, tableSize);
    let result: string = "";

    for (let i = 0; i < table[0].length; i++) {
        for (let j = 0; j < table.length; j++) {
            result += table[j][i];
        }
    }

    return result;
}

export const formEncryptionTable = (text: string, tableSize: [number, number]): string[][] => {
    let cipherTable: string[][] = [];
    let textIndex = 0;

    for (let i = 0; i < tableSize[0]; i++) {
        let row: string[] = [];
        for (let j = 0; j < tableSize[1]; j++) {
            let char = text[textIndex] !== undefined ? text[textIndex] : '';
            row.push(char);
            textIndex++;
        }
        cipherTable.push(row);
    }

    return cipherTable;
}

export const clearText = (text: string): string => {
    let result: string = "";
    for (let i = 0; i < text.length; i++) {
        if (BELARUSIAN_ALPHABET.includes(text[i])) {
            result += text[i];
        }
    }

    return result;
}

const formDecryptionTable = (text: string, tableSize: [number, number]): string[][] => {
    let cipherTable: string[][] = [];
    let textIndex = 0;

    for (let i = 0; i < tableSize[1]; i++) {
        let row: string[] = [];
        for (let j = 0; j < tableSize[0]; j++) {
            let char = text[textIndex] !== undefined ? text[textIndex] : '';
            row.push(char);
            textIndex++;
        }
        cipherTable.push(row);
    }

    return cipherTable;
}

export const formSortedTable = (tableSize: [number, number], table: string[][]) => {
    let sortedTable: string[][] = [];

    const {nameKeywordIndexes, lastnameKeywordIndexes} = transformKeywords(tableSize);

    for (let i = 0; i < nameKeywordIndexes.length; i++) {
        sortedTable[nameKeywordIndexes[i][1]] = table[i];
    }

    table = structuredClone(sortedTable);

    for (let i = 0; i < nameKeywordIndexes.length; i++) {
        for (let j = 0; j < lastnameKeywordIndexes.length; j++) {
            sortedTable[i][lastnameKeywordIndexes[j][1]] = table[i][j];
        }
    }

    return sortedTable;
}

export const multipleTranspositionEncode = (text: string, table: string[][]) => {
    let result: string = "";

    for (let i = 0; i < table[0].length; i++) {
        for (let j = 0; j < table.length; j++) {
            result += table[j][i];
        }
    }

    return result;
}

const transformKeywords = (tableSize: [number, number],) => {
    let resultKeywordName = NAME_KEYWORD.repeat(Math.floor(tableSize[0] / NAME_KEYWORD.length));
    resultKeywordName += NAME_KEYWORD.substring(0, tableSize[0] % NAME_KEYWORD.length);

    let resultKeywordLastName = LASTNAME_KEYWORD.repeat(Math.floor(tableSize[1] / LASTNAME_KEYWORD.length));
    resultKeywordLastName += LASTNAME_KEYWORD.substring(0, tableSize[1] % LASTNAME_KEYWORD.length);

    let nameKeywordIndexes = indexLetters(resultKeywordName);
    let lastnameKeywordIndexes = indexLetters(resultKeywordLastName);

    return {nameKeywordIndexes, lastnameKeywordIndexes}
}

export const multipleTranspositionDecode = (tableSize: [number, number], table: string[][]) => {
    let unsortedTable: string[][] = [];

    let {nameKeywordIndexes, lastnameKeywordIndexes} = transformKeywords(tableSize);

    for (let i = 0; i < nameKeywordIndexes.length; i++) {
        unsortedTable[i] = [];
        for (let j = 0; j < lastnameKeywordIndexes.length; j++) {
            unsortedTable[i][j] = table[i][lastnameKeywordIndexes[j][1]];
        }
    }

    table = structuredClone(unsortedTable);

    for (let i = 0; i < nameKeywordIndexes.length; i++) {
        unsortedTable[i] = table[nameKeywordIndexes[i][1]];
    }



    let result: string = "";

    for (let i = 0; i < unsortedTable.length; i++) {
        for (let j = 0; j < unsortedTable[0].length; j++) {
            result += unsortedTable[i][j];
        }
    }

    return result;
}


const indexLetters = (str: string): [string, number][] => {
    str = str.toLowerCase();

    const indexes: [string, number, number?][] = [];

    let result: [string, number][]  = [];


    for (let i = 0; i < str.length; i++) {
        indexes[i] = [str[i], i];
    }

    indexes.sort((a: [string, number, number?], b: [string, number, number?]) => a[0].localeCompare(b[0]));

    for (let i = 0; i < indexes.length; i++) {
        indexes[i][2] = i;
    }

    for (let i = 0; i < indexes.length; i++) {
        result[indexes[i][1]] = [str[indexes[i][1]], indexes[i][2]!]
    }

    return result;
}

export const factorizeNumber = (num: number): [number, number] => {
    if (isPrime(num)) {
        num++;
    }

    let sqrt = Math.floor(Math.sqrt(num));

    for (let i = sqrt; i >= 1; i--) {
        if (num % i === 0) {
            return [i, num / i];
        }
    }

    return [1, num];
}

const isPrime = (a: number): boolean => {
    if (a < 2)
        return false;

    let square = Math.round(Math.sqrt(a));

    for (let i = 2; i <= square; i++) {
        if (a % i === 0)
            return false;
    }
    return true;
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