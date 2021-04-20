// Attach to the Canvas
let canvas = document.getElementById('canvas');
// Create the GL context
let gl = canvas.getContext('webgl');
// Set the clear color
gl.clearColor(1, 0 , 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

let base = 1024;
// Set the vertex shader
let vs = `
  attribute vec2 pos;
  varying vec2 vpos;
  void main (void) {
    vpos = pos;
    gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);
  }
`

// A straightforward black to white shader
let fs = `
  precision highp float;
  varying vec2 vpos;
  uniform float canvas_x;
  uniform float canvas_y;
  uniform float base;
  uniform float step;
  uniform float translate_x;
  uniform float translate_y;
  void main (void) {
    // Normalize the x coordinate between 0 and 1
    float normal_x = (vpos.x + 1.0) * canvas_x / 2.0;
    // Translate the X position
    normal_x = normal_x + (translate_x * base);
    // Normalize the y coordinate between 0 and 1;
    float normal_y = (vpos.y + 1.0) * canvas_y / 2.0;
    // Translate the Y position
    normal_y = normal_y - (translate_y * base);
    // default for multiplication:
    // float color_value = mod(normal_x * normal_y + step, base);
    float color_value = mod((normal_x * normal_x) + (normal_y * normal_y) + (normal_x * normal_y) + step, base);
    float color_value_normal = color_value / (base - 1.0);
    gl_FragColor = vec4(vec3(color_value_normal), 1.0);
    // gl_FragColor = vec4(normal.x, normal.y, 0, 1.0);
  }
`

/**
 * The HTML element for a base slider and value (todo)
 */
const baseSlider = document.getElementById('base-slider');
const baseDisplay = document.getElementById('base-value');

baseSlider.oninput = (e) => {
  let newBase = e.target.value;
  baseDisplay.innerText = `${e.target.value}`;
// todo: insert future update code here
}

/**
 * The HTML element for a zoom slider
 */
const zoomSlider = document.getElementById('zoom-slider')
const zoomDisplay = document.getElementById('zoom-value');

let zoomFactor = 1;

zoomSlider.oninput = (e) => {
  let newZoomFactor = 1 + (e.target.value / 100);
  updateTranslateOnZoom(newZoomFactor);
  base = e.target.value;

  zoomFactor = 1 + (e.target.value / 100);
  zoomDisplay.innerText = `${e.target.value}%`;
}

/**
 * The HTML element for translate X and Y sliders
 */
const translateXSlider = document.getElementById('translate-x-slider')
const translateYSlider = document.getElementById('translate-y-slider')
const translateXDisplay = document.getElementById('translate-x-value');
const translateYDisplay = document.getElementById('translate-y-value');

let translateX = 0;
let translateY = 0;

translateXSlider.oninput = (e) => {
  translateX = e.target.value / e.target.max;
  translateXDisplay.innerText = `${translateX.toFixed(2)}`;
}

translateYSlider.oninput = (e) => {
  translateY = e.target.value / e.target.max;
  translateYDisplay.innerText = `${translateY}`;
}

function updateTranslateOnZoom(currentZoomFactor) {
  const xDiff = (0.5 - 1/(2*(currentZoomFactor )));
  console.log(xDiff);
  // translateX = xDiff;
  translateXDisplay.innerText = `${translateX.toFixed(2)}`;
}

// Our proper work begins from here

let vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, vs)
gl.compileShader(vertexShader);

let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fs)
gl.compileShader(fragmentShader);

let program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader)
gl.linkProgram(program);
gl.useProgram(program);
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
let posAttribute = gl.getAttribLocation(program, 'pos');
gl.enableVertexAttribArray(posAttribute);
gl.vertexAttribPointer(posAttribute, 2, gl.FLOAT, gl.FALSE, 0, 0)
let baseLoc = gl.getUniformLocation(program, 'base');
let stepLoc = gl.getUniformLocation(program, 'step');
let canvasSizeXLoc = gl.getUniformLocation(program, 'canvas_x');
let canvasSizeYLoc = gl.getUniformLocation(program, 'canvas_y');
const translateXLoc = gl.getUniformLocation(program, 'translate_x');
const translateYLoc = gl.getUniformLocation(program, 'translate_y');


let vertices = new Float32Array([
  -1.0, -1.0,
  -1.0, 1.0,
  1.0, -1.0,
  1.0, 1.0,
  1.0, -1.0,
  -1.0, 1.0
]);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

let step = 0;


function animate() {
  let zoom = base * zoomFactor;
  step = (step + 1 * zoomFactor) % zoom;

  const width = window.innerWidth;
  const height = window.innerHeight;
  base = Math.min(width, height);

  const displayWidth  = base
  const displayHeight = base


  if(gl.canvas.width != displayWidth || gl.canvas.height != displayHeight) {
    canvas.width = base;
    canvas.height = base;
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }


  gl.uniform1f(canvasSizeXLoc, canvas.width)
  gl.uniform1f(canvasSizeYLoc, canvas.height)
  gl.uniform1f(translateXLoc, translateX)
  gl.uniform1f(translateYLoc, translateY)

  gl.uniform1f(baseLoc, zoom)
  gl.uniform1f(stepLoc, step)
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
