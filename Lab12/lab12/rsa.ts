import * as crypto from 'crypto';
import bigInt, {BigInteger} from 'big-integer';
import {generateCoprimeNumber, generatePrimeNumber} from "./mathUtils";

export class RSA {
    private p: BigInteger;
    private readonly q: BigInteger;
    private readonly n: BigInteger;
    private readonly fi: BigInteger;
    private readonly e: BigInteger;
    private readonly d: BigInteger;

    constructor() {
        this.p = generatePrimeNumber(100);
        this.q = generatePrimeNumber(100);
        this.n = this.p.multiply(this.q);
        this.fi = this.p.subtract(1).multiply(this.q.subtract(1));
        this.e = generateCoprimeNumber(this.fi);
        this.d = this.e.modInv(this.fi);
    }

    public getPublicKey(): {e: BigInteger; n: BigInteger} {
        return {e: this.e, n: this.n};
    }

    public createDigitalSignature(text: string): BigInteger {
        const hash = crypto.createHash('sha256').update(text, 'utf8').digest();
        return bigInt(hash.readBigInt64LE()).modPow(this.d, this.n);
    }

    public verifyDigitalSignature(text: string, digitalSign: BigInteger): boolean {
        const signBytes: BigInteger = digitalSign.modPow(this.e, this.n);
        const receivedHash = crypto.createHash('sha256').update(text, 'utf8').digest();
        return bigInt(receivedHash.readBigInt64LE()).eq(signBytes);
    }
}
