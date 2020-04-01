var scale = 10 ;
var cols = window.innerWidth / scale;
var rows = window.innerHeight / scale;
var noise = new Noise(Math.random());
 

var GUI = function(){
    this.height = 5;
    this.turbulence = 0.0;
    this.low_height = 0.5;
    this.mid_height = 5.0;
    this.bg_color = "#696969";
    this.top_color = "#fffafa";
    this.mid_color = "#228b22";
    this.bottom_color = "#0077be";

}
var step = new GUI();

var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
renderer.setClearColor(0x696969);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100;
scene.add(camera)

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var focalPointGroup = new THREE.Group()
focalPointGroup.add(camera)
scene.add(focalPointGroup)
//focalPointGroup.position.y = -100
//focalPointGroup.rotation.x = Math.PI/3;

var ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

var pointLight = new THREE.PointLight(0xff0000, 1, 0);
pointLight.position.set(50, 200, 50);
scene.add(pointLight);



var geometry = new THREE.PlaneGeometry(cols, rows, cols, rows);

var plane = new THREE.Group();
var wireFrameMaterial = new THREE.MeshBasicMaterial({ color: 'black', wireframe: true });
var faceMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, vertexColors: THREE.VertexColors, wireframe: true, linewidth: 4});
plane.add(new THREE.Mesh(geometry, wireFrameMaterial));
plane.add(new THREE.Mesh(geometry, faceMaterial));
plane.position.set(0, 0, 0)
scene.add(plane);

console.log(geometry.faces.length, geometry.vertices.length)

wireMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 , vertexColors: THREE.VertexColors, side: THREE.DoubleSide });

var k = 40;
for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
        obj = geometry.vertices[j % Math.floor(rows) + i * Math.floor(rows)]
        obj.z = Math.abs((noise.perlin2(i / 10, j / 10)) * k);
    }
}

geometry.verticesNeedUpdate = true;
geometry.colorsNeedUpdate = true;

addDatGui()




function animate() {
    update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

var update = function () {

    //update height of verticies
    for (var i = 0; i < cols+1; i++) {
        for (var j = 0; j < rows+1; j++) {
            obj = geometry.vertices[j % Math.floor(rows+1) + i * Math.floor(rows+1)]
            obj.z = Math.abs(noise.perlin2((obj.x / 10) * step.turbulence, (obj.y / 10) * step.turbulence)) * step.height;
        }
    }
    geometry.verticesNeedUpdate = true;

    //update color
    for (let i = 0; i < geometry.faces.length; i=i+2) {
        var face = geometry.faces[i];
        var face2 = geometry.faces[i+1];
        var z = geometry.vertices[face.a].z
        //face.color.setRGB(r/255 + z, g/255 + z, b/255 + z );

        if (z <= step.low_height) {

            face.color.set(step.bottom_color);
            face2.color.set(step.bottom_color);
        }
        else if (z > step.low_height && z <= step.mid_height) {

            face.color.set(step.mid_color);
            face2.color.set(step.mid_color);

        } else {
            face.color.set(step.top_color);
            face2.color.set(step.top_color);
        }
    }
    geometry.colorsNeedUpdate = true;

}

function addDatGui() {
    var gui = new dat.GUI();
    //gui.add(focalPointGroup.position, 'x', -50, 50).step(1).name("Inclinaison");
    //gui.add(focalPointGroup.position, 'y', -200, 10).step(1).name("Zoom");
    //gui.add(focalPointGroup.rotation, 'x', 0, 2*Math.PI/3).step(0.1).name("Vertical Rotation");
    gui.add(plane.rotation, 'z', -1 * Math.PI, Math.PI).step(0.1).name("h_rotation");
    gui.add(step, 'height', 0, 50).name("Peak Height");
    gui.add(step, 'turbulence', 0, 3).step(0.0001).name("Noise Turbulence");
    gui.add(faceMaterial, 'wireframe');
    gui.addColor(step, 'top_color').onChange(function (colorValue) {
        top_color = colorValue
    }).name("Top Colour");
    gui.addColor(step, 'mid_color').onChange(function (colorValue) {
        mid_color = colorValue
    }).name("Mid Colour");
    gui.addColor(step, 'bottom_color').onChange(function (colorValue) {
        bottom_color = colorValue
    }).name("Bottom Colour");
    gui.addColor(step, 'bg_color').onChange(function (colorValue) {
        renderer.setClearColor(colorValue)
    }).name("Background Colour");

    gui.add(step, 'mid_height', step.low_height, 50).step(0.01).name("Mid Max Value");
    gui.add(step, 'low_height', 0.0, 50).step(0.01).name("Mid Lower Value");


    
    renderer.render(scene, camera);

}


requestAnimationFrame(animate);
