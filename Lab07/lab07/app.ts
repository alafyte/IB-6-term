import express from 'express';
import {avalancheEffect, decrypt, encrypt, textToBytes} from "./des";
import {Bytes} from "node-forge";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('des');
});

app.post("/encrypt", (req, res) => {
    let startTime = performance.now();
    const key: Bytes = textToBytes(req.body.key);
    const encryptedText = encrypt(req.body.enc_text, key);
    const result = encryptedText.toHex();
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    startTime = performance.now();
    const decryptedText = decrypt(encryptedText, req.body.key);
    endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);

    const avalanche = avalancheEffect(req.body.enc_text, key);

    res.status(200).json({
        encrypted: result,
        avalanche: avalanche,
        decrypted: decryptedText,
        decodingTime: decodingTime,
        encodingTime: encodingTime
    });
});


app.listen(3000, () => console.log(`Server is running at http://localhost:3000`));