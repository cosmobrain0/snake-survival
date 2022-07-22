const APPLE_SPAWN_MARGIN = 20;
const APPLE_COUNT = 5;
const TAIL_SHRINK_INTERVAL = 150;
const ENEMY_SPAWN_INTERVAL = 4000;
const TIME_SCORE_MULTIPLIER = 1/100;
const SCORE_BOX_PADDING_X = 40;
const APPLE_RADIUS = 30;
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

const ENEMY_TYPES = [CircleEnemy, RectangleEnemy];
