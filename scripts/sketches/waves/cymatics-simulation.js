class CymaticsSimulation {
    constructor() {
        this.gridSize = 200;
        this.heights = [];
        this.velocities = [];
        this.sources = [];
        this.frequency = 40;
        this.amplitude = 20;
        this.damping = 0.99;
        this.time = 0;
        this.showWaveform = true;
        this.colorMode = 0;
        this.displayMode = 0; // 0: 3D, 1: 2D topview, 2: heightmap
    }

    init() {
        // Initialize height and velocity grids
        for (let i = 0; i < this.gridSize; i++) {
            this.heights[i] = [];
            this.velocities[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.heights[i][j] = 0;
                this.velocities[i][j] = 0;
            }
        }

        // Add default sources at corners
        this.sources = [
            { x: this.gridSize * 0.2, y: this.gridSize * 0.2, frequency: this.frequency, amplitude: this.amplitude, phase: 0 },
            { x: this.gridSize * 0.8, y: this.gridSize * 0.2, frequency: this.frequency * 1.1, amplitude: this.amplitude, phase: PI/2 },
            { x: this.gridSize * 0.2, y: this.gridSize * 0.8, frequency: this.frequency * 0.9, amplitude: this.amplitude, phase: PI },
            { x: this.gridSize * 0.8, y: this.gridSize * 0.8, frequency: this.frequency * 1.2, amplitude: this.amplitude, phase: 3*PI/2 }
        ];
    }

    update() {
        // Reset heights
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.heights[i][j] = 0;
            }
        }

        // Add wave contributions from all sources
        for (let source of this.sources) {
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    let dx = i - source.x;
                    let dy = j - source.y;
                    let distance = sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        let waveValue = source.amplitude * sin(this.time * source.frequency / 10 - distance * 0.3 + source.phase) / (1 + distance * 0.05);
                        this.heights[i][j] += waveValue;
                    }
                }
            }
        }

        this.time += 0.1;
    }

    draw() {
        background(10);
        
        if (this.displayMode === 0) {
            this.draw3D();
        } else if (this.displayMode === 1) {
            this.draw2DTopView();
        } else {
            this.drawHeightMap();
        }

        // Draw UI
        this.drawUI();
    }

    draw3D() {
        // 3D visualization
        push();
        translate(0, 0, -100);
        rotateX(PI/4);
        rotateZ(this.time * 0.005);
        
        // 表示サイズを大きく
        let meshSize = min(width, height) * 0.8;
        let stepX = meshSize / this.gridSize;
        let stepY = meshSize / this.gridSize;
        
        noFill();
        strokeWeight(1);
        
        // Draw mesh
        for (let i = 0; i < this.gridSize - 1; i += 2) {
            beginShape(TRIANGLE_STRIP);
            for (let j = 0; j < this.gridSize; j += 2) {
                // Color based on height
                let height1 = this.heights[i][j];
                let height2 = this.heights[i + 1] ? this.heights[i + 1][j] : 0;
                
                this.setHeightColor(height1);
                vertex((i - this.gridSize/2) * stepX, (j - this.gridSize/2) * stepY, height1 * 5);
                
                this.setHeightColor(height2);
                vertex(((i + 1) - this.gridSize/2) * stepX, (j - this.gridSize/2) * stepY, height2 * 5);
            }
            endShape();
        }
        
        // 音源の位置を表示
        for (let source of this.sources) {
            push();
            translate((source.x - this.gridSize/2) * stepX, (source.y - this.gridSize/2) * stepY, 30);
            fill(255, 255, 0, 200);
            noStroke();
            sphere(8);
            pop();
        }
        
        pop();
    }

    draw2DTopView() {
        // 2D top-down view
        // 中央に配置
        push();
        translate(-width/2, -height/2);
        
        let stepX = width / this.gridSize;
        let stepY = height / this.gridSize;
        
        noStroke();
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                let height = this.heights[i][j];
                this.setHeightColor(height);
                rect(i * stepX, j * stepY, stepX, stepY);
            }
        }

        // Draw sources
        fill(255, 255, 0);
        noStroke();
        for (let source of this.sources) {
            circle(source.x * stepX, source.y * stepY, 15);
        }
        
        pop();
    }

    drawHeightMap() {
        // Grayscale height map
        push();
        translate(-width/2, -height/2);
        
        let stepX = width / this.gridSize;
        let stepY = height / this.gridSize;
        
        noStroke();
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                let height = this.heights[i][j];
                let brightness = map(height, -this.amplitude * 2, this.amplitude * 2, 0, 255);
                fill(brightness);
                rect(i * stepX, j * stepY, stepX, stepY);
            }
        }
        
        // Draw sources
        fill(255, 255, 0);
        for (let source of this.sources) {
            circle(source.x * stepX, source.y * stepY, 15);
        }
        
        pop();
    }

    setHeightColor(height) {
        if (this.colorMode === 0) {
            // Blue to red gradient
            let t = map(height, -this.amplitude * 2, this.amplitude * 2, 0, 1);
            t = constrain(t, 0, 1);
            fill(t * 255, 100, (1-t) * 255, 150);
            stroke(t * 255, 100, (1-t) * 255);
        } else if (this.colorMode === 1) {
            // HSV rainbow
            let hue = map(height, -this.amplitude * 2, this.amplitude * 2, 0, 360);
            colorMode(HSB);
            fill(hue, 80, 90, 150);
            stroke(hue, 80, 90);
            colorMode(RGB);
        } else {
            // Monochrome
            let brightness = map(abs(height), 0, this.amplitude * 2, 50, 255);
            fill(brightness, 150);
            stroke(brightness);
        }
    }

    drawUI() {
        // UI をカメラ座標系で描画
        camera();
        fill(255, 200);
        textAlign(LEFT, TOP);
        textSize(14);
        text(`Frequency: ${this.frequency.toFixed(1)} Hz`, 10, 20);
        text(`Amplitude: ${this.amplitude.toFixed(1)}`, 10, 40);
        text(`Sources: ${this.sources.length}`, 10, 60);
        text(`Display: ${['3D', '2D俯瞰', 'HeightMap'][this.displayMode]}`, 10, 80);
        text(`Color: ${['Blue-Red', 'Rainbow', 'Mono'][this.colorMode]}`, 10, 100);
        text('Click/Drag to add wave sources', 10, 120);
        text('D: display mode, C: color mode', 10, 140);
        text('F/V: frequency, A/Z: amplitude, Space: clear', 10, 160);
    }

    mousePressed() {
        // マウス座標をグリッド座標に変換
        let sourceX = map(mouseX, 0, width, 0, this.gridSize);
        let sourceY = map(mouseY, 0, height, 0, this.gridSize);
        
        // 範囲チェック
        if (sourceX >= 0 && sourceX < this.gridSize && sourceY >= 0 && sourceY < this.gridSize) {
            this.sources.push({
                x: sourceX,
                y: sourceY,
                frequency: this.frequency + random(-5, 5),
                amplitude: this.amplitude,
                phase: random(TWO_PI)
            });
            
            // 音源数を制限
            if (this.sources.length > 8) {
                this.sources.shift();
            }
        }
    }
    
    mouseDragged() {
        // ドラッグ中は連続して音源を追加（確率的に）
        if (frameCount % 5 === 0) {
            this.mousePressed();
        }
    }

    keyPressed() {
        if (key === 'd' || key === 'D') {
            // Change display mode
            this.displayMode = (this.displayMode + 1) % 3;
        } else if (key === 'c' || key === 'C') {
            // Change color mode
            this.colorMode = (this.colorMode + 1) % 3;
        } else if (key === 'r' || key === 'R') {
            // Reset
            this.init();
        } else if (key === 'f' || key === 'F') {
            // Increase frequency
            this.frequency = min(this.frequency + 5, 100);
            for (let source of this.sources) {
                source.frequency = this.frequency + random(-5, 5);
            }
        } else if (key === 'v' || key === 'V') {
            // Decrease frequency
            this.frequency = max(this.frequency - 5, 10);
            for (let source of this.sources) {
                source.frequency = this.frequency + random(-5, 5);
            }
        } else if (key === 'a' || key === 'A') {
            // Increase amplitude
            this.amplitude = min(this.amplitude + 5, 50);
            for (let source of this.sources) {
                source.amplitude = this.amplitude;
            }
        } else if (key === 'z' || key === 'Z') {
            // Decrease amplitude
            this.amplitude = max(this.amplitude - 5, 5);
            for (let source of this.sources) {
                source.amplitude = this.amplitude;
            }
        } else if (key === ' ') {
            // Clear sources
            this.sources = [];
        } else if (keyCode === UP_ARROW) {
            // Increase frequency with arrow keys
            this.frequency = min(this.frequency + 2, 100);
            for (let source of this.sources) {
                source.frequency = this.frequency + random(-5, 5);
            }
        } else if (keyCode === DOWN_ARROW) {
            // Decrease frequency with arrow keys
            this.frequency = max(this.frequency - 2, 10);
            for (let source of this.sources) {
                source.frequency = this.frequency + random(-5, 5);
            }
        }
    }
}

// Functions are defined in the HTML file