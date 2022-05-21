//canvas setup
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let TIME = 0.6;
let GRAVITY = 0.2;

let xPos = 0;
let yPos = 0;

let startX = -1;
let startY = -1;

let SHOOTDAMPED = 0.1;
let DEFAULTSIZE = 10;

let holdingMouse = false;
canvas.addEventListener('mousemove', e => {
		xPos = e.offsetX;
		yPos = e.offsetY;
});
canvas.addEventListener('mousedown', e => {
	if(e.button == 0){
		holdingMouse = true;
	}
	else if(e.button == 2){
		startX = e.offsetX;
		startY = e.offsetY;
	}
});
canvas.addEventListener('mouseup', e => {
	if(e.button == 0){
		holdingMouse = false;
	}
	else if(e.button == 2){
		let newBall = new Ball(startX, startY, DEFAULTSIZE, DEFAULTSIZE);
		newBall.velocity.x = (startX - e.offsetX) * SHOOTDAMPED;
		newBall.velocity.y = (startY - e.offsetY) * SHOOTDAMPED;
		ballArray.push(newBall);
		startX = -1;
		startY = -1;
	}
});
canvas.oncontextmenu = function (e) {
    e.preventDefault();
};
class Ball{
	position = {'x':0,'y':0};
	velocity = {'x':0,'y':0};
	acceleration = {'x':0,'y':0};
	force = {'x':0,'y':0};
	radius = 0;
	mass = 0;
	damp = 0.9;
	traction = 0.8;
	thrust = 0.002;
	color = {'r':0,'g':0,'b':0};
	constructor(xposition, yposition, radius, mass){
		this.position.x = xposition;
		this.position.y = yposition;
		
		this.velocity.x = 0;
		this.velocity.y = 0;
		
		this.acceleration.x = 0;
		this.acceleration.y = 0;
		
		this.radius = radius;
		this.mass = mass;
		
		this.color.r = Math.floor(Math.random() * 256);
		this.color.g = Math.floor(Math.random() * 256);
		this.color.b = Math.floor(Math.random() * 256);
	}
}
let ball = new Ball(canvas.width/2,canvas.height/2,DEFAULTSIZE,DEFAULTSIZE);
let ballArray = [ball];
//called on page load
function init(){
	//called only once
	frame();
}
//called every 1/60 of a second
function frame(){
	//draws main screen
	updatePosition();
	moveObject();
	checkCollision();
	draw();
	window.requestAnimationFrame(frame);
}
function draw(){
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	if(startX >= 0 && startY >= 0){
		ctx.strokeStyle = 'red';
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(startX-(xPos-startX)*SHOOTDAMPED/0.5, startY-(yPos-startY)*SHOOTDAMPED/0.5);
		ctx.stroke();
		
		ctx.fillStyle = 'blue';
		ctx.beginPath();
		ctx.arc(startX, startY, DEFAULTSIZE, 0, 2*Math.PI, false);
		ctx.fill();
	}
	for(let i=0;i<ballArray.length;i++){
		ctx.fillStyle = `rgba(${ballArray[i].color.r},${ballArray[i].color.g},${ballArray[i].color.b},1)`;
		ctx.beginPath();
		ctx.arc(ballArray[i].position.x, ballArray[i].position.y, ballArray[i].radius, 0, 2*Math.PI, false);
		ctx.fill();
	}
}

function updatePosition(){
	for(let i=0;i<ballArray.length;i++){
		ballArray[i].velocity.x += ballArray[i].acceleration.x * TIME;
		ballArray[i].velocity.y += ballArray[i].acceleration.y * TIME;
		ballArray[i].position.x += ballArray[i].velocity.x * TIME;
		ballArray[i].position.y += ballArray[i].velocity.y * TIME;
		
		//check y bounding
		if(ballArray[i].position.y + ballArray[i].radius >= canvas.height){
			ballArray[i].velocity.y = -ballArray[i].velocity.y * ballArray[i].damp;
			ballArray[i].position.y = canvas.height - ballArray[i].radius;
			ballArray[i].velocity.x *= ballArray[i].traction;
		}
		else if(ballArray[i].position.y + ballArray[i].radius < 0){
			ballArray[i].velocity.y = -ballArray[i].velocity.y * ballArray[i].damp;
			ballArray[i].position.y = ballArray[i].radius;
		}
		//check x bounding
		if(ballArray[i].position.x + ballArray[i].radius >= canvas.width){
			ballArray[i].velocity.x = -ballArray[i].velocity.x * ballArray[i].damp;
			ballArray[i].position.x = canvas.width - ballArray[i].radius;
		}
		else if(ballArray[i].position.x - ballArray[i].radius < 0){
			ballArray[i].velocity.x = -ballArray[i].velocity.x * ballArray[i].damp;
			ballArray[i].position.x = ballArray[i].radius;
		}
	}
}

function moveObject(){
	for(let i=0;i<ballArray.length;i++){
		if(holdingMouse){
			let dx = ballArray[i].position.x - xPos;
			let dy = ballArray[i].position.y - yPos;
			
			ballArray[i].acceleration.x = -dx * ballArray[i].thrust;
			ballArray[i].acceleration.y = -dy * ballArray[i].thrust;
		}
		else{
			ballArray[i].acceleration.x = 0;
			ballArray[i].acceleration.y = 0;
		}
		ballArray[i].acceleration.y += GRAVITY;
	}
}
function checkCollision(){
	for(let i=0;i<ballArray.length;i++){
		for(let j=0;j<ballArray.length;j++){
			let dx = ballArray[j].position.x - ballArray[i].position.x;
			let dy = ballArray[j].position.y - ballArray[i].position.y;
			let d = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
			if(d < 1){
				d = 1;
			}
			if(d < ballArray[i].radius + ballArray[j].radius){
				let nx = dx / d;
				let ny = dy / d;
				let s = ballArray[i].radius + ballArray[j].radius - d;
				ballArray[i].position.x -= nx * s/2;
				ballArray[i].position.y -= ny * s/2;
				ballArray[j].position.x += nx * s/2;
				ballArray[j].position.y += ny * s/2;
			
				// Magic...
				let k = -2 * ((ballArray[j].velocity.x - ballArray[i].velocity.x) * nx + (ballArray[j].velocity.y - ballArray[i].velocity.y) * ny) / (1/ballArray[i].mass + 1/ballArray[j].mass);
				
				ballArray[i].velocity.x -= k * nx / ballArray[i].mass;
				ballArray[i].velocity.y -= k * ny / ballArray[i].mass;
				ballArray[j].velocity.x += k * nx / ballArray[j].mass;
				ballArray[j].velocity.y += k * ny / ballArray[j].mass;
			}
		}
	}
}