const overlay = document.getElementById('overlay');
const openBtn = document.getElementById('open-settings');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');

openBtn.addEventListener('click', () => {
  overlay.style.display = 'flex';
});
cancelBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
});

saveBtn.addEventListener('click', () => {
  const settings = {
    fieldSize: parseInt(document.getElementById('field-size').value, 10),
    snakeSpeed: parseInt(document.getElementById('snake-speed').value, 10),
    foodCount: parseInt(document.getElementById('food-count').value, 10),
    borderType: document.querySelector('input[name="border-type"]:checked').value,
  };
  console.log('Сохранённые настройки:', settings);
  // Здесь можно вызвать функцию вашей игры, например:
  // applySettings(settings);
  overlay.style.display = 'none';
});

// Закрытие по клику вне модального окна
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) overlay.style.display = 'none';
});
