class MorphingSphere {
    constructor() {
        this.radius = 100;
        this.detail = 50;
        this.vertices = [];
        this.originalVertices = [];
        this.normals = [];
        this.time = 0;
        this.morphSpeed = 0.02;
        this.morphIntensity = 80;
        this.colorMode = 0;
        this.wireframe = false;
        this.autoRotate = true;
        this.rotationX = 0;
        this.rotationY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.cameraDistance = 300;
        this.targetCameraDistance = 300;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.generateSphere();
    }

    generateSphere() {
        this.vertices = [];
        this.originalVertices = [];
        this.normals = [];
        
        for (let i = 0; i <= this.detail; i++) {
            let lat = map(i, 0, this.detail, -PI/2, PI/2);
            for (let j = 0; j <= this.detail; j++) {
                let lon = map(j, 0, this.detail, -PI, PI);
                
                let x = this.radius * cos(lat) * cos(lon);
                let y = this.radius * sin(lat);
                let z = this.radius * cos(lat) * sin(lon);
                
                let vertex = createVector(x, y, z);
                this.vertices.push(vertex.copy());
                this.originalVertices.push(vertex.copy());
                
                // Store normalized position as initial normal
                let normal = vertex.copy();
                normal.normalize();
                this.normals.push(normal);
            }
        }
    }

    update() {
        this.time += this.morphSpeed;
        
        // Smooth camera rotation
        this.rotationX = lerp(this.rotationX, this.targetRotationX, 0.1);
        this.rotationY = lerp(this.rotationY, this.targetRotationY, 0.1);
        this.cameraDistance = lerp(this.cameraDistance, this.targetCameraDistance, 0.1);
        
        if (this.autoRotate && !this.isDragging) {
            this.targetRotationY += 0.01;
        }
        
        // Morph vertices and update normals
        for (let i = 0; i < this.vertices.length; i++) {
            let original = this.originalVertices[i];
            let vertex = this.vertices[i];
            
            // Multiple noise layers for complex deformation
            let noise1 = noise(original.x * 0.01, original.y * 0.01, original.z * 0.01 + this.time);
            let noise2 = noise(original.x * 0.02, original.y * 0.02, original.z * 0.02 + this.time * 0.5);
            let noise3 = noise(original.x * 0.05, original.y * 0.05, original.z * 0.05 + this.time * 2);
            
            let displacement = (noise1 - 0.5) * this.morphIntensity + 
                              (noise2 - 0.5) * this.morphIntensity * 0.5 +
                              (noise3 - 0.5) * this.morphIntensity * 0.2;
            
            let direction = original.copy();
            direction.normalize();
            direction.mult(displacement);
            
            vertex.set(original);
            vertex.add(direction);
            
            // Update normal based on displaced position
            this.normals[i] = vertex.copy();
            this.normals[i].normalize();
        }
    }

    draw() {
        // Apply camera transformations
        push();
        rotateX(this.rotationX);
        rotateY(this.rotationY);
        
        if (this.wireframe) {
            this.drawWireframe();
        } else {
            this.drawSolid();
        }
        pop();
    }

    drawWireframe() {
        stroke(255);
        strokeWeight(1);
        noFill();
        
        for (let i = 0; i < this.detail; i++) {
            for (let j = 0; j < this.detail; j++) {
                let index1 = i * (this.detail + 1) + j;
                let index2 = i * (this.detail + 1) + (j + 1);
                let index3 = (i + 1) * (this.detail + 1) + j;
                let index4 = (i + 1) * (this.detail + 1) + (j + 1);
                
                if (index1 < this.vertices.length && index2 < this.vertices.length && 
                    index3 < this.vertices.length && index4 < this.vertices.length) {
                    
                    let v1 = this.vertices[index1];
                    let v2 = this.vertices[index2];
                    let v3 = this.vertices[index3];
                    let v4 = this.vertices[index4];
                    
                    beginShape(TRIANGLES);
                    vertex(v1.x, v1.y, v1.z);
                    vertex(v2.x, v2.y, v2.z);
                    vertex(v3.x, v3.y, v3.z);
                    
                    vertex(v2.x, v2.y, v2.z);
                    vertex(v4.x, v4.y, v4.z);
                    vertex(v3.x, v3.y, v3.z);
                    endShape();
                }
            }
        }
    }

    drawSolid() {
        noStroke();
        
        for (let i = 0; i < this.detail; i++) {
            for (let j = 0; j < this.detail; j++) {
                let index1 = i * (this.detail + 1) + j;
                let index2 = i * (this.detail + 1) + (j + 1);
                let index3 = (i + 1) * (this.detail + 1) + j;
                let index4 = (i + 1) * (this.detail + 1) + (j + 1);
                
                if (index1 < this.vertices.length && index2 < this.vertices.length && 
                    index3 < this.vertices.length && index4 < this.vertices.length) {
                    
                    let v1 = this.vertices[index1];
                    let v2 = this.vertices[index2];
                    let v3 = this.vertices[index3];
                    let v4 = this.vertices[index4];
                    
                    let n1 = this.normals[index1];
                    let n2 = this.normals[index2];
                    let n3 = this.normals[index3];
                    let n4 = this.normals[index4];
                    
                    beginShape(TRIANGLES);
                    
                    this.setVertexColor(v1);
                    normal(n1.x, n1.y, n1.z);
                    vertex(v1.x, v1.y, v1.z);
                    this.setVertexColor(v2);
                    normal(n2.x, n2.y, n2.z);
                    vertex(v2.x, v2.y, v2.z);
                    this.setVertexColor(v3);
                    normal(n3.x, n3.y, n3.z);
                    vertex(v3.x, v3.y, v3.z);
                    
                    this.setVertexColor(v2);
                    normal(n2.x, n2.y, n2.z);
                    vertex(v2.x, v2.y, v2.z);
                    this.setVertexColor(v4);
                    normal(n4.x, n4.y, n4.z);
                    vertex(v4.x, v4.y, v4.z);
                    this.setVertexColor(v3);
                    normal(n3.x, n3.y, n3.z);
                    vertex(v3.x, v3.y, v3.z);
                    
                    endShape();
                }
            }
        }
    }

    setVertexColor(vertex) {
        if (this.colorMode === 0) {
            // Distance from center
            let distance = vertex.mag();
            let normalizedDist = map(distance, this.radius - this.morphIntensity, 
                                   this.radius + this.morphIntensity, 0, 1);
            let hue = map(normalizedDist, 0, 1, 240, 0);
            colorMode(HSB);
            fill(hue, 80, 90);
            colorMode(RGB);
        } else if (this.colorMode === 1) {
            // Y position
            let normalizedY = map(vertex.y, -this.radius - this.morphIntensity, 
                                this.radius + this.morphIntensity, 0, 1);
            fill(normalizedY * 255, 100, 255 - normalizedY * 255);
        } else {
            // Noise-based
            let noiseVal = noise(vertex.x * 0.01, vertex.y * 0.01, vertex.z * 0.01 + this.time);
            let c = map(noiseVal, 0, 1, 0, 255);
            fill(c, c * 0.7, 255);
        }
    }

    keyPressed() {
        if (key === 'w' || key === 'W') {
            this.wireframe = !this.wireframe;
        } else if (key === 'c' || key === 'C') {
            this.colorMode = (this.colorMode + 1) % 3;
        } else if (key === 'r' || key === 'R') {
            this.autoRotate = !this.autoRotate;
        } else if (key === 'q' || key === 'Q') {
            this.morphIntensity = min(this.morphIntensity + 10, 150);
        } else if (key === 'e' || key === 'E') {
            this.morphIntensity = max(this.morphIntensity - 10, 0);
        } else if (key === ' ') {
            this.resetCamera();
        }
    }
    
    mouseDragged() {
        if (mouseButton === LEFT) {
            this.isDragging = true;
            let deltaX = mouseX - pmouseX;
            let deltaY = mouseY - pmouseY;
            
            this.targetRotationY += deltaX * 0.01;
            this.targetRotationX += deltaY * 0.01;
            this.targetRotationX = constrain(this.targetRotationX, -PI/2, PI/2);
        }
        return false;
    }
    
    mousePressed() {
        this.isDragging = true;
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
        
        if (this.autoRotate) {
            this.autoRotate = false;
        }
        return false;
    }
    
    mouseReleased() {
        this.isDragging = false;
    }
    
    mouseWheel(event) {
        this.targetCameraDistance += event.delta * 0.5;
        this.targetCameraDistance = constrain(this.targetCameraDistance, 100, 600);
        return false;
    }
    
    resetCamera() {
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.targetCameraDistance = 300;
    }
}

// P5.js sketch functions
let morphingSphere;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    morphingSphere = new MorphingSphere();
}

function draw() {
    background(10, 15, 30);
    
    // Proper lighting setup for shading
    ambientLight(60, 60, 70);
    directionalLight(255, 255, 255, -1, 0.5, -1);
    directionalLight(100, 150, 255, 1, -0.5, 0.5);
    pointLight(255, 200, 150, 200, -200, 200);
    
    // Set camera distance
    let camX = morphingSphere.cameraDistance * sin(0) * cos(0);
    let camY = morphingSphere.cameraDistance * sin(0);
    let camZ = morphingSphere.cameraDistance * cos(0) * cos(0);
    camera(0, 0, morphingSphere.cameraDistance, 0, 0, 0, 0, 1, 0);
    
    // Update and draw
    morphingSphere.update();
    morphingSphere.draw();
    
    // UI
    drawUI();
}

function drawUI() {
    push();
    camera();
    resetMatrix();
    
    // Background panel
    fill(0, 0, 0, 150);
    noStroke();
    rect(10, 10, 250, 140, 5);
    
    fill(255, 220);
    textAlign(LEFT);
    textSize(14);
    text('Sphere Morphing', 20, 30);
    
    textSize(12);
    fill(255, 180);
    text(`Mode: ${morphingSphere.wireframe ? 'Wireframe' : 'Solid'}`, 20, 50);
    text(`Color: ${['Distance', 'Y-Position', 'Noise'][morphingSphere.colorMode]}`, 20, 65);
    text(`Intensity: ${morphingSphere.morphIntensity}`, 20, 80);
    text(`Auto Rotate: ${morphingSphere.autoRotate ? 'ON' : 'OFF'}`, 20, 95);
    text(`Zoom: ${Math.round((300/morphingSphere.cameraDistance) * 100)}%`, 20, 110);
    
    text('Controls:', 20, 130);
    text('[W] Wireframe | [C] Color | [R] Auto-rotate', 20, 145);
    
    // Controls at bottom
    fill(0, 0, 0, 150);
    rect(10, height - 80, 400, 75, 5);
    
    fill(255, 180);
    text('Mouse: Drag to rotate | Scroll to zoom', 20, height - 60);
    text('[Q/E] Morph intensity | [Space] Reset view', 20, height - 45);
    text('Proper shading with multiple light sources', 20, height - 30);
    text('Smooth normals for realistic lighting', 20, height - 15);
    
    pop();
}

function keyPressed() {
    if (morphingSphere) {
        morphingSphere.keyPressed();
    }
}

function mouseDragged() {
    if (morphingSphere) {
        morphingSphere.mouseDragged();
    }
}

function mousePressed() {
    if (morphingSphere) {
        return morphingSphere.mousePressed();
    }
}

function mouseReleased() {
    if (morphingSphere) {
        morphingSphere.mouseReleased();
    }
}

function mouseWheel(event) {
    if (morphingSphere) {
        return morphingSphere.mouseWheel(event);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
