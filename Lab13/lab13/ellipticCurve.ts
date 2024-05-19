import {O, Point} from "./point";

export const a = -1;
export const b = 1;
export const p = 751;

const ALPHABET: string = "абвгдежзийклмнопрстуфхцчшщъыьэюя";
const POINTS: Point[] = [
    new Point(189, 297), new Point(189, 454), new Point(192, 32), new Point(192, 719),
    new Point(194, 205), new Point(194, 546), new Point(197, 145), new Point(197, 606),
    new Point(198, 224), new Point(198, 527), new Point(200, 30), new Point(200, 721),
    new Point(203, 324), new Point(203, 427), new Point(205, 372), new Point(205, 379),
    new Point(206, 106), new Point(206, 645), new Point(209, 82), new Point(209, 669),
    new Point(210, 31), new Point(210, 720), new Point(215, 247), new Point(215, 504),
    new Point(218, 150), new Point(218, 601), new Point(221, 138), new Point(221, 613),
    new Point(226, 9), new Point(226, 742), new Point(227, 299), new Point(227, 542)
];


export const mod = (x: number, m: number) => {
    let remainder: number = x % m;
    return remainder < 0 ? remainder + m : remainder;
}
export const modInv = (a: number, m: number): number => {
    a = mod(a, m);
    for (let x = 1; x < m; x++) {
        if (mod(a * x, m) == 1) {
            return x;
        }
    }
    return a;
}

export const ellipticCurve = (x: number): number => {
    const temp = Math.pow(x, 3) + a * x + b;
    return mod(temp, p);
}

const getQuadraticResidues = (): { [key: number]: number } => {
    const res: { [key: number]: number } = {};
    for (let i = 0; i < p; i++) {
        res[i] = Math.pow(i, 2) % p;
    }
    return res;
}

export const getCurvePoints = (xMin: number, xMax: number): Point[] => {
    const result: Point[] = [];
    const residues = getQuadraticResidues();
    const keys: string[] = Object.keys(residues);

    for (let i = xMin; i <= xMax; i++) {
        const y2: number = ellipticCurve(i);
        const y: string[] = keys.filter((key) => residues[+key] === y2);
        for (const key of y) {
            result.push(new Point(i, +key));
        }
    }
    return result;
}

export const encryptText = (text: string, G: Point, d: number): EncryptedSymbol[] | null => {
    text = text.toLowerCase();

    const Q: Point | O = G.multiplyBy(d);
    if (Q === "O") {
        return null;
    }

    const encryptedText: EncryptedSymbol[] = [];
    for (let i = 0; i < text.length; i++) {
        if (ALPHABET.includes(text[i])) {
            const P: Point = POINTS[ALPHABET.indexOf(text[i])];
            const k: number = getRandomInt(2, d);
            const C1: Point | O = G.multiplyBy(k);
            const C2: Point | O = Point.sumPoints(P, Q.multiplyBy(k));
            if (C1 === "O" || C2 === "O") {
                return null;
            }
            encryptedText.push({C1, C2});
        }
    }

    return encryptedText;
}

export const decryptText = (encText: EncryptedSymbol[], d: number): string | null => {
    let result: string = '';
    for (let i = 0; i < encText.length; i++) {
        const c: EncryptedSymbol = encText[i];
        const dC1: Point | O = c.C1.multiplyBy(d);
        if (dC1 === 'O') {
            return null;
        }
        const P: Point | O = Point.sumPoints(c.C2, dC1.getInversePoint());
        if (P === 'O') {
            return null;
        }

        const point: Point | undefined = POINTS.find(p => Point.equals(p, P));
        if (!point) {
            return null;
        }
        const char = ALPHABET[POINTS.indexOf(point)];
        result += char;
    }
    return result;
}

export const getHash = (point: Point) => {
    return mod(point.x, 13);
}

export const generateDigitalSignature = (G: Point, q: number, h: number, d: number): DigitalSignature | null => {
    let k: number = getRandomInt(2, q);
    let r: number = 0;
    let kG: Point | O = 'O';
    let s: number = 0;

    while (s === 0) {
        r = 0;
        while (r === 0) {
            k = getRandomInt(2, q);
            kG = G.multiplyBy(k);
            if (kG === 'O') {
                continue;
            }
            r = mod(kG.x, q);
        }

        const t: number = modInv(k, q);
        s = mod(t * (h + d * r), q);
    }
    return {r, s};
}

export const verifyDigitalSignature = (ds: DigitalSignature, q: number, h: number, G: Point, d: number): boolean => {
    if (1 > ds.r || ds.s > q) {
        return false;
    }

    const Q: Point | O = G.multiplyBy(d);
    if (Q === 'O') {
        return false;
    }

    const w: number = modInv(ds.s, q);
    const u1: number = mod(w * h, q);
    const u2: number = mod(w * ds.r, q);
    const Gu1Qu2: Point | O = Point.sumPoints(G.multiplyBy(u1), Q.multiplyBy(u2));
    if (Gu1Qu2 === 'O') {
        return false;
    }
    const v: number = mod(Gu1Qu2.x, q);
    return v === ds.r;
}

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export const isOnCurve = (p: Point): boolean => {
    const residues = getQuadraticResidues();
    const keys: string[] = Object.keys(residues);
    const y2: number = ellipticCurve(p.x);
    const y: string[] = keys.filter((key) => residues[+key] === y2);
    return y.find((y) => +y === p.y) !== undefined;
}

export type EncryptedSymbol = {
    C1: Point,
    C2: Point
}

export type DigitalSignature = {
    r: number,
    s: number
}