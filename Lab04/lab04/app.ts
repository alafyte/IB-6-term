import express from "express";
import {Request, Response} from 'express';
import {
    BELARUSIAN_ALPHABET,
    caesarDecode,
    caesarEncode,
    calculateSymbolsFrequency,
    exportHistogram, formAlphabet,
    formTrithemiusTable, trithemiusDecode, trithemiusEncode
} from "./cipher";
import * as fs from "fs";
const { performance } = require('perf_hooks');
import path from "path";


const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/", (req: Request, res: Response) => {
    return res.redirect("/caesar");
})

app.get("/caesar", async (req: Request, res: Response) => {
    const alphabet = formAlphabet(2);
    const originalFilePath = path.join(__dirname, "files", "belarusian.txt");
    const caesarFilePath = path.join(__dirname, "files", "belarusian_caesar.txt");

    let text = fs.readFileSync(originalFilePath, {encoding: "utf-8"});
    let originalFrequency = calculateSymbolsFrequency(originalFilePath, BELARUSIAN_ALPHABET);
    await exportHistogram('belarusian.xlsx', originalFrequency.resultFrequency, BELARUSIAN_ALPHABET);

    let startTime = performance.now();
    let caesarText = caesarEncode(text, alphabet);
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    fs.writeFileSync(caesarFilePath, caesarText, {encoding: 'utf8'});
    let caesarFrequency = calculateSymbolsFrequency(caesarFilePath, BELARUSIAN_ALPHABET);
    await exportHistogram('caesar.xlsx', caesarFrequency.resultFrequency, BELARUSIAN_ALPHABET);

    startTime = performance.now();
    let originalText = caesarDecode(caesarText, alphabet);
    endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);

    res.render('caesar', {
        alphabet: alphabet,
        caesarText: caesarText,
        encodingTime: encodingTime,
        originalText: originalText,
        decodingTime: decodingTime
    });
});

app.get('/trithemius', async (req: Request, res: Response) => {
    const table: string[][] = formTrithemiusTable(8, 4);
    const originalFilePath = path.join(__dirname, "files", "belarusian.txt");
    const trithemiusFilePath = path.join(__dirname, "files", "belarusian_trithemius.txt");

    let text = fs.readFileSync(originalFilePath, {encoding: "utf-8"});
    let originalFrequency = calculateSymbolsFrequency(originalFilePath, BELARUSIAN_ALPHABET);
    await exportHistogram('belarusian.xlsx', originalFrequency.resultFrequency, BELARUSIAN_ALPHABET);

    let startTime = performance.now();
    let trithemiusText = trithemiusEncode(text, table);
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    fs.writeFileSync(trithemiusFilePath, trithemiusText, {encoding: 'utf8'});
    let caesarFrequency = calculateSymbolsFrequency(trithemiusFilePath, BELARUSIAN_ALPHABET);
    await exportHistogram('trithemius.xlsx', caesarFrequency.resultFrequency, BELARUSIAN_ALPHABET);

    startTime = performance.now();
    let originalText = trithemiusDecode(trithemiusText, table);
    endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);

    res.render('trithemius', {
        table: table,
        trithemiusText: trithemiusText,
        encodingTime: encodingTime,
        originalText: originalText,
        decodingTime: decodingTime
    });
});


app.listen(3000, () => console.log('Server is running at http://localhost:3000'));