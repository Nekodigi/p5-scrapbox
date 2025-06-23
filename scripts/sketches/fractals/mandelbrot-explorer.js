// Variables are defined in the HTML file

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
uniform float u_zoom;
uniform float u_centerX;
uniform float u_centerY;
uniform int u_maxIterations;
uniform int u_colorMode;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 coord = vTexCoord;
    coord.y = 1.0 - coord.y;
    
    // Map to complex plane
    float aspectRatio = u_resolution.x / u_resolution.y;
    vec2 c = vec2(
        (coord.x - 0.5) * 4.0 / u_zoom * aspectRatio + u_centerX,
        (coord.y - 0.5) * 4.0 / u_zoom + u_centerY
    );
    
    // Mandelbrot iteration
    vec2 z = vec2(0.0, 0.0);
    int iter = 0;
    float smooth_iter = 0.0;
    
    for (int i = 0; i < 1000; i++) {
        if (i >= u_maxIterations) break;
        
        float x2 = z.x * z.x;
        float y2 = z.y * z.y;
        
        if (x2 + y2 > 4.0) {
            smooth_iter = float(i) + 1.0 - log(log(sqrt(x2 + y2))) / log(2.0);
            break;
        }
        
        z = vec2(x2 - y2 + c.x, 2.0 * z.x * z.y + c.y);
        iter = i;
    }
    
    // Color based on iteration count
    vec3 color;
    if (iter == u_maxIterations - 1) {
        color = vec3(0.0, 0.0, 0.0);
    } else {
        float t = smooth_iter / float(u_maxIterations);
        
        if (u_colorMode == 0) {
            // Classic blue gradient
            color = vec3(
                0.0,
                0.7 * pow(t, 3.0),
                0.7 * pow(t, 0.5)
            );
        } else if (u_colorMode == 1) {
            // Rainbow HSV
            color = hsv2rgb(vec3(t * 6.0, 0.8, 0.9));
        } else {
            // Fire gradient
            color = vec3(
                pow(t, 0.5),
                pow(t, 1.5),
                pow(t, 3.0)
            );
        }
    }
    
    gl_FragColor = vec4(color, 1.0);
}
`;

// Functions are defined in the HTML file