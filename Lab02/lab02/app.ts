import express from "express";
import {Request, Response} from "express"
import * as fs from "fs";
import path from "path";
import {
    adjustBinaryStrings,
    base64Encode,
    convertBase64ToBinary, convertBinaryToBase64String,
    convertBinaryToString,
    convertStringToBinary,
    xorBinaryStrings
} from "./base64";
import {
    BASE64_ALPHABET,
    calculateEntropy, calculateHartleyEntropy, calculateRedundancy,
    calculateSymbolsFrequency,
    exportHistogram,
    LITHUANIAN_ALPHABET
} from "./entropy";

const app = express();

app.set("view engine", "ejs");

app.get("/", (req : Request, res : Response) => {
    let text = fs.readFileSync(path.join(__dirname, "files", "lithuanian.txt"), {encoding: "utf-8"});
    let base64text = base64Encode(text);
    fs.writeFileSync(path.join(__dirname, "files", 'base64.txt'), base64text);
    res.render('main', {text: base64text});
})

app.get("/entropy", async (req : Request, res : Response) => {
    let result = calculateSymbolsFrequency(path.join(__dirname, 'files', 'lithuanian.txt'), LITHUANIAN_ALPHABET);
    await exportHistogram('lithuanian.xlsx', result.resultFrequency, LITHUANIAN_ALPHABET);
    let entropyS = calculateEntropy(result.resultFrequency);
    let entropyCh = calculateHartleyEntropy(LITHUANIAN_ALPHABET);
    let redundancy = calculateRedundancy(entropyS, entropyCh);
    const lithuanian = {
        entropyS: entropyS.toFixed(2),
        entropyCh: entropyCh.toFixed(2),
        redundancy: redundancy.toFixed(2),
        symbolsCount: result.symbolsCount
    };

    result = calculateSymbolsFrequency(path.join(__dirname, 'files', 'base64.txt'), BASE64_ALPHABET);
    await exportHistogram('base64.xlsx', result.resultFrequency, BASE64_ALPHABET);
    entropyS = calculateEntropy(result.resultFrequency);
    entropyCh = calculateHartleyEntropy(BASE64_ALPHABET);
    redundancy = calculateRedundancy(entropyS, entropyCh);
    const base64 = {
        entropyS: entropyS.toFixed(2),
        entropyCh: entropyCh.toFixed(2),
        redundancy: redundancy.toFixed(2),
        symbolsCount: result.symbolsCount
    };

    res.render('entropy', {
        lithuanian: lithuanian,
        base64: base64
    });
})

app.get('/xor', (req: Request, res: Response) => {
    let stringA = "Ivan";
    let stringB = "Sokolov";
    let result = xorBinaryStrings(convertStringToBinary(stringA), convertStringToBinary(stringB));
    let resultXorB = xorBinaryStrings(result, convertStringToBinary(stringB));

    let {a, b} = adjustBinaryStrings(convertStringToBinary(stringA), convertStringToBinary(stringB));

    const xorASCII = {
        string_a: stringA,
        string_b: stringB,
        a_binary: a,
        b_binary: b,
        result: convertBinaryToString(result),
        result_xor_b_binary: resultXorB,
        result_xor_b: convertBinaryToString(resultXorB),
        result_binary: result
    };

    stringA = base64Encode(stringA);
    stringB = base64Encode(stringB);
    result = xorBinaryStrings(convertBase64ToBinary(stringA), convertBase64ToBinary(stringB));
    resultXorB = xorBinaryStrings(result, convertBase64ToBinary(stringB));

    ({a, b} = adjustBinaryStrings(convertBase64ToBinary(stringA), convertBase64ToBinary(stringB)));

    const xorBase64 = {
        string_a: stringA,
        string_b: stringB,
        a_binary: a,
        b_binary: b,
        result_xor_b_binary: resultXorB,
        result_xor_b: convertBinaryToBase64String(resultXorB),
        result: convertBinaryToBase64String(result),
        result_binary: result
    };

    res.render('xor', {
        xorASCII: xorASCII,
        xorBase64: xorBase64
    });
})

app.listen(3000, () => console.log('Server is running at http://localhost:3000'));