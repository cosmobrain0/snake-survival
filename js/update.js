calc = () => {
    movePlayer();
    updateEnemies();
    updateApples();
    checkGameOver();
    calculateScore();
}

let movePlayer = () => {
    if (Mouse.leftclick.down) player.direction.rotate(PLAYER_ROTATION_SPEED * deltaTime * (Mouse.leftclick.start.x <= CANVASWIDTH/2 ? -1 : 1));
    for (let i=player.tail.length-1; i>0; i--) {
        player.tail[i] = player.tail[i-1].copy();
    }
    player.tail[0] = player.position.copy();
    player.position.add(Vector.multiply(player.direction, Snake.speed*deltaTime));
    if (time-player.timeOfLastTailShrink > TAIL_SHRINK_INTERVAL) {
        player.timeOfLastTailShrink = time;
        player.tail.splice(player.tail.length-1);
    }
}

let checkGameOver = () => {
    if (player.tail.length <= Snake.closestToIgnore) {
        paused = true;
        Rune.gameOver();
        return;
    }
    for (let i=player.tail.length-1; i>=Snake.closestToIgnore; i--) {
        if (player.position.to(player.tail[i]).sqrLength() < Snake.headRadius*Snake.headRadius) {
            paused = true;
            Rune.gameOver();
            return;
        }
        for (let enemy of enemies) {
            if (enemy.active && enemy.sqrDistanceToPoint(player.tail[i]) <= 5*5) {
                player.tail.splice(i);
                break;
            }
        }
    }
    for (let enemy of enemies) {
        if (enemy.active && enemy.sqrDistanceToPoint(player.position) < Snake.headRadius*Snake.headRadius) {
            paused = true;
            Rune.gameOver();
            return;
        }
    }
    if (!Vector.inBounds(player.position, new Vector(0, 0), new Vector(CANVASWIDTH, CANVASHEIGHT))) {
        paused = true;
        Rune.gameOver();
        return;
    }
}

let updateEnemies = () => {
    for (let i=enemies.length-1; i>=0; i--) {
        if (enemies[i].dead) enemies.splice(i, 1);
    }

    if (time - timeOfLastEnemySpawn > ENEMY_SPAWN_INTERVAL) {
        let Type = ENEMY_TYPES[floor(randomRange(0, ENEMY_TYPES.length))];
        enemies.push(new Type(Vector.random(CANVASWIDTH, CANVASHEIGHT)));
        timeOfLastEnemySpawn = time;
    }
}

let calculateScore = () => {
    score += deltaTime * TIME_SCORE_MULTIPLIER;
    debug.renderer.text = `${floor(score)}`;
    font(debug.renderer.font);
    let details = ctx.measureText(`${floor(score)}`);
    debug.renderer.width = details.actualBoundingBoxLeft + details.actualBoundingBoxRight + SCORE_BOX_PADDING_X;
}

let updateApples = () => {
    for (let i=apples.length-1; i>=0; i--) {
        if (apples[i].to(player.position).sqrLength() < (Snake.headRadius + APPLE_RADIUS)*(Snake.headRadius + APPLE_RADIUS)) {
            let playerTailOffset = player.tail[player.tail.length-2].to(player.tail[player.tail.length-1]);
            let previousPoint = player.tail[player.tail.length-1];
            for (let j=0; j<APPLE_LENGTH_INCREASE; j++) {
                let newPoint = Vector.add(previousPoint, playerTailOffset);
                player.tail.push(Vector.add(previousPoint, playerTailOffset));
                previousPoint = newPoint.copy();
            }
            timeOfLastAppleEaten = time;
            timeOfLastAppleSpawn = time;
            score += APPLE_SCORE_INCREASE;
            apples[i] = newApplePosition();
        }
    }
}
