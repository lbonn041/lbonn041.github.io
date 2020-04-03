// ==========================================================================
// $Id: script.js,v 1 2020/04/01 20:04:25 lbonn041 
// Assignment 4
// ==========================================================================
// (C)opyright:
//
// Creator: lbonn041 (Luc-Cyril Bonnet)
// Email:   lbonn041@uottawa.ca
// ==========================================================================

//Variables to set up plane Geometry
var scale = 5 ;
var cols = window.innerWidth / scale;
var rows = window.innerHeight / scale;

//Noise object from Noise.js
var noise = new Noise(Math.random());
 
//object with dat.gui propereties that will be modified
var GUI = function(){
    this.height = 5;
    this.turbulence = 0.0;
    this.bottom_color_line = 1.0;
    this.top_color_line = 25.0;
    this.bg_color = "#696969";
    this.top_color = "#fffafa";
    this.mid_color = "#228b22";
    this.bottom_color = "#0077be";
    this.x_rotation = 2 * Math.PI / 3;
    this.y_rotation = Math.PI;
    this.z_rotation = 0;
    this.reset_plane = function(){
        this.height = 5;
        this.turbulence = 0.0;
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
    this.reset_camera = function(){
        controls.reset();

    }
}
//properties object
var prop = new GUI();

//renderer
var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
renderer.setClearColor(0x696969);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//scene, camera, and OrbitControls
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 200;
scene.add(camera)
var controls = new THREE.OrbitControls(camera, renderer.domElement);


//ambient light
var ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

//point light
var pointLight = new THREE.PointLight(0xffffff, 1, 0);
pointLight.position.set(0, 0, 1000);
scene.add(pointLight);


//plane group created to incluse PlaneGeometry and mesh
//PlaneGeometry object created using the preset variables
var plane = new THREE.Group();
var geometry = new THREE.PlaneGeometry(cols, rows, cols, rows);

// MeshBasicMaterial to give object surface
var faceMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, vertexColors: THREE.VertexColors, wireframe: true});
var wireFrameMaterial = new THREE.MeshBasicMaterial({ color: 0x141414, wireframe: true, visible:false});
plane.add(new THREE.Mesh(geometry, faceMaterial));
plane.add(new THREE.Mesh(geometry, wireFrameMaterial));

scene.add(plane);

//initializing the  perlin noise
//i use the x and y value of the current vertex to find the perlin noise value and then assign it to z
//since my camera will be rotated arounf the z-axis, z will be facing up in the scene and therefpre create peaks
geometry.vertices.forEach(obj => {
    obj.z = Math.abs((noise.perlin2(obj.x / 10, obj.y / 10)) * 40);
});
geometry.verticesNeedUpdate = true;

function animate() {
    update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

var update = function () {

    //update height of verticies
    geometry.vertices.forEach(obj => {
        obj.z = Math.abs(noise.perlin2((obj.x / 10) * prop.turbulence, (obj.y / 10) * prop.turbulence)) * prop.height; 
    });
    geometry.verticesNeedUpdate = true;

    //update color
    //loop through triangle faces of the plane and assing colour corresponding to the level the z value is at
    //assign two colours at a time in order to have a square color
    for (let i = 0; i < geometry.faces.length; i=i+2) {
        var face = geometry.faces[i];
        var face2 = geometry.faces[i+1];
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

    //reset camera
    plane.rotation.x = prop.x_rotation; //tilt
    plane.rotation.y = prop.y_rotation; //flip
    plane.rotation.z = prop.z_rotation;

}

function addDatGui() {
    var gui = new dat.GUI();
    
    gui.add(prop, 'x_rotation', -1 * Math.PI, Math.PI).step(0.01).name("y-axis rotation");
    gui.add(prop, 'z_rotation', -1 * Math.PI, Math.PI).step(0.01).name("x-axis rotation");
    gui.add(prop, 'y_rotation', -1 * Math.PI/2, 2*Math.PI).step(0.01).name("Inclinaison");
    gui.add(prop, 'height', 0, 50).name("Peak Height");
    gui.add(prop, 'turbulence', 0, 1).step(0.0001).name("Noise Turbulence");
    gui.add(faceMaterial, 'wireframe').onChange(function(){
        wireFrameMaterial.visible = !wireFrameMaterial.visible
    });
    gui.addColor(prop, 'top_color').onChange(function (colorValue) {
        top_color = colorValue
    }).name("Top Colour");
    gui.addColor(prop, 'mid_color').onChange(function (colorValue) {
        mid_color = colorValue
    }).name("Mid Colour");
    gui.addColor(prop, 'bottom_color').onChange(function (colorValue) {
        bottom_color = colorValue
    }).name("Bottom Colour");
    gui.addColor(prop, 'bg_color').onChange(function (colorValue) {
        renderer.setClearColor(colorValue)
    }).name("Background Colour");
    gui.add(prop, 'top_color_line', prop.bottom_color_line, 30).step(0.01).name("Top colour line");
    gui.add(prop, 'bottom_color_line', 0.0, 50).step(0.01).name("Bottom colour line");
    gui.add(prop, 'reset_plane').name('Reset plane');
    gui.add(prop, 'reset_camera').name('Reset Camera');

    renderer.render(scene, camera);
}
addDatGui();
requestAnimationFrame(animate);