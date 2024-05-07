 
var renderer = null, 
scene = null, 
camera = null,
geometry = null;

var duration = 5000; // ms
var currentTime = Date.now();

function animate() {
  var now = Date.now();
  var deltat = now - currentTime;
  var fract = deltat / duration;
  var angle = Math.PI * 2 * fract;
  geometry.rotation.y += angle;
  currentTime = now;
}

function run() {
  requestAnimationFrame(function() { run(); });
  
  // Render the scene
  renderer.render( scene, camera );
  
  // Spin the cube for next frame
  animate();
  
}

function createCube () {
  // Create a shaded, texture-mapped cube and add it to the scene
  // First, create the texture map
//   var mapUrl = "webgl-logo-256.jpg";
  var map = THREE.ImageUtils.loadTexture("webgl-logo-256.jpg");
  
  // Now, create a Phong material to show shading; pass in the map
  var material = new THREE.MeshPhongMaterial({ map: map,
    color: 0xffffff });
  
  // Create the cube geometry
  var geometry = new THREE.CubeGeometry(2, 2, 2);
  
  // And put the geometry and material together into a mesh
  var cube = new THREE.Mesh(geometry, material);
//   cube.rotation.x = Math.PI / 5;
  return cube;
}

function createCamera (canvas, scene) {
  var camera = new THREE.PerspectiveCamera( 45, 
            canvas.width / canvas.height, 1, 4000 );
  camera.position.x = 2;
  camera.position.y = 4;
  camera.position.z = 6;
  camera.lookAt (scene.position);
  return camera;
}

function createRenderer (canvas) {
  // Create the Three.js renderer and attach it to our canvas
  var renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  
  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height);
  
  return renderer;
}

function createLight () {
  var light = new THREE.DirectionalLight( 0xffff77, 1.5);
  
  // Position the light out from the scene, pointing at the origin
  light.position.set(0, 1, 1);
  
  return light;
}

$(document).ready(
  function() {
    var canvas = document.getElementById("webglcanvas");
    
    renderer = createRenderer (canvas);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();
    
    // Add  a camera so we can view the scene
    camera = createCamera (canvas, scene);
    scene.add(camera);
    
    // Add a directional light to show off the object
    var light = createLight ();
    scene.add( light );
    
    geometry = createCube ();
    
    // Finally, add the mesh to our scene
    scene.add( geometry );
    
    // Run the run loop
    run();
  }
);

 