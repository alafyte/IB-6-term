import express from "express";

import path from "path";

import {
    BINARY_ALPHABET, calculateEffectiveEntropy,
    calculateEntropy, calculateInformationCount,
    calculateSymbolsFrequency, convertStringToBinary,
    exportHistogram,
    LITHUANIAN_ALPHABET,
    MACEDONIAN_ALPHABET
} from "./entropy";

const app = express();
app.set("view engine", "ejs");


app.get("/", async (req, res) => {
    let result = calculateSymbolsFrequency(path.join(__dirname, 'files', 'lithuanian.txt'), LITHUANIAN_ALPHABET);
    await exportHistogram('lithuanian.xlsx', result.resultFrequency, LITHUANIAN_ALPHABET);
    let entropy = calculateEntropy(result.resultFrequency);
    const lithuanian = {
        entropy: entropy.toFixed(2), symbolsCount: result.symbolsCount
    };

    result = calculateSymbolsFrequency(path.join(__dirname, 'files', 'macedonian.txt'), MACEDONIAN_ALPHABET);
    await exportHistogram('macedonian.xlsx', result.resultFrequency, MACEDONIAN_ALPHABET);
    entropy = calculateEntropy(result.resultFrequency);
    const macedonian = {
        entropy: entropy.toFixed(2), symbolsCount: result.symbolsCount
    };

    result = calculateSymbolsFrequency(path.join(__dirname, 'files', 'lithuanian.txt'), BINARY_ALPHABET);
    entropy = calculateEntropy(result.resultFrequency);
    const binary = {
        entropy: entropy.toFixed(2), symbolsCount: result.symbolsCount
    };


    const informationCountLithuanian = calculateInformationCount("Ivanovas Ivanas Ivanovičius", +lithuanian.entropy).toFixed(2);
    const informationCountMacedonian = calculateInformationCount("Иванов Иван Иванович", +macedonian.entropy).toFixed(2);

    let message = convertStringToBinary("Ivanovas Ivanas Ivanovičius");

    const informationCountBinary = calculateInformationCount(message, +binary.entropy).toFixed(2);

    const effectiveEntropyCase1 = calculateEffectiveEntropy(0.1);
    const effectiveEntropyCase2 = calculateEffectiveEntropy(0.5);
    const effectiveEntropyCase3 = calculateEffectiveEntropy(1);

    const informationCountCase1 = calculateInformationCount(message, effectiveEntropyCase1);
    const informationCountCase2 = calculateInformationCount(message, effectiveEntropyCase2);
    const informationCountCase3 = calculateInformationCount(message, effectiveEntropyCase3);

    const entropyWithError = {
        effectiveEntropyCase1: effectiveEntropyCase1.toFixed(2),
        effectiveEntropyCase2: effectiveEntropyCase2,
        effectiveEntropyCase3: effectiveEntropyCase3,
        informationCountCase1: informationCountCase1.toFixed(2),
        informationCountCase2: informationCountCase2,
        informationCountCase3: informationCountCase3,
    }

    res.render('main', {
        lithuanian: lithuanian,
        macedonian: macedonian,
        binary: binary,
        informationCountLithuanian: informationCountLithuanian,
        informationCountMacedonian: informationCountMacedonian,
        informationCountBinary: informationCountBinary,
        entropyWithError: entropyWithError
    });
});

app.listen(3000, () => console.log('Server is running at http://localhost:3000'));