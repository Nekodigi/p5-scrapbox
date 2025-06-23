// Particle Lenia - WebGL Shader Implementation
// Based on Lenia continuous cellular automaton

// Simple vertex shader
const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition * 2.0 - 1.0, 1.0);
}
`;

// Lenia compute shader for simulation
const leniaComputeShaderCode = `
precision highp float;

varying vec2 vTexCoord;

uniform sampler2D u_prevState;
uniform vec2 u_resolution;
uniform float u_mu;
uniform float u_sigma;
uniform float u_dt;
uniform float u_time;

// Stable Lenia kernel function - ring-shaped Gaussian
float leniaKernel(float r, float R, float mu, float sigma) {
  if (r > R) return 0.0;
  float dist_norm = r / R;
  return exp(-0.5 * pow((dist_norm - mu) / sigma, 2.0));
}

// Lenia growth function
float leniaGrowth(float n, float mu, float sigma) {
  return 2.0 * exp(-0.5 * pow((n - mu) / sigma, 2.0)) - 1.0;
}

void main() {
  vec2 texelSize = 1.0 / u_resolution;
  float R = 16.0; // Kernel radius
  
  float U = 0.0; // Neighborhood sum
  float totalWeight = 0.0;
  
  // Fixed loop with larger radius
  for (int dx = -16; dx <= 16; dx++) {
    for (int dy = -16; dy <= 16; dy++) {
      float r = length(vec2(float(dx), float(dy)));
      
      if (r <= R) {
        vec2 offset = vec2(float(dx), float(dy)) * texelSize;
        vec2 samplePos = vTexCoord + offset;
        samplePos = mod(samplePos, 1.0);
        
        float weight = leniaKernel(r, R, 0.5, 0.15);
        U += texture2D(u_prevState, samplePos).r * weight;
        totalWeight += weight;
      }
    }
  }
  
  // Normalize
  if (totalWeight > 0.001) {
    U /= totalWeight;
  }
  
  // Growth function
  float growth = leniaGrowth(U, u_mu, u_sigma);
  growth = clamp(growth, -0.05, 0.05);
  
  // Update state
  float currentState = texture2D(u_prevState, vTexCoord).r;
  float newState = currentState + u_dt * growth;
  newState = clamp(newState, 0.0, 1.0);
  
  gl_FragColor = vec4(newState, newState, newState, 1.0);
}
`;

// Display shader for rendering with 3D effect
const displayShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_leniaTexture;
uniform sampler2D u_envTexture;
uniform float u_time;
uniform float u_reflectionIntensity;
uniform vec2 u_resolution;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float value = texture2D(u_leniaTexture, vTexCoord).r;
  
  // Create colorful alien-like appearance
  vec3 color1 = vec3(0.1, 0.3, 0.8);
  vec3 color2 = vec3(0.8, 0.3, 0.7);
  vec3 color3 = vec3(0.3, 0.8, 0.5);
  
  vec3 baseColor = mix(color1, color2, value);
  baseColor = mix(baseColor, color3, sin(value * 10.0 + u_time) * 0.5 + 0.5);
  
  // Add some shimmer
  float shimmer = sin(vTexCoord.x * 50.0 + u_time * 2.0) * 
                  cos(vTexCoord.y * 50.0 + u_time * 1.5) * 0.1 + 0.9;
  baseColor *= shimmer;
  
  // Environment reflection
  vec2 envUV = vTexCoord + vec2(sin(u_time + value * 5.0), cos(u_time + value * 3.0)) * 0.02;
  vec3 envColor = texture2D(u_envTexture, envUV).rgb;
  
  vec3 finalColor = mix(baseColor, envColor, u_reflectionIntensity * value);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Add splat shader for adding patterns
const splatShaderCode = `
precision highp float;
varying vec2 vTexCoord;

uniform sampler2D u_source;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_strength;

void main() {
  vec4 base = texture2D(u_source, vTexCoord);
  float dist = distance(vTexCoord, u_center);
  float splat = u_strength * smoothstep(u_radius, 0.0, dist);
  
  gl_FragColor = vec4(base.r + splat, base.g, base.b, 1.0);
}
`;