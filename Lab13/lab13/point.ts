import {a, mod, modInv, p} from "./ellipticCurve";

export type O = 'O';

export class Point {
    public static O: O = 'O';
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getInversePoint(): Point {
        return new Point(this.x, mod(-this.y, p));
    }

    public static sumPoints(point1: Point | O, point2: Point | O): Point | O {
        if (point1 === Point.O || point2 === Point.O) {
            return Point.O;
        }
        if (Point.equals(point1, point2.getInversePoint())) {
            return Point.O;
        }
        const lambda = Point.getLambda(point1, point2);
        const x3 = mod(Math.pow(lambda, 2) - point1.x - point2.x, p);
        const y3 = mod(lambda * (point1.x - x3) - point1.y, p);
        return new Point(x3, y3);
    }

    public multiplyBy(k: number): Point | O {
        const basePoint: Point = new Point(this.x, this.y);
        let point: Point | O = basePoint;
        for (let i = 0; i < Math.trunc(Math.log2(k)); i++) {
            point = Point.sumPoints(point, point);
        }
        k = k - Math.trunc(Math.pow(2, Math.trunc(Math.log2(k))));
        while (k > 1) {
            for (let i = 0; i < Math.trunc(Math.log2(k)); i++)
                point = Point.sumPoints(point, Point.sumPoints(basePoint, basePoint));
            k = k - Math.trunc(Math.pow(2, Math.trunc(Math.log2(k))));
        }
        if (k == 1)
            point = Point.sumPoints(point, basePoint);
        return point;
    }

    public static equals(point1: Point, point2: Point): boolean {
        return point1.x === point2.x && point1.y === point2.y;
    }

    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }

    private static getLambda(point1: Point, point2: Point): number {
        if (Point.equals(point1, point2)) {
            return mod((3 * Math.pow(point1.x, 2) + a) * modInv(2 * point1.y, p), p);
        }
        return mod((point2.y - point1.y) * modInv(point2.x - point1.x, p), p);
    }
}