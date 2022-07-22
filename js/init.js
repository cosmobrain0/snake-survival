init = () => {
    debug = RectangleButton(UI, 40, 40, 100, 50, "#f00", "#0000", "DEBUG", "#fff", "50px Arial", []);
    restartGame();
    paused = true;
}

restartGame = () => {
    time = 0;
    score = 0;
    player = new Snake(new Vector(CANVASWIDTH/2, CANVASHEIGHT/2));
    paused = false;
    enemies = [];
    timeOfLastEnemySpawn = time;
    timeOfLastAppleSpawn = time;
    timeOfLastAppleEaten = time;
    apples = new Array(APPLE_COUNT).fill(0).map(x => newApplePosition());
}
