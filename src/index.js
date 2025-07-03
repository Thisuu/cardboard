import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, DirectionalLight, Color, Fog, PointLight } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "./files/globe-data-min.json";
import countryLabels from "./files/country-labels.json";
import { createLoginWaitlistButton } from './files/loginWaitlistButton.js';
import { renderCardAvailability } from './files/metamaskCardAvailability.js';
import './files/coffeeCup.js';
import { createMainLogo } from './files/mainLogo.js';
import createHeader from './files/header.js';
import './files/footer.js';
import { createTopUpWidget } from './files/topupWidget.js';
import { createCardLimitsWidget } from './files/cardLimitsWidget.js';
import { createCoinbackWidget } from './files/coinbackWidget.js';
import { createUSDCStrategyWidget } from './files/usdcStrategyWidget.js';
import { createShoppingListWidget, openShoppingListWidget, closeShoppingListWidget, isShoppingListWidgetOpen } from './files/shoppingListWidget.js';
import { openUSDCStrategyWidget, closeUSDCStrategyWidget, isUSDCStrategyWidgetOpen } from './files/usdcStrategyWidget.js';
import { openCoinbackWidget, closeCoinbackWidget, isCoinbackWidgetOpen } from './files/coinbackWidget.js';
import { openTopUpWidget, closeTopUpWidget, isTopUpWidgetOpen } from './files/topupWidget.js';
import { openCardLimitsWidget, closeCardLimitsWidget, isCardLimitsWidgetOpen } from './files/cardLimitsWidget.js';
//import { initializeFloatingImages } from "./files/floatingImages.js";

// Chain & token configuration
const chains = {
  ETH: { id: 1, name: 'Ethereum' },
  Linea: { id: 59144, name: 'Linea' },
};

const tokens = {
  ETH: {
    USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  },
  Linea: {
    USDC: { address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', decimals: 6 },
  },
};

// Global ThreeJS variables
let renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let Globe;
let currentlyOpenWidget = null;
const widgetAPIs = {
  shopping: { open: openShoppingListWidget, close: closeShoppingListWidget, isOpen: () => isShoppingListWidgetOpen },
  usdc: { open: openUSDCStrategyWidget, close: closeUSDCStrategyWidget, isOpen: () => isUSDCStrategyWidgetOpen },
  coinback: { open: openCoinbackWidget, close: closeCoinbackWidget, isOpen: () => isCoinbackWidgetOpen },
  topup: { open: openTopUpWidget, close: closeTopUpWidget, isOpen: () => isTopUpWidgetOpen },
  cardlimits: { open: openCardLimitsWidget, close: closeCardLimitsWidget, isOpen: () => isCardLimitsWidgetOpen },
};

let particleAnimationRunning = false;
let particleAnimationFrameId = null;
let particleCanvas = null;
let particleCtx = null;
let particleParticles = [];
let particleWidth = 0;
let particleHeight = 0;

function animateGlobe(targetZ, duration = 1000) {
  const startZ = camera.position.z;
  const startTime = performance.now();
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    camera.position.z = startZ + (targetZ - startZ) * easeProgress;
    camera.updateProjectionMatrix();
    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

async function initializeWeb3() {
  // Modern dapp browsers
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Handle chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
      
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          console.log('Please connect to MetaMask.');
        } else {
          window.location.reload();
        }
      });
      
      return true;
    } catch (error) {
      console.error('User denied account access', error);
      return false;
    }
  }
  // Non-dapp browsers
  else {
    console.log('Non-Ethereum browser detected. Widgets will be in read-only mode');
    return false;
  }
}

async function initializeApp() {
  // Initialize Web3 first
  const web3Connected = await initializeWeb3();
  
  // Proceed with the rest of the app initialization
  loadFont();
  addGlobalStyles();
  initThreeJS();
  initGlobe();
  onWindowResize();
  animate();
  createMainLogo();
  createLoginWaitlistButton();
//  initializeFloatingImages(); //draw floating images

  const header = createHeader();
  
  const canvas = createParticleCanvas(); //effect
initParticleAnimation(canvas);
  
  // Initialize all widgets
  if (web3Connected) {
    try {
      // Initialize all widgets
      createCardLimitsWidget();
      createCoinbackWidget();
      createShoppingListWidget();
      createTopUpWidget();
      
      // Initialize USDC strategy widget
      const strategyInitialized = await createUSDCStrategyWidget();
      
      // Set up event listeners only after successful initialization
      const strategyTrigger = document.getElementById('strategy-trigger');
      if (strategyTrigger && strategyInitialized) {
        strategyTrigger.addEventListener('click', (e) => {
          e.preventDefault();
          handleHeaderClick('usdc');
        });
      }
    } catch (error) {
      console.error('Widget initialization failed:', error);
    }
  }

  // Set up other UI elements
  const allowanceTrigger = document.getElementById('allowance-trigger');
  if (allowanceTrigger) {
    allowanceTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      handleHeaderClick('cardlimits');
    });
  }
  
  const shoppinglistTrigger = document.getElementById('shoppinglist-trigger');
  if (shoppinglistTrigger) {
    shoppinglistTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      handleHeaderClick('shopping');
    });
  }
  
  const coinbackTrigger = document.getElementById('coinback-trigger');
  if (coinbackTrigger) {
    coinbackTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      handleHeaderClick('coinback');
    });
  }

  const topupTrigger = document.getElementById('topup-trigger');
  if (topupTrigger) {
    topupTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      handleHeaderClick('topup');
    });
  }

  renderCardAvailability();
  addLineaFooter();
}

function createParticleCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.3s',
    opacity: '1',
    display: 'block',
  });
  document.body.appendChild(canvas);
  particleCanvas = canvas;

  // Add fire toggle button if not present
  if (!document.getElementById('particle-toggle-btn')) {
    const btn = document.createElement('button');
    btn.id = 'particle-toggle-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Disable particle animation');
    btn.style.position = 'fixed';
    btn.style.bottom = '18px';
    btn.style.right = '18px';
    btn.style.zIndex = '10001';
    btn.style.background = 'rgba(255,255,255,0.85)';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.width = '38px';
    btn.style.height = '38px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background 0.2s, box-shadow 0.2s';
    btn.innerHTML = `
      <svg id="fire-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C12 2 7 8 7 13a5 5 0 0 0 10 0c0-5-5-11-5-11z" fill="#ff9800"/>
        <path d="M12 22c-2.5 0-4-2-4-4 0-2 2-4 4-4s4 2 4 4c0 2-1.5 4-4 4z" fill="#ffd180"/>
      </svg>
    `;
    btn.title = 'Toggle particle animation';
    let enabled = true;
    btn.onclick = () => {
      enabled = !enabled;
      if (enabled) {
        startParticleAnimation();
        particleCanvas.style.opacity = '1';
        particleCanvas.style.display = 'block';
      } else {
        stopParticleAnimation();
        particleCanvas.style.opacity = '0';
        setTimeout(() => { particleCanvas.style.display = 'none'; }, 300);
      }
      btn.setAttribute('aria-label', enabled ? 'Disable particle animation' : 'Enable particle animation');
      btn.style.background = enabled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)';
      btn.querySelector('#fire-svg').style.opacity = enabled ? '1' : '0.4';
      btn.querySelector('#fire-svg').style.filter = enabled ? 'none' : 'grayscale(1)';
    };
    document.body.appendChild(btn);
  }
  return canvas;
}

function initParticleAnimation(canvas) {
  particleCtx = canvas.getContext('2d');
  particleWidth = canvas.width = window.innerWidth;
  particleHeight = canvas.height = window.innerHeight;
  particleParticles = Array.from({ length: 150 }, () => createParticle());

  function createParticle() {
    return {
      x: Math.random() * particleWidth,
      y: Math.random() * particleHeight,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: -Math.random() * 1.5 - 0.5,
      alpha: Math.random() * 0.6 + 0.4,
      hue: 25 + Math.random() * 25 // warm tones
    };
  }

  window.addEventListener('resize', () => {
    particleWidth = canvas.width = window.innerWidth;
    particleHeight = canvas.height = window.innerHeight;
  });

  // Start the animation loop
  startParticleAnimation();
}

function startParticleAnimation() {
  if (particleAnimationRunning) return;
  particleAnimationRunning = true;
  if (particleCanvas) {
    particleCanvas.style.opacity = '1';
    particleCanvas.style.display = 'block';
  }
  function loop() {
    if (!particleAnimationRunning) return;
    if (particleCtx && particleParticles.length) {
      particleCtx.clearRect(0, 0, particleWidth, particleHeight);
      particleParticles.forEach(p => {
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        particleCtx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`;
        particleCtx.fill();
      });
      particleParticles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10 || p.x < -10 || p.x > particleWidth + 10) {
          Object.assign(p, {
            x: Math.random() * particleWidth,
            y: particleHeight + 10,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.5,
            dy: -Math.random() * 1.5 - 0.5,
            alpha: Math.random() * 0.6 + 0.4,
            hue: 25 + Math.random() * 25
          });
        }
      });
    }
    particleAnimationFrameId = requestAnimationFrame(loop);
  }
  loop();
}

function stopParticleAnimation() {
  particleAnimationRunning = false;
  if (particleAnimationFrameId) {
    cancelAnimationFrame(particleAnimationFrameId);
    particleAnimationFrameId = null;
  }
  if (particleCanvas) {
    particleCanvas.style.opacity = '0';
    setTimeout(() => { particleCanvas.style.display = 'none'; }, 300);
  }
}

function addGlobalStyles() {
  // Inject Caveat font
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Caveat"]')) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
  }
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      -webkit-user-select: none;
      -ms-user-select: none;
      user-select: none;
      font-family: 'Euclid Circular B', sans-serif;
    }
    .selectable {
      -webkit-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
    #lifi-widget-container {
      position: fixed;
      z-index: 2000;
    }
    .footer-linea {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%) rotate(0deg);
      font-family: 'Caveat', cursive;
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 1px 1px 4px #a0522d, 0 2px 8px #00000044;
      zIndex: 0;
      pointer-events: none;
      letter-spacing: 0.02em;
      animation: footer-float 7s ease-in-out infinite;
      user-select: none;
    }
    @keyframes footer-float {
      0%   { transform: translateX(-50%) translateY(0) rotate(-2deg); }
      20%  { transform: translateX(-50%) translateY(-8px) rotate(-2deg); }
      50%  { transform: translateX(-50%) translateY(0) rotate(-2deg); }
      80%  { transform: translateX(-50%) translateY(8px) rotate(-2deg); }
      100% { transform: translateX(-50%) translateY(0) rotate(-2deg); }
    }
  `;
  document.head.appendChild(style);
}

function addLineaFooter() {
  if (document.querySelector('.footer-linea')) return;
  const footer = document.createElement('div');
  footer.className = 'footer-linea';
  footer.textContent = 'Built with 💛 on LINEA';
  document.body.appendChild(footer);
}

function loadFont() {
  const existingLink = document.querySelector('link[href*="fonts.googleapis.com"]');
  if (!existingLink) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.cdnfonts.com/css/euclid-circular-b?styles=100047,100041';
    document.head.appendChild(fontLink);
  }
}

function initThreeJS() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new Scene();
  scene.add(new AmbientLight(0xbbbbbb, 0.3));
scene.background = new Color(0xf5841f);

  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  const dLight = new DirectionalLight(0xffffff, 0.8);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  const dLight1 = new DirectionalLight(0x7982f6, 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  const dLight2 = new PointLight(0x8566cc, 0.5);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  camera.position.z = 400;
  scene.add(camera);
  scene.fog = new Fog(0x535ef3, 400, 2000);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1;
  controls.autoRotate = false;
  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
}

function initGlobe() {
  const supportedCountries = ["USA", "GBR", "BRA", "MEX", "COL", "CHE", "ARG", "AUT", "BEL", "BGR", "HRV", "CYP", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "IRL", "ITA", "LVA", "LTU", "LUX", "MLT", "NLD", "POL", "PRT", "ROU", "SVK", "SVN", "ESP", "SWE"];
  Globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.25)
    .hexPolygonColor(e => supportedCountries.includes(e.properties.ISO_A3) ? "rgba(241, 227, 124, 1)" : "rgba(255,255,255, 0.35)")
    .labelsData(countryLabels.countries)
    .labelColor(() => 0x37af37)
    .labelText("label")
    .labelSize(1.2)
    .labelResolution(6)
    .labelAltitude(0.03);
  Globe.rotateY(-Math.PI * (5 / 9));
  Globe.rotateZ(-Math.PI / 6);

  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color(0x311e49);
  globeMaterial.emissive = new Color(0x220038);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  scene.add(Globe);
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowHalfX = window.innerWidth / 1.5;
  windowHalfY = window.innerHeight / 1.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  camera.position.x += Math.abs(mouseX) <= windowHalfX / 2 ? (mouseX / 2 - camera.position.x) * 0.005 : 0;
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

async function handleHeaderClick(widgetKey) {
  if (currentlyOpenWidget && currentlyOpenWidget !== widgetKey) {
    await widgetAPIs[currentlyOpenWidget].close();
    currentlyOpenWidget = null;
  }
  if (widgetAPIs[widgetKey].isOpen()) {
    await widgetAPIs[widgetKey].close();
    currentlyOpenWidget = null;
  } else {
    await widgetAPIs[widgetKey].open();
    currentlyOpenWidget = widgetKey;
  }
}

// Initialize the app when DOM is ready
if (document.readyState !== 'loading') {
  initializeApp();
} else {
  document.addEventListener('DOMContentLoaded', initializeApp);
}
