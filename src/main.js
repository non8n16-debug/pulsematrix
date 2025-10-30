import './style.css';
import { SceneManager } from './core/SceneManager.js';

// Создаём контейнер сцены
document.querySelector('#app').innerHTML = `
  <div id="scene-container"></div>
`;

const container = document.getElementById('scene-container');

// Инициализация менеджера сцены
const sceneManager = new SceneManager(container);

// Обработка взаимодействий пользователя
window.addEventListener('mousemove', (event) => {
  // перенаправляем событие в сцену (Raycaster)
  if (sceneManager && sceneManager.onMouseMove) {
    sceneManager.onMouseMove(event);
  }
});

// (опционально) обработка кликов по планетам
window.addEventListener('click', (event) => {
  if (sceneManager && sceneManager.onClick) {
    sceneManager.onClick(event);
  }
});

// Адаптация при изменении окна
window.addEventListener('resize', () => {
  if (sceneManager && sceneManager.onWindowResize) {
    sceneManager.onWindowResize();
  }
});
