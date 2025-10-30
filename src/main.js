import './style.css';
import { SceneManager } from './core/SceneManager.js';
import { gsap } from 'gsap';

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

// === 🚀 Обработчик кнопки LAUNCH ===
const launchButton = document.querySelector('.btn-glow');
const logo = document.querySelector('.logo');

if (launchButton) {
  launchButton.addEventListener('click', () => {
    if (!sceneManager) return;

    // === 1. Визуальный отклик кнопки ===
    gsap.fromTo(
      launchButton,
      { boxShadow: '0 0 10px #00ffff' },
      {
        boxShadow: '0 0 40px #00ffff, 0 0 80px #0099ff',
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      }
    );

    // === 2. Пульс логотипа (реакция на запуск) ===
    if (logo) {
      gsap.fromTo(
        logo,
        { textShadow: '0 0 10px #00ffff, 0 0 20px #0099ff', scale: 1 },
        {
          textShadow: '0 0 25px #00ffff, 0 0 45px #0099ff, 0 0 70px #00ccff',
          scale: 1.05,
          duration: 0.8,
          yoyo: true,
          repeat: 3,
          ease: 'sine.inOut',
        }
      );
    }

    // === 3. Усиленный пульс света ===
    if (sceneManager.globalPulse) {
      gsap.to(sceneManager.globalPulse, {
        intensity: 2,
        duration: 2,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
      });
    }

    // === 4. Плавное ускорение вращения сцены ===
    const originalRotation = sceneManager.scene.rotation.y;
    gsap.to(sceneManager.scene.rotation, {
      y: originalRotation + Math.PI * 2,
      duration: 5,
      ease: 'power2.out',
    });

    // === 5. Всплеск яркости света ===
    if (sceneManager.light) {
      gsap.to(sceneManager.light, {
        intensity: 4,
        duration: 0.6,
        yoyo: true,
        repeat: 1,
      });
    }

    // === 6. Визуальный отклик UI (текст под логотипом) ===
    const subtitle = document.querySelector('.ui-overlay p');
    if (subtitle) {
      gsap.fromTo(
        subtitle,
        { opacity: 0.6, textShadow: '0 0 10px #00ccff' },
        {
          opacity: 1,
          textShadow: '0 0 25px #00ffff, 0 0 60px #0099ff',
          duration: 1.5,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
        }
      );
    }

    console.log('🚀 PulseMatrix launched!');
  });
}
