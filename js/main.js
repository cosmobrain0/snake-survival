const APPLE_SPAWN_MARGIN = 20;
const APPLE_COUNT = 5;
const TAIL_SHRINK_INTERVAL = 150;
const ENEMY_SPAWN_INTERVAL = 4000;
const TIME_SCORE_MULTIPLIER = 1/100;
const SCORE_BOX_PADDING_X = 40;
const APPLE_RADIUS = 40;
const APPLE_LENGTH_INCREASE = 10;
const APPLE_SCORE_INCREASE = 200;
const PLAYER_ROTATION_SPEED = 0.3 * PI/180;

let timeOfLastEnemySpawn;
let timeOfLastAppleSpawn;
let timeOfLastAppleEaten;

class Snake {
    static startingLength = 80;
    static speed = 0.5;
    static headRadius = 40;
    static closestToIgnore = 4;
    static headRadius = 20;
    /**
     * 
     * @param {Vector} position the position of the snake's head
     */
    constructor(position) {
        this.position = position.copy();
        this.direction = Vector.fromPolar(-PI/180 * 45, 1);
        this.tail = new Array(Snake.startingLength).fill(0).map((x, i) => Vector.fromPolar(PI/180 * 135, Snake.speed*20*(i+1)).add(position));
        this.timeOfLastTailShrink = time;
    }
}

// base enemy class
class Enemy {
    /**
     * 
     * @param {Number} lifespan the total lifetime of the enemy
     * @param {Number} inactiveTime the time when a warning is drawn but the enemy itself is not active
     */
    constructor(lifespan, inactiveTime) {
        this.lifespan = lifespan;
        this.inactiveTime = inactiveTime;
        this.spawnTime = time;
    }
    
    get life() { return time-this.spawnTime; }

    /**
     * 
     * @returns {boolean}
     */
    get active() {
        return this.life > this.inactiveTime;
    }

    /**
     * 
     * @returns {boolean}
     */
    get dead() {
        return this.life > this.lifespan;
    }

    /**
     * 
     * @param {Vector} point
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        return null;
    }

    draw() {
        // nothing
    }
}

class CircleEnemy extends Enemy {
    static lifespan = 10000;
    static inactiveTime = 3000;
    static minRadius = 100;
    static maxRadius = 400;
    constructor(position) {
        super(CircleEnemy.lifespan, CircleEnemy.inactiveTime);
        this.position = position.copy();
        this.radius = randomRange(CircleEnemy.minRadius, CircleEnemy.maxRadius);
    }

    draw() {
        strokeStyle("#f00");
        if (!this.active) {
            fillStyle("#8669");
            circle(this.position, this.radius, -0.25 - this.life/this.inactiveTime * 0.5, -0.25 + this.life/this.inactiveTime * 0.5);
        } else {
            fillStyle("#f00");
            circle(this.position, this.radius);
        }
    }

    /**
     * 
     * @param {Vector} point 
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        let l = max(0, point.distanceTo(this.position)-this.radius);
        return l*l;
    }
}

class RectangleEnemy extends Enemy {
    static lifespan = 10000;
    static inactiveTime = 3000;
    static minSize = 100;
    static maxSize = 400;
    constructor(position) {
        super(RectangleEnemy.lifespan, RectangleEnemy.inactiveTime);
        this.position = position.copy();
        this.size = Vector.random(RectangleEnemy.maxSize-RectangleEnemy.minSize, RectangleEnemy.maxSize-RectangleEnemy.minSize).add(RectangleEnemy.minSize, RectangleEnemy.minSize);
    }

    draw() {
        strokeStyle("#f00");
        if (!this.active) {
            fillStyle("#8669");
            let width = this.size.x * this.life/this.inactiveTime;
            let height = this.size.y * this.life/this.inactiveTime;
            ctx.fillRect(this.position.x-width/2, this.position.y-height/2, width, height);
        } else {
            fillStyle("#f00");
            ctx.fillRect(this.position.x-this.size.x/2, this.position.y-this.size.y/2, this.size.x, this.size.y);
        }
        ctx.strokeRect(this.position.x-this.size.x/2, this.position.y-this.size.y/2, this.size.x, this.size.y);
    }

    /**
     * 
     * @param {Vector} point 
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        let closestPoint = new Vector(clamp(point.x, this.position.x-this.size.x/2, this.position.x+this.size.x/2), clamp(point.y, this.position.y-this.size.y/2, this.position.y+this.size.y/2));
        return point.sqrDistanceTo(closestPoint);
    }
}

class LineEnemy extends Enemy {
    static lifespan = 20000;
    static inactiveTime = 5000;
    constructor(position) {
        super(RectangleEnemy.lifespan, RectangleEnemy.inactiveTime);
        let value = randomRange(0, 2*CANVASWIDTH + 2*CANVASHEIGHT);
        this.a = new Vector();
        let invalidSide = -1;
        if (value < CANVASWIDTH) {
            this.a = new Vector(value, 0);
            invalidSide = 0;
        } else if (value < 2*CANVASWIDTH) {
            this.a = new Vector(value - CANVASWIDTH, CANVASHEIGHT);
            invalidSide = 1;
        } else if (value < 2*CANVASWIDTH + CANVASHEIGHT) {
            this.a = new Vector(0, value - 2*CANVASWIDTH);
            invalidSide = 2;
        } else {
            this.a = new Vector(CANVASWIDTH, value - (2*CANVASWIDTH + CANVASHEIGHT));
            invalidSide = 3;
        }
        let direction = this.a.to(position);
        let m = direction.y/direction.x;
        let c = this.a.y - m*this.a.x;
        let collisions = [
            new Vector(-c/m, 0),
            new Vector((CANVASHEIGHT-c)/m, CANVASHEIGHT),
            new Vector(0, c),
            new Vector(CANVASWIDTH, m*CANVASWIDTH + c)
        ];
        collisions.splice(invalidSide, 1);
        for (let i=collisions.length-1; i>=0; i--) {
            if (!Vector.inBounds(collisions[i], new Vector(0, 0), new Vector(CANVASWIDTH, CANVASHEIGHT))) {
                collisions.splice(i, 1);
            }
        }
        collisions.sort((a, b) => this.a.to(a).sqrLength() - this.a.to(b).sqrLength());
        this.b = collisions[0].copy();
    }

    draw() {
        lineWidth(10);
        if (!this.active) {
            let offset = this.a.to(this.b).multiply(this.life/this.inactiveTime);
            strokeStyle("#8669");
            beginPath();
            moveTo(this.a);
            lineTo(Vector.add(this.a, offset));
            stroke();
        } else {
            strokeStyle("#f00");
            beginPath();
            moveTo(this.a);
            lineTo(this.b);
            stroke();
        }
    }

    /**
     * 
     * @param {Vector} point 
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        let m1 = (this.b.y-this.a.y)/(this.b.x-this.a.x);
        let c1 = this.a.y - m1*this.a.x;

        let m2 = -1/m1;
        let c2 = point.y - m2*point.x;

        let x = (c1-c2)/(m2-m1);
        let y = m1*x + c1;
        return point.sqrDistanceTo(new Vector(x, y));
    }
}

class ProjectileEnemy extends Enemy {
    static lifespanPerUnit = 13.9;
    static inactiveTime = 3000;
    static radius = 70;
    constructor(position) {
        super(RectangleEnemy.lifespan, RectangleEnemy.inactiveTime);
        let value = randomRange(0, 2*CANVASWIDTH + 2*CANVASHEIGHT);
        this.a = new Vector();
        let invalidSide = -1;
        if (value < CANVASWIDTH) {
            this.a = new Vector(value, 0);
            invalidSide = 0;
        } else if (value < 2*CANVASWIDTH) {
            this.a = new Vector(value - CANVASWIDTH, CANVASHEIGHT);
            invalidSide = 1;
        } else if (value < 2*CANVASWIDTH + CANVASHEIGHT) {
            this.a = new Vector(0, value - 2*CANVASWIDTH);
            invalidSide = 2;
        } else {
            this.a = new Vector(CANVASWIDTH, value - (2*CANVASWIDTH + CANVASHEIGHT));
            invalidSide = 3;
        }
        let direction = this.a.to(position);
        let m = direction.y/direction.x;
        let c = this.a.y - m*this.a.x;
        let collisions = [
            new Vector(-c/m, 0),
            new Vector((CANVASHEIGHT-c)/m, CANVASHEIGHT),
            new Vector(0, c),
            new Vector(CANVASWIDTH, m*CANVASWIDTH + c)
        ];
        collisions.splice(invalidSide, 1);
        for (let i=collisions.length-1; i>=0; i--) {
            if (!Vector.inBounds(collisions[i], new Vector(0, 0), new Vector(CANVASWIDTH, CANVASHEIGHT))) {
                collisions.splice(i, 1);
            }
        }
        collisions.sort((a, b) => this.a.to(a).sqrLength() - this.a.to(b).sqrLength());
        this.b = collisions[0].copy();
        this.lifespan = ProjectileEnemy.inactiveTime + ProjectileEnemy.lifespanPerUnit*this.a.to(this.b).length();
    }

    currentPosition = (t) => {
        return this.a.to(this.b).multiply(t ? t : (this.life-this.inactiveTime)/(this.lifespan-this.inactiveTime)).add(this.a);
    }

    draw() {
        let position = this.currentPosition(this.active ? null : this.life/this.inactiveTime);
        if (!this.active) {
            strokeStyle("#8669");
            fillStyle("#8669");
            beginPath();
            moveTo(this.a);
            lineTo(position);
            stroke();
            circle(position, ProjectileEnemy.radius);
        } else {
            fillStyle("#f00");
            circle(position, ProjectileEnemy.radius);
            strokeStyle("#f00");
            lineWidth(5);
            let theta = this.a.to(this.b).theta()/(2*PI);
            circle(position, ProjectileEnemy.radius*1.4, theta-0.2, theta+0.2, false, false, true);
        }
    }

    /**
     * 
     * @param {Vector} point 
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        return max(point.sqrDistanceTo(this.currentPosition(null)) - ProjectileEnemy.radius*ProjectileEnemy.radius, 0);
    }
}

/**
 * @type {Snake}
 */
let player;
let debug;
/**
 * @type {Enemy[]}
 */
let enemies;
/**
 * @type {Vector[]}
 */
let apples;

let newApplePosition = () => Vector.random(CANVASWIDTH-APPLE_SPAWN_MARGIN*2, CANVASHEIGHT-APPLE_SPAWN_MARGIN*2).add(APPLE_SPAWN_MARGIN, APPLE_SPAWN_MARGIN);

const ENEMY_TYPES = [CircleEnemy, RectangleEnemy, LineEnemy, ProjectileEnemy];
