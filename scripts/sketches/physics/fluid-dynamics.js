// Stable Fluid Simulation using WebGL Shaders
// Based on Jos Stam's "Real-Time Fluid Dynamics for Games" (2003)

// Vertex shader - simple pass-through
const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition * 2.0 - 1.0, 1.0);
}
`;

// Advection shader - move quantities through the velocity field
const advectionShader = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_texelSize;
uniform float u_dt;
uniform float u_dissipation;

void main() {
  vec2 coord = vTexCoord - u_dt * texture2D(u_velocity, vTexCoord).xy * u_texelSize;
  coord = fract(coord); // Wrap coordinates
  gl_FragColor = u_dissipation * texture2D(u_source, coord);
}
`;

// Divergence shader - calculate divergence of velocity field
const divergenceShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_velocity;
uniform vec2 u_texelSize;

void main() {
  vec2 vL = texture2D(u_velocity, vTexCoord - vec2(u_texelSize.x, 0.0)).xy;
  vec2 vR = texture2D(u_velocity, vTexCoord + vec2(u_texelSize.x, 0.0)).xy;
  vec2 vB = texture2D(u_velocity, vTexCoord - vec2(0.0, u_texelSize.y)).xy;
  vec2 vT = texture2D(u_velocity, vTexCoord + vec2(0.0, u_texelSize.y)).xy;
  
  float div = 0.5 * (vR.x - vL.x + vT.y - vB.y);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

// Pressure solver shader - Jacobi iteration
const pressureShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_texelSize;
uniform float u_alpha;
uniform float u_beta;

void main() {
  vec4 pL = texture2D(u_pressure, vTexCoord - vec2(u_texelSize.x, 0.0));
  vec4 pR = texture2D(u_pressure, vTexCoord + vec2(u_texelSize.x, 0.0));
  vec4 pB = texture2D(u_pressure, vTexCoord - vec2(0.0, u_texelSize.y));
  vec4 pT = texture2D(u_pressure, vTexCoord + vec2(0.0, u_texelSize.y));
  
  vec4 bC = texture2D(u_divergence, vTexCoord);
  
  float pressure = (pL.x + pR.x + pB.x + pT.x + u_alpha * bC.x) * u_beta;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

// Gradient subtraction shader - make velocity field divergence-free
const gradientShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_pressure;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;

void main() {
  float pL = texture2D(u_pressure, vTexCoord - vec2(u_texelSize.x, 0.0)).x;
  float pR = texture2D(u_pressure, vTexCoord + vec2(u_texelSize.x, 0.0)).x;
  float pB = texture2D(u_pressure, vTexCoord - vec2(0.0, u_texelSize.y)).x;
  float pT = texture2D(u_pressure, vTexCoord + vec2(0.0, u_texelSize.y)).x;
  
  vec2 velocity = texture2D(u_velocity, vTexCoord).xy;
  velocity.x -= 0.5 * (pR - pL);
  velocity.y -= 0.5 * (pT - pB);
  
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

// Add force shader - add external forces
const addForceShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_source;
uniform vec2 u_force;
uniform vec2 u_center;
uniform float u_radius;

void main() {
  vec4 base = texture2D(u_source, vTexCoord);
  float dist = distance(vTexCoord, u_center);
  float mult = smoothstep(u_radius, 0.0, dist);
  
  gl_FragColor = base + vec4(u_force * mult, 0.0, 0.0);
}
`;

// Splat shader - add dye/smoke
const splatShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_source;
uniform vec3 u_color;
uniform vec2 u_center;
uniform float u_radius;

void main() {
  vec4 base = texture2D(u_source, vTexCoord);
  float dist = distance(vTexCoord, u_center);
  vec3 splat = u_color * smoothstep(u_radius, 0.0, dist);
  
  gl_FragColor = vec4(base.rgb + splat, 1.0);
}
`;

// Display shader - render the final result
const displayShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_density;
uniform sampler2D u_velocity;
uniform float u_displayMode;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec3 density = texture2D(u_density, vTexCoord).rgb;
  vec2 velocity = texture2D(u_velocity, vTexCoord).xy;
  
  vec3 color;
  
  if (u_displayMode < 0.5) {
    // Display density/dye
    color = density;
  } else if (u_displayMode < 1.5) {
    // Display velocity magnitude
    float mag = length(velocity) * 10.0;
    color = vec3(mag);
  } else {
    // Display velocity direction as color
    float angle = atan(velocity.y, velocity.x);
    float mag = length(velocity);
    color = hsv2rgb(vec3(angle / (2.0 * 3.14159) + 0.5, 1.0, mag * 10.0));
  }
  
  gl_FragColor = vec4(color, 1.0);
}
`;

// Boundary condition shader
const boundaryShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_source;
uniform vec2 u_texelSize;
uniform float u_scale;

void main() {
  vec2 coord = vTexCoord;
  vec4 result = texture2D(u_source, coord);
  
  // Apply boundary conditions at edges
  if (coord.x < u_texelSize.x) result = texture2D(u_source, coord + vec2(u_texelSize.x, 0.0)) * vec4(u_scale, 1.0, 1.0, 1.0);
  if (coord.x > 1.0 - u_texelSize.x) result = texture2D(u_source, coord - vec2(u_texelSize.x, 0.0)) * vec4(u_scale, 1.0, 1.0, 1.0);
  if (coord.y < u_texelSize.y) result = texture2D(u_source, coord + vec2(0.0, u_texelSize.y)) * vec4(1.0, u_scale, 1.0, 1.0);
  if (coord.y > 1.0 - u_texelSize.y) result = texture2D(u_source, coord - vec2(0.0, u_texelSize.y)) * vec4(1.0, u_scale, 1.0, 1.0);
  
  gl_FragColor = result;
}
`;

// Vorticity confinement shader - add swirling motion
const vorticityShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_velocity;
uniform sampler2D u_vorticity;
uniform vec2 u_texelSize;
uniform float u_curl;
uniform float u_dt;

void main() {
  vec2 vL = texture2D(u_velocity, vTexCoord - vec2(u_texelSize.x, 0.0)).xy;
  vec2 vR = texture2D(u_velocity, vTexCoord + vec2(u_texelSize.x, 0.0)).xy;
  vec2 vB = texture2D(u_velocity, vTexCoord - vec2(0.0, u_texelSize.y)).xy;
  vec2 vT = texture2D(u_velocity, vTexCoord + vec2(0.0, u_texelSize.y)).xy;
  vec2 vC = texture2D(u_velocity, vTexCoord).xy;
  
  // Calculate vorticity
  float omega = 0.5 * (vR.y - vL.y - vT.x + vB.x);
  
  // Calculate vorticity gradient
  float omegaL = texture2D(u_vorticity, vTexCoord - vec2(u_texelSize.x, 0.0)).x;
  float omegaR = texture2D(u_vorticity, vTexCoord + vec2(u_texelSize.x, 0.0)).x;
  float omegaB = texture2D(u_vorticity, vTexCoord - vec2(0.0, u_texelSize.y)).x;
  float omegaT = texture2D(u_vorticity, vTexCoord + vec2(0.0, u_texelSize.y)).x;
  
  vec2 grad = vec2(abs(omegaR) - abs(omegaL), abs(omegaT) - abs(omegaB));
  float gradMag = length(grad) + 0.0001;
  grad *= 1.0 / gradMag;
  
  vec2 force = u_curl * vec2(grad.y, -grad.x) * omega;
  vec2 velocity = vC + force * u_dt;
  
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

// Calculate vorticity magnitude
const vorticityMagShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_velocity;
uniform vec2 u_texelSize;

void main() {
  vec2 vL = texture2D(u_velocity, vTexCoord - vec2(u_texelSize.x, 0.0)).xy;
  vec2 vR = texture2D(u_velocity, vTexCoord + vec2(u_texelSize.x, 0.0)).xy;
  vec2 vB = texture2D(u_velocity, vTexCoord - vec2(0.0, u_texelSize.y)).xy;
  vec2 vT = texture2D(u_velocity, vTexCoord + vec2(0.0, u_texelSize.y)).xy;
  
  float vorticity = 0.5 * (vR.y - vL.y - vT.x + vB.x);
  gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}
`;