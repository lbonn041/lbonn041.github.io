// ==========================================================================
// Assignment 4
// ==========================================================================
// (C)opyright:
// Creator: lbonn041 (Luc-Cyril Bonnet)
// Email:   lbonn041@uottawa.ca
// ==========================================================================
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/controls/OrbitControls.js";

// Variables to set up plane Geometry
const scale = 5;
const cols = window.innerWidth / scale;
const rows = window.innerHeight / scale;

let renderer,
  scene,
  camera,
  controls,
  plane,
  geometry,
  faceMaterial,
  wireFrameMaterial;

// GUI Properties Object
const prop = {
  amplitude: 5,
  frequency: 0.0,
  bottom_color_line: 1.0,
  top_color_line: 25.0,
  bg_color: "#696969",
  top_color: "#fffafa",
  mid_color: "#228b22",
  bottom_color: "#0077be",
  x_rotation: (2 * Math.PI) / 3,
  y_rotation: Math.PI,
  z_rotation: 0,
  reset_plane() {
    this.amplitude = 5;
    this.frequency = 0.0;
    this.bottom_color_line = 1.0;
    this.top_color_line = 25.0;
    this.bg_color = "#696969";
    this.top_color = "#fffafa";
    this.mid_color = "#228b22";
    this.bottom_color = "#0077be";
    this.x_rotation = (2 * Math.PI) / 3;
    this.y_rotation = Math.PI;
    this.z_rotation = 0;
  },
  reset_camera() {
    controls.reset();
  },
  new_terrain() {
    seed(Math.random());
    createNoise(geometry);
  },
  random_colors() {
    this.top_color = randomHEX();
    this.mid_color = randomHEX();
    this.bottom_color = randomHEX();
  },
};

// Initialize the Scene
function setUpScene() {
  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
    antialias: true,
  });
  renderer.setClearColor(prop.bg_color);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 100, 200);
  scene.add(camera);

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;

  // Axes Helper
  const axesHelper = new THREE.AxesHelper();
  scene.add(axesHelper);

  // Plane Geometry and Mesh Materials
  geometry = new THREE.PlaneGeometry(cols, rows, cols, rows);
  faceMaterial = new THREE.MeshBasicMaterial({
    color: 0x444444,
    vertexColors: THREE.VertexColors,
    wireframe: true,
  });
  wireFrameMaterial = new THREE.MeshBasicMaterial({
    color: 0x141414,
    wireframe: true,
    visible: false,
  });

  // Plane
  plane = new THREE.Group();
  const mesh = new THREE.Mesh(geometry, faceMaterial);
  plane.add(mesh);
  plane.add(new THREE.Mesh(geometry, wireFrameMaterial));
  scene.add(plane);
}

// Create Noise using Perlin Noise Function
function createNoise(geometry) {
  geometry.vertices.forEach((vertex) => {
    vertex.z = Math.abs(perlin(vertex.x / 10, vertex.y / 10) * 40);
  });
  geometry.verticesNeedUpdate = true;
}

// Animation Loop
function animate() {
  updatePerlin();
  updateColours();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  updatePlaneRotation();
}

// Update Perlin Noise
function updatePerlin() {
  geometry.vertices.forEach((vertex) => {
    vertex.z =
      Math.abs(
        perlin(
          (vertex.x / 10) * prop.frequency,
          (vertex.y / 10) * prop.frequency
        )
      ) * prop.amplitude;
  });
  geometry.verticesNeedUpdate = true;
}

// Update Colors Based on Height
function updateColours() {
  geometry.faces.forEach((face, i) => {
    const z = geometry.vertices[face.a].z;
    const color =
      z <= prop.bottom_color_line
        ? prop.bottom_color
        : z <= prop.top_color_line
        ? prop.mid_color
        : prop.top_color;
    face.color.set(color);
    geometry.faces[i + 1]?.color.set(color);
  });
  geometry.colorsNeedUpdate = true;
}

// Update Plane Rotation
function updatePlaneRotation() {
  plane.rotation.x = prop.x_rotation;
  plane.rotation.y = prop.y_rotation;
  plane.rotation.z = prop.z_rotation;
}

// Add dat.GUI Controls
function addDatGui() {
  const gui = new dat.GUI();

  gui
    .add(prop, "x_rotation", -Math.PI, Math.PI)
    .step(0.01)
    .name("X-Axis Rotation");
  gui
    .add(prop, "y_rotation", -Math.PI / 2, Math.PI * 2)
    .step(0.01)
    .name("Y-Axis Rotation");
  gui
    .add(prop, "z_rotation", -Math.PI, Math.PI)
    .step(0.01)
    .name("Z-Axis Rotation");
  gui.add(prop, "amplitude", 0, 50).name("Amplitude");
  gui.add(prop, "frequency", 0, 1).step(0.0001).name("Frequency");
  gui
    .add(faceMaterial, "wireframe")
    .onChange(() => {
      wireFrameMaterial.visible = !wireFrameMaterial.visible;
    })
    .name("Wireframe");
  gui.addColor(prop, "top_color").name("Top Color");
  gui.addColor(prop, "mid_color").name("Mid Color");
  gui.addColor(prop, "bottom_color").name("Bottom Color");
  gui
    .addColor(prop, "bg_color")
    .onChange((color) => {
      renderer.setClearColor(color);
    })
    .name("Background Color");
  gui
    .add(prop, "top_color_line", prop.bottom_color_line, 30)
    .step(0.01)
    .name("Top Color Level");
  gui
    .add(prop, "bottom_color_line", 0.0, 50)
    .step(0.01)
    .name("Bottom Color Level");
  gui.add(prop, "random_colors").name("Random Colors");
  gui.add(prop, "reset_plane").name("Reset Plane");
  gui.add(prop, "reset_camera").name("Reset Camera");
  gui.add(prop, "new_terrain").name("New Terrain");

  renderer.render(scene, camera);
}

// Generate Random HEX Color
function randomHEX() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

// Handle Keyboard Input for Adjustments
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      prop.frequency += 0.01;
      break;
    case "ArrowRight":
      prop.frequency -= 0.01;
      break;
    case "ArrowUp":
      prop.amplitude += 1;
      break;
    case "ArrowDown":
      prop.amplitude -= 1;
      break;
  }
});

// Initialize the Scene and Start Animation
setUpScene();
createNoise(geometry);
addDatGui();
requestAnimationFrame(animate);
