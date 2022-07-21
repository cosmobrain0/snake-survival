draw = () => {
	beginPath();
	fillStyle(Mouse.leftclick.down ? "#fff" : "#07f");
	arc(Mouse.position.x, Mouse.position.y, 20, 0, 2*Math.PI);
	fill();

	fillStyle("#999");
	circle(player.position, 30);
	if (player.tail.length) {
		beginPath();
		lineWidth(3);
		strokeStyle("#999");
		moveTo(player.tail[player.tail.length-1]);
		for (let i=player.tail.length-2; i>=0; i--) {
			lineTo(player.tail[i]);
		}
		lineTo(player.position);
		stroke();
	}

	// fillStyle("#fff");
	// circle(new Vector(20, 20), 20);
}