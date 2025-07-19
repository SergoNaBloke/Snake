const gameboard = document.querySelector('#gameBoard');
const ctx = gameboard.getContext('2d');
const scoreText = document.querySelector('#scoreText');
const resetBtn = document.querySelector('#resetBtn');
const gameWidth = gameboard.width;
const gameHeight = gameboard.height;
const boardBackground = 'white';
const snakeColor = 'lightgreen';
const snakeBorder = 'black';
const foodColor = 'red';
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
  clearBoard()
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
  ctx.fillStyle = boardBackground;
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
  } while (snake.some(segment => segment.x === newX && segment.y === newY));

  foodX = newX;
  foodY = newY;
}

function drawFood() {
  ctx.fillStyle = foodColor;
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
  ctx.fillStyle = snakeColor;
  ctx.strokeStyle = snakeBorder;
  snake.forEach((snakePart) => {
    ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
    ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
  });
}

function changeDirection(event) {
  const keyPressed = event.keyCode;
  const LEFT_ARROW = 37;
  const UP_ARROW = 38;
  const RIGHT_ARROW = 39;
  const DOWN_ARROW = 40;

  const KEY_A = 65;
  const KEY_W = 87;
  const KEY_D = 68;
  const KEY_S = 83;

  const goingUp = yVelocity == -unitSize;
  const goingDown = yVelocity == unitSize;
  const goingRight = xVelocity == unitSize;
  const goingLeft = xVelocity == -unitSize;

  switch (true) {
    case (keyPressed == LEFT_ARROW || keyPressed == KEY_A) && !goingRight:
      nextXVelocity = -unitSize;
      nextYVelocity = 0;
      break;
    case (keyPressed == UP_ARROW || keyPressed == KEY_W) && !goingDown:
      nextXVelocity = 0;
      nextYVelocity = -unitSize;
      break;
    case (keyPressed == RIGHT_ARROW || keyPressed == KEY_D) && !goingLeft:
      nextXVelocity = unitSize;
      nextYVelocity = 0;
      break;
    case (keyPressed == DOWN_ARROW || keyPressed == KEY_S) && !goingUp:
      nextXVelocity = 0;
      nextYVelocity = unitSize;
      break;
    default:
      return;
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
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER!', gameWidth / 2, gameHeight / 2);
  running = false;
}

function resetGame() {
  clearTimeout(gameTimerId);

  score = 0;
  xVelocity = unitSize;
  yVelocity = 0;
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
