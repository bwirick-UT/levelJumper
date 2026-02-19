import { resizeCanvas, canvas, ctx } from "./utils.js";

// ====================
// GAME STATE
// ====================

const gravity = 0.6;

let player = {
  x: 80,
  y: 0,
  width: 40,
  height: 40,
  vy: 0,
  jumping: false
};

let groundY = canvas.height - 40;

let obstacles = [];
let nextObstacleSpawn = 120;

let gameSpeed = 5;
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
// TOUCH CONTROLS (Mobile)
// ====================

document.addEventListener("touchstart", (e) => {
  e.preventDefault(); // Prevent default touch behaviors
  
  // Jump on tap
  if (!player.jumping) {
    player.vy = -12;
    player.jumping = true;
  }
  
  // Restart on game over
  if (gameOver) {
    resetGame();
  }
});

document.addEventListener("touchend", (e) => {
  e.preventDefault();
});

// ====================
// RESET GAME
// ====================

function spawnObstacle() {
  const type = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
  obstacles.push({
    x: canvas.width,
    y: groundY - 35,
    width: type * 35,
    height: 35,
    type: type
  });
}

function resetGame() {
  player.y = groundY - player.height;
  player.vy = 0;
  player.jumping = false;

  obstacles = [];
  nextObstacleSpawn = 120;
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

  // Spawn new obstacles
  nextObstacleSpawn--;
  if (nextObstacleSpawn <= 0) {
    spawnObstacle();
    nextObstacleSpawn = 30 + Math.random() * 40; // Spawn every 60-100 frames
  }

  // Move and remove obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= gameSpeed;
    
    // Remove if off-screen
    if (obstacles[i].x < -obstacles[i].width) {
      obstacles.splice(i, 1);
      continue;
    }

    // Collision detection
    if (
      player.x < obstacles[i].x + obstacles[i].width &&
      player.x + player.width > obstacles[i].x &&
      player.y < obstacles[i].y + obstacles[i].height &&
      player.y + player.height > obstacles[i].y
    ) {
      gameOver = true;
    }
  }

  // Increase difficulty faster
  gameSpeed += 0.0035;

  // Score = time survived
  score++;
}

// ====================
// DRAW
// ====================

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Disable image smoothing for crisp pixels
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "black";

  // Ground
  ctx.fillRect(0, groundY, canvas.width, 2);

  // Player
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Obstacles (triangle/triangles)
  const triangleWidth = 35;
  obstacles.forEach(obstacle => {
    for (let i = 0; i < obstacle.type; i++) {
      ctx.beginPath();
      const offsetX = Math.round(obstacle.x) + (i * triangleWidth);
      ctx.moveTo(offsetX + triangleWidth / 2, obstacle.y); // Top point
      ctx.lineTo(offsetX, obstacle.y + obstacle.height); // Bottom left
      ctx.lineTo(offsetX + triangleWidth, obstacle.y + obstacle.height); // Bottom right
      ctx.closePath();
      ctx.fill();
      
      // Add stroke for crisp edges
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

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
