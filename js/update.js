calc = () => {
    movePlayer();
    updateEnemies();
    updateApples();
    checkGameOver();
    calculateScore();
    manageParticles();
}

let movePlayer = () => {
    if (keymap['a'] || (Mouse.leftclick.down && Mouse.leftclick.start.x <= CANVASWIDTH/2) || Mouse.touches.filter(x => x.down && x.start.x <= CANVASWIDTH/2).length) player.direction.rotate(-PLAYER_ROTATION_SPEED * deltaTime);
    if (keymap['d'] || (Mouse.leftclick.down && Mouse.leftclick.start.x > CANVASWIDTH/2) || Mouse.touches.filter(x => x.down && x.start.x > CANVASWIDTH/2).length) player.direction.rotate( PLAYER_ROTATION_SPEED * deltaTime);
    for (let i=player.tail.length-1; i>0; i--) {
        player.tail[i] = player.tail[i-1].copy();
    }
    player.tail[0] = player.position.copy();
    player.position.add(Vector.multiply(player.direction, Snake.speed*deltaTime));
    if (time-player.timeOfLastTailShrink > TAIL_SHRINK_INTERVAL) {
        player.timeOfLastTailShrink = time;
        player.tail.splice(player.tail.length-1);
    }

    PARTICLES.push(new Particle(player.tail[player.tail.length-1].copy(), Vector.fromPolar(randomRange(0, 2*PI), 0.1), 500, 10, "#fff"))
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
        if (random() < 0.4) enemies[i].spawnParticles();
        if (enemies[i].dead) enemies.splice(i, 1);
    }

    if (time - timeOfLastEnemySpawn > enemySpawnInterval) {
        let Type = ENEMY_TYPES[floor(randomRange(0, ENEMY_TYPES.length))];
        enemies.push(new Type(Vector.random(CANVASWIDTH, CANVASHEIGHT)));
        timeOfLastEnemySpawn = time;
        enemySpawnInterval *= 0.99;
    }
    if (random() < 0.8) {
        PARTICLES.push(new Particle(randomPointInRectangle(0, 0, CANVASWIDTH, CANVASHEIGHT), Vector.fromPolar(random()*2*PI, 0.1), 1000, 15, "#f00"));
    }
}

let calculateScore = () => {
    let appleMultiplier = time-timeOfLastAppleEaten < APPLE_COMBO_MAX_TIME ? APPLE_COMBO_SCORE_MULTIPLIER**appleComboChain : 1;
    score += deltaTime * TIME_SCORE_MULTIPLIER * appleMultiplier;
    debug.renderer.text = `${floor(score)}`;
    font(debug.renderer.font);
    let details = ctx.measureText(debug.renderer.text);
    debug.renderer.width = details.actualBoundingBoxLeft + details.actualBoundingBoxRight + SCORE_BOX_PADDING_X;
}

let updateApples = () => {
    for (let i=apples.length-1; i>=0; i--) {
        if (random() < 0.3) {
            PARTICLES.push(new Particle(apples[i].copy(), Vector.fromPolar(randomRange(0, 2*PI), 0.1), 1000, 15, "#fbff00"))
        }
        if (apples[i].to(player.position).sqrLength() < (Snake.headRadius + APPLE_RADIUS)*(Snake.headRadius + APPLE_RADIUS)) {
            appleComboChain++;
            let playerTailOffset = player.tail[player.tail.length-2].to(player.tail[player.tail.length-1]);
            let previousPoint = player.tail[player.tail.length-1];
            for (let j=0; j<APPLE_LENGTH_INCREASE * (APPLE_COMBO_LENGTH_INCREASE_MULTIPLIER ** appleComboChain); j++) {
                let newPoint = Vector.add(previousPoint, playerTailOffset.copy().rotate(PLAYER_ROTATION_SPEED*deltaTime*j));
                player.tail.push(newPoint.copy());
                previousPoint = newPoint.copy();
            }
            timeOfLastAppleEaten = time;
            timeOfLastAppleSpawn = time;
            let scoreIncrease = APPLE_SCORE_INCREASE * (APPLE_COMBO_SCORE_MULTIPLIER ** appleComboChain);
            score += scoreIncrease;
            scoreMenu.addButton(RectangleButton(scoreMenu, apples[i].x, apples[i].y, 200, 70, colourToString(COMBO_UI_SECONDARY_COLOUR), "#0000", `+${floor(scoreIncrease)}`, "#000", "50px Arial", []));
            scoreMenu.addButton(CircleButton(scoreMenu, apples[i].x+100, apples[i].y+100, 40, colourToString(COMBO_UI_SECONDARY_COLOUR), "#0000", `x${appleComboChain}`, "#000", "50px Arial", []));
            for (let j=0; j<20; j++) {
                PARTICLES.push(new Particle(apples[i].copy(), Vector.fromPolar(randomRange(0, 2*PI), 0.1), 1000, 15, "#fff"))
            }
            apples[i] = newApplePosition();
        }
    }
    if (time-timeOfLastAppleEaten > APPLE_COMBO_MAX_TIME) appleComboChain = 0;
}

let manageParticles = () => {
    for (let i=PARTICLES.length-1; i>=0; i--) {
        if (PARTICLES[i].dead) {
            PARTICLES.splice(i, 1);
        }
    }
}
