import crypto from 'crypto';

export class CryptoService {
    static rsaEncrypt(data: string, publicKey: string): string {
        const buffer = Buffer.from(data);
        const encryptedData = crypto.publicEncrypt(publicKey, buffer);
        return encryptedData.toString('base64');
    }

    static rsaDecrypt(data: string, privateKey: string): string {
        const buffer = Buffer.from(data, 'base64');
        const decryptedData = crypto.privateDecrypt(privateKey, buffer);
        return decryptedData.toString('utf-8');
    }

    private static exponentiation(a: number, b: number, n: number): number {
        let tmp = a;
        let sum = tmp;
        for (let i = 1; i < b; i++) {
            for (let j = 1; j < a; j++) {
                sum += tmp;
                if (sum >= n) {
                    sum -= n;
                }
            }
            tmp = sum;
        }
        return tmp;
    }

    private static multiplication(a: number, b: number, n: number): number {
        let sum = 0;
        for (let i = 0; i < b; i++) {
            sum += a;
            if (sum >= n) {
                sum -= n;
            }
        }
        return sum;
    }

     static encryptElGamal(p: number, g: number, x: number, originalString: string): string {
        let result = "";
        const y = this.exponentiation(g, x, p);

        for (const char of originalString) {
            const code = char.charCodeAt(0);
            if (code > 0) {
                const k = Math.floor(Math.random() * (p - 2)) + 1;
                const a = this.exponentiation(g, k, p);
                const b = this.multiplication(this.exponentiation(y, k, p), code, p);
                result += `${a} ${b} `;
            }
        }
        return result;
    }

     static decryptElGamal(p: number, x: number, encryptedText: string): string {
        let result = "";

        const arr = encryptedText.split(' ').filter(xx => xx !== "");
        for (let i = 0; i < arr.length; i += 2) {
            const a = parseInt(arr[i]);
            const b = parseInt(arr[i + 1]);

            if (a !== 0 && b !== 0) {
                const deM = this.multiplication(b, this.exponentiation(a, p - 1 - x, p), p);
                const m = String.fromCharCode(deM);
                result += m;
            }
        }
        return result;
    }
}
