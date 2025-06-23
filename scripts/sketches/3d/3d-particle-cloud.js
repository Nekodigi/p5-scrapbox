class Particle3D {
    constructor(x, y, z) {
        this.pos = createVector(x, y, z);
        this.vel = p5.Vector.random3D();
        this.vel.mult(random(0.5, 2));
        this.acc = createVector(0, 0, 0);
        this.size = random(2, 8);
        this.life = 255;
        this.maxLife = 255;
        this.color = color(random(100, 255), random(100, 255), random(100, 255));
        this.noiseOffset = createVector(random(1000), random(1000), random(1000));
        this.trail = [];
        this.maxTrailLength = 5; // 軽量化のため短縮
    }

    update(attractor, time, mouseAttractor = null, mouseForce = 0) {
        // Add current position to trail
        this.trail.push(this.pos.copy());
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Apply noise-based force
        let noiseForce = createVector(
            noise(this.noiseOffset.x + time * 0.01) - 0.5,
            noise(this.noiseOffset.y + time * 0.01) - 0.5,
            noise(this.noiseOffset.z + time * 0.01) - 0.5
        );
        noiseForce.mult(0.1);
        this.acc.add(noiseForce);

        // Apply attractor force
        if (attractor) {
            let force = p5.Vector.sub(attractor, this.pos);
            let distance = force.mag();
            distance = constrain(distance, 5, 100);
            force.normalize();
            force.mult(100 / (distance * distance));
            this.acc.add(force);
        }

        // Apply mouse attractor/repeller force
        if (mouseAttractor) {
            let force = p5.Vector.sub(mouseAttractor, this.pos);
            let distance = force.mag();
            distance = constrain(distance, 10, 200);
            force.normalize();
            // Positive mouseForce = attract, negative = repel
            force.mult(mouseForce * 500 / (distance * distance));
            this.acc.add(force);
        }

        // Apply gravity towards center
        let center = createVector(0, 0, 0);
        let gravity = p5.Vector.sub(center, this.pos);
        gravity.mult(0.001);
        this.acc.add(gravity);

        // Update physics
        this.vel.add(this.acc);
        this.vel.limit(3);
        this.pos.add(this.vel);
        this.acc.mult(0);

        // Boundary check with wrapping
        let boundary = 300;
        if (this.pos.x > boundary) this.pos.x = -boundary;
        if (this.pos.x < -boundary) this.pos.x = boundary;
        if (this.pos.y > boundary) this.pos.y = -boundary;
        if (this.pos.y < -boundary) this.pos.y = boundary;
        if (this.pos.z > boundary) this.pos.z = -boundary;
        if (this.pos.z < -boundary) this.pos.z = boundary;

        // Update life
        this.life -= 0.5;
        if (this.life <= 0) {
            this.respawn();
        }
    }

    respawn() {
        this.pos = p5.Vector.random3D();
        this.pos.mult(random(50, 200));
        this.vel = p5.Vector.random3D();
        this.vel.mult(random(0.5, 2));
        this.life = this.maxLife;
        this.size = random(2, 8);
        this.trail = [];
        this.color = color(random(100, 255), random(100, 255), random(100, 255));
    }

    display(showTrails, coloringMode) {
        push();
        translate(this.pos.x, this.pos.y, this.pos.z);

        // Set color based on mode
        if (coloringMode === 0) {
            // Distance-based coloring
            let distance = this.pos.mag();
            let hue = map(distance, 0, 300, 240, 0); // Blue to red
            push();
            colorMode(HSB);
            fill(hue, 80, 90, map(this.life, 0, this.maxLife, 0, 255));
            pop();
        } else if (coloringMode === 1) {
            // Velocity-based coloring
            let speed = this.vel.mag();
            let intensity = map(speed, 0, 3, 100, 255);
            fill(intensity, intensity * 0.7, intensity * 0.3, map(this.life, 0, this.maxLife, 0, 255));
        } else {
            // Original color with life-based alpha
            let c = this.color;
            fill(red(c), green(c), blue(c), map(this.life, 0, this.maxLife, 0, 255));
        }

        noStroke();
        sphere(this.size);
        pop();

        // Draw trail
        if (showTrails && this.trail.length > 1) {
            stroke(red(this.color), green(this.color), blue(this.color), 100);
            strokeWeight(1);
            noFill();
            
            beginShape();
            for (let i = 0; i < this.trail.length; i++) {
                let pos = this.trail[i];
                let alpha = map(i, 0, this.trail.length - 1, 0, 100);
                stroke(red(this.color), green(this.color), blue(this.color), alpha);
                vertex(pos.x, pos.y, pos.z);
            }
            endShape();
        }
    }
}

class ParticleCloud3D {
    constructor() {
        this.particles = [];
        this.numParticles = 150; // 軽量化のため削減
        this.attractor = null;
        this.showTrails = false; // デフォルトでOFF（重い）
        this.colorMode = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.autoRotate = true;
        this.time = 0;
        this.mouseAttractor = null;
        this.mouseForce = 0;
        this.cameraDistance = 600;
        this.targetCameraDistance = 600;
        this.isDragging = false;
        this.isPanning = false;
        this.cameraOffset = createVector(0, 0, 0);
        this.targetCameraOffset = createVector(0, 0, 0);
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.selectedParticle = null;
        this.clickEffects = [];
        this.interactionMode = 'attract'; // 'attract', 'repel', 'explode'
        
        this.initializeParticles();
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            let pos = p5.Vector.random3D();
            pos.mult(random(50, 250));
            this.particles.push(new Particle3D(pos.x, pos.y, pos.z));
        }
    }

    update() {
        this.time++;
        
        // Smooth camera rotations
        this.rotationX = lerp(this.rotationX, this.targetRotationX, 0.15);
        this.rotationY = lerp(this.rotationY, this.targetRotationY, 0.15);
        
        // Auto-rotate camera
        if (this.autoRotate && !this.isDragging) {
            this.targetRotationY += 0.005;
            this.targetRotationX = sin(this.time * 0.003) * 0.3;
        }

        // Update attractor position
        if (this.attractor) {
            this.attractor = createVector(
                sin(this.time * 0.01) * 100,
                cos(this.time * 0.007) * 100,
                sin(this.time * 0.013) * 100
            );
        }

        // Smooth camera movements
        this.cameraDistance = lerp(this.cameraDistance, this.targetCameraDistance, 0.1);
        this.cameraOffset.x = lerp(this.cameraOffset.x, this.targetCameraOffset.x, 0.1);
        this.cameraOffset.y = lerp(this.cameraOffset.y, this.targetCameraOffset.y, 0.1);
        this.cameraOffset.z = lerp(this.cameraOffset.z, this.targetCameraOffset.z, 0.1);
        
        // Update mouse attractor with better interaction modes
        if (mouseIsPressed && !this.isDragging && !this.isPanning) {
            // Calculate 3D position from screen coordinates
            let ray = this.screenTo3D(mouseX, mouseY);
            this.mouseAttractor = ray.point;
            
            // Different forces based on interaction mode
            if (this.interactionMode === 'attract') {
                this.mouseForce = 2.0;
            } else if (this.interactionMode === 'repel') {
                this.mouseForce = -2.0;
            } else if (this.interactionMode === 'explode') {
                this.mouseForce = -5.0;
            }
        } else {
            this.mouseAttractor = null;
        }

        // Update click effects
        for (let i = this.clickEffects.length - 1; i >= 0; i--) {
            let effect = this.clickEffects[i];
            effect.life -= 2;
            effect.radius += 3;
            if (effect.life <= 0) {
                this.clickEffects.splice(i, 1);
            }
        }

        // Update all particles
        for (let particle of this.particles) {
            particle.update(this.attractor, this.time, this.mouseAttractor, this.mouseForce);
        }
    }

    screenTo3D(screenX, screenY) {
        // Convert screen coordinates to 3D world coordinates
        let x = (screenX - width/2) * (this.cameraDistance / 600);
        let y = (screenY - height/2) * (this.cameraDistance / 600);
        let z = 0;
        
        // Apply inverse camera rotation
        let cosY = cos(-this.rotationY);
        let sinY = sin(-this.rotationY);
        let cosX = cos(-this.rotationX);
        let sinX = sin(-this.rotationX);
        
        // Rotate around Y axis
        let tempX = x * cosY - z * sinY;
        let tempZ = x * sinY + z * cosY;
        
        // Rotate around X axis
        let finalY = y * cosX - tempZ * sinX;
        let finalZ = y * sinX + tempZ * cosX;
        
        return {
            point: createVector(tempX + this.cameraOffset.x, finalY + this.cameraOffset.y, finalZ + this.cameraOffset.z),
            direction: createVector(tempX, finalY, finalZ).normalize()
        };
    }

    draw() {
        background(0);
        
        // Enhanced lighting setup
        lights();
        ambientLight(30, 30, 40);
        
        // Set up camera with offset
        let camX = this.cameraDistance * sin(this.rotationY) * cos(this.rotationX);
        let camY = this.cameraDistance * sin(this.rotationX);
        let camZ = this.cameraDistance * cos(this.rotationY) * cos(this.rotationX);
        
        camera(
            camX + this.cameraOffset.x,
            camY + this.cameraOffset.y,
            camZ + this.cameraOffset.z,
            this.cameraOffset.x,
            this.cameraOffset.y,
            this.cameraOffset.z,
            0, 1, 0
        );
        
        // Simpler lighting for performance
        ambientLight(80, 80, 80);
        directionalLight(255, 255, 255, -1, 0.5, -1);
        directionalLight(100, 150, 255, 1, -0.5, 0.5);

        // Draw coordinate axes (optional)
        this.drawAxes();

        // Draw attractor
        if (this.attractor) {
            push();
            translate(this.attractor.x, this.attractor.y, this.attractor.z);
            fill(255, 255, 0, 150);
            noStroke();
            sphere(10);
            pop();
        }

        // Draw mouse attractor with mode-specific visualization
        if (this.mouseAttractor) {
            push();
            translate(this.mouseAttractor.x, this.mouseAttractor.y, this.mouseAttractor.z);
            
            // Pulsing effect
            let pulse = sin(frameCount * 0.1) * 0.2 + 1;
            
            // Different colors for different modes
            let modeColor;
            if (this.interactionMode === 'attract') {
                modeColor = color(0, 255, 150); // Cyan
            } else if (this.interactionMode === 'repel') {
                modeColor = color(255, 100, 100); // Red
            } else {
                modeColor = color(255, 200, 0); // Yellow
            }
            
            // Main sphere
            fill(red(modeColor), green(modeColor), blue(modeColor), 180);
            noStroke();
            sphere(25 * pulse);
            
            // Outer glow
            fill(red(modeColor), green(modeColor), blue(modeColor), 60);
            sphere(50 * pulse);
            
            // Animated rings
            stroke(red(modeColor), green(modeColor), blue(modeColor), 150);
            strokeWeight(3);
            noFill();
            
            for (let i = 0; i < 3; i++) {
                push();
                rotateY(frameCount * 0.02 + i * PI/3);
                rotateX(frameCount * 0.015 + i * PI/3);
                ellipse(0, 0, (60 + i * 20) * pulse, (60 + i * 20) * pulse);
                pop();
            }
            
            pop();
        }

        // Draw click effects
        for (let effect of this.clickEffects) {
            push();
            translate(effect.x, effect.y, effect.z);
            noFill();
            stroke(effect.color.levels[0], effect.color.levels[1], effect.color.levels[2], effect.life);
            strokeWeight(2);
            sphere(effect.radius);
            pop();
        }

        // Draw all particles
        for (let particle of this.particles) {
            particle.display(this.showTrails, this.colorMode);
        }

        // Draw connections between nearby particles
        this.drawConnections();

        // Draw UI
        this.drawUI();
    }

    drawAxes() {
        strokeWeight(1);
        // X axis - red
        stroke(255, 0, 0);
        line(0, 0, 0, 100, 0, 0);
        // Y axis - green
        stroke(0, 255, 0);
        line(0, 0, 0, 0, 100, 0);
        // Z axis - blue
        stroke(0, 0, 255);
        line(0, 0, 0, 0, 0, 100);
    }

    drawConnections() {
        // 軽量化のため接続線の描画を最適化
        stroke(255, 20);
        strokeWeight(0.5);
        
        let maxConnections = 100; // 最大接続数を制限
        let connectionCount = 0;
        
        for (let i = 0; i < this.particles.length && connectionCount < maxConnections; i++) {
            for (let j = i + 1; j < this.particles.length && connectionCount < maxConnections; j++) {
                let distance = p5.Vector.dist(this.particles[i].pos, this.particles[j].pos);
                if (distance < 40) { // 距離を短縮
                    let alpha = map(distance, 0, 40, 60, 0);
                    stroke(255, alpha);
                    line(
                        this.particles[i].pos.x, this.particles[i].pos.y, this.particles[i].pos.z,
                        this.particles[j].pos.x, this.particles[j].pos.y, this.particles[j].pos.z
                    );
                    connectionCount++;
                }
            }
        }
    }

    drawUI() {
        // Reset transformations for UI
        camera();
        // Using push/pop and resetMatrix for UI rendering instead of hint()
        push();
        resetMatrix();
        
        // Semi-transparent background panel
        fill(0, 0, 0, 150);
        noStroke();
        rect(5, 5, 220, 110, 5);
        
        fill(255, 200);
        textAlign(LEFT);
        textSize(12);
        text(`Particles: ${this.numParticles}`, 10, 20);
        text(`Trails: ${this.showTrails ? 'ON' : 'OFF'}`, 10, 35);
        text(`Color: ${['Distance', 'Velocity', 'Original'][this.colorMode]}`, 10, 50);
        text(`Attractor: ${this.attractor ? 'ON' : 'OFF'}`, 10, 65);
        text(`Auto Rotate: ${this.autoRotate ? 'ON' : 'OFF'}`, 10, 80);
        text(`Mode: ${this.interactionMode.toUpperCase()}`, 10, 95);
        text(`Zoom: ${Math.round((600/this.cameraDistance) * 100)}%`, 10, 110);
        
        // Controls panel
        fill(0, 0, 0, 150);
        rect(5, height - 140, 500, 135, 5);
        
        fill(255, 220);
        textSize(14);
        text('Mouse Controls:', 10, height - 120);
        
        textSize(12);
        fill(255, 180);
        text('Left Click & Hold = ' + (this.interactionMode === 'attract' ? 'Attract (Cyan)' : 
             this.interactionMode === 'repel' ? 'Repel (Red)' : 'Explode (Yellow)'), 10, height - 100);
        text('Left Drag = Rotate view smoothly', 10, height - 85);
        text('Middle Drag / Shift+Drag = Pan camera', 10, height - 70);
        text('Scroll / Pinch = Zoom in/out', 10, height - 55);
        text('Double Click = Reset view', 10, height - 40);
        
        text('Keys: [1/2/3] Mode | [Space] Reset | [T] Trails | [C] Color | [A] Attractor', 10, height - 20);
        text('      [R] Auto-rotate | [+/-] Add/Remove particles', 10, height - 5);
        
        pop();
    }

    keyPressed() {
        if (key === 't' || key === 'T') {
            this.showTrails = !this.showTrails;
        } else if (key === 'c' || key === 'C') {
            this.colorMode = (this.colorMode + 1) % 3;
        } else if (key === 'a' || key === 'A') {
            this.attractor = this.attractor ? null : createVector(0, 0, 0);
        } else if (key === 'r' || key === 'R') {
            this.autoRotate = !this.autoRotate;
        } else if (key === '+' || key === '=') {
            this.numParticles = min(this.numParticles + 20, 300);
            this.initializeParticles();
        } else if (key === '-' || key === '_') {
            this.numParticles = max(this.numParticles - 20, 50);
            this.initializeParticles();
        } else if (key === ' ') {
            this.initializeParticles();
            this.resetCamera();
        } else if (key === '1') {
            this.interactionMode = 'attract';
        } else if (key === '2') {
            this.interactionMode = 'repel';
        } else if (key === '3') {
            this.interactionMode = 'explode';
        }
    }

    resetCamera() {
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.targetCameraDistance = 600;
        this.targetCameraOffset = createVector(0, 0, 0);
    }

    mouseDragged() {
        // Check if panning (middle mouse or shift key)
        if (mouseButton === CENTER || keyIsPressed && keyCode === SHIFT) {
            this.isPanning = true;
            let panSpeed = this.cameraDistance / 1000;
            this.targetCameraOffset.x -= (mouseX - pmouseX) * panSpeed;
            this.targetCameraOffset.y += (mouseY - pmouseY) * panSpeed;
        } else if (mouseButton === LEFT) {
            // Smooth rotation
            this.isDragging = true;
            let rotSpeed = 0.01;
            this.targetRotationY += (mouseX - pmouseX) * rotSpeed;
            this.targetRotationX += (pmouseY - mouseY) * rotSpeed;
            this.targetRotationX = constrain(this.targetRotationX, -PI/2 + 0.1, PI/2 - 0.1);
        }
        return false;
    }

    mousePressed() {
        this.isDragging = false;
        this.isPanning = false;
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
        
        // Disable auto rotation when interacting
        if (this.autoRotate && mouseButton === LEFT) {
            this.autoRotate = false;
        }
        
        return false;
    }
    
    mouseReleased() {
        this.isDragging = false;
        this.isPanning = false;
        
        // Add click effect if it was a quick click
        if (dist(mouseX, mouseY, this.lastMouseX, this.lastMouseY) < 5) {
            let ray = this.screenTo3D(mouseX, mouseY);
            this.clickEffects.push({
                x: ray.point.x,
                y: ray.point.y,
                z: ray.point.z,
                life: 255,
                radius: 10,
                color: color(random(100, 255), random(100, 255), random(100, 255))
            });
            
            // Create particle burst on click
            if (this.interactionMode === 'explode') {
                this.createBurst(ray.point);
            }
        }
    }
    
    createBurst(position) {
        // Add temporary explosion force to nearby particles
        for (let particle of this.particles) {
            let distance = p5.Vector.dist(particle.pos, position);
            if (distance < 100) {
                let force = p5.Vector.sub(particle.pos, position);
                force.normalize();
                force.mult(50 / (distance + 1));
                particle.vel.add(force);
            }
        }
    }
    
    doubleClicked() {
        this.resetCamera();
        return false;
    }
    
    mouseWheel(event) {
        // Smooth zoom with acceleration
        let zoomSpeed = this.targetCameraDistance / 500;
        this.targetCameraDistance += event.delta * zoomSpeed;
        this.targetCameraDistance = constrain(this.targetCameraDistance, 150, 1500);
        return false;
    }
}

// P5.js functions for standalone mode
let particleSystem;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    particleSystem = new ParticleCloud3D();
}

function draw() {
    if (particleSystem) {
        particleSystem.update();
        particleSystem.draw();
    }
}

function keyPressed() {
    if (particleSystem) {
        particleSystem.keyPressed();
    }
}

function mouseDragged() {
    if (particleSystem) {
        particleSystem.mouseDragged();
    }
}

function mousePressed() {
    if (particleSystem) {
        return particleSystem.mousePressed();
    }
    return false;
}

function mouseReleased() {
    if (particleSystem) {
        particleSystem.mouseReleased();
    }
}

function doubleClicked() {
    if (particleSystem) {
        return particleSystem.doubleClicked();
    }
}

function mouseWheel(event) {
    if (particleSystem) {
        return particleSystem.mouseWheel(event);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}