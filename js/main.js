class Snake {
    static startingLength = 40;
    static speed = 10;
    static headRadius = 40;
    /**
     * 
     * @param {Vector} position the position of the snake's head
     */
    constructor(position) {
        this.position = position.copy();
        this.direction = Vector.fromPolar(-PI/180 * 45, 1);
        this.tail = new Array(Snake.startingLength).fill(0).map((x, i) => Vector.fromPolar(PI/180 * 135, Snake.speed*(i+1)).add(position));
    }
}

/**
 * @type {Snake}
 */
let player;
