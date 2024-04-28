import bigInt, {BigInteger} from "big-integer";

export const generateRandomNumber = (n: number): bigint => {
    const randomBits: string[] = [];

    for (let i = 0; i < n; i++) {
        const bit = Math.random() < 0.5 ? '0' : '1';
        randomBits.push(bit);
    }

    const randomString = randomBits.join('');
    return BigInt('0b' + randomString);
}

export const gcd = (a: BigInteger, b: BigInteger): BigInteger => {
    while (!b.isZero()) {
        const temp = b;
        b = a.mod(b);
        a = temp;
    }
    return a;
}

export const getInverseNumber = (number: BigInteger, modulus: BigInteger): BigInteger => {
    let m0 = modulus;
    let y = bigInt.zero;
    let x = bigInt.one;

    if (modulus.eq(1)) {
        return bigInt.zero;
    }

    while (number.gt(1)) {
        let quotient = number.divmod(modulus).quotient;
        let temp = modulus;

        modulus = number.divmod(modulus).remainder;
        number = temp;

        temp = y;
        y = x.minus(quotient.times(y));
        x = temp;
    }

    if (x.lt(0)) {
        x = x.plus(m0);
    }

    return x;
}

export const generateCoprime = (n: BigInteger): BigInteger => {
    const min = n.plus(1);
    const max = n.times(2);
    let coprime: bigInt.BigInteger;

    do {
        coprime = bigInt.randBetween(min, max);
    } while (!gcd(n, coprime).eq(1));

    return coprime;
}
