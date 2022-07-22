draw = () => {
	drawEnemies();
	drawApples();
	drawPlayerSnake();
	drawTouchControls();
	drawScore();
}

let drawJoystick = () => {
	if (Mouse.leftclick.down) {
		fillStyle("#fff");
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
}

let drawTouchControls = () => {
	if (Mouse.leftclick.down) {
		let colour = Mouse.leftclick.start.x <= CANVASWIDTH/2 ? "#07f" : "#f40";
		fillStyle(colour);
		circle(Mouse.leftclick.start, 30);
		lineWidth(map(time%300, 0, 300, 1, 0.3) * 7);
		strokeStyle(colour);
		circle(Mouse.leftclick.start, map(time%300, 0, 300, 25, 80), 0, 1, false, false, true);
	}
}

let drawPlayerSnake = () => {
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
}

let drawEnemies = () => {
	for (let enemy of enemies) enemy.draw();
}

let drawApples = () => {
	fillStyle("#fff");
	strokeStyle("#fff");
	lineWidth(3);
	for (let apple of apples) {
		circle(apple, APPLE_RADIUS);
	}
}

let drawScore = () => {
	let v = 1 - clamp((time-timeOfLastAppleEaten)/500, 0, 1);
	debug.renderer.bgcolour = `rgb(${0 * v}, ${119 * v}, ${255 * v})`;
}
