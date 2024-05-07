 
function initWebGL(canvas) {
  
  var gl = null;
  var msg = "Your browser does not support WebGL, " +
  "or it is not enabled by default.";
  try 
  {
    gl = canvas.getContext("experimental-webgl");
  } 
  catch (e)
  {
    msg = "Error creating WebGL Context!: " + e.toString();
  }
  
  if (!gl)
  {
    alert(msg);
    throw new Error(msg);
  }
  
  return gl;        
}
 
function initViewport(gl, canvas)
{
  gl.viewport(0, 0, canvas.width, canvas.height);
}

var projectionMatrix, modelViewMatrix;
var rotationAxis;

function initMatrices(canvas)
{
  // Create a model view matrix with object at 0, 0, -8
  modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -8]);
  
  // Create a project matrix with 45 degree field of view
  projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
  
  rotationAxis = vec3.create();
  vec3.normalize(rotationAxis, [1, 1, 1]);
}

// Create the vertex, color and index data for a multi-colored cube
function createCube(gl) {
  
  // Vertex Data
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var verts = [
  // Front face
  -1.0, -1.0,  1.0,
  1.0, -1.0,  1.0,
  1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,
  
  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0, -1.0, -1.0,
  
  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
  1.0,  1.0,  1.0,
  1.0,  1.0, -1.0,
  
  // Bottom face
  -1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,
  
  // Right face
  1.0, -1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0,  1.0,  1.0,
  1.0, -1.0,  1.0,
  
  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  
  // Vertex Data
  var colorBuffer;
  colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var vertColors = [
  // Front face
  0.0, 0.0,  1.0,
  1.0, 0.0,  1.0,
  1.0,  1.0,  1.0,
  0.0,  1.0,  1.0,
  
  // Back face
  0.0, 0.0, 0.0,
  0.0,  1.0, 0.0,
  1.0,  1.0, 0.0,
  1.0, 0.0, 0.0,
  
  // Top face
  0.0,  1.0, 0.0,
  0.0,  1.0,  1.0,
  1.0,  1.0,  1.0,
  1.0,  1.0, 0.0,
  
  // Bottom face
  0.0, 0.0, 0.0,
  1.0, 0.0, 0.0,
  1.0, 0.0,  1.0,
  0.0, 0.0,  1.0,
  
  // Right face
  1.0, 0.0, 0.0,
  1.0,  1.0, 0.0,
  1.0,  1.0,  1.0,
  1.0, 0.0,  1.0,
  
  // Left face
  0.0, 0.0, 0.0,
  0.0, 0.0,  1.0,
  0.0,  1.0,  1.0,
  0.0,  1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertColors), gl.STATIC_DRAW);

  // Texture Coordinates
  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  var textureCoords = [
  // Front face
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  
  // Back face
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  0.0, 0.0,
  
  // Top face
  0.0, 1.0,
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  
  // Bottom face
  1.0, 1.0,
  0.0, 1.0,
  0.0, 0.0,
  1.0, 0.0,
  
  // Right face
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  0.0, 0.0,
  
  // Left face
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
  
  // Index data (defines the triangles to be drawn)
  var cubeIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  var cubeIndices = [
  0, 1, 2,      0, 2, 3,    // Front face
  4, 5, 6,      4, 6, 7,    // Back face
  8, 9, 10,     8, 10, 11,  // Top face
  12, 13, 14,   12, 14, 15, // Bottom face
  16, 17, 18,   16, 18, 19, // Right face
  20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
  
  var cube = {
    vertex:vertexBuffer, 
    vertSize:3, nVerts:24, 
    color:colorBuffer, 
    colorSize:3, nColors:24,
    texCoord:texCoordBuffer, 
    texCoordSize:2, nTexCoords: 24, 
    indices:cubeIndexBuffer,
    nIndices:36, 
    primtype:gl.TRIANGLES};
    
    return cube;
}
 
function createShader(gl, str, type) {
  var shader;
  if (type == "fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (type == "vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
  
  gl.shaderSource(shader, str);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}
 
var vertexShaderSource =
"    attribute vec3 vertexPos;\n" +
"    attribute vec3 colorVert;\n" +
"    attribute vec2 texCoord;\n" +
"    uniform mat4 modelViewMatrix;\n" +
"    uniform mat4 projectionMatrix;\n" +
"    varying vec3 vColor;\n" +
"    varying vec2 vTexCoord;\n" +
"    void main(void) {\n" +
"               // Return the transformed and projected vertex value\n" +
"        gl_Position = projectionMatrix * modelViewMatrix * \n" +
"            vec4(vertexPos, 1.0);\n" +
"        // Output the texture coordinate in vTexCoord\n" +
"        vColor = colorVert;\n" +
"        vTexCoord = texCoord;\n" +
"    }\n";
  
var fragmentShaderSource = document.getElementById ("fragment").textContent;
// var fragmentShaderSource = 
// "    precision mediump float;\n" +
// "    varying vec3 vColor;\n" +
// "    varying vec2 vTexCoord;\n" +
// "    uniform sampler2D uSampler;\n" + 
// "    void main(void) {\n" +
// "    // Return the pixel color: always output white\n" +
// "    gl_FragColor = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t)) * \n" +
// "        vec4(vColor, 1.0);\n" +
// "}\n";


var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
shaderProjectionMatrixUniform, shaderModelViewMatrixUniform, shaderSamplerUniform;

function initShader(gl) {
  
  // load and compile the fragment and vertex shader
  var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
  var vertexShader = createShader(gl, vertexShaderSource, "vertex");
  
  // link them together into a new program
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // get pointers to the shader params
  shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
  gl.enableVertexAttribArray(shaderVertexPositionAttribute);
  
  shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "colorVert");
  gl.enableVertexAttribArray(shaderVertexColorAttribute);
  
  shaderTexCoordAttribute = gl.getAttribLocation(shaderProgram, "texCoord");
  gl.enableVertexAttribArray(shaderTexCoordAttribute);
  
  shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram,"projectionMatrix");
  shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
  shaderSamplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }
}
   
var okToRun = false;

function handleTextureLoaded(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);
  okToRun = true;
}

var webGLTexture;

function initTexture(gl) {
  webGLTexture = gl.createTexture();
  webGLTexture.image = new Image();
  webGLTexture.image.src = "webgl-logo-256-bn.jpg";
  webGLTexture.image.onload = function () {
    handleTextureLoaded(gl, webGLTexture)
  }
  
}


function draw(gl, obj) {
  
  // clear the background (with black)
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);
  
  // set the shader to use
  gl.useProgram(shaderProgram);
  
  // connect up the shader parameters: vertex position, texture coordinate,
  // projection/model matrices and texture
  // set up the buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertex);
  gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.color);
  gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoord);
  gl.vertexAttribPointer(shaderTexCoordAttribute, obj.texCoordSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);
  
  gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
  gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, webGLTexture);
  gl.uniform1i(shaderSamplerUniform, 0);
  
  // draw the object
  gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
}

var duration = 5000; // ms
var currentTime = Date.now();
function animate() {
  var now = Date.now();
  var deltat = now - currentTime;
  currentTime = now;
  var fract = deltat / duration;
  var angle = Math.PI * 2 * fract;
  mat4.rotate(modelViewMatrix, modelViewMatrix, angle, rotationAxis);
}

function run(gl, cube) {
  requestAnimationFrame(function() { run(gl, cube); });
  if (okToRun)
  {
    draw(gl, cube);
    animate();
  }
}


  function main() {
    var canvas = document.getElementById("theCanvas");
    var gl = initWebGL(canvas);
    initViewport(gl, canvas);
    initMatrices(canvas);
    var cube = createCube(gl);
    initShader(gl);
    initTexture(gl);
    run(gl, cube);
  }

   