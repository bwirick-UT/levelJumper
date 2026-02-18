import { resizeCanvas, canvas, ctx } from "./utils.js";

// ====================
// GAME STATE
// ====================

const gravity = 0.6;

let player = {
  x: 80,
  y: 0,
  width: 20,
  height: 20,
  vy: 0,
  jumping: false
};

let groundY = canvas.height - 40;

let obstacle = {
  x: canvas.width,
  y: groundY - 20,
  width: 20,
  height: 20
};

let gameSpeed = 4;
let score = 0;
let gameOver = false;

let keys = {};

// ====================
// INPUT
// ====================

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  // Restart on game over
  if (gameOver && e.key === "Enter") {
    resetGame();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// ====================
// RESET GAME
// ====================

function resetGame() {
  player.y = groundY - player.height;
  player.vy = 0;
  player.jumping = false;

  obstacle.x = canvas.width;
  gameSpeed = 4;
  score = 0;
  gameOver = false;
}

// Initial position
resetGame();

// ====================
// UPDATE
// ====================

function update() {
  if (gameOver) return;

  // Jump
  if (keys[" "] && !player.jumping) {
    player.vy = -12;
    player.jumping = true;
  }

  // Gravity
  player.vy += gravity;
  player.y += player.vy;

  // Ground collision
  if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.jumping = false;
  }

  // Move obstacle (WORLD MOVES LEFT)
  obstacle.x -= gameSpeed;

  // Recycle obstacle
  if (obstacle.x < -obstacle.width) {
    obstacle.x = canvas.width + Math.random() * 200;
  }

  // Collision detection
  if (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  ) {
    gameOver = true;
  }

  // Increase difficulty slowly
  gameSpeed += 0.002;

  // Score = time survived
  score++;
}

// ====================
// DRAW
// ====================

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";

  // Ground
  ctx.fillRect(0, groundY, canvas.width, 2);

  // Player
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Obstacle
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  // Score
  ctx.font = "16px monospace";
  ctx.fillText("Score: " + score, 20, 30);

  if (gameOver) {
    ctx.fillText("GAME OVER", canvas.width / 2 - 50, canvas.height / 2);
    ctx.fillText("Press Enter to Restart", canvas.width / 2 - 100, canvas.height / 2 + 25);
  }
}

// ====================
// GAME LOOP
// ====================

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
