import fs from "fs";
import path from "path";
// @ts-ignore
import XLSXChart from "xlsx-chart";

export const LITHUANIAN_ALPHABET: string = "aąbcčdeęėfghiįyjklmnoprsštuųūvzž";
export const BASE64_ALPHABET: string = "BCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const xlsxChart = new XLSXChart();

export const calculateSymbolsFrequency = (file: string, alphabet: string) => {
    let contents = fs.readFileSync(file, {encoding: "utf-8"});

    let resultFrequency: any = {};
    let symbolsCount = 0;

    if (alphabet === LITHUANIAN_ALPHABET) {
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

export const calculateEntropy = (frequency: any): number => {
    let entropyHs = 0;

    for (let symbol in frequency) {
        entropyHs += frequency[symbol] * Math.log2(frequency[symbol]);
    }
    entropyHs *= -1;
    return entropyHs;
}

export const calculateHartleyEntropy = (alphabet: string) => {
    let N = alphabet.length;
    return Math.log2(N);
}

export const calculateRedundancy = (entropyShannon: number, entropyHartley: number) => {
    return (entropyHartley - entropyShannon) / entropyHartley * 100;
}
