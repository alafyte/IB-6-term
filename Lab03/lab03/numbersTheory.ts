export const gcd = (a: number, b: number, c: number | null = null): number => {
    if (c === null) {
        let q = a % b;

        if (q === 0) {
            return b;
        }
        return gcd(b, q);
    } else {
        let gcdAB: number = gcd(a, b);
        return gcd(gcdAB, c);
    }
}

export const sieveOfEratosthenes = (m: number, n: number) => {
    let arr = Array.from(
        {length: (n - m)},
        (value, index) => m + index
    );

    let square = Math.round(Math.sqrt(n));

    let primes: number[] = []

    for (let i = 2; i < square; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }

    let result: number[] = [];

    for (let i = 0; i < arr.length; i++) {
        let isPrime = true;
        for (let j = 0; j < primes.length; j++) {
            if (arr[i] % primes[j] === 0) {
                isPrime = false;
            }
        }
        if (isPrime) result.push(arr[i]);
    }

    return [...primes, ...result];
}

export const primeFactors = (n: number) : string => {
    const factors : number[] = [];
    let divisor: number = 2;

    while (n >= 2) {
        if (n % divisor === 0) {
            factors.push(divisor);
            n /= divisor;
        } else {
            divisor++;
        }
    }
    return factors.join(' * ');
}

export const isPrime = (a: number): boolean => {
    if (a < 2)
        return false;

    let square = Math.round(Math.sqrt(a));

    for (let i = 2; i <= square; i++) {
        if (a % i === 0)
            return false;
    }
    return true;
}


