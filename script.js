const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayDesc = document.getElementById("overlay-desc");
const actionBtn = document.getElementById("action-btn");
const kbHints = document.getElementById("kb-hints");

// Mobile controls
const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameLoopTimeout;
let gameState = "START"; 
let speed = 120; 

highScoreElement.textContent = highScore;

// Colors
const COLOR_BG = "#000000";
const COLOR_SNAKE_HEAD = "#22c55e"; 
const COLOR_SNAKE_BODY = "#4ade80"; 
const COLOR_SNAKE_GLOW = "rgba(34, 197, 94, 0.6)";
const COLOR_FOOD = "#ec4899"; 
const COLOR_FOOD_GLOW = "rgba(236, 72, 153, 0.8)";
const COLOR_GRID = "#111111";

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1;
    score = 0;
    speed = 130;
    scoreElement.textContent = score;
    gameState = "PLAYING";
    
    placeFood();
    overlay.classList.remove("active");
    
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    gameLoop();
}

function placeFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        
        valid = true;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                valid = false;
                break;
            }
        }
    }
}

function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        if (speed > 60) speed -= 3;
        
        placeFood();
    } else {
        snake.pop();
    }
}

function drawGrid() {
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function draw() {
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLOR_FOOD_GLOW;
    ctx.fillStyle = COLOR_FOOD;
    
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2, 
        food.y * gridSize + gridSize / 2, 
        gridSize / 2 - 2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        
        if (i === 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLOR_SNAKE_GLOW;
            ctx.fillStyle = COLOR_SNAKE_HEAD;
        } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = COLOR_SNAKE_BODY;
        }
        
        const pad = 1;
        ctx.fillRect(
            segment.x * gridSize + pad, 
            segment.y * gridSize + pad, 
            gridSize - pad * 2, 
            gridSize - pad * 2
        );
    }
    
    ctx.shadowBlur = 0;
}

function gameLoop() {
    if (gameState !== "PLAYING") return;
    
    update();
    
    if (gameState === "PLAYING") {
        draw();
        gameLoopTimeout = setTimeout(gameLoop, speed);
    }
}

function gameOver() {
    gameState = "GAMEOVER";
    
    ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highScoreElement.textContent = highScore;
    }
    
    overlayTitle.textContent = "게임 오버!";
    overlayTitle.className = "overlay-title game-over";
    overlayDesc.textContent = `최종 점수: ${score}`;
    actionBtn.textContent = "다시 하기";
    kbHints.style.display = "none";
    
    setTimeout(() => {
        overlay.classList.add("active");
    }, 500);
}

function changeDirection(newDx, newDy) {
    if (dx === 0 && dy === -1 && newDy === 1) return; 
    if (dx === 0 && dy === 1 && newDy === -1) return; 
    if (dx === -1 && dy === 0 && newDx === 1) return; 
    if (dx === 1 && dy === 0 && newDx === -1) return; 
    
    dx = newDx;
    dy = newDy;
}

window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }
    
    if (gameState !== "PLAYING") {
        if (e.key === "Enter" || e.key === " ") {
            initGame();
        }
        return;
    }
    
    switch(e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            changeDirection(0, -1);
            break;
        case "ArrowDown":
        case "s":
        case "S":
            changeDirection(0, 1);
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            changeDirection(-1, 0);
            break;
        case "ArrowRight":
        case "d":
        case "D":
            changeDirection(1, 0);
            break;
    }
});

actionBtn.addEventListener("click", initGame);

btnUp.addEventListener("click", () => changeDirection(0, -1));
btnDown.addEventListener("click", () => changeDirection(0, 1));
btnLeft.addEventListener("click", () => changeDirection(-1, 0));
btnRight.addEventListener("click", () => changeDirection(1, 0));

draw();
