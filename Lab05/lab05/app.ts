import express from 'express';
import {
    BELARUSIAN_ALPHABET,
    calculateSymbolsFrequency, clearText,
    exportHistogram,
    factorizeNumber,
    formEncryptionTable, formSortedTable, multipleTranspositionDecode, multipleTranspositionEncode,
    routeTranspositionDecode,
    routeTranspositionEncode
} from "./cipher";
import * as fs from "fs";
import path from "path";

const app = express();

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    return res.redirect("/transposition");
})

app.get('/transposition', async (req, res) => {
    const originalFilePath = path.join(__dirname, "files", "belarusian.txt");
    const encodedFilePath = path.join(__dirname, "files", "belarusian_transposition.txt");

    let text = fs.readFileSync(originalFilePath, {encoding: "utf-8"});
    text = text.toLowerCase();
    text = clearText(text);

    let originalFrequency = calculateSymbolsFrequency(originalFilePath, BELARUSIAN_ALPHABET);
    await exportHistogram('belarusian.xlsx', originalFrequency.resultFrequency, BELARUSIAN_ALPHABET);

    let tableSize = factorizeNumber(text.length);

    let startTime = performance.now();
    let encodedText: string = routeTranspositionEncode(text, tableSize);
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    fs.writeFileSync(encodedFilePath, encodedText, {encoding: 'utf8'});
    let encodedFrequency = calculateSymbolsFrequency(encodedFilePath, BELARUSIAN_ALPHABET);
    await exportHistogram('transposition.xlsx', encodedFrequency.resultFrequency, BELARUSIAN_ALPHABET);

    startTime = performance.now();
    let originalText = routeTranspositionDecode(encodedText, tableSize);
    endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);

    res.render('routeTransposition', {
        encodedText: encodedText,
        encodingTime: encodingTime,
        originalText: originalText,
        decodingTime: decodingTime
    });
});

app.get('/multiple-transposition', async (req, res) => {
    const originalFilePath = path.join(__dirname, "files", "belarusian.txt");
    const encodedFilePath = path.join(__dirname, "files", "belarusian_multransposition.txt");

    let text = fs.readFileSync(originalFilePath, {encoding: "utf-8"});
    text = text.toLowerCase();
    text = clearText(text);

    let originalFrequency = calculateSymbolsFrequency(originalFilePath, BELARUSIAN_ALPHABET);
    await exportHistogram('belarusian.xlsx', originalFrequency.resultFrequency, BELARUSIAN_ALPHABET);

    let tableSize = factorizeNumber(text.length);
    let table = formEncryptionTable(text, tableSize);

    let startTime = performance.now();
    let sorted = formSortedTable(tableSize, table);
    let encodedText: string = multipleTranspositionEncode(text, sorted);
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    fs.writeFileSync(encodedFilePath, encodedText, {encoding: 'utf8'});
    let encodedFrequency = calculateSymbolsFrequency(encodedFilePath, BELARUSIAN_ALPHABET);
    await exportHistogram('multransposition.xlsx', encodedFrequency.resultFrequency, BELARUSIAN_ALPHABET);

    startTime = performance.now();
    let originalText = multipleTranspositionDecode(tableSize, sorted);
    endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);

    res.render('multipleTransposition', {
        encodedText: encodedText,
        encodingTime: encodingTime,
        originalText: originalText,
        decodingTime: decodingTime
    });
});


app.listen(3000, () => console.log(`Server is running at http://localhost:3000`));