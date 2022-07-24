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
		let colour = "#555";
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
	strokeStyle("#f00");
	lineWidth(10);
	strokeRect(5, 5, CANVASWIDTH-10, CANVASHEIGHT-10)
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
	for (let i=scoreMenu.buttons.length-1; i>=0; i--) {
		let alpha = scoreMenu.buttons[i].renderer.bgcolour.split(",")[3];
		alpha = alpha.slice(1, alpha.length-1);
		alpha = max(parseFloat(alpha) - 0.05, 0);
		scoreMenu.buttons[i].renderer.bgcolour = colourToString(COMBO_UI_SECONDARY_COLOUR, alpha);
		if (alpha == 0) scoreMenu.buttons.splice(i, 1);
	}

	let v = 1 - clamp((time-timeOfLastAppleEaten)/APPLE_COMBO_MAX_TIME, 0, 1);
	debug.renderer.bgcolour = colourToString(COMBO_UI_COLOUR.map(x => x*v));
}
