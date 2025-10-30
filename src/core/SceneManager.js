import * as THREE from 'three';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    // --- Камера ---
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 85);
    this.camera.lookAt(0, 0, 0);

    // --- Рендерер ---
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);
    this.container.appendChild(this.renderer.domElement);

    // --- Постобработка (Bloom) ---
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2, 0.4, 0.1
    );
    this.composer.addPass(bloom);

    // --- Свет ---
    this.light = new THREE.PointLight(0xffffff, 2, 200);
    this.light.position.set(0, 0, 50);
    this.scene.add(this.light);
    this.scene.add(new THREE.AmbientLight(0x222233, 0.6));

    // --- Туман ---
    this.scene.fog = new THREE.FogExp2(0x000010, 0.003);

    // --- Создание элементов ---
    this.createStars();
    this.createPlanets();

    // --- Энергетическая линия ---
    this.activeIndex = 0;
    this.nextIndex = 1;
    this.travelLine = null;
    this.trailLine = null;
    this.wavePhase = 0;
    this.spawnTravelLine();

    // --- Пульсация ---
    this.globalPulse = { intensity: 0 };
    gsap.to(this.globalPulse, {
      intensity: 1,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // --- Мышь ---
    this.targetX = 0;
    this.targetY = 0;
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      this.targetX = x * 15;
      this.targetY = y * 8;
    });

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // --- Resize с throttling ---
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.onWindowResize(), 200);
    });
  }

  // --- Звёзды ---
  createStars() {
    const starCount = window.innerWidth < 768 ? 1500 : 4000;
    const starsGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < starCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(800);
      const y = THREE.MathUtils.randFloatSpread(800);
      const z = THREE.MathUtils.randFloatSpread(800);
      positions.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      opacity: 0.65,
      transparent: true
    });
    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
  }

  // --- Планеты ---
  createPlanets() {
    const planetCount = window.innerWidth < 768 ? 30 : 65;
    this.planets = [];
    const planetColors = [
      0xc2b280, 0xd8c080, 0x708090, 0x3d5b8c,
      0x4997d0, 0xd14a28, 0xa67c52, 0x5a4d41
    ];

    const radius = 55;
    for (let i = 0; i < planetCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + THREE.MathUtils.randFloat(-3, 3);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const color = new THREE.Color(
        planetColors[Math.floor(Math.random() * planetColors.length)]
      );

      const planetMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7,
        emissive: color.clone().multiplyScalar(0.05),
      });

      const planetGeometry = new THREE.SphereGeometry(0.9, 32, 32);
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      planet.position.set(x, y, z);
      planet.scale.setScalar(Math.random() * 2 + 0.8);
      planet.rotationSpeed = Math.random() * 0.005; // добавлено вращение
      this.scene.add(planet);
      this.planets.push(planet);
    }
  }

  // --- Линии путешествия ---
  spawnTravelLine() {
    if (this.travelLine) {
      this.scene.remove(this.travelLine);
      this.scene.remove(this.trailLine);
      this.travelLine.geometry.dispose();
      this.trailLine.geometry.dispose();
    }

    const from = this.planets[this.activeIndex].position.clone();
    const to = this.planets[this.nextIndex].position.clone();

    const segmentCount = 120;
    const positions = [];
    for (let i = 0; i < segmentCount; i++) {
      const t = i / (segmentCount - 1);
      const x = THREE.MathUtils.lerp(from.x, to.x, t);
      const y = THREE.MathUtils.lerp(from.y, to.y, t);
      const z = THREE.MathUtils.lerp(from.z, to.z, t);
      positions.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x3399ff) },
        uColorB: { value: new THREE.Color(0xffffff) },
        uOpacity: { value: 0.0 },
      },
      vertexShader: `
        uniform float uTime;
        varying float vPos;
        void main() {
          vPos = position.y + sin(position.x * 0.02 + uTime * 6.0) * 0.03;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uOpacity;
        varying float vPos;
        void main() {
          float gradient = smoothstep(-1.0, 1.0, vPos);
          vec3 color = mix(uColorA, uColorB, gradient);
          gl_FragColor = vec4(color, uOpacity);
        }
      `,
    });

    const trailMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x66ccff) },
        uOpacity: { value: 0.0 },
      },
      vertexShader: `
        uniform float uTime;
        varying float vWave;
        void main() {
          vWave = sin(position.x * 0.02 + uTime * 3.0) * 0.1;
          vec3 displaced = position + normalize(position) * vWave;
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vWave;
        void main() {
          float alpha = smoothstep(0.0, 1.0, abs(vWave));
          gl_FragColor = vec4(uColor, uOpacity * (1.0 - alpha));
        }
      `,
    });

    this.travelLine = new THREE.Line(geometry, material);
    this.trailLine = new THREE.Line(geometry.clone(), trailMaterial);

    this.scene.add(this.trailLine);
    this.scene.add(this.travelLine);

    gsap.to(material.uniforms.uOpacity, { value: 1, duration: 1.2, ease: 'sine.inOut' });
    gsap.to(trailMaterial.uniforms.uOpacity, { value: 0.4, duration: 1.2, ease: 'sine.inOut' });

    gsap.to(material.uniforms.uOpacity, {
      value: 0,
      duration: 1.2,
      delay: 3,
      ease: 'sine.inOut',
      onComplete: () => {
        this.activeIndex = this.nextIndex;
        this.nextIndex = (this.nextIndex + 1) % this.planets.length;
        this.spawnTravelLine();
      },
    });

    gsap.to(trailMaterial.uniforms.uOpacity, {
      value: 0,
      duration: 1.5,
      delay: 2.5,
      ease: 'sine.inOut'
    });

    this.currentMaterial = material;
    this.currentTrailMaterial = trailMaterial;
  }

  updateTravelLine(delta) {
    if (!this.travelLine) return;
    this.currentMaterial.uniforms.uTime.value += delta;
    this.currentTrailMaterial.uniforms.uTime.value += delta;
  }

  animate() {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.scene.rotation.y += 0.0008;
    this.scene.rotation.x = Math.sin(time * 0.1) * 0.1;

    this.updateTravelLine(delta);

    const pulse = this.globalPulse.intensity;
    this.stars.material.opacity = 0.55 + pulse * 0.35;
    this.light.intensity = 1.5 + pulse * 0.8;

    this.planets.forEach((planet, i) => {
      planet.material.emissiveIntensity = 0.05 + pulse * 0.1 + Math.sin(time * 1.5 + i) * 0.03;
      planet.rotation.y += planet.rotationSpeed; // вращение планет
    });

    this.camera.position.x += (this.targetX - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.targetY - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    this.composer.render(); // теперь через postprocessing
    requestAnimationFrame(this.animate);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}
