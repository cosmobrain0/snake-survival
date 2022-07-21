const { log } = console;

let CANVASWIDTH = 1440;
let CANVASHEIGHT = 2560;

let c = document.createElement("canvas");
let ctx = c.getContext("2d");
c.width = CANVASWIDTH;
c.height = CANVASHEIGHT;
c.style.background = '#000';
ctx.textBaseline = 'top';
ctx.fillStyle = '#fff';
ctx.font = "40px Arial";
document.body.appendChild(c);
ctx.imageSmoothingEnabled = false;

/**
 * @typedef {Object} MouseButton
 * @property {boolean} down true while this button is pressed
 * @property {Vector} start the position of the mouse the last time it was pressed
 * @property {Vector[]} path the path the mouse took the last time this button was held down
 */
/**
 * @typedef {Object} Mouse
 * @property {Vector} position the current position
 * @property {MouseButton} leftclick information about the mouse left click button
 * @property {MouseButton} rightclick information about the mouse right click button
 * @property {Menu} selected the current selected menu
 * @property {Number} mouseTouchIdentifier for touchscreens
 */
/**
 * @type {Mouse}
 */
const Mouse = {
	position: new Vector(0, 0),
	leftclick: {
		down: false,
		start: new Vector(0, 0),
		path: [],
	},
	rightclick: {
		down: false,
		start: new Vector(0, 0),
		path: [],
	},
	selected: null,
	mouseTouchIdentifier: null,
};
let leftDrag = () => Vector.subtract(Mouse.position, Mouse.leftclickstart);
let rightDrag = () => Vector.subtract(Mouse.position, Mouse.rightclickstart);
const UI = new Menu(new Vector(0, 0), null);
let keymap = {};
let previousFrameTime, currentFrameTime, lastDeltaTime, deltaTime;
const { Engine, Render, Runner, Bodies, Body, Composite } = Matter;
/**
 * @type {Engine}
 */
let engine; // physics engine
let paused = false;
let time, score;

let init = () => false;
let calc = () => false;
let draw = () => false;
let getScore = () => score;
let pauseGame = () => paused = true;
let resumeGame = () => paused = false;
let restartGame = () => paused = false;

let events = {
	mousemove: [],
	mousedown: [],
	mouseup  : [],
	keydown  : [],
	keyup    : [],
	wheel    : []
}

window.onload = () => {
	engine = Engine.create();
	paused = false;
	time = 0;
	score = 0;
	init();
    requestAnimationFrame(main);
	Rune.init({resumeGame, restartGame, pauseGame, getScore});
	previousFrameTime = Date.now();
}

let main = () => {
	currentFrameTime = Date.now();
	lastDeltaTime = deltaTime == null ? 1 : deltaTime;
	deltaTime = currentFrameTime - previousFrameTime;
	if (!paused) {
		let totalTimeRequired = deltaTime;
		let previousX = lastDeltaTime%10;
		if (previousX == 0) previousX = 10;
		let currentX = 0;
		let totalTimeDone = 0;
		while (totalTimeDone < totalTimeRequired) {
			currentX = min(totalTimeRequired-totalTimeDone, 10);
			Engine.update(engine, currentX, currentX/previousX);
			totalTimeDone += currentX;
			previousX = currentX;
		}
		calc();
	}
	previousFrameTime = currentFrameTime;
    ctx.clearRect(0, 0, c.width, c.height);
    adjustSize();
	draw();
	UI.draw();
    requestAnimationFrame(main);
}

onmousemove = e => {
	Mouse.position = adjustMousePosition(e.clientX, e.clientY);
	if (Mouse.leftclick.down) Mouse.leftclick.path.push(Mouse.position.copy());
	if (Mouse.rightclick.down) Mouse.rightclick.path.push(Mouse.position.copy());
	for (let f of events.mousemove) f();
}
onmousedown = e => {
    if (e.button == 0) {
		Mouse.leftclick.down = true;
		Mouse.leftclick.start = Mouse.position.copy();
		Mouse.leftclick.path = [Mouse.position.copy()];
		Mouse.selected = null;
		
	}
    else if (e.button == 2) {
		Mouse.rightclick.down = true;
		Mouse.rightclick.start = Mouse.position.copy();
		Mouse.rightclick.path = [Mouse.position.copy()];
	}
    // handle start-of-press inputs
	for (let f of events.mousedown) f();
}
onmouseup = e => {
    if (e.button == 0) {
		Mouse.leftclick.down = false;
		UI.update();
	}
    else if (e.button == 2) Mouse.rightclick.down = false;
    // handle end-of-press inputs
	for (let f of events.mouseup) f();
}
oncontextmenu = e => e.preventDefault(); // custom context menus?

onkeyup = e => {
    keymap[e.key] = false;
    // handle any one-time-per-key-press inputs
	for (let f of events.keyup) f(e.key);
}

onkeydown = e => {
    keymap[e.key] = true;
    // handle any key-held-down inputs
	for (let f of events.keydown) f(e.key);
}

onwheel = e => {
    // e.deltaY
	for (let f of events.wheel) f(e.deltaY);
}

ontouchstart = e => {
	if (e.touches.length) {
		if (Mouse.mouseTouchIdentifier == null) {
			Mouse.position = adjustMousePosition(e.touches[0].clientX, e.touches[0].clientY);
			Mouse.leftclick.down = true;
			Mouse.leftclick.start = Mouse.position.copy();
			Mouse.leftclick.path = [Mouse.position.copy()];
			Mouse.mouseTouchIdentifier = e.touches[0].identifier;
			Mouse.selected = null;
		}
	}
}
ontouchmove = e => {
	for (let i=0; i < e.changedTouches.length; i++) {
		if (e.changedTouches[i].identifier == Mouse.mouseTouchIdentifier) {
			Mouse.position = adjustMousePosition(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
			Mouse.leftclick.path.push(Mouse.position.copy());
			break;
		}
	}
}
ontouchcancel = e => {
	for (let i=0; i<e.changedTouches.length; i++) {
		if (e.changedTouches[i].identifier == Mouse.mouseTouchIdentifier) {
			Mouse.leftclick.down = false;
			Mouse.mouseTouchIdentifier = null;
		}
	}
}
ontouchend = e => {
	for (let i=0; i<e.changedTouches.length; i++) {
		if (e.changedTouches[i].identifier == Mouse.mouseTouchIdentifier) {
			Mouse.leftclick.down = false;
			Mouse.mouseTouchIdentifier = null;
		}
	}
}