import bigInt, {BigInteger, gcd} from "big-integer";

export const generatePrimeNumber = (bitLength: number): BigInteger => {
    let primeCandidate: BigInteger;
    do {
        primeCandidate = bigInt.randBetween(
            bigInt(2).pow(bitLength - 1),
            bigInt(2).pow(bitLength)
        );

    } while (!primeCandidate.isPrime());

    return primeCandidate;
}

export const generateCoprimeNumber = (fi: BigInteger): BigInteger => {
    const min = fi.plus(1);
    const max = fi.times(2);
    let coprime: bigInt.BigInteger;

    do {
        coprime = bigInt.randBetween(min, max);
    } while (!isCoprime(fi, coprime));

    return coprime;
}

export const isCoprime = (a: BigInteger, b: BigInteger): boolean => {
    return gcd(a, b).eq(1);
}