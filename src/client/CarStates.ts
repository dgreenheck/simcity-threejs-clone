// Imports
import { appConstants } from '../AppConstants.jsx';
import { IPoint2D } from '../sim/IPoint.js';
import { ICarInfo } from '../sim/SimCars.js';
import { calculateArc, calculateTurnArc, DEG_120, DEG_180, DEG_270, DEG_60, DEG_90, getAngle, getCornerAngle, getDistance, lerp, lerpPoint } from '../sim/utils.js';
import { Car3D } from './Car3D.js';


// Interface for segments that can provide their max entry speed
interface ICarSegment {
    getMaxEntrySpeed(): number;
}

export abstract class CarState implements ICarSegment {
    private startTime?: number;
    private duration!: number;

    initialize(car: Car3D, startTime: number, firstInit: boolean = true) {
        this.startTime = startTime;
        this.init(car, firstInit);
        this.duration = this.calcDuration();
    }

    abstract init(car: Car3D, firstInit: boolean): void;
    abstract calcDuration(): number;
    abstract getMaxEntrySpeed(): number;

    onDrawFrame(car: Car3D, now: number) {
        if (!this.startTime) throw Error("State was not initialized");

        let progress: number;
        if (this.duration <= 0) {
            progress = 1;
        } else {
            progress = (now - this.startTime) / this.duration;
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;
        }
        this.onDraw(car, progress);

        if (progress >= 1) {
            let newStartTime = this.startTime + this.duration;
            let newState = this.createNextState();
            newState.initialize(car, newStartTime, newState !== this);
            car.currentCarState = newState;
        }
    }

    abstract createNextState(): CarState;
    abstract onDraw(car: Car3D, progress: number): void;

    static createInitialState(car: Car3D): CarState {
        /*        car.carInfo.path = [
                    { x: 1, z: 0 },
                    { x: 1, z: 1 },
                    { x: 1, z: 2 },
                    { x: 1, z: 3 },
                    { x: 1, z: 4 },
                    { x: 1, z: 5 },
                    { x: 1, z: 6 },
                    { x: 1, z: 5 },
                    { x: 1, z: 4 },
                    { x: 1, z: 3 },
                    { x: 1, z: 2 },
                    { x: 1, z: 1 },
                ];*/
        let path = car.carInfo.path;

        if (path.length < 2) {
            return CarIdle.instance;
        } else {
            return new CarPath(car);
        }
    }
}

export class CarIdle extends CarState {
    static instance = new CarIdle();

    private constructor() { super() }

    init(_car: Car3D, _firstInit: boolean): void { }
    calcDuration(): number {
        return Number.MAX_VALUE;
    }
    onDraw(_car: Car3D, _progress: number): void { }
    createNextState(): CarState {
        return this;
    }
    getMaxEntrySpeed(): number {
        return 0;
    }
}

abstract class CarSegment implements ICarSegment {
    abstract onDraw(car: Car3D, progress: number): void;
    abstract calcDuration(): number;
    abstract init(car: Car3D, nextSegment: ICarSegment): void;
    abstract getMaxEntrySpeed(): number;
}

export class CarPath extends CarState {
    segmentIndex = 0;
    motion!: 'forward' | 'loop';
    currentSegment!: CarSegment;
    segments: CarSegment[] = [];

    init(car: Car3D, firstInit: boolean): void {
        if (firstInit) {
            this.motion = car.carInfo.motion ?? 'forward';
            this.initSegments(car.carInfo);
        }
        this.currentSegment = this.segments[this.segmentIndex];

        let nextSegment: ICarSegment;
        if (this.segmentIndex === this.segments.length - 1) {
            if (this.motion === 'loop') {
                nextSegment = this.segments[0];
            } else {
                nextSegment = CarIdle.instance;
            }
        } else {
            nextSegment = this.segments[this.segmentIndex + 1];
        }

        this.currentSegment.init(car, nextSegment);
    }

    getMaxEntrySpeed(): number {
        return this.segments[0]?.getMaxEntrySpeed() ?? 0;
    }

    calcDuration(): number {
        return this.currentSegment.calcDuration();
    }

    initSegments(carInfo: ICarInfo): void {
        const path = carInfo.path;
        this.segments = [];

        let max = path.length - (this.motion === 'loop' ? 0 : 1);

        let pA: IPoint2D = path[0];
        for (let i = 0; i < max; i++) {
            let pB = path[(i + 1) % path.length];
            let pC: IPoint2D;

            if (i + 2 < path.length) {
                pC = path[i + 2];
            } else if (this.motion === 'loop') {
                pC = path[(i + 2) % path.length];
            } else {
                pC = pB;
            }

            let nextAngle = getCornerAngle(pA, pB, pC);

            if (Math.abs(nextAngle) >= DEG_120) {
                this.segments.push(new StraightSegment(pA, pB));
                let angle = getAngle(pA, pB);
                let arc1 = calculateTurnArc(pB, angle, 0.2, DEG_60);
                this.segments.push(new UTurnSegment(arc1.center, arc1.radius, arc1.startAngle, arc1.sweep));
                let arc2 = calculateTurnArc(arc1.ptB, arc1.endAngle + DEG_180, 0.2, DEG_60);
                this.segments.push(new UTurnSegment(arc2.center, arc2.radius, arc2.startAngle, arc2.sweep, { carInReverse: true }));
                let arc3 = calculateTurnArc(arc2.ptB, arc2.endAngle + DEG_180, 0.2, DEG_60);
                this.segments.push(new UTurnSegment(arc3.center, arc3.radius, arc3.startAngle, arc3.sweep));
                pA = arc3.ptB;
            } else if (nextAngle !== 0) {
                let radius = 0.25;
                let tile = this.car.scene.tiles3D.getTile({ x: Math.floor(pA.x), z: Math.floor(pA.z) });
                if (tile && tile._floor!.parent.modelName == 'road-corner') {
                    radius = 1
                }
                let arc = calculateArc(pA, pB, pC, radius)!;
                this.segments.push(new StraightSegment(pA, arc.ptA));
                this.segments.push(new TurningSegment(arc.center, arc.radius, arc.startAngle, arc.sweep));
                pA = arc.ptB;
            } else {
                this.segments.push(new StraightSegment(pA, pB));
                pA = pB;
            }
        }
        // if (this.motion !== 'loop' && getDistance(pA, path[path.length - 1]) > 0.001) {
        //     this.segments.push(new CarStraight(pA, path[path.length - 1]));
        // }
    }

    constructor(readonly car: Car3D) {
        super();
    }

    onDraw(car: Car3D, progress: number): void {
        this.currentSegment?.onDraw(car, progress);
    }

    createNextState(): CarState {
        if (this.segmentIndex < this.segments.length - 1 || this.motion === 'loop') {
            this.segmentIndex = (this.segmentIndex + 1) % this.segments.length;
            return this;
        } else {
            return CarIdle.instance;
        }
    }
}

export class StraightSegment extends CarSegment {
    private segmentLength!: number;
    easing!: number;
    duration!: number;
    angle: number;
    readonly origin: IPoint2D;
    readonly target: IPoint2D;

    constructor(
        origin: IPoint2D,
        target: IPoint2D,
    ) {
        super()
        this.angle = getAngle(origin, target);
        this.segmentLength = getDistance(origin, target);

        let dz = (target.x - origin.x) * appConstants.LANE_OFFSET;
        let dx = (origin.z - target.z) * appConstants.LANE_OFFSET;


        this.origin = { x: origin.x + dx, z: origin.z + dz }
        this.target = { x: target.x + dx, z: target.z + dz }

    }

    init(car: Car3D, nextSegment: ICarSegment): void {
        car.rotation = this.angle;

        let finalSpeed = nextSegment.getMaxEntrySpeed();
        this.duration = 2 * this.segmentLength / (car.speed + finalSpeed);

        let deltaSpeed: number = Math.round((finalSpeed - car.speed) * 1000);
        if (deltaSpeed > 0) {
            this.easing = 2
        } else if (deltaSpeed < 0) {
            this.easing = 1 / 2;
        } else this.easing = 1;
        car.speed = finalSpeed;
    }

    getMaxEntrySpeed(): number {
        return appConstants.STRAIGHT_SPEED;
    }

    calcDuration(): number {
        return this.duration;
    }

    onDraw(car: Car3D, progress: number): void {
        lerpPoint(this.origin, this.target, Math.pow(progress, this.easing), car)
    }

    toString() {
        return `StraightSegment (${this.origin.x},${this.origin.z})...(${this.target.x},${this.target.z})`
    }
}

export class TurningSegment extends CarSegment {
    carInReverse: boolean;
    private adjustedRadius!: number;

    constructor(
        readonly center: IPoint2D,
        readonly radius: number,
        readonly startAngle: number,
        readonly sweep: number,
        options: { carInReverse?: boolean } = {}
    ) {
        super()
        this.carInReverse = options.carInReverse ?? false;
        const LANE_OFFSET_VALUE = appConstants.LANE_OFFSET;
        // -1 pour intérieur, 1 pour extérieur
        let offsetDirection = (this.sweep > 0) ? -1 : 1;
        this.adjustedRadius = this.radius + offsetDirection * LANE_OFFSET_VALUE;

        if (this.adjustedRadius < 0.01) {
            this.adjustedRadius = 0.01;
        }
    }

    turnSpeed() {
        return appConstants.TURN_SPEED;
    }

    init(car: Car3D, _nextSegment: ICarSegment): void {
        let angle = this.startAngle;
        car.z = this.center.z + this.adjustedRadius * Math.sin(angle);

        let forward = (this.sweep > 0);
        if (this.carInReverse) {
            forward = !forward;
        }
        if (forward) car.rotation = this.startAngle + DEG_90;
        else car.rotation = this.startAngle + DEG_270;
        car.speed = this.turnSpeed();
    }

    getMaxEntrySpeed(): number {
        return this.turnSpeed();
    }

    calcDuration(): number {
        const arcLength = Math.abs(this.sweep) * this.adjustedRadius;
        const speed = this.turnSpeed();
        return arcLength / speed;
    }

    onDraw(car: Car3D, progress: number): void {
        const currentAngle = lerp(this.startAngle, this.startAngle + this.sweep, progress);
        let angleRad = currentAngle;

        car.x = this.center.x + this.adjustedRadius * Math.cos(angleRad);
        car.z = this.center.z + this.adjustedRadius * Math.sin(angleRad);

        let forward = (this.sweep > 0);
        if (this.carInReverse) {
            forward = !forward;
        }
        if (forward) car.rotation = currentAngle + DEG_90;
        else car.rotation = currentAngle + DEG_270;

    }
}

export class UTurnSegment extends TurningSegment {

    override turnSpeed(): number {
        return appConstants.U_TURN_SPEED;
    }
}