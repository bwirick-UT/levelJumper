import { canvas, ctx } from "./utils.js";

// ====================
// GAME STATE
// ====================

const gravity = 0.5;

let player = {
  x: 50,
  y: 300,
  width: 50,
  height: 50,
  vx: 0,
  vy: 0,
  speed: 8,
  jumping: false
};

let platforms = [];
let coin = {};
let door = {};
let currentLevel = 1;
let gameWon = false;
let levelsData = [];

let keys = {};

// ====================
// LOAD LEVELS
// ====================

async function loadLevels() {
  try {
    const response = await fetch("./levels.json");
    const data = await response.json();
    levelsData = data.levels;
    generateLevel();
  } catch (error) {
    console.error("Error loading levels:", error);
  }
}

// Helper function to evaluate canvas expressions
function evaluateValue(value, key) {
  if (typeof value === "string") {
    return eval(value);
  }
  return value;
}

// ====================
// INPUT
// ====================

document.addEventListener("keydown", e => {
  keys[e.key] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "r") {
    generateLevel();
  }
  if (gameWon && e.key === "Enter") {
    restartGame();
  }
});

// Restart button click handler
canvas.addEventListener("click", (e) => {
  if (gameWon) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Button bounds
    const buttonX = canvas.width / 2 - 75;
    const buttonY = canvas.height / 2 + 60;
    const buttonWidth = 150;
    const buttonHeight = 50;

    if (
      clickX > buttonX &&
      clickX < buttonX + buttonWidth &&
      clickY > buttonY &&
      clickY < buttonY + buttonHeight
    ) {
      restartGame();
    }
  }
});

// ====================
// Level Generation
// ====================

function restartGame() {
  currentLevel = 1;
  gameWon = false;
  generateLevel();
}

function generateLevel() {
  platforms = [];
  gameWon = false;

  const levelData = levelsData[currentLevel - 1]; // -1 for level 1, +1 for level 3

  if (levelData) {
    // Load platforms
    levelData.platforms.forEach(p => {
      platforms.push({
        x: evaluateValue(p.x),
        y: evaluateValue(p.y),
        width: evaluateValue(p.width),
        height: evaluateValue(p.height)
      });
    });

    // Load coin
    coin = {
      x: evaluateValue(levelData.coin.x),
      y: evaluateValue(levelData.coin.y),
      size: levelData.coin.size,
      collected: false
    };

    // Load door
    door = {
      x: evaluateValue(levelData.door.x),
      y: evaluateValue(levelData.door.y),
      width: levelData.door.width,
      height: levelData.door.height
    };
  }

  // Reset player
  player.x = 50;
  player.y = canvas.height - 50;
  player.vx = 0;
  player.vy = 0;
}

// ====================
// GAME LOOP
// ====================

function update() {
  // Movement
  if (keys["ArrowLeft"]) player.vx = -player.speed;
  else if (keys["ArrowRight"]) player.vx = player.speed;
  else player.vx = 0;

  // Jump
  if (keys[" "] && !player.jumping) {
    player.vy = -15;
    player.jumping = true;
  }

  // Gravity
  player.vy += gravity;

  // Apply velocity
  player.x += player.vx;
  player.y += player.vy;

  // Platform collision
  platforms.forEach(p => {
    if (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y < p.y + p.height &&
      player.y + player.height > p.y
    ) {
      if (player.vy > 0) {
        player.y = p.y - player.height;
        player.vy = 0;
        player.jumping = false;
      }
    }
  });

  // Coin collision
  if (
    !coin.collected &&
    player.x < coin.x + coin.size &&
    player.x + player.width > coin.x &&
    player.y < coin.y + coin.size &&
    player.y + player.height > coin.y
  ) {
    coin.collected = true;
  }

  // Door collision (if coin collected)
  if (
    coin.collected &&
    player.x < door.x + door.width &&
    player.x + player.width > door.x &&
    player.y < door.y + door.height &&
    player.y + player.height > door.y
  ) {
    if (currentLevel < 3) {
      currentLevel++;
      generateLevel();
    } else {
      gameWon = true;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";

  // Player
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Platforms
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // Coin
  if (!coin.collected) {
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Door
  ctx.strokeRect(door.x, door.y, door.width, door.height);

  // Level indicator
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Level ${currentLevel}`, 10, 25);

  // Win screen
  if (gameWon) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "gold";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText("All levels completed!", canvas.width / 2, canvas.height / 2 + 40);

    // Restart button
    const buttonX = canvas.width / 2 - 75;
    const buttonY = canvas.height / 2 + 60;
    const buttonWidth = 150;
    const buttonHeight = 50;

    ctx.fillStyle = "gold";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    ctx.fillStyle = "black";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Restart (Enter)", canvas.width / 2, buttonY + 32);
    
    ctx.textAlign = "left";
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Load levels and start the game
loadLevels().then(() => {
  gameLoop();
});
