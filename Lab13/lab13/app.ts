import express, {Request, Response} from 'express';
import {
    decryptText, DigitalSignature, EncryptedSymbol,
    encryptText,
    generateDigitalSignature,
    getCurvePoints,
    getHash,
    isOnCurve,
    verifyDigitalSignature
} from "./ellipticCurve";
import {O, Point} from "./point";

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    return res.redirect('/points');
});

app.get('/points', (req: Request, res: Response) => {
    const xMin: number = 586;
    const xMax: number = 620;
    const points = getCurvePoints(xMin, xMax);
    return res.render('points', {points});
});

app.get('/operations', (req: Request, res: Response) => {
    const k = 7;
    const l = 7;
    const P: Point = new Point(59, 365);
    const Q: Point = new Point(59, 386);
    const R: Point = new Point(105, 382);

    console.log("P:", P, isOnCurve(P));
    console.log("Q:", Q, isOnCurve(Q));
    console.log("R:", R, isOnCurve(R));

    const kP: Point | O = P.multiplyBy(k);
    const lQ: Point | O = Q.multiplyBy(l);
    const pPlusQ: Point | O = Point.sumPoints(P, Q);
    const kPPluslQMinusR: Point | O = Point.sumPoints(Point.sumPoints(kP, lQ), R.getInversePoint());
    const pMinusQPlusR: Point | O = Point.sumPoints(Point.sumPoints(P, Q.getInversePoint()), R);

    return res.render('operations', {P, Q, R, k, l, kP, pPlusQ, kPPluslQMinusR, pMinusQPlusR});
});

app.get('/cipher', (req: Request, res: Response) => {
    const originalText: string = "ивановиваниванович";
    const d: number = 19;
    const G: Point = new Point(0, 1);

    const encryptedText: EncryptedSymbol[] | null = encryptText(originalText, G, d);
    let decryptedText: string;
    if (encryptedText) {
        const result: string | null = decryptText(encryptedText, d);
        if (result) {
            decryptedText = result;
        } else {
            decryptedText = 'Ошибка при расшифровании';
        }
    } else {
        decryptedText = 'Ошибка при расшифровании';
    }
    return res.render('cipher', {
        originalText,
        encryptedText,
        decryptedText
    });
});

app.get('/ds', (req: Request, res: Response) => {
    const G: Point = new Point(416, 55);
    const q: number = 13;
    const d: number = 12;
    const pointLetterI: Point = new Point(198, 224);
    const H: number = getHash(pointLetterI);
    const ds: DigitalSignature | null = generateDigitalSignature(G, q, H, d);
    let verified: boolean;
    if (!ds) {
        verified = false;
    } else {
        verified = verifyDigitalSignature(ds, q, H, G, d);
    }
    return res.render('digital-signature', {H, ds, verified});
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
