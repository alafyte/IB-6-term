import express, {Request, Response} from 'express';
import {CryptoService} from './cryptoService';
import * as fs from "fs";

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/rsa');
})

app.get('/rsa', (req: Request, res: Response) => {
    const originalText = "Ivanov Ivan Ivanovich";
    const publicKey = fs.readFileSync('./keys/public.pem', 'utf8');
    const privateKey = fs.readFileSync('./keys/private.pem', 'utf8');

    let startTime = performance.now();
    const encryptedData = CryptoService.rsaEncrypt(originalText, publicKey);
    let endTime = performance.now();
    const encryptionTime = endTime - startTime;

    startTime = performance.now();
    const decryptedData = CryptoService.rsaDecrypt(encryptedData, privateKey);
    endTime = performance.now();
    const decryptionTime = endTime - startTime;

    res.render('rsa', {
        originalText,
        publicKey,
        privateKey,
        encryptionTime,
        decryptionTime,
        encryptedData,
        decryptedData
    });
});

app.get('/el-gamal', (req: Request, res: Response) => {
    const p = 241;
    const g = 56;
    const x = 9;
    const originalText = "Ivanov Ivan Ivanovich";
    let startTime = performance.now();
    const encryptedData = CryptoService.encryptElGamal(p, g, x, originalText);
    let endTime = performance.now();
    const encryptionTime = endTime - startTime;

    startTime = performance.now();
    const decryptedData = CryptoService.decryptElGamal(p, x, encryptedData);
    endTime = performance.now();
    const decryptionTime = endTime - startTime;

    res.render('el-gamal', {
        originalText,
        encryptionTime,
        decryptionTime,
        encryptedData,
        decryptedData
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
