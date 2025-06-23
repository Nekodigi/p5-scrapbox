// Fluid Dynamics - Simplified GPU Implementation
// Variables for fluid simulation
let fluidShader;
let fluidBuffer;
let prevMouseX = 0;
let prevMouseY = 0;
let time = 0;

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
uniform vec2 u_mouse;
uniform vec2 u_mouseDelta;
uniform sampler2D u_texture;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 coord = vTexCoord;
    coord.y = 1.0 - coord.y;
    
    // 既存の流体データを取得
    vec4 fluid = texture2D(u_texture, coord);
    
    // マウスからの距離を計算
    float dist = distance(coord, u_mouse);
    float influence = exp(-dist * dist * 200.0);
    
    // マウスの動きから流体を追加
    if (length(u_mouseDelta) > 0.001) {
        fluid.xy += u_mouseDelta * influence * 10.0;
        fluid.z += influence * 0.5;
    }
    
    // 簡易的な流体シミュレーション
    vec2 texelSize = 1.0 / u_resolution;
    
    // 近傍のサンプリング
    vec4 n = texture2D(u_texture, coord + vec2(0.0, texelSize.y));
    vec4 s = texture2D(u_texture, coord - vec2(0.0, texelSize.y));
    vec4 e = texture2D(u_texture, coord + vec2(texelSize.x, 0.0));
    vec4 w = texture2D(u_texture, coord - vec2(texelSize.x, 0.0));
    
    // 簡易的な拡散
    fluid = fluid * 0.98 + (n + s + e + w) * 0.005;
    
    // 速度場の移流
    vec2 vel = fluid.xy * 0.01;
    vec4 advected = texture2D(u_texture, coord - vel);
    fluid.xy = mix(fluid.xy, advected.xy, 0.95);
    fluid.z = mix(fluid.z, advected.z, 0.98);
    
    // 色の計算
    float speed = length(fluid.xy);
    float angle = atan(fluid.y, fluid.x);
    float hue = mod(angle / (2.0 * 3.14159) + u_time * 0.05, 1.0);
    float brightness = fluid.z * 1.5 + speed * 0.2;
    
    vec3 color = hsv2rgb(vec3(hue, 0.8, brightness));
    vec3 bgColor = vec3(0.02, 0.02, 0.05);
    color = mix(bgColor, color, clamp(fluid.z + speed * 0.1, 0.0, 1.0));
    
    gl_FragColor = vec4(color, 1.0);
}
`;

// 次フレーム用のシェーダー
const updateShader = `
precision highp float;
varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_mouseDelta;
uniform sampler2D u_texture;

void main() {
    vec2 coord = vTexCoord;
    coord.y = 1.0 - coord.y;
    
    // 既存の流体データを取得
    vec4 fluid = texture2D(u_texture, coord);
    
    // マウスからの距離を計算
    float dist = distance(coord, u_mouse);
    float influence = exp(-dist * dist * 200.0);
    
    // マウスの動きから流体を追加
    if (length(u_mouseDelta) > 0.001) {
        fluid.xy += u_mouseDelta * influence * 10.0;
        fluid.z += influence * 0.5;
    }
    
    // 簡易的な流体シミュレーション
    vec2 texelSize = 1.0 / u_resolution;
    
    // 近傍のサンプリング
    vec4 n = texture2D(u_texture, coord + vec2(0.0, texelSize.y));
    vec4 s = texture2D(u_texture, coord - vec2(0.0, texelSize.y));
    vec4 e = texture2D(u_texture, coord + vec2(texelSize.x, 0.0));
    vec4 w = texture2D(u_texture, coord - vec2(texelSize.x, 0.0));
    
    // 簡易的な拡散
    fluid = fluid * 0.98 + (n + s + e + w) * 0.005;
    
    // 速度場の移流
    vec2 vel = fluid.xy * 0.01;
    vec4 advected = texture2D(u_texture, coord - vel);
    fluid.xy = mix(fluid.xy, advected.xy, 0.95);
    fluid.z = mix(fluid.z, advected.z, 0.98);
    
    gl_FragColor = fluid;
}
`;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    noStroke();
    
    // シェーダーを作成
    fluidShader = createShader(vertexShader, fragmentShader);
    
    // フレームバッファを作成
    fluidBuffer = createFramebuffer({
        width: width,
        height: height,
        density: 1,
        format: FLOAT
    });
    
    // 初期化
    fluidBuffer.begin();
    clear(0, 0, 0, 0);
    fluidBuffer.end();
    
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function draw() {
    time += 0.01;
    
    // マウスの動きを計算
    let mouseDeltaX = (mouseX - prevMouseX) / width;
    let mouseDeltaY = (mouseY - prevMouseY) / height;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    
    // フレームバッファに描画
    fluidBuffer.begin();
    shader(fluidShader);
    fluidShader.setUniform('u_resolution', [width, height]);
    fluidShader.setUniform('u_time', time);
    fluidShader.setUniform('u_mouse', [mouseX / width, mouseY / height]);
    fluidShader.setUniform('u_mouseDelta', [mouseDeltaX, mouseDeltaY]);
    fluidShader.setUniform('u_texture', fluidBuffer);
    rect(-width/2, -height/2, width, height);
    fluidBuffer.end();
    
    // 画面に表示
    clear();
    texture(fluidBuffer);
    rect(-width/2, -height/2, width, height);
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        // リセット
        fluidBuffer.begin();
        clear(0, 0, 0, 0);
        fluidBuffer.end();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // フレームバッファを再作成
    fluidBuffer = createFramebuffer({
        width: width,
        height: height,
        density: 1,
        format: FLOAT
    });
}