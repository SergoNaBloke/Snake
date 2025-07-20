const themeToggle = document.querySelector('#themeToggle');
const root = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  clearBoard();
  drawFood();
  drawSnake();
  checkGameOver();
  if (!running) {
    displayGameOver();
  }
});

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const gameboard = document.querySelector('#gameBoard');
const ctx = gameboard.getContext('2d');
const scoreText = document.querySelector('#scoreText');
const resetBtn = document.querySelector('#resetBtn');
const gameWidth = gameboard.width;
const gameHeight = gameboard.height;
const unitSize = 25;
let running = false;
let gameTimerId;
let xVelocity = unitSize;
let yVelocity = 0;
let nextXVelocity = xVelocity;
let nextYVelocity = yVelocity;
let foodX;
let foodY;
let score = 0;
let snake = [
  { x: unitSize * 4, y: 0 },
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize * 1, y: 0 },
  { x: 0, y: 0 },
];

window.addEventListener('keydown', changeDirection);
document.querySelectorAll('.dirrectionBtn').forEach((btn) => {
  // click для мыши, touchstart для тача
  btn.addEventListener('click', touchDirectionHandler);
  btn.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault(); // чтобы не сработал клик-мокап через мышь
      touchDirectionHandler(e);
    },
    { passive: false },
  );
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
    resetGame();
  }
});
resetBtn.addEventListener('click', resetGame);

gameStart();

function gameStart() {
  running = true;
  scoreText.textContent = score;
  clearBoard();
  createFood();
  drawFood();
  drawSnake();
  nextTick();
}

function nextTick() {
  gameTimerId = setTimeout(() => {
    moveSnake();
    checkGameOver();

    if (running) {
      clearBoard();
      drawFood();
      drawSnake();
      nextTick();
    } else {
      displayGameOver();
    }
  }, 500);
}

function clearBoard() {
  ctx.fillStyle = cssVar('--board-bg');
  ctx.fillRect(0, 0, gameWidth, gameHeight);
}

function createFood() {
  function randomFood(min, max) {
    const randomNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    return randomNum;
  }

  let newX, newY;

  // Генерируем до тех пор, пока не найдём свободную клетку
  do {
    newX = randomFood(0, gameWidth - unitSize);
    newY = randomFood(0, gameHeight - unitSize);
    // snake.some вернёт true, если хоть один сегмент совпадает с (newX, newY)
  } while (snake.some((segment) => segment.x === newX && segment.y === newY));

  foodX = newX;
  foodY = newY;
}

function drawFood() {
  ctx.fillStyle = cssVar('--food-color');
  ctx.fillRect(foodX, foodY, unitSize, unitSize);
}

function moveSnake() {
  yVelocity = nextYVelocity;
  xVelocity = nextXVelocity;
  const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
  snake.unshift(head);
  // if food is eaten
  if (snake[0].x === foodX && snake[0].y === foodY) {
    score += 1;
    scoreText.textContent = score;
    createFood();
  } else {
    snake.pop(); // remove the last part of the snake if food is not eaten
  }
}

function drawSnake() {
  ctx.fillStyle = cssVar('--snake-color');
  ctx.strokeStyle = cssVar('--snake-border');
  snake.forEach((snakePart) => {
    ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
    ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
  });
}

function setDirection(desiredX, desiredY) {
  const goingUp = yVelocity === -unitSize;
  const goingDown = yVelocity === unitSize;
  const goingRight = xVelocity === unitSize;
  const goingLeft = xVelocity === -unitSize;

  // запрет на разворот на 180°
  if (
    (desiredX === -unitSize && goingRight) ||
    (desiredX === unitSize && goingLeft) ||
    (desiredY === -unitSize && goingDown) ||
    (desiredY === unitSize && goingUp)
  ) {
    return;
  }

  nextXVelocity = desiredX;
  nextYVelocity = desiredY;
}

function changeDirection(event) {
  const key = event.keyCode;
  switch (key) {
    case 37: // ←
    case 65: // A
      setDirection(-unitSize, 0);
      break;
    case 38: // ↑
    case 87: // W
      setDirection(0, -unitSize);
      break;
    case 39: // →
    case 68: // D
      setDirection(unitSize, 0);
      break;
    case 40: // ↓
    case 83: // S
      setDirection(0, unitSize);
      break;
    default:
      return;
  }
}

function touchDirectionHandler(e) {
  const dir = e.currentTarget.dataset.dir;
  switch (dir) {
    case 'left':
      setDirection(-unitSize, 0);
      break;
    case 'up':
      setDirection(0, -unitSize);
      break;
    case 'right':
      setDirection(unitSize, 0);
      break;
    case 'down':
      setDirection(0, unitSize);
      break;
  }
}

function checkGameOver() {
  switch (true) {
    case snake[0].x < 0:
      running = false;
      break;
    case snake[0].x >= gameWidth:
      running = false;
      break;
    case snake[0].y < 0:
      running = false;
      break;
    case snake[0].y >= gameHeight:
      running = false;
      break;
  }
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y === snake[0].y) {
      running = false;
    }
  }
}

function displayGameOver() {
  ctx.font = '50px MV Boli';
  ctx.fillStyle = cssVar('--text-color');
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER!', gameWidth / 2, gameHeight / 2);
  running = false;
}

function resetGame() {
  clearTimeout(gameTimerId);

  score = 0;
  xVelocity = unitSize;
  yVelocity = 0;
  nextXVelocity = xVelocity;
  nextYVelocity = yVelocity;
  snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize * 1, y: 0 },
    { x: 0, y: 0 },
  ];
  clearBoard();
  gameStart();
}
