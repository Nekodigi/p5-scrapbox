// Shader-based noise visualization
let noiseShader;
let time = 0;
let zoomLevel = 1.0;
let panX = 0.0;
let panY = 0.0;
let noiseType = 0; // 0: Perlin-like, 1: Turbulence, 2: Ridged, 3: Marble

// Vertex shader
const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

// Fragment shader
const fragmentShader = `
precision highp float;
varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_zoom;
uniform float u_panX;
uniform float u_panY;
uniform int u_noiseType;

// Noise function (simplified Perlin-like noise)
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 6; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

float turbulence(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 6; i++) {
        value += amplitude * abs(noise(p * frequency) - 0.5) * 2.0;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

float ridgedNoise(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 6; i++) {
        float n = noise(p * frequency);
        n = 1.0 - abs(n - 0.5) * 2.0;
        value += amplitude * n;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

vec3 getColor(float value, vec2 pos) {
    if(u_noiseType == 0) {
        // Perlin-like - smooth gradients
        return vec3(value * 0.5 + 0.3, value * 0.8 + 0.2, value);
    } else if(u_noiseType == 1) {
        // Turbulence - fire-like
        return vec3(value, value * 0.6, value * 0.2);
    } else if(u_noiseType == 2) {
        // Ridged - metallic
        return vec3(value * 0.7, value * 0.8, value);
    } else {
        // Marble - organic
        float marble = sin(pos.x * 0.1 + value * 10.0);
        marble = marble * 0.5 + 0.5;
        return vec3(marble * 0.9, marble * 0.7, marble * 0.5);
    }
}

void main() {
    vec2 coord = vTexCoord;
    // coord.y = 1.0 - coord.y; // Remove y-axis inversion
    
    // Map coordinates with zoom and pan
    float aspectRatio = u_resolution.x / u_resolution.y;
    vec2 p = vec2(
        (coord.x - 0.5) * 8.0 / u_zoom * aspectRatio + u_panX,
        (coord.y - 0.5) * 8.0 / u_zoom + u_panY
    );
    
    // Add time animation
    p += vec2(u_time * 0.1, u_time * 0.05);
    
    float noiseValue;
    
    if(u_noiseType == 0) {
        noiseValue = fbm(p);
    } else if(u_noiseType == 1) {
        noiseValue = turbulence(p);
    } else if(u_noiseType == 2) {
        noiseValue = ridgedNoise(p);
    } else {
        noiseValue = fbm(p);
    }
    
    vec3 color = getColor(noiseValue, p);
    
    gl_FragColor = vec4(color, 1.0);
}
`;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noiseShader = createShader(vertexShader, fragmentShader);
}

function draw() {
    shader(noiseShader);
    
    // Update uniforms
    noiseShader.setUniform('u_resolution', [width, height]);
    noiseShader.setUniform('u_time', time);
    noiseShader.setUniform('u_zoom', zoomLevel);
    noiseShader.setUniform('u_panX', panX);
    noiseShader.setUniform('u_panY', panY);
    noiseShader.setUniform('u_noiseType', noiseType);
    
    // Draw full screen quad
    rect(-width/2, -height/2, width, height);
    
    time += 0.016; // ~60fps
}

function keyPressed() {
    // Number keys to change noise type
    if (key >= '1' && key <= '4') {
        noiseType = parseInt(key) - 1;
    }
    
    // Reset
    if (key === 'r' || key === 'R') {
        time = 0;
        zoomLevel = 1.0;
        panX = 0.0;
        panY = 0.0;
        noiseType = 0;
    }
}

function mouseWheel(event) {
    // Zoom
    let zoomFactor = 1.1;
    if (event.delta > 0) {
        zoomLevel /= zoomFactor;
    } else {
        zoomLevel *= zoomFactor;
    }
    return false;
}

function mouseDragged() {
    // Pan
    let sensitivity = 0.005 / zoomLevel;
    panX -= (mouseX - pmouseX) * sensitivity;
    panY -= (mouseY - pmouseY) * sensitivity;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}