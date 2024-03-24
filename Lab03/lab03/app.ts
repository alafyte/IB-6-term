import express from "express";
import {Request, Response} from "express"
import {gcd, isPrime, primeFactors, sieveOfEratosthenes} from "./numbersTheory";

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
    return res.redirect("/gcd");
})

app.get("/gcd", async (req: Request, res: Response) => {
    res.render('gcd');
});

app.get("/primes", async (req: Request, res: Response) => {
    const n = 591;
    const m = 555;
    const numberOfPrimes = (n / Math.log(n)).toFixed(3);
    const primesFrom2to591 = sieveOfEratosthenes(2, n);
    const primesFrom555to591 = sieveOfEratosthenes(m, n);
    const isConcatenationPrime = isPrime(Number(`${m}${n}`));
    const factorsOfM = primeFactors(m);
    const factorsOfN = primeFactors(n);

    res.render('primes', {
        n: n, m: m,
        numberOfPrimes: numberOfPrimes,
        primesFrom2to591: primesFrom2to591.join(", "),
        resultNumberOfPrimes: primesFrom2to591.length,
        primesFrom555to591: primesFrom555to591.join(", "),
        isConcatenationPrime: isConcatenationPrime,
        factorsOfM: factorsOfM,
        factorsOfN: factorsOfN,
    });
});

app.post("/gcd", async (req: Request, res: Response) => {
    try {
        let a: number = Number(req.body.a);
        let b: number = Number(req.body.b);
        let c: number | null = req.body.c ? Number(req.body.c) : null;

        let resultC = c === null ? "" : `, ${c}`;
        const result = `НОД(${a}, ${b}${resultC}) = ${gcd(a, b, c)}`;

        return res.status(200).json({result: result});
    } catch (err: any) {
        return res.status(422).end("Произошла ошибка: " + err.message);
    }
});


app.listen(3000, () => console.log('Server is running at http://localhost:3000'));