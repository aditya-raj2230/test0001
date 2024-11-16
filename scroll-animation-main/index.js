import * as THREE from "three";
import { OBJLoader } from "jsm/loaders/OBJLoader.js";

const w = window.innerWidth;
const h = window.innerHeight;

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 1, 10); // Slightly adjusted for better perspective

// Renderer
const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(w, h);
renderer.setClearColor(new THREE.Color(0xf0f0f0), 1); // Soft gray background
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Softer ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7); // Key light
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048; // Higher resolution shadows
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.6, 30); // Focused light for better text visibility
pointLight.position.set(0, 2, 5);
pointLight.castShadow = true;
scene.add(pointLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4); // Sky and ground light
hemisphereLight.position.set(0, 10, 0);
scene.add(hemisphereLight);

// Variables
let scrollPosY = 0;

// Load and initialize the 3D model
const manager = new THREE.LoadingManager();
const loader = new OBJLoader(manager);
let sceneData = {};

manager.onLoad = () => initScene(sceneData);

loader.load("./assets/Coffee OBJ.obj", (obj) => {
  let geometry;
  obj.traverse((child) => {
    if (child.isMesh) {
      geometry = child.geometry;
    }
  });
  sceneData.geo = geometry;
});

// Initialize the scene with the loaded geometry
function initScene({ geo }) {
  const geometry = geo;
  geometry.center();

  const texLoader = new THREE.TextureLoader();
  const material = new THREE.MeshStandardMaterial({
    map: texLoader.load("./assets/Pack2.png"),
    side: THREE.DoubleSide,
    metalness: 0.4, // Slightly reflective
    roughness: 0.4, // Smooth surface for clarity
    emissive: 0x000000, // No emissive effect
    emissiveIntensity: 0.0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(0.4, 0.4, 0.4);
  mesh.rotation.y = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  let goalPos = Math.PI / 2;
  const rate = 0.1;

  function animate() {
    requestAnimationFrame(animate);
    goalPos = (Math.PI / 2) + (Math.PI * 2.5 * scrollPosY);
    mesh.rotation.y -= (mesh.rotation.y - goalPos) * rate;
    renderer.render(scene, camera);
  }

  animate();
}

// Scroll handler
window.addEventListener("scroll", () => {
  scrollPosY = window.scrollY / document.body.clientHeight;
});

// Resize handler
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", handleWindowResize, false);
