import express, {Request, Response} from 'express';
import {RSA} from "./rsa";
import {ElGamal} from "./elGamal";
import {Schnorr} from "./schnorr";

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/rsa');
})

app.get('/rsa', (req: Request, res: Response) => {
    const originalText = "Ivanov Ivan Ivanovich";
    const rsa = new RSA();
    const publicKey = rsa.getPublicKey();

    let startTime = performance.now();
    const digitalSign = rsa.createDigitalSignature(originalText);
    let endTime = performance.now();
    const signTime = endTime - startTime;

    startTime = performance.now();
    const verified = rsa.verifyDigitalSignature(originalText, digitalSign);
    endTime = performance.now();
    const verificationTime = endTime - startTime;

    res.render('rsa', {
        originalText,
        signTime: signTime.toFixed(3),
        publicKey,
        verificationTime: verificationTime.toFixed(3),
        digitalSign,
        verified
    });
});

app.get('/el-gamal', (req: Request, res: Response) => {
    const originalText = "Ivanov Ivan Ivanovich";
    let startTime = performance.now();
    const elGamal = new ElGamal();
    const publicKey = elGamal.getPublicKey();

    const digitalSign = elGamal.createDigitalSignature(originalText);
    let endTime = performance.now();
    const signTime = endTime - startTime;

    startTime = performance.now();
    const verified = elGamal.verifyDigitalSignature(originalText, digitalSign);
    endTime = performance.now();
    const verificationTime = endTime - startTime;

    res.render('el-gamal', {
        originalText,
        signTime: signTime.toFixed(3),
        publicKey,
        verificationTime: verificationTime.toFixed(3),
        digitalSign: digitalSign.join(', '),
        verified
    });
});

app.get('/schnorr', (req, res) => {
    const originalText = "Ivanov Ivan Ivanovich";
    let startTime = performance.now();
    const schnorr = new Schnorr();
    const publicKey = schnorr.getPublicKey();

    const digitalSign = schnorr.generateDigitalSignature(originalText);
    let endTime = performance.now();
    const signTime = endTime - startTime;

    startTime = performance.now();
    const verified = schnorr.verifyDigitalSignature(originalText, digitalSign);
    endTime = performance.now();
    const verificationTime = endTime - startTime;

    res.render('schnorr', {
        originalText,
        signTime: signTime.toFixed(3),
        publicKey,
        verificationTime: verificationTime.toFixed(3),
        digitalSign: digitalSign.join(', '),
        verified
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
