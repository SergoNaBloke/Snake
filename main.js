const themeToggle = document.querySelector('#themeToggle');
const root = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
  // переключение темы
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
  // получение CSS-переменных
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const gameboard = document.querySelector('#gameBoard');
const ctx = gameboard.getContext('2d');
const header = document.querySelector('.gameHeader');
const scoreText = document.querySelector('#scoreText');
const resetBtn = document.querySelector('#resetBtn');
let gameWidth;
let gameHeight;
let unitSize;
let running = false;
let gameTimerId;
let xVelocity = unitSize;
let yVelocity = 0;
let nextXVelocity = xVelocity;
let nextYVelocity = yVelocity;
let foods = [];
let score = 0;
let snake = [
  { x: unitSize * 4, y: 0 },
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize * 1, y: 0 },
  { x: 0, y: 0 },
];
let foodCount = 1;
let fieldColums = 16;
let snakeSpeedMs = 450;
let transparentBorders = false;
let tempFoodCount;
let tempFieldColums;
let tempSnakeSpeedMs;
let tempTransparentBorders;

const overlay = document.getElementById('overlay');
const openBtn = document.getElementById('open-settings');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');

const form = document.getElementById('settings-modal');
const foodSlider = document.getElementById('food-count');
const foodValueEl = document.getElementById('food-count-value');
const borderCheckbox = document.getElementById('border-type');

openBtn.addEventListener('click', () => {
  // открытие оверлея
  overlay.style.display = 'flex';
});

cancelBtn.addEventListener('click', () => {
  // закрытие оверлея
  overlay.style.display = 'none';

  // Восстанавливаем интерфейс по сохранённым значениям
  foodSlider.value = foodCount;
  foodValueEl.textContent = foodCount;
  document.querySelector(`input[name="field-size"][value="${fieldColums}"]`).checked = true;
  document.querySelector(`input[name="snake-speed"][value="${snakeSpeedMs}"]`).checked = true;
  borderCheckbox.checked = transparentBorders;
});

overlay.addEventListener('click', (e) => {
  // слушаем клик по оверлею
  if (e.target === overlay) {
    cancelBtn.click(); // внутри cancelBtn уже скрывается overlay
  }
});

form.addEventListener('submit', applySettings); // применение настроек

foodSlider.addEventListener('input', (e) => {
  // слушатель настроек еды
  foodValueEl.textContent = e.target.value; // live-обновление числа
  tempFoodCount = e.target.value; // обновляем глобальную переменную foodCount
  console.log(`Food count: ${tempFoodCount}`);
});

document.querySelectorAll('input[name="field-size"]').forEach((el) => {
  // слушатель размера поля
  el.addEventListener('change', (e) => {
    tempFieldColums = parseInt(e.target.value, 10); // присванивание размера поля в переменную
    console.log(`Field: ${tempFieldColums}`);
  });
});

document.querySelectorAll('input[name="snake-speed"]').forEach((el) => {
  // слушатель скорости змейки
  el.addEventListener('change', (e) => {
    tempSnakeSpeedMs = parseInt(e.target.value, 10);
    console.log(`Speed: ${tempSnakeSpeedMs} ms`);
  });
});

borderCheckbox.addEventListener('change', (e) => {
  // слушатель прозрачности границ
  tempTransparentBorders = e.target.checked;
  console.log(`Transparent borders: ${tempTransparentBorders}`);
});

window.addEventListener('DOMContentLoaded', () => {
  // события при загрузке
  checkLocalStorageSettings();
  resetGame();
});

document.addEventListener('touchstart', function () {}, true);
window.addEventListener('keydown', changeDirection);
document.querySelectorAll('.controlButton').forEach((btn) => {
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

function checkLocalStorageSettings() {
  // восстанавливаем настройки из localStorage
  const raw = localStorage.getItem('snakeSettings');
  if (!raw) return;

  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch {
    return;
  }

  // Восстановление контролов
  if (cfg.fieldColums !== undefined) {
    const sizeRadio = document.querySelector(
      `input[name="field-size"][value="${cfg.fieldColums}"]`,
    );
    if (sizeRadio) sizeRadio.checked = true;
    fieldColums = Number(cfg.fieldColums);
  }

  if (cfg.snakeSpeedMs !== undefined) {
    const speedRadio = document.querySelector(
      `input[name="snake-speed"][value="${cfg.snakeSpeedMs}"]`,
    );
    if (speedRadio) speedRadio.checked = true;
    snakeSpeedMs = Number(cfg.snakeSpeedMs);
  }

  if (cfg.foodCount !== undefined) {
    const slider = document.getElementById('food-count');
    if (slider) {
      slider.value = String(cfg.foodCount);
      const label = document.getElementById('food-count-value');
      if (label) label.textContent = String(cfg.foodCount);
    }
    foodCount = Number(cfg.foodCount);
  }

  if (cfg.transparentBorders !== undefined) {
    const borderCheckbox = document.getElementById('border-type');
    if (borderCheckbox) borderCheckbox.checked = Boolean(cfg.transparentBorders);
    transparentBorders = Boolean(cfg.transparentBorders);
  }

  // console.log(fieldColums, snakeSpeedMs, foodCount, transparentBorders);
  console.log(`Settings: ${fieldColums}, ${snakeSpeedMs}, ${foodCount}, ${transparentBorders}`);
}

function setSizing() {
  const gameboardStyles = window.getComputedStyle(gameboard); // получаем стили элементов
  const rect = header.getBoundingClientRect(); // размеры хедера
  const roundedHeaderHeight = Math.ceil(rect.height); // высота хедера + округление вверх

  const borderWidth = parseInt(gameboardStyles.borderWidth, 10);
  const extraPadding = 8;

  const dpr = window.devicePixelRatio;
  const width = window.innerWidth;
  const height = window.innerHeight - 2 * roundedHeaderHeight;
  const shorterMeasure = Math.min(width, height, 1200);

  // console.log(`${dpr} dpr \n${width} width \n${height} height`);
  // console.log(`resolution: \n${height * dpr} x ${width * dpr}`); // разрешение получается дробным

  const calculatedFieldSize =
    Math.floor((shorterMeasure - borderWidth * 2 - extraPadding) / fieldColums) * fieldColums;

  console.log(calculatedFieldSize);
  console.log(fieldColums);

  gameboard.style.width = calculatedFieldSize + 'px';
  gameboard.style.height = calculatedFieldSize + 'px';
  gameboard.width = calculatedFieldSize * dpr;
  gameboard.height = calculatedFieldSize * dpr;

  gameWidth = calculatedFieldSize * dpr;
  gameHeight = calculatedFieldSize * dpr;

  console.log(calculatedFieldSize / fieldColums);
  unitSize = (calculatedFieldSize / fieldColums) * dpr;
}

function applySettings(e) {
  e.preventDefault(); // не даём форме перезагружать страницу.

  fieldColums = tempFieldColums ?? fieldColums; // применяем выбранные настройки
  snakeSpeedMs = tempSnakeSpeedMs ?? snakeSpeedMs;
  foodCount = tempFoodCount ?? foodCount;
  transparentBorders = tempTransparentBorders ?? transparentBorders;

  const fd = new FormData(form); // удобный сбор значений при submit.

  const config = {
    fieldColums: parseInt(fd.get('field-size'), 10),
    snakeSpeedMs: parseInt(fd.get('snake-speed'), 10),
    foodCount: parseInt(fd.get('food-count'), 10),
    transparentBorders: !!fd.get('border-type'),
  };
  overlay.style.display = 'none';
  localStorage.setItem('snakeSettings', JSON.stringify(config)); // запись настроек в localStorage
  resetGame();
}

function resetGame() {
  setSizing();

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
  foods = [];
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
    // console.log(snakeSpeedMs)
  }, snakeSpeedMs);
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

  while (foods.length < foodCount) {
    let newX = randomFood(0, gameWidth - unitSize);
    let newY = randomFood(0, gameHeight - unitSize);

    if (
      !snake.some((segment) => segment.x === newX && segment.y === newY) &&
      !foods.some((food) => food.x === newX && food.y === newY)
    ) {
      foods.push({ x: newX, y: newY });
    }
  }
}

function drawFood() {
  ctx.fillStyle = cssVar('--food-color');
  foods.forEach((food) => {
    ctx.fillRect(food.x, food.y, unitSize, unitSize);
  });
}

function moveSnake() {
  yVelocity = nextYVelocity;
  xVelocity = nextXVelocity;
  let head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };

  if (transparentBorders) {
    // телепортация через стены
    if (head.x < 0) {
      head.x = gameWidth - unitSize;
    } else if (head.x >= gameWidth) {
      head.x = 0;
    }
    if (head.y < 0) {
      head.y = gameHeight - unitSize;
    } else if (head.y >= gameHeight) {
      head.y = 0;
    }
  }
  snake.unshift(head); // добавляем новую голову в начало змейки
  // console.log(head);

  const eatenFoodIndex = foods.findIndex((food) => food.x === snake[0].x && food.y === snake[0].y);
  if (eatenFoodIndex !== -1) {
    // if food is eaten
    score += 1;
    scoreText.textContent = score;
    foods.splice(eatenFoodIndex, 1); // удаляем съеденную еду
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
  if (!transparentBorders) {
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
  }
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y === snake[0].y) {
      running = false;
    }
  }
}

function displayGameOver() {
  ctx.font = '120px MV Boli';
  ctx.fillStyle = cssVar('--text-color');
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER!', gameWidth / 2, gameHeight / 2);
  running = false;
}
