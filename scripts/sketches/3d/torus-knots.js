class TorusKnot {
    constructor(p, q, R = 100, r = 30) {
        this.p = p; // Number of times the curve winds around the major circumference
        this.q = q; // Number of times the curve winds around the minor circumference
        this.R = R; // Major radius
        this.r = r; // Minor radius
        this.points = [];
        this.normals = [];
        this.colors = [];
        this.resolution = 200;
        this.tubeResolution = 16;
        this.tubeRadius = 8;
        this.time = 0;
        
        this.generateKnot();
    }

    generateKnot() {
        this.points = [];
        this.normals = [];
        this.colors = [];
        
        for (let i = 0; i <= this.resolution; i++) {
            let t = map(i, 0, this.resolution, 0, TWO_PI);
            let point = this.getKnotPoint(t);
            let tangent = this.getKnotTangent(t);
            let normal = this.getKnotNormal(t);
            
            this.points.push(point);
            this.normals.push(normal);
            
            // Color based on position along curve
            let hue = map(i, 0, this.resolution, 0, 360);
            colorMode(HSB);
            this.colors.push(color(hue, 80, 90));
            colorMode(RGB);
        }
    }

    getKnotPoint(t) {
        let x = (this.R + this.r * cos(this.q * t)) * cos(this.p * t);
        let y = (this.R + this.r * cos(this.q * t)) * sin(this.p * t);
        let z = this.r * sin(this.q * t);
        return createVector(x, y, z);
    }

    getKnotTangent(t) {
        let epsilon = 0.01;
        let p1 = this.getKnotPoint(t - epsilon);
        let p2 = this.getKnotPoint(t + epsilon);
        let tangent = p5.Vector.sub(p2, p1);
        tangent.normalize();
        return tangent;
    }

    getKnotNormal(t) {
        let epsilon = 0.01;
        let t1 = this.getKnotTangent(t - epsilon);
        let t2 = this.getKnotTangent(t + epsilon);
        let normal = p5.Vector.sub(t2, t1);
        normal.normalize();
        return normal;
    }

    update() {
        this.time += 0.01;
    }

    drawWireframe() {
        stroke(255);
        strokeWeight(2);
        noFill();
        
        beginShape();
        for (let i = 0; i < this.points.length; i++) {
            let p = this.points[i];
            stroke(this.colors[i]);
            vertex(p.x, p.y, p.z);
        }
        endShape(CLOSE);
    }

    drawTube() {
        // Draw tube geometry
        for (let i = 0; i < this.points.length - 1; i++) {
            let p1 = this.points[i];
            let p2 = this.points[i + 1];
            let n1 = this.normals[i];
            let n2 = this.normals[i + 1];
            let c1 = this.colors[i];
            let c2 = this.colors[i + 1];
            
            this.drawTubeSegment(p1, p2, n1, n2, c1, c2);
        }
        
        // Connect last to first
        if (this.points.length > 0) {
            let p1 = this.points[this.points.length - 1];
            let p2 = this.points[0];
            let n1 = this.normals[this.normals.length - 1];
            let n2 = this.normals[0];
            let c1 = this.colors[this.colors.length - 1];
            let c2 = this.colors[0];
            
            this.drawTubeSegment(p1, p2, n1, n2, c1, c2);
        }
    }

    drawTubeSegment(p1, p2, n1, n2, c1, c2) {
        let tangent = p5.Vector.sub(p2, p1);
        tangent.normalize();
        
        // Create a basis for the tube cross-section
        let binormal1 = p5.Vector.cross(tangent, n1, createVector());
        let binormal2 = p5.Vector.cross(tangent, n2, createVector());
        
        binormal1.normalize();
        binormal2.normalize();
        
        // Draw tube as triangle strip
        beginShape(TRIANGLE_STRIP);
        for (let j = 0; j <= this.tubeResolution; j++) {
            let angle = map(j, 0, this.tubeResolution, 0, TWO_PI);
            let cosA = cos(angle);
            let sinA = sin(angle);
            
            // First ring
            fill(c1);
            let v1 = p5.Vector.mult(n1, cosA * this.tubeRadius);
            let v1b = p5.Vector.mult(binormal1, sinA * this.tubeRadius);
            v1.add(v1b);
            v1.add(p1);
            vertex(v1.x, v1.y, v1.z);
            
            // Second ring
            fill(c2);
            let v2 = p5.Vector.mult(n2, cosA * this.tubeRadius);
            let v2b = p5.Vector.mult(binormal2, sinA * this.tubeRadius);
            v2.add(v2b);
            v2.add(p2);
            vertex(v2.x, v2.y, v2.z);
        }
        endShape();
    }

    drawParticles() {
        for (let i = 0; i < this.points.length; i += 3) {
            push();
            let p = this.points[i];
            translate(p.x, p.y, p.z);
            
            fill(this.colors[i]);
            noStroke();
            
            let size = 5 + sin(this.time * 2 + i * 0.1) * 2;
            sphere(size);
            pop();
        }
    }
}

class TorusKnotVisualization {
    constructor() {
        this.knots = [];
        this.currentKnot = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.autoRotate = true;
        this.renderMode = 1; // 0: wireframe, 1: tube, 2: particles
        this.scale = 1.0;
        this.targetScale = 1.0;
        this.time = 0;
        this.isDragging = false;
        this.transitionProgress = 1.0;
        this.transitionTarget = 0;
        this.prevKnot = 0;
        this.clickEffects = [];
        this.interactionHint = 0;
        this.mousePressTime = 0;
        this.mousePressX = 0;
        this.mousePressY = 0;
        
        this.initializeKnots();
    }

    initializeKnots() {
        // Various interesting torus knot configurations with descriptions
        this.knotConfigs = [
            {p: 3, q: 2, name: "Trefoil", desc: "最もシンプルな結び目"},
            {p: 5, q: 2, name: "Cinquefoil", desc: "5つの葉を持つ結び目"},
            {p: 4, q: 3, name: "Figure-eight", desc: "8の字型の結び目"},
            {p: 5, q: 3, name: "Pentafoil", desc: "複雑な5つ葉パターン"},
            {p: 7, q: 2, name: "Septafoil", desc: "7つの葉を持つ結び目"},
            {p: 6, q: 4, name: "Complex", desc: "対称的な複雑パターン"},
            {p: 8, q: 3, name: "Intricate", desc: "精巧な編み込みパターン"},
            {p: 9, q: 4, name: "Elaborate", desc: "最も複雑な結び目"}
        ];
        
        for (let config of this.knotConfigs) {
            this.knots.push(new TorusKnot(config.p, config.q));
        }
    }

    update() {
        this.time += 0.01;
        
        // Smooth transitions
        this.rotationX = lerp(this.rotationX, this.targetRotationX, 0.1);
        this.rotationY = lerp(this.rotationY, this.targetRotationY, 0.1);
        this.scale = lerp(this.scale, this.targetScale, 0.1);
        
        // Auto-rotate
        if (this.autoRotate && !this.isDragging) {
            this.targetRotationY += 0.008;
            this.targetRotationX = sin(this.time * 0.5) * 0.2;
        }
        
        // Update knot transition
        if (this.transitionProgress < 1.0) {
            this.transitionProgress += 0.05;
            if (this.transitionProgress >= 1.0) {
                this.transitionProgress = 1.0;
                this.prevKnot = this.transitionTarget;
                this.currentKnot = this.transitionTarget;
            }
        }
        
        // Update current knot
        this.knots[this.currentKnot].update();
        if (this.prevKnot !== this.currentKnot) {
            this.knots[this.prevKnot].update();
        }
        
        // Update click effects
        for (let i = this.clickEffects.length - 1; i >= 0; i--) {
            let effect = this.clickEffects[i];
            effect.life -= 2;
            effect.radius += 5;
            if (effect.life <= 0) {
                this.clickEffects.splice(i, 1);
            }
        }
        
        // Update interaction hint
        this.interactionHint = max(0, this.interactionHint - 1);
    }

    draw() {
        background(10, 15, 25);
        
        // Enhanced lighting
        ambientLight(60, 60, 100);
        directionalLight(255, 255, 255, -1, 0.5, -1);
        pointLight(255, 200, 150, 200, -200, 200);
        pointLight(150, 200, 255, -200, 200, -200);
        
        // Apply transformations
        push();
        scale(this.scale);
        rotateX(this.rotationX);
        rotateY(this.rotationY);
        
        // Draw knot with transition effect
        if (this.transitionProgress < 1.0) {
            // Fade out previous knot
            push();
            let fadeOut = 1.0 - this.transitionProgress;
            this.drawKnotWithOpacity(this.knots[this.prevKnot], fadeOut);
            pop();
            
            // Fade in new knot
            push();
            let fadeIn = this.transitionProgress;
            this.drawKnotWithOpacity(this.knots[this.transitionTarget], fadeIn);
            pop();
        } else {
            // Draw current knot normally
            let knot = this.knots[this.currentKnot];
            
            noStroke();
            if (this.renderMode === 0) {
                knot.drawWireframe();
            } else if (this.renderMode === 1) {
                knot.drawTube();
            } else {
                knot.drawParticles();
            }
        }
        
        // Draw coordinate reference
        this.drawAxes();
        
        // Draw click effects
        this.drawClickEffects();
        
        pop();
        
        // Draw UI
        this.drawUI();
    }
    
    drawKnotWithOpacity(knot, opacity) {
        push();
        // Simple opacity simulation by adjusting colors
        let alpha = opacity * 255;
        
        if (this.renderMode === 0) {
            strokeWeight(2 * opacity);
            knot.drawWireframe();
        } else if (this.renderMode === 1) {
            // Adjust tube colors for fade effect
            knot.drawTube();
        } else {
            knot.drawParticles();
        }
        pop();
    }
    
    drawClickEffects() {
        noFill();
        for (let effect of this.clickEffects) {
            push();
            stroke(effect.color.levels[0], effect.color.levels[1], effect.color.levels[2], effect.life);
            strokeWeight(3);
            rotateX(frameCount * 0.02);
            rotateY(frameCount * 0.03);
            ellipse(0, 0, effect.radius * 2, effect.radius * 2);
            pop();
        }
    }

    drawAxes() {
        strokeWeight(1);
        // X axis - red
        stroke(255, 0, 0, 100);
        line(0, 0, 0, 50, 0, 0);
        // Y axis - green
        stroke(0, 255, 0, 100);
        line(0, 0, 0, 0, 50, 0);
        // Z axis - blue
        stroke(0, 0, 255, 100);
        line(0, 0, 0, 0, 0, 50);
    }

    drawUI() {
        // Reset camera for UI
        push();
        camera();
        resetMatrix();
        
        // Use ortho() to avoid WebGL text issues
        ortho();
        
        // Main info panel
        push();
        fill(0, 0, 0, 150);
        noStroke();
        rect(10, 10, 300, 120, 10);
        
        fill(255, 220);
        textAlign(LEFT);
        textSize(16);
        let config = this.knotConfigs[this.currentKnot];
        text(`${config.name} Knot (${config.p}, ${config.q})`, 20, 35);
        
        textSize(12);
        fill(200, 200, 255);
        text(config.desc, 20, 55);
        
        fill(255, 180);
        text(`Mode: ${['Wireframe', 'Tube', 'Particles'][this.renderMode]}`, 20, 75);
        text(`Auto Rotate: ${this.autoRotate ? 'ON' : 'OFF'}`, 20, 90);
        text(`Scale: ${(this.scale * 100).toFixed(0)}%`, 20, 105);
        text(`Pattern: ${this.currentKnot + 1}/${this.knots.length}`, 180, 105);
        pop();
        
        // Controls panel
        push();
        fill(0, 0, 0, 150);
        rect(10, height - 140, 450, 135, 10);
        
        fill(255, 220);
        textSize(14);
        text('Mouse Controls:', 20, height - 115);
        
        textSize(12);
        fill(255, 180);
        text('Click: Next knot pattern', 20, height - 95);
        text('Right Click: Previous knot pattern', 20, height - 80);
        text('Drag: Rotate view', 20, height - 65);
        text('Scroll: Zoom in/out', 20, height - 50);
        text('Double Click: Random knot', 20, height - 35);
        
        text('Keys: [M] Mode | [R] Auto-rotate | [Space] Reset view', 20, height - 15);
        pop();
        
        // Interaction hint
        if (this.interactionHint > 0) {
            push();
            fill(255, 255, 100, this.interactionHint);
            textAlign(CENTER);
            textSize(18);
            text('Click to change knot pattern!', width/2, height/2 - 100);
            pop();
        }
        
        // Knot selector preview
        this.drawKnotSelector();
    }
    
    drawKnotSelector() {
        push();
        fill(0, 0, 0, 150);
        noStroke();
        rect(width - 170, 10, 160, 250, 10);
        
        fill(255, 220);
        textAlign(CENTER);
        textSize(14);
        text('Knot Patterns', width - 90, 30);
        
        // Draw knot previews
        for (let i = 0; i < this.knotConfigs.length; i++) {
            let y = 50 + i * 25;
            let config = this.knotConfigs[i];
            
            if (i === this.currentKnot) {
                fill(100, 200, 255, 100);
                rect(width - 165, y - 12, 150, 22, 5);
            }
            
            fill(i === this.currentKnot ? 255 : 180);
            textAlign(LEFT);
            textSize(11);
            text(`${i + 1}. ${config.name}`, width - 160, y);
            
            textAlign(RIGHT);
            fill(150);
            text(`(${config.p},${config.q})`, width - 20, y);
        }
        pop();
        
        pop(); // End of ortho mode
    }


    keyPressed() {
        if (key === 'n' || key === 'N') {
            this.nextKnot();
        } else if (key === 'p' || key === 'P') {
            this.previousKnot();
        } else if (key === 'm' || key === 'M') {
            this.renderMode = (this.renderMode + 1) % 3;
        } else if (key === 'r' || key === 'R') {
            this.autoRotate = !this.autoRotate;
        } else if (key === '+' || key === '=') {
            this.targetScale = min(this.targetScale + 0.1, 3.0);
        } else if (key === '-' || key === '_') {
            this.targetScale = max(this.targetScale - 0.1, 0.3);
        } else if (key === ' ') {
            this.resetView();
        } else if (key >= '1' && key <= '8') {
            let index = int(key) - 1;
            if (index < this.knots.length) {
                this.switchToKnot(index);
            }
        }
    }
    
    nextKnot() {
        let next = (this.currentKnot + 1) % this.knots.length;
        this.switchToKnot(next);
    }
    
    previousKnot() {
        let prev = (this.currentKnot - 1 + this.knots.length) % this.knots.length;
        this.switchToKnot(prev);
    }
    
    switchToKnot(index) {
        if (index !== this.currentKnot && this.transitionProgress >= 1.0) {
            this.prevKnot = this.currentKnot;
            this.transitionTarget = index;
            this.transitionProgress = 0.0;
        }
    }
    
    resetView() {
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.targetScale = 1.0;
    }

    mouseDragged() {
        if (mouseButton === LEFT) {
            this.isDragging = true;
            this.targetRotationY += (mouseX - pmouseX) * 0.01;
            this.targetRotationX += (pmouseY - mouseY) * 0.01;
            this.targetRotationX = constrain(this.targetRotationX, -PI/2, PI/2);
        }
        return false;
    }
    
    mousePressed() {
        this.isDragging = true;
        this.mousePressTime = millis();
        this.mousePressX = mouseX;
        this.mousePressY = mouseY;
        
        if (this.autoRotate) {
            this.autoRotate = false;
        }
        
        // Show interaction hint on first click
        if (this.interactionHint === 0 && frameCount < 300) {
            this.interactionHint = 255;
        }
        
        return false;
    }
    
    mouseReleased() {
        this.isDragging = false;
        
        // Check if it was a click (not a drag)
        // Use a more reliable click detection
        let clickThreshold = 10;
        let timeSincePress = millis() - this.mousePressTime;
        
        if (timeSincePress < 500 && abs(mouseX - this.mousePressX) < clickThreshold && abs(mouseY - this.mousePressY) < clickThreshold) {
            if (mouseButton === LEFT) {
                this.nextKnot();
                
                // Add click effect
                this.clickEffects.push({
                    life: 255,
                    radius: 20,
                    color: color(random(150, 255), random(150, 255), random(150, 255))
                });
            } else if (mouseButton === RIGHT) {
                this.previousKnot();
            } else if (mouseButton === CENTER) {
                // Middle click to toggle render mode
                this.renderMode = (this.renderMode + 1) % 3;
            }
        }
    }
    
    mouseWheel(event) {
        this.targetScale -= event.delta * 0.001;
        this.targetScale = constrain(this.targetScale, 0.3, 3.0);
        return false;
    }
    
    doubleClicked() {
        // Switch to random knot
        let randomIndex = floor(random(this.knots.length));
        this.switchToKnot(randomIndex);
        return false;
    }
}

// P5.js functions
let torusKnotViz;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    torusKnotViz = new TorusKnotVisualization();
}

function draw() {
    torusKnotViz.update();
    torusKnotViz.draw();
}

function keyPressed() {
    if (torusKnotViz) {
        torusKnotViz.keyPressed();
    }
}

function mouseDragged() {
    if (torusKnotViz) {
        return torusKnotViz.mouseDragged();
    }
}

function mousePressed() {
    if (torusKnotViz) {
        return torusKnotViz.mousePressed();
    }
}

function mouseReleased() {
    if (torusKnotViz) {
        torusKnotViz.mouseReleased();
    }
}

function mouseWheel(event) {
    if (torusKnotViz) {
        return torusKnotViz.mouseWheel(event);
    }
}

function doubleClicked() {
    if (torusKnotViz) {
        return torusKnotViz.doubleClicked();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}