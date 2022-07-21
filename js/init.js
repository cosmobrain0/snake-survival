init = () => {
    restartGame();
    paused = true;
}

restartGame = () => {
    player = new Snake(new Vector(CANVASWIDTH/2, CANVASHEIGHT/2));
    paused = false;
}
