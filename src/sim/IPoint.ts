
export interface IPoint2D {
    x: number;
    z: number;
}

export interface IHeading extends IPoint2D {
    angle: number; 
    speed: number;
}

export function tileFloor(position: IPoint2D): IPoint2D {
    return {
        x: Math.floor(position.x),
        z: Math.floor(position.z),
    };
}

export function tileCenter(position: IPoint2D): IPoint2D {
    return {
        x: Math.floor(position.x) + 0.5,
        z: Math.floor(position.z) + 0.5,
    };
}

export function distance(p1: IPoint2D, p2: IPoint2D): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2));
}

export function manhattanDistance(p1: IPoint2D, p2: IPoint2D): number {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.z - p2.z) * 1.2;
}

export function addHalfTile(position: IPoint2D): IPoint2D {
    return {
        x: position.x + 0.5,
        z: position.z + 0.5,
    };
}

export function removeHalfTile(position: IPoint2D): IPoint2D {
    return {
        x: position.x - 0.5,
        z: position.z - 0.5,
    };
}

export function positionFloorString(position: IPoint2D) {
    return `${Math.floor(position.x)},${Math.floor(position.z)}`
}

export interface IRectangle extends IPoint2D {
    width: number;
    height: number;
}

export function rectangleContains(self: IRectangle, IPoint2D: IPoint2D): boolean {
    return IPoint2D.x >= self.x && IPoint2D.x < self.x + self.width && IPoint2D.z >= self.z && IPoint2D.z < self.z + self.height;
}

export function rectangleIntersects(self: IRectangle, range: IRectangle): boolean {
    return !(range.x + range.width <= self.x ||
        range.x >= self.x + self.width ||
        range.z + range.height <= self.z ||
        range.z >= self.z + self.height);
}