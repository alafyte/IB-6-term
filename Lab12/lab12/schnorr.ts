import crypto from 'crypto';
import bigInt, {BigInteger} from 'big-integer';

export class Schnorr {
    private readonly p: BigInteger;
    private readonly q: BigInteger;
    private readonly g: BigInteger;
    private x: BigInteger;
    private readonly y: BigInteger;

    constructor() {
        this.p = bigInt(48731);
        this.q = bigInt(443);
        this.g = bigInt(11444);
        do {
            this.x = bigInt.randBetween(1, this.q.subtract(1));
        } while (this.x.compare(this.q) >= 0);

        this.y = this.g.modPow(this.x, this.p).modInv(this.p);
    }


    public getPublicKey(): { p: BigInteger, q: BigInteger, g: BigInteger, y: BigInteger } {
        return {p: this.p, q: this.q, g: this.g, y: this.y};
    }

    public generateDigitalSignature(message: string): BigInteger[] {
        let k: BigInteger;
        do {
            k = bigInt.randBetween(2, this.q.subtract(1));
        } while (!(k.compare(1) > 0 && k.compare(this.q) < 0));

        const a = this.g.modPow(k, this.p);
        message += a.toString();
        const hash = crypto.createHash('sha256').update(message, 'utf8').digest();
        return [
            bigInt(hash.readBigUInt64LE()),
            k.add(this.x.multiply(bigInt(hash.readBigUInt64LE()))).mod(this.q)
        ];
    }

    public verifyDigitalSignature(message: string, digitalSignature: BigInteger[]): boolean {
        let x = this.g.modPow(digitalSignature[1], this.p)
            .multiply(this.y.modPow(digitalSignature[0], this.p)).mod(this.p);
        message += x.toString();
        const receivedHash = crypto.createHash('sha256').update(message, 'utf8').digest();
        return digitalSignature[0].equals(receivedHash.readBigUInt64LE());
    }
}
