export const lcg = (seed: number, sequenceLength: number) => {
    const a: number = 421;
    const c: number = 1663;
    const n: number = 7875;

    const sequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
        seed = (a * seed + c) % n;
        sequence.push(seed);
    }
    return sequence;
}

export const RC4encrypt = (data: string)  => {
    const n: number = 8;
    const key: number[] = [13, 19, 90, 92, 240];

    const m: number = Math.pow(2, n);
    let x: number = 0;
    let y: number;
    const box: number[] = [...Array(m).keys()];

    let startTime: number = performance.now();
    for (let i = 0; i < m; i++) {
        x = (x + box[i] + key[i % key.length]) % m;
        [box[i], box[x]] = [box[x], box[i]];
    }
    let endTime: number = performance.now();
    const generationTime: string = (endTime - startTime).toFixed(4);

    x = y = 0;
    const out: string[] = [];

    for (const char of data) {
        x = (x + 1) % m;
        y = (y + box[x]) % m;
        [box[x], box[y]] = [box[y], box[x]];
        out.push(String.fromCharCode(char.charCodeAt(0) ^ box[(box[x] + box[y]) % m]));
    }

    return {result: out.join(''), generationTime};
}
