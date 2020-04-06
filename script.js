// ==========================================================================
// Assignment 4
// ==========================================================================
// (C)opyright:
//
// Creator: lbonn041 (Luc-Cyril Bonnet)
// Email:   lbonn041@uottawa.ca
// ==========================================================================

//Variables to set up plane Geometry
var scale = 5;
var cols = window.innerWidth / scale;
var rows = window.innerHeight / scale;
var renderer,scene,camera, controls, axesHelper, plane, geometry, faceMaterial, wireFrameMaterial, mesh

//object with dat.gui propereties that will be modified
var GUI = function () {
    this.amplitude = 5;
    this.frequency = 0.0;
    this.bottom_color_line = 1.0;
    this.top_color_line = 25.0;
    this.bg_color = "#696969";
    this.top_color = "#fffafa";
    this.mid_color = "#228b22";
    this.bottom_color = "#0077be";
    this.x_rotation = 2 * Math.PI / 3;
    this.y_rotation = Math.PI;
    this.z_rotation = 0;
    this.reset_plane = function () {
        this.amplitude = 5;
        this.frequency = 0.0;
        this.bottom_color_line = 1.0;
        this.top_color_line = 25.0;
        this.bg_color = "#696969";
        this.top_color = "#fffafa";
        this.mid_color = "#228b22";
        this.bottom_color = "#0077be";
        this.x_rotation = 2 * Math.PI / 3;
        this.y_rotation = Math.PI;
        this.z_rotation = 0;

    };
    this.reset_camera = function () {
        controls.reset();
    }
    this.new_terrain = function () {
        seed(Math.random());
        createNoise(geometry);
    }
    this.random_colors = function () {

        this.top_color = randomHEX();
        this.mid_color = randomHEX();
        this.bottom_color = randomHEX();
    }

}
//properties object
var prop = new GUI();

//initializes scene
function setUpScene(){
    //renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    renderer.setClearColor(0x696969);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    //scene
    scene = new THREE.Scene();

    //camera, and OrbitControls
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;
    scene.add(camera)
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //axis helper
    axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    //plane group created to incluse PlaneGeometry and mesh
    //PlaneGeometry object created using the preset variables
    plane = new THREE.Group();
    geometry = new THREE.PlaneGeometry(cols, rows, cols, rows);

    // MeshPhongMaterial to give object surface
    faceMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, vertexColors: THREE.VertexColors, wireframe: true });
    wireFrameMaterial = new THREE.MeshBasicMaterial({ color: 0x141414, wireframe: true, visible: false });
    mesh = new THREE.Mesh(geometry, faceMaterial);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    plane.add(mesh);
    plane.add(new THREE.Mesh(geometry, wireFrameMaterial));

    scene.add(plane);

}

//initializing the  perlin noise
//i use the x and y value of the current vertex to find the perlin noise value and then assign it to z
//since my camera will be rotated arounf the z-axis, z will be facing up in the scene and therefpre create peaks
function createNoise(geometry) {
    geometry.vertices.forEach(obj => {
        obj.z = Math.abs((perlin(obj.x / 10, obj.y / 10)) * 40);
    });
    geometry.verticesNeedUpdate = true;
}


function animate() {
    updatePerlin();
    UpdateColours();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    //reset camera
    plane.rotation.x = prop.x_rotation; //tilt
    plane.rotation.y = prop.y_rotation; //flip
    plane.rotation.z = prop.z_rotation;
}

function updatePerlin() {
        //update height of verticies
        geometry.vertices.forEach(obj => {
            obj.z = Math.abs(perlin((obj.x / 10) * prop.frequency, (obj.y / 10) * prop.frequency)) * prop.amplitude;
        });
        geometry.verticesNeedUpdate = true;
}

function UpdateColours(){
    //update color
    //loop through triangle faces of the plane and assing colour corresponding to the level the z value is at
    //assign two colours at a time in order to have a square color
    for (let i = 0; i < geometry.faces.length; i = i + 2) {
        var face = geometry.faces[i];
        var face2 = geometry.faces[i + 1];
        var z = geometry.vertices[face.a].z
        //face.color.setRGB(r/255 + z, g/255 + z, b/255 + z );

        if (z <= prop.bottom_color_line) {

            face.color.set(prop.bottom_color);
            face2.color.set(prop.bottom_color);
        }
        else if (z > prop.bottom_color_line && z <= prop.top_color_line) {

            face.color.set(prop.mid_color);
            face2.color.set(prop.mid_color);

        } else {
            face.color.set(prop.top_color);
            face2.color.set(prop.top_color);
        }
    }
    geometry.colorsNeedUpdate = true;

}

function addDatGui() {
    var gui = new dat.GUI();

    gui.add(prop, 'x_rotation', -1 * Math.PI, Math.PI).step(0.01).name("y-axis rotation");
    gui.add(prop, 'z_rotation', -1 * Math.PI, Math.PI).step(0.01).name("x-axis rotation");
    gui.add(prop, 'y_rotation', -1 * Math.PI / 2, 2 * Math.PI).step(0.01).name("Inclinaison");
    gui.add(prop, 'amplitude', 0, 50).name("Amplitude");
    gui.add(prop, 'frequency', 0, 1).step(0.0001).name("Frequency");
    gui.add(faceMaterial, 'wireframe').onChange(function () {
        wireFrameMaterial.visible = !wireFrameMaterial.visible
    });
    gui.addColor(prop, 'top_color').onChange(function (colorValue) {
        top_color = colorValue
    }).name("Top colour");
    gui.addColor(prop, 'mid_color').onChange(function (colorValue) {
        mid_color = colorValue
    }).name("Mid colour");
    gui.addColor(prop, 'bottom_color').onChange(function (colorValue) {
        bottom_color = colorValue
    }).name("Bottom colour");
    gui.addColor(prop, 'bg_color').onChange(function (colorValue) {
        renderer.setClearColor(colorValue)
    }).name("Background colour");
    gui.add(prop, 'top_color_line', prop.bottom_color_line, 30).step(0.01).name("Top colour level");
    gui.add(prop, 'bottom_color_line', 0.0, 50).step(0.01).name("Bottom colour level");
    gui.add(prop, 'random_colors').name('Random colours');
    gui.add(prop, 'reset_plane').name('Reset plane');
    gui.add(prop, 'reset_camera').name('Reset camera');
    gui.add(prop, 'new_terrain').name('New terrain');

    renderer.render(scene, camera);
}
//simple function to generate random hex string
function randomHEX() {
    const hex = '0123456789ABCDEF';
    let output = '#';
    for (let i = 0; i < 6; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
}

// movement
var amplitude_var = 1;
var frequency_var = 0.01;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 37) {
        prop.frequency += frequency_var;
    } else if (keyCode == 39) {
        prop.frequency += -1*frequency_var;
    } else if (keyCode == 38) {
        prop.amplitude += amplitude_var;
    } else if (keyCode == 40) {
        prop.amplitude += -1*amplitude_var;
    }
};


setUpScene();
createNoise(geometry);
requestAnimationFrame(animate);

addDatGui();
//requestAnimationFrame(animate);