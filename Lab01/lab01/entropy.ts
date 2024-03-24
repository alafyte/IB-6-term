import fs from "fs";
import path from "path";
// @ts-ignore
import XLSXChart from "xlsx-chart";

export const LITHUANIAN_ALPHABET: string = "aąbcčdeęėfghiįyjklmnoprsštuųūvzž";
export const MACEDONIAN_ALPHABET: string = "абвгдѓежзѕијклљмнњопрстќуфхцчџш";
export const BINARY_ALPHABET: string = "10";

const xlsxChart = new XLSXChart();

export const calculateSymbolsFrequency = (file: string, alphabet: string) => {
    let contents = fs.readFileSync(file, {encoding: "utf-8"});

    let resultFrequency: any = {};
    let symbolsCount = 0;


    if (alphabet === BINARY_ALPHABET) {
        contents = convertStringToBinary(contents);
    } else {
        contents = contents.toLowerCase();
    }

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

export const convertStringToBinary = (str: string): string => {
    let binaryString = "";
    for (let i = 0; i < str.length; i++) {
        binaryString += str.charCodeAt(i).toString(2);
    }

    return binaryString;
}

export const calculateEntropy = (frequency: any): number => {
    let entropyHs = 0;

    for (let symbol in frequency) {
        entropyHs += frequency[symbol] * Math.log2(frequency[symbol]);
    }
    entropyHs *= -1;
    return entropyHs;
}

export const calculateInformationCount = (message: string, alphabetEntropy: number): number => {
    let k = message.length;
    return k * alphabetEntropy;
}

export const calculateEffectiveEntropy = (p: number): number => {
    const q = 1 - p;
    let conditionalEntropy: number = -p * Math.log2(p) - q * Math.log2(q);
    conditionalEntropy = Number.isNaN(conditionalEntropy) ? 0 : conditionalEntropy;
    return 1 - conditionalEntropy;
}
