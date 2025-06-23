class Fractal3D {
    constructor() {
        this.fractalType = 0; // 0: Sierpinski, 1: Menger, 2: Tree, 3: IFS
        this.iteration = 2;
        this.maxIterations = 3;
        this.maxIterationsByType = [3, 2, 4, 3]; // Sierpinski: 3, Menger: 2, Tree: 4, IFS: 3
        this.autoIterate = true;
        this.rotationX = 0;
        this.rotationY = 0;
        this.autoRotate = false;
        this.mouseRotate = true;
        this.zoom = 1.0;
        this.clickEffects = [];
        this.scale = 1.0;
        this.time = 0;
        this.colorMode = 0;
        
        this.triangles = [];
        this.cubes = [];
        this.branches = [];
        this.points = [];
        
        this.generateFractal();
    }

    generateFractal() {
        if (this.fractalType === 0) {
            this.generateSierpinski3D();
        } else if (this.fractalType === 1) {
            this.generateMengerSponge();
        } else if (this.fractalType === 2) {
            this.generate3DTree();
        } else {
            this.generateIFS();
        }
    }

    generateSierpinski3D() {
        this.triangles = [];
        let size = 200;
        
        // Initial tetrahedron vertices
        let vertices = [
            createVector(0, -size/2, 0),
            createVector(-size/2, size/2, -size/2),
            createVector(size/2, size/2, -size/2),
            createVector(0, size/2, size/2)
        ];
        
        this.sierpinski3DRecursive(vertices, this.iteration);
    }

    sierpinski3DRecursive(vertices, depth) {
        if (depth === 0) {
            this.triangles.push({
                v1: vertices[0], v2: vertices[1], v3: vertices[2],
                color: this.getFractalColor(depth)
            });
            this.triangles.push({
                v1: vertices[0], v2: vertices[1], v3: vertices[3],
                color: this.getFractalColor(depth)
            });
            this.triangles.push({
                v1: vertices[0], v2: vertices[2], v3: vertices[3],
                color: this.getFractalColor(depth)
            });
            this.triangles.push({
                v1: vertices[1], v2: vertices[2], v3: vertices[3],
                color: this.getFractalColor(depth)
            });
        } else {
            // Create midpoints
            let mid = [];
            for (let i = 0; i < 4; i++) {
                for (let j = i + 1; j < 4; j++) {
                    let midpoint = p5.Vector.add(vertices[i], vertices[j]);
                    midpoint.div(2);
                    mid.push(midpoint);
                }
            }
            
            // Create 4 smaller tetrahedra
            this.sierpinski3DRecursive([vertices[0], mid[0], mid[1], mid[2]], depth - 1);
            this.sierpinski3DRecursive([vertices[1], mid[0], mid[3], mid[4]], depth - 1);
            this.sierpinski3DRecursive([vertices[2], mid[1], mid[3], mid[5]], depth - 1);
            this.sierpinski3DRecursive([vertices[3], mid[2], mid[4], mid[5]], depth - 1);
        }
    }

    generateMengerSponge() {
        this.cubes = [];
        let size = 150;
        this.mengerRecursive(createVector(0, 0, 0), size, this.iteration);
    }

    mengerRecursive(center, size, depth) {
        if (depth === 0) {
            this.cubes.push({
                center: center,
                size: size,
                color: this.getFractalColor(depth)
            });
        } else {
            let newSize = size / 3;
            
            // Create 20 smaller cubes (27 - 7 removed)
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        // Skip the center cube and face-centered cubes
                        let count = abs(x) + abs(y) + abs(z);
                        if (count >= 2) {
                            let newCenter = createVector(
                                center.x + x * newSize,
                                center.y + y * newSize,
                                center.z + z * newSize
                            );
                            this.mengerRecursive(newCenter, newSize, depth - 1);
                        }
                    }
                }
            }
        }
    }

    generate3DTree() {
        this.branches = [];
        let startPos = createVector(0, 100, 0);
        let startDir = createVector(0, -1, 0);
        this.treeRecursive(startPos, startDir, 60, this.iteration);
    }

    treeRecursive(pos, dir, length, depth) {
        if (depth === 0 || length < 5) {
            return;
        }
        
        let endPos = p5.Vector.add(pos, p5.Vector.mult(dir, length));
        
        this.branches.push({
            start: pos,
            end: endPos,
            thickness: length * 0.1,
            color: this.getFractalColor(depth)
        });
        
        // Create multiple branches
        let angles = [
            [PI/6, 0],
            [-PI/6, 0],
            [0, PI/6],
            [0, -PI/6],
            [PI/8, PI/8],
            [-PI/8, -PI/8]
        ];
        
        for (let angle of angles) {
            if (random() > 0.3) { // Some randomness
                let newDir = dir.copy();
                
                // Rotate around Y axis
                let cosY = cos(angle[0]);
                let sinY = sin(angle[0]);
                let newX = newDir.x * cosY - newDir.z * sinY;
                let newZ = newDir.x * sinY + newDir.z * cosY;
                newDir.x = newX;
                newDir.z = newZ;
                
                // Rotate around X axis
                let cosX = cos(angle[1]);
                let sinX = sin(angle[1]);
                let newY = newDir.y * cosX - newDir.z * sinX;
                newZ = newDir.y * sinX + newDir.z * cosX;
                newDir.y = newY;
                newDir.z = newZ;
                
                this.treeRecursive(endPos, newDir, length * 0.7, depth - 1);
            }
        }
    }

    generateIFS() {
        this.points = [];
        let numPoints = 1000;
        let point = createVector(0, 0, 0);
        
        for (let i = 0; i < numPoints; i++) {
            // Barnsley fern in 3D
            let r = random();
            let newPoint = createVector();
            
            if (r < 0.01) {
                newPoint.set(0, 0.16 * point.y, point.z * 0.5);
            } else if (r < 0.86) {
                newPoint.x = 0.85 * point.x + 0.04 * point.y;
                newPoint.y = -0.04 * point.x + 0.85 * point.y + 1.6;
                newPoint.z = point.z * 0.85 + sin(i * 0.1) * 10;
            } else if (r < 0.93) {
                newPoint.x = 0.2 * point.x - 0.26 * point.y;
                newPoint.y = 0.23 * point.x + 0.22 * point.y + 1.6;
                newPoint.z = point.z * 0.7 + cos(i * 0.1) * 5;
            } else {
                newPoint.x = -0.15 * point.x + 0.28 * point.y;
                newPoint.y = 0.26 * point.x + 0.24 * point.y + 0.44;
                newPoint.z = point.z * 0.6;
            }
            
            point = newPoint;
            
            if (i > 10) { // Skip first few iterations
                this.points.push({
                    pos: point.copy(),
                    color: this.getFractalColor(0)
                });
            }
        }
    }

    getFractalColor(depth) {
        if (this.colorMode === 0) {
            // Depth-based
            let hue = map(depth, 0, this.maxIterations, 0, 300);
            colorMode(HSB);
            let c = color(hue, 80, 90);
            colorMode(RGB);
            return c;
        } else if (this.colorMode === 1) {
            // Rainbow
            let hue = (frameCount * 2 + depth * 50) % 360;
            colorMode(HSB);
            let c = color(hue, 70, 95);
            colorMode(RGB);
            return c;
        } else {
            // Monochrome
            let gray = map(depth, 0, this.maxIterations, 100, 255);
            return color(gray);
        }
    }

    update() {
        this.time++;
        
        // マウスインタラクション
        if (this.mouseRotate && mouseIsPressed) {
            this.rotationY += (mouseX - pmouseX) * 0.01;
            this.rotationX += (mouseY - pmouseY) * 0.01;
            this.rotationX = constrain(this.rotationX, -PI/2, PI/2);
        }
        
        if (this.autoRotate) {
            this.rotationY += 0.008;
            this.rotationX = sin(this.time * 0.01) * 0.3;
        }
        
        if (this.autoIterate && this.time % 120 === 0) {
            let maxIter = this.maxIterationsByType[this.fractalType];
            this.iteration = (this.iteration + 1) % (maxIter + 1);
            this.generateFractal();
        }
        
        // クリックエフェクトの更新
        for (let i = this.clickEffects.length - 1; i >= 0; i--) {
            let effect = this.clickEffects[i];
            effect.life--;
            effect.size += 2;
            effect.alpha *= 0.95;
            if (effect.life <= 0) {
                this.clickEffects.splice(i, 1);
            }
        }
    }

    draw() {
        background(0);
        
        ambientLight(60);
        directionalLight(255, 255, 255, -1, 0.5, -1);
        
        scale(this.scale * this.zoom);
        rotateX(this.rotationX);
        rotateY(this.rotationY);
        
        if (this.fractalType === 0) {
            this.drawTriangles();
        } else if (this.fractalType === 1) {
            this.drawCubes();
        } else if (this.fractalType === 2) {
            this.drawBranches();
        } else {
            this.drawPoints();
        }
        
        this.drawUI();
        this.drawClickEffects();
    }

    drawTriangles() {
        for (let triangle of this.triangles) {
            fill(triangle.color);
            noStroke();
            beginShape(TRIANGLES);
            vertex(triangle.v1.x, triangle.v1.y, triangle.v1.z);
            vertex(triangle.v2.x, triangle.v2.y, triangle.v2.z);
            vertex(triangle.v3.x, triangle.v3.y, triangle.v3.z);
            endShape();
        }
    }

    drawCubes() {
        for (let cube of this.cubes) {
            push();
            translate(cube.center.x, cube.center.y, cube.center.z);
            fill(cube.color);
            noStroke();
            box(cube.size);
            pop();
        }
    }

    drawBranches() {
        for (let branch of this.branches) {
            stroke(branch.color);
            strokeWeight(branch.thickness);
            line(branch.start.x, branch.start.y, branch.start.z,
                 branch.end.x, branch.end.y, branch.end.z);
        }
    }

    drawPoints() {
        for (let point of this.points) {
            push();
            translate(point.pos.x * 10, -point.pos.y * 10, point.pos.z);
            fill(point.color);
            noStroke();
            sphere(1);
            pop();
        }
    }

    drawUI() {
        camera();
        fill(255);
        textAlign(LEFT, TOP);
        textSize(14);
        let fractalNames = ['Sierpinski 3D', 'Menger Sponge', '3D Tree', 'IFS Fern'];
        text(`Fractal: ${fractalNames[this.fractalType]}`, 10, 20);
        text(`Iteration: ${this.iteration}/${this.maxIterationsByType[this.fractalType]}`, 10, 35);
        text(`Auto Iterate: ${this.autoIterate ? 'ON' : 'OFF'}`, 10, 50);
        text(`Auto Rotate: ${this.autoRotate ? 'ON' : 'OFF'}`, 10, 65);
        text(`Color Mode: ${this.colorMode + 1}/3`, 10, 80);
        text('Keys: 1-4 (fractal), Q/E or ↑↓ (iteration), Space (auto iterate)', 10, height - 50);
        text('R (auto rotate), C (color), Mouse drag to rotate', 10, height - 35);
        text('Mouse wheel to zoom, Click for effects', 10, height - 20);
    }

    keyPressed() {
        if (key === '1') {
            this.fractalType = 0;
            this.iteration = min(this.iteration, this.maxIterationsByType[0]);
            this.generateFractal();
        } else if (key === '2') {
            this.fractalType = 1;
            this.iteration = min(this.iteration, this.maxIterationsByType[1]);
            this.generateFractal();
        } else if (key === '3') {
            this.fractalType = 2;
            this.iteration = min(this.iteration, this.maxIterationsByType[2]);
            this.generateFractal();
        } else if (key === '4') {
            this.fractalType = 3;
            this.iteration = min(this.iteration, this.maxIterationsByType[3]);
            this.generateFractal();
        } else if (key === 'q' || key === 'Q') {
            let maxIter = this.maxIterationsByType[this.fractalType];
            this.iteration = min(this.iteration + 1, maxIter);
            this.generateFractal();
        } else if (key === 'e' || key === 'E') {
            this.iteration = max(this.iteration - 1, 0);
            this.generateFractal();
        } else if (keyCode === UP_ARROW) {
            let maxIter = this.maxIterationsByType[this.fractalType];
            this.iteration = min(this.iteration + 1, maxIter);
            this.generateFractal();
        } else if (keyCode === DOWN_ARROW) {
            this.iteration = max(this.iteration - 1, 0);
            this.generateFractal();
        } else if (key === ' ') {
            this.autoIterate = !this.autoIterate;
        } else if (key === 'r' || key === 'R') {
            this.autoRotate = !this.autoRotate;
        } else if (key === 'c' || key === 'C') {
            this.colorMode = (this.colorMode + 1) % 3;
            this.generateFractal();
        }
    }
    
    drawClickEffects() {
        for (let effect of this.clickEffects) {
            push();
            translate(effect.x, effect.y, effect.z);
            fill(effect.color.levels[0], effect.color.levels[1], effect.color.levels[2], effect.alpha * 255);
            noStroke();
            sphere(effect.size);
            pop();
        }
    }
    
    mousePressed() {
        // 3D\u7a7a\u9593\u306e\u30e9\u30f3\u30c0\u30e0\u306a\u4f4d\u7f6e\u306b\u30a8\u30d5\u30a7\u30af\u30c8\u3092\u8ffd\u52a0
        let effect = {
            x: random(-200, 200),
            y: random(-200, 200),
            z: random(-200, 200),
            size: 5,
            life: 60,
            alpha: 1.0,
            color: color(random(360), 70, 90)\n        };\n        this.clickEffects.push(effect);\n        \n        // \u30af\u30ea\u30c3\u30af\u3067\u30e9\u30f3\u30c0\u30e0\u306b\u30d5\u30e9\u30af\u30bf\u30eb\u306e\u4e00\u90e8\u3092\u5909\u66f4\n        if (random() < 0.3) {\n            this.colorMode = (this.colorMode + 1) % 3;\n            this.generateFractal();\n        }\n        \n        // \u30af\u30ea\u30c3\u30af\u3067\u30e9\u30f3\u30c0\u30e0\u306b\u56de\u8ee2\u3092\u5909\u66f4\n        if (random() < 0.2) {\n            this.rotationY += random(-0.5, 0.5);\n            this.rotationX += random(-0.3, 0.3);\n        }\n    }\n}


function keyPressed() {
    fractal3d.keyPressed();
}

function mouseWheel(event) {
    if (fractal3d) {
        fractal3d.zoom += event.delta * -0.001;
        fractal3d.zoom = constrain(fractal3d.zoom, 0.1, 5.0);
    }
    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}