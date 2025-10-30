import './style.css';
import { SceneManager } from './core/SceneManager.js';

// --- Создание контейнера ---
const appRoot = document.querySelector('#app');
appRoot.innerHTML = `<div id="scene-container"></div>`;
const container = document.getElementById('scene-container');

// --- Инициализация сцены ---
let sceneManager = null;
try {
  sceneManager = new SceneManager(container);
} catch (err) {
  console.error('Ошибка инициализации SceneManager:', err);
}

// --- Передача событий мыши ---
window.addEventListener('mousemove', (event) => {
  if (sceneManager && typeof sceneManager.onMouseMove === 'function') {
    sceneManager.onMouseMove(event);
  }
});

// --- (опционально) обработка кликов по планетам ---
window.addEventListener('click', (event) => {
  if (sceneManager && typeof sceneManager.onClick === 'function') {
    sceneManager.onClick(event);
  }
});

// --- Адаптация при изменении размера окна ---
window.addEventListener('resize', () => {
  if (sceneManager && typeof sceneManager.onWindowResize === 'function') {
    sceneManager.onWindowResize();
  }
});

// --- Очистка при закрытии страницы (освобождение WebGL памяти) ---
window.addEventListener('beforeunload', () => {
  if (sceneManager && typeof sceneManager.dispose === 'function') {
    sceneManager.dispose();
  }
});
