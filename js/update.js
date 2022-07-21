let timeOfLastEnemySpawn;
calc = () => {
    for (let i=player.tail.length-1; i>0; i--) {
        player.tail[i] = player.tail[i-1].copy();
    }
    player.tail[0] = player.position.copy();
    player.position.add(Vector.multiply(player.direction, Snake.speed));
    for (let i=player.tail.length-1; i>=Snake.closestToIgnore; i--) {
        if (player.position.to(player.tail[i]).sqrLength() < 20*20) {
            paused = true;
            Rune.gameOver();
            return;
        }
        for (let enemy of enemies) {
            if (enemy.active && enemy.sqrDistanceToPoint(player.tail[i]) <= 0) {
                player.tail.splice(i);
                break;
            }
        }
    }
    for (let enemy of enemies) {
        if (enemy.active && enemy.sqrDistanceToPoint(player.position) < 20*20) {
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

    for (let i=enemies.length-1; i>=0; i--) {
        if (enemies[i].dead) enemies.splice(i, 1);
    }

    if (time - timeOfLastEnemySpawn > 4000) {
        enemies.push(new CircleEnemy(Vector.random(CANVASWIDTH, CANVASHEIGHT), randomRange(100, 400)));
        timeOfLastEnemySpawn = time;
    }

    score = floor(time/100);
    debug.renderer.text = `${score}`;
}