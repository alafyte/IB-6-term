import bigInt from 'big-integer';
import {BigInteger} from 'big-integer';

const xValues: BigInteger[] = [
    bigInt(1000),
    bigInt(3000),
    bigInt(5000),
    bigInt(10000),
    bigInt(15000)
];

const nValues: BigInteger[] = [
    bigInt(2).pow(1024),
    bigInt(2).pow(2048)
];

const aValues = [5, 10];


aValues.forEach(a => {
    nValues.forEach(n => {
        console.log("=================================");
        console.log(`a: ${a}, n: ${n}`);
        console.log("=================================");
        console.log("   x       | Время вычисления (мс)");
        console.log("=================================");
        xValues.forEach(x => {
            const timerStart = performance.now();
            const y = bigInt(a).modPow(x, n);
            const timerEnd = performance.now();
            const elapsedMilliseconds = timerEnd - timerStart;
            console.log(`${x}   |${elapsedMilliseconds}`);
        });
    });
});
