calc = () => {
    for (let i=player.tail.length-1; i>0; i--) {
        player.tail[i] = player.tail[i-1].copy();
    }
    player.tail[0] = player.position.copy();
    player.position.add(Vector.multiply(player.direction, Snake.speed));
    if (!Vector.inBounds(player.position, new Vector(0, 0), new Vector(CANVASWIDTH, CANVASHEIGHT))) {
        paused = true;
        Rune.gameOver();
    }
}