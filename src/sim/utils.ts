import { DEG2RAD, RAD2DEG } from "three/src/math/MathUtils";
import { IPoint2D } from "./IPoint";


export const DEG_0 = 0 * DEG2RAD;
export const DEG_30 = 30 * DEG2RAD;
export const DEG_60 = 60 * DEG2RAD;
export const DEG_90 = 90 * DEG2RAD;
export const DEG_120 = 120 * DEG2RAD;
export const DEG_180 = 180 * DEG2RAD;
export const DEG_270 = 270 * DEG2RAD;

export const EPSILON = 0.0001; // Small number for float comparisons

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

export function getAngle(pt1: IPoint2D, pt2: IPoint2D): number {
    const dx = pt2.x - pt1.x;
    const dz = pt2.z - pt1.z; // Corrected: pt1.z
    return Math.atan2(dz, dx);
}

export function getDistanceInMetre(pt1: IPoint2D, pt2: IPoint2D): number {
    const dx = pt2.x - pt1.x;
    const dz = pt2.z - pt1.z;
    return Math.hypot(dx, dz) * 16;
}

export function KmPerHour(v: number): number {
    return v / 3.6;
}

export const TWO_PI = Math.PI * 2;

export function normalizeAngle(angle: number): number {
    while (angle <= -Math.PI) angle += TWO_PI;
    while (angle > Math.PI) angle -= TWO_PI;
    return angle;
}

export function normalizeAngleDeg(angle: number): number {
    return normalizeAngle(angle) * RAD2DEG;
}


export function getCornerAngle(p0: IPoint2D, p1: IPoint2D, p2: IPoint2D): number {
    const angle1 = getAngle(p0, p1);
    const angle2 = getAngle(p1, p2);
    let turnAmountDeg = normalizeAngle(angle2 - angle1);
    return turnAmountDeg;
}


export function getDistance(p1: IPoint2D, p2: IPoint2D): number {
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    return Math.hypot(dx, dz);
}

export function lerp(start: number, end: number, progress: number) {
    return end * progress + (1 - progress) * start;
}

export function lerpPoint(start: IPoint2D, end: IPoint2D, progress: number, output: IPoint2D): void {
    output.x = lerp(start.x, end.x, progress);
    output.z = lerp(start.z, end.z, progress);
}

export function subtractPoints(p1: IPoint2D, p2: IPoint2D): IPoint2D { return { x: p1.x - p2.x, z: p1.z - p2.z }; }
export function addPoints(p1: IPoint2D, p2: IPoint2D): IPoint2D { return { x: p1.x + p2.x, z: p1.z + p2.z }; }
export function scalePoint(p: IPoint2D, s: number): IPoint2D { return { x: p.x * s, z: p.z * s }; }

export function normalizePoint(p: IPoint2D): IPoint2D {
    let d = Math.hypot(p.x, p.z)
    if (d === 0) return { x: 0, z: 0 };
    return { x: p.x / d, z: p.z / d };
}


export function midPoint(start: IPoint2D, end: IPoint2D): IPoint2D {
    let result = { x: (start.x + end.x) / 2, z: (start.z + end.z) / 2 };
    return result;
}

export function dotProduct(v1: IPoint2D, v2: IPoint2D) {
    return v1.x * v2.x + v1.z * v2.z;
}

export function calculateArc(pA: IPoint2D, pB: IPoint2D, pC: IPoint2D, maxRadius: number) {
    const v1 = normalizePoint(subtractPoints(pA, pB));
    const v2 = normalizePoint(subtractPoints(pC, pB));

    const dot = dotProduct(v1, v2);
    const angle = Math.acos(clamp(dot, -1, 1));
    if (angle < EPSILON) return null;

    const len1 = getDistance(pA, pB);
    const len2 = getDistance(pC, pB);
    const radius = Math.min(maxRadius, len1, len2);
    const tanHalf = Math.tan(angle / 2);
    const offset = radius / tanHalf;

    const ptA = addPoints(pB, scalePoint(v1, offset));
    const ptB = addPoints(pB, scalePoint(v2, offset));

    const bisector = normalizePoint(addPoints(v1, v2));
    const centerOffset = radius / Math.sin(angle / 2);
    const center = addPoints(pB, scalePoint(bisector, centerOffset));

    const startAngle = Math.atan2(ptA.z - center.z, ptA.x - center.x);
    const endAngle = Math.atan2(ptB.z - center.z, ptB.x - center.x);
    let sweep = endAngle - startAngle;

    if (sweep <= -Math.PI) sweep += 2 * Math.PI;
    else if (sweep > Math.PI) sweep -= 2 * Math.PI;

    return {
        ptA,
        ptB,
        center,
        radius,
        startAngle,
        sweep
    };
}

export function calculateTurnArc(origin: IPoint2D, direction: number, radius: number, sweep: number) {

    // Le vecteur perpendiculaire pointe vers le centre du cercle
    const side = Math.sign(sweep); // +1 = gauche, -1 = droite
    const centerAngle = direction + side * Math.PI / 2;

    const center: IPoint2D = {
        x: origin.x + Math.cos(centerAngle) * radius,
        z: origin.z + Math.sin(centerAngle) * radius,
    };

    const startAngle = Math.atan2(origin.z - center.z, origin.x - center.x);
    const endAngle = startAngle + sweep;

    const final: IPoint2D = {
        x: center.x + Math.cos(endAngle) * radius,
        z: center.z + Math.sin(endAngle) * radius,
    };

    return { center, startAngle, endAngle: direction + sweep, radius, sweep, ptA: origin, ptB: final };
}