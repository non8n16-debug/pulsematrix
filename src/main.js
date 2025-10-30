import './style.css';
import { SceneManager } from './core/SceneManager.js';
import { gsap } from 'gsap';

// --- Контейнер сцены ---
const container = document.getElementById('scene-container');

// --- Инициализация сцены ---
let sceneManager = null;
try {
  sceneManager = new SceneManager(container);
} catch (err) {
  console.error('Ошибка инициализации SceneManager:', err);
}

// --- События мыши ---
window.addEventListener('mousemove', (event) => {
  if (sceneManager && typeof sceneManager.onMouseMove === 'function') {
    sceneManager.onMouseMove(event);
  }
});

// --- Клики по планетам (опционально) ---
window.addEventListener('click', (event) => {
  if (sceneManager && typeof sceneManager.onClick === 'function') {
    sceneManager.onClick(event);
  }
});

// --- Изменение размера окна ---
window.addEventListener('resize', () => {
  if (sceneManager && typeof sceneManager.onWindowResize === 'function') {
    sceneManager.onWindowResize();
  }
});

// --- Очистка при закрытии ---
window.addEventListener('beforeunload', () => {
  if (sceneManager && typeof sceneManager.dispose === 'function') {
    sceneManager.dispose();
  }
});

// === 🚀 Обработчик кнопки LAUNCH ===
const launchButton = document.querySelector('.btn-glow');
const logo = document.querySelector('.logo');
const overlayTitle = document.querySelector('.ui-overlay h1');
const overlaySubtitle = document.querySelector('.ui-overlay p');

if (launchButton) {
  launchButton.addEventListener('click', () => {
    if (!sceneManager) return;

    console.log('🚀 PulseMatrix launch initiated');

    // === 1. Анимация кнопки ===
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

    // === 2. Логотип пульсирует ===
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

    // === 3. Текст под логотипом оживает ===
    if (overlayTitle && overlaySubtitle) {
      gsap.to([overlayTitle, overlaySubtitle], {
        opacity: 1,
        duration: 1.5,
        delay: 0.2,
        textShadow: '0 0 20px #00ffff, 0 0 60px #0099ff',
        ease: 'sine.inOut',
      });
    }

    // === 4. Усиленный пульс света ===
    if (sceneManager.globalPulse) {
      gsap.to(sceneManager.globalPulse, {
        intensity: 2,
        duration: 2,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
      });
    }

    // === 5. Плавное ускорение вращения сцены ===
    const originalRotation = sceneManager.scene.rotation.y;
    gsap.to(sceneManager.scene.rotation, {
      y: originalRotation + Math.PI * 2,
      duration: 5,
      ease: 'power2.out',
    });

    // === 6. Всплеск света ===
    if (sceneManager.light) {
      gsap.to(sceneManager.light, {
        intensity: 4,
        duration: 0.6,
        yoyo: true,
        repeat: 1,
      });
    }

    // === 7. Дополнительная атмосфера — лёгкий zoom-in ===
    if (sceneManager.camera) {
      gsap.to(sceneManager.camera.position, {
        z: sceneManager.camera.position.z - 5,
        duration: 4,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1,
      });
    }
  });
}

// === 💫 Плавный старт интерфейса ===
window.addEventListener('load', () => {
  const timeline = gsap.timeline();
  timeline
    .from('.top-bar', { y: -50, opacity: 0, duration: 1, ease: 'power2.out' })
    .from('.ui-overlay h1', { opacity: 0, scale: 0.9, duration: 1.2 }, '-=0.4')
    .from('.ui-overlay p', { opacity: 0, y: 20, duration: 1 }, '-=0.8')
    .from('.btn-glow', { opacity: 0, y: -10, duration: 0.8 }, '-=0.6');
});
