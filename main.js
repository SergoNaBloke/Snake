/* const canvas = document.querySelector('#gameBoard');
const ctx = canvas.getContext('2d');
const cols = 20; // например, сетка 20×20
let boxSize;

function resizeCanvasSquare() {
  // Получаем ширину родителя в CSS-пикселях
  const parentWidth = canvas.parentElement.clientWidth;
  // devicePixelRatio для чёткости на Retina-экранах
  const ratio = window.devicePixelRatio || 1;

  // Устанавливаем реальный буфер в пикселях
  canvas.width = parentWidth * ratio;
  canvas.height = parentWidth * ratio; // same as width!

  // Оставляем CSS-размер лишь по ширине (100%)
  // А высота выставим вручную в px, чтобы блок остался квадратным
  canvas.style.width = parentWidth + 'px';
  canvas.style.height = parentWidth + 'px';

  // Сбрасываем предыдущие преобразования и масштабируем контекст
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // Пересчитываем размер «клетки» змейки
  boxSize = Math.floor(parentWidth / cols);
  // boxSize = parentWidth / cols;
}

let snake = [
  // { x: 20, y: 0 },
  { x: 19, y: 1 },
  { x: 18, y: 2 },
  { x: 1, y: 0 },
  { x: 0, y: 0 },
];
// Ваша функция рисования
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00FF00';
  snake.forEach((seg) => {
    ctx.fillRect(seg.x * boxSize, seg.y * boxSize, boxSize, boxSize);
  });
  requestAnimationFrame(draw);
}

// Подвязываем ресайз: инициализация + слушатель
resizeCanvasSquare();
window.addEventListener('resize', resizeCanvasSquare);
draw(); */

// Допустим, logicalWidth = 500, devicePixelRatio = 2
const canvas = document.querySelector('#gameBoard');
canvas.width = 500 * 3;
canvas.height = 500 * 3;
canvas.style.width = '500px';

const ctx = canvas.getContext('2d');

ctx.scale(3, 3);

ctx.fillRect(0, 0, 100, 100);
ctx.fillRect(100, 100, 100, 100);
ctx.fillRect(0, 200, 100, 100);

// окружность радиусом 5px, центр (100,100)
ctx.beginPath();
ctx.arc(100, 100, 5, 0, Math.PI * 2);
ctx.fillStyle = 'orange';
ctx.fill();
ctx.strokeStyle = 'darkorange';
ctx.stroke();
