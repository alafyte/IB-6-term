import * as crypto from 'crypto';
import bigInt, {BigInteger} from 'big-integer';
import {generateCoprimeNumber, generatePrimeNumber, isCoprime} from "./mathUtils";

export class ElGamal {
    private readonly p: BigInteger;
    private readonly g: BigInteger;
    private readonly x: BigInteger;
    private readonly y: BigInteger;

    constructor() {
        this.p = generatePrimeNumber(100);
        this.g = generateCoprimeNumber(this.p);
        this.x = bigInt.randBetween(bigInt(2), this.p.subtract(1));
        this.y = this.g.modPow(this.x, this.p);
    }

    public getPublicKey(): { p: BigInteger, g: BigInteger, y: BigInteger } {
        return {p: this.p, g: this.g, y: this.y}
    }

    public createDigitalSignature(message: string): BigInteger[] {
        const hash = crypto.createHash('sha256').update(message, 'utf8').digest();
        let digitalSignI: BigInteger[];
        do {
            let k = bigInt.randBetween(bigInt(2), this.p.subtract(2));
            while (!isCoprime(k, this.p.subtract(1))) {
                k = bigInt.randBetween(bigInt(2), this.p.subtract(2));
            }
            digitalSignI = [];
            digitalSignI[0] = this.g.modPow(k, this.p);
            let temp = bigInt(hash.readBigInt64LE()).subtract(this.x.multiply(digitalSignI[0]));
            temp = temp.multiply(k.modInv(this.p.subtract(1))).mod(this.p.subtract(1));
            if (temp.isNegative()) {
                temp = this.p.subtract(1).subtract(temp.abs());
            }
            digitalSignI[1] = temp;
        } while (digitalSignI[1].equals(0));
        return digitalSignI;
    }

    public verifyDigitalSignature(message: string, digitalSignature: BigInteger[]): boolean {
        const hash = crypto.createHash('sha256').update(message, 'utf8').digest();
        const leftPart = this.g.modPow(hash.readBigInt64LE(), this.p);
        const rightPart = this.y.modPow(digitalSignature[0], this.p)
            .multiply(digitalSignature[0].modPow(digitalSignature[1], this.p))
            .mod(this.p);
        return leftPart.equals(rightPart);
    }
}
