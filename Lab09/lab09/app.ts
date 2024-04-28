import express from 'express';
import {decrypt, Encoding, encrypt, generatePrivateKey, generatePublicKey, getPublicKeyParams} from "./asymmetric";
import bigInt from "big-integer";
import {generateRandomNumber} from "./mathUtils";
import {base64Encode, convertBinaryToBase64String} from "./base64";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
   res.redirect('/ascii')
});

app.get("/ascii", (req, res) => {
    const originalText = 'Ivanov Ivan Ivanovich';

    const firstSequenceElement = generateRandomNumber(100);
    const privateKeyASCII = generatePrivateKey(bigInt(firstSequenceElement), 8);

    const {a, n} = getPublicKeyParams(privateKeyASCII);

    const publicKey = generatePublicKey(privateKeyASCII, a, n);

    let startTime = performance.now();
    const encrypted = encrypt(publicKey, originalText, Encoding.ASCII);
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    startTime = performance.now();
    const decrypted = decrypt(privateKeyASCII, encrypted, a, n);
    endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);
    const decoder = new TextDecoder('utf-8');
    const decodedString = decoder.decode(decrypted.decoded);

    res.render('asymmetric-ascii', {
        originalText: originalText,
        privateKey: privateKeyASCII.join(', '),
        n: n,
        a: a,
        publicKey: publicKey.join(', '),
        encrypted: encrypted.join(', '),
        decrypted: decodedString,
        encodingTime: encodingTime,
        decodingTime: decodingTime
    });
});

app.get("/base64", (req, res) => {
    const originalText = 'Ivanov Ivan Ivanovich';
    const originalBase64 = base64Encode(originalText);

    const firstSequenceElement = generateRandomNumber(100);
    const privateKeyBase64 = generatePrivateKey(bigInt(firstSequenceElement), 6);

    const {a, n} = getPublicKeyParams(privateKeyBase64);

    const publicKey = generatePublicKey(privateKeyBase64, a, n);

    let startTime = performance.now();
    const encrypted = encrypt(publicKey, originalText, Encoding.BASE64);
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    startTime = performance.now();
    const decrypted = decrypt(privateKeyBase64, encrypted, a, n);
    endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);
    const decodedString = convertBinaryToBase64String(decrypted.binary);

    res.render('asymmetric-base64', {
        originalText: originalBase64,
        privateKey: privateKeyBase64.join(', '),
        n: n,
        a: a,
        publicKey: publicKey.join(', '),
        encrypted: encrypted.join(', '),
        decrypted: decodedString,
        encodingTime: encodingTime,
        decodingTime: decodingTime
    });
});


app.listen(3000, () => console.log(`Server is running at http://localhost:3000`));