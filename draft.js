
const canvas = document.querySelector('#gameBoard');
canvas.width = 300 * 3;
canvas.height = 300 * 3;
canvas.style.width = '300px';

const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

ctx.scale(3, 3);

ctx.fillRect(0, 0, 100, 100);
ctx.fillRect(100, 100, 100, 100);
ctx.fillRect(0, 200, 100, 100);

// окружность радиусом 5px, центр (100,100)
ctx.beginPath();
ctx.arc(100, 100, 3, 0, Math.PI * 2);
ctx.fillStyle = 'orange';
ctx.fill();
ctx.strokeStyle = 'darkorange';
ctx.stroke();
