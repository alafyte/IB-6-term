import express from 'express';
import * as fs from "fs";
import path from "path";
import Enigma, {calculateSymbolsFrequency, exportHistogram} from "./enigma";

const app = express();

const ROTORS = {
    L: 0,
    M: 0,
    R: 0
}

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('enigma', {rotors: ROTORS});
});

app.post("/set-rotors", (req, res) => {
    ROTORS.L = Number(req.body.rotorL);
    ROTORS.M = Number(req.body.rotorM);
    ROTORS.R = Number(req.body.rotorR);
    res.status(200).json(ROTORS);
});

app.post('/encrypt', async (req, res) => {
    const enigma = new Enigma(ROTORS.L, ROTORS.M, ROTORS.R);
    let encryptedText = enigma.encrypt(req.body.enc_text.toLowerCase());

    const ALPHABET = encryptedText.split('').filter((item, i, allItems) => i == allItems.indexOf(item)).join('');

    const filePath = path.join(__dirname, 'files', 'encrypted.txt');
    fs.writeFileSync(filePath, encryptedText);
    const frequency = calculateSymbolsFrequency(filePath, ALPHABET);
    await exportHistogram('encrypted.xlsx', frequency.resultFrequency, ALPHABET);

    res.status(200).json({result: encryptedText});
});

app.post('/decrypt', async (req, res) => {
    const enigma = new Enigma(ROTORS.L, ROTORS.M, ROTORS.R);
    let decryptedText = enigma.decrypt(req.body.dec_text.toLowerCase());

    const ALPHABET = decryptedText.split('').filter((item, i, allItems) => i == allItems.indexOf(item)).join('');

    const filePath = path.join(__dirname, 'files', 'decrypted.txt');
    fs.writeFileSync(filePath, decryptedText);
    const frequency = calculateSymbolsFrequency(filePath, ALPHABET);
    await exportHistogram('decrypted.xlsx', frequency.resultFrequency, ALPHABET);

    res.status(200).json({result: decryptedText});
});


app.listen(3000, () => console.log(`Server is running at http://localhost:3000`));