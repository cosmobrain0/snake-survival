draw = () => {
	beginPath();
	fillStyle(Mouse.leftclick.down ? "#fff" : "#07f");
	strokeStyle("#0000");
	circle(Mouse.position, 20);

	if (Mouse.leftclick.down) {
		circle(Mouse.leftclick.start, 20);
		let offset = leftDrag();
		let joystickDeadZone = 10;
		if (offset.sqrLength() > joystickDeadZone*joystickDeadZone) {
			player.direction = offset.normalise();
			let theta = player.direction.theta();
			strokeStyle("#fff");
			lineWidth(5);
			circle(Mouse.leftclick.start, 100, theta/(2*PI)-0.1, theta/(2*PI)+0.1, false, false, true);
		}
	}

	strokeStyle("#0000");
	fillStyle("#999");
	circle(player.position, 30);
	if (player.tail.length) {
		beginPath();
		lineWidth(3);
		strokeStyle("#999");
		moveTo(player.tail[player.tail.length-1]);
		for (let i=player.tail.length-2; i>=Snake.closestToIgnore; i--) {
			lineTo(player.tail[i]);
		}
		// lineTo(player.position);
		stroke();
	}

	for (let enemy of enemies) enemy.draw();

	// fillStyle("#fff");
	// circle(new Vector(20, 20), 20);
}