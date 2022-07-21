init = () => {
    debug = RectangleButton(UI, 40, 40, 100, 50, "#000", "#0000", "DEBUG", "#fff", "50px Arial", []);
    restartGame();
    paused = true;
}

restartGame = () => {
    player = new Snake(new Vector(CANVASWIDTH/2, CANVASHEIGHT/2));
    paused = false;
    // circleEnemy = new CircleEnemy(new Vector(720, 800), 100);
    enemies = [];
    time = 0;
    timeOfLastEnemySpawn = time;
}
