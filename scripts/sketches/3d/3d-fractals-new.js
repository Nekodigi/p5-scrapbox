// 3D Fractals - Modern Aesthetic Redesign

class Fractal3D {
    constructor() {
        // フラクタルタイプ
        this.fractalType = 0; // 0: Apollonian, 1: Quaternion Julia, 2: Mandelbox, 3: Kleinian
        this.iteration = 8;
        this.maxIterations = 12;
        
        // カメラとビュー
        this.cameraRadius = 400;
        this.cameraTheta = 0;
        this.cameraPhi = PI / 4;
        this.targetRadius = 400;
        this.targetTheta = 0;
        this.targetPhi = PI / 4;
        
        // レンダリング設定
        this.quality = 'medium'; // low, medium, high
        this.showGlow = true;
        this.showGrid = false;
        this.showDepthFog = true;
        
        // アニメーション
        this.time = 0;
        this.animationSpeed = 0.003;
        this.pulsePhase = 0;
        
        // インタラクション
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // マテリアルとカラー
        this.colorPalette = this.generateColorPalette();
        this.materialType = 'metallic'; // metallic, glass, organic
        
        // ポストエフェクト用バッファ
        this.glowBuffer = null;
        this.mainBuffer = null;
        
        this.setupBuffers();
    }
    
    setupBuffers() {
        // グロー効果用のバッファ
        this.glowBuffer = createGraphics(width, height, WEBGL);
        this.mainBuffer = createGraphics(width, height, WEBGL);
    }
    
    generateColorPalette() {
        // モダンなグラデーションパレット
        return [
            color(20, 20, 30),      // Deep space blue
            color(120, 40, 180),    // Purple
            color(40, 180, 220),    // Cyan
            color(220, 120, 40),    // Orange
            color(255, 255, 255)    // White highlights
        ];
    }
    
    update() {
        this.time += this.animationSpeed;
        this.pulsePhase = sin(this.time * 2) * 0.5 + 0.5;
        
        // スムーズカメラ移動
        if (!this.isDragging) {
            this.targetTheta += 0.002;
        }
        
        // カメラのイージング
        this.cameraTheta += (this.targetTheta - this.cameraTheta) * 0.05;
        this.cameraPhi += (this.targetPhi - this.cameraPhi) * 0.05;
        this.cameraRadius += (this.targetRadius - this.cameraRadius) * 0.05;
    }
    
    draw() {
        // メインバッファに描画
        this.mainBuffer.background(10, 10, 15);
        
        // カメラ設定
        let camX = this.cameraRadius * sin(this.cameraPhi) * cos(this.cameraTheta);
        let camY = this.cameraRadius * cos(this.cameraPhi);
        let camZ = this.cameraRadius * sin(this.cameraPhi) * sin(this.cameraTheta);
        
        this.mainBuffer.camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
        
        // 高度なライティング
        this.setupAdvancedLighting();
        
        // グリッド描画（オプション）
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // フラクタル描画
        this.mainBuffer.push();
        this.drawFractal();
        this.mainBuffer.pop();
        
        // メインキャンバスに合成
        image(this.mainBuffer, -width/2, -height/2);
        
        // グロー効果
        if (this.showGlow) {
            this.applyGlowEffect();
        }
        
        // UI描画
        this.drawUI();
    }
    
    setupAdvancedLighting() {
        this.mainBuffer.ambientLight(20, 20, 30);
        
        // キーライト
        this.mainBuffer.directionalLight(255, 240, 220, -0.5, 0.5, -1);
        
        // フィルライト
        this.mainBuffer.directionalLight(100, 120, 180, 0.5, -0.3, 0.5);
        
        // リムライト
        this.mainBuffer.directionalLight(180, 100, 255, 0, -1, 0.5);
        
        // アニメーションポイントライト
        let lightX = cos(this.time * 2) * 200;
        let lightZ = sin(this.time * 2) * 200;
        this.mainBuffer.pointLight(255, 100, 150, lightX, 100, lightZ);
    }
    
    drawFractal() {
        switch(this.fractalType) {
            case 0:
                this.drawApollonianGasket();
                break;
            case 1:
                this.drawQuaternionJulia();
                break;
            case 2:
                this.drawMandelbox();
                break;
            case 3:
                this.drawKleinianGroup();
                break;
        }
    }
    
    drawApollonianGasket() {
        // 初期の4つの球
        let r1 = 100;
        let spheres = [
            {x: 0, y: -r1/2, z: 0, r: r1, level: 0},
            {x: -r1*0.866, y: r1/2, z: 0, r: r1, level: 0},
            {x: r1*0.866, y: r1/2, z: 0, r: r1, level: 0},
            {x: 0, y: 0, z: r1*0.816, r: r1, level: 0}
        ];
        
        // 再帰的に球を生成
        this.apollonianRecursive(spheres, this.iteration);
        
        // 球を描画
        for (let sphere of spheres) {
            this.mainBuffer.push();
            this.mainBuffer.translate(sphere.x, sphere.y, sphere.z);
            
            // レベルに基づいた色とマテリアル
            this.applyFractalMaterial(sphere.level);
            
            // パルスアニメーション
            let scale = 1 + sin(this.time * 3 + sphere.level) * 0.05;
            this.mainBuffer.scale(scale);
            
            this.mainBuffer.sphere(sphere.r);
            this.mainBuffer.pop();
        }
    }
    
    apollonianRecursive(spheres, depth) {
        if (depth <= 0 || spheres.length > 1000) return;
        
        let newSpheres = [];
        
        // 各3つの球の組み合わせで新しい球を計算
        for (let i = 0; i < spheres.length - 2; i++) {
            for (let j = i + 1; j < spheres.length - 1; j++) {
                for (let k = j + 1; k < spheres.length; k++) {
                    let s1 = spheres[i];
                    let s2 = spheres[j];
                    let s3 = spheres[k];
                    
                    // Descartes' Circle Theorem を使用
                    let newSphere = this.calculateTangentSphere(s1, s2, s3);
                    if (newSphere && newSphere.r > 5) {
                        newSphere.level = Math.max(s1.level, s2.level, s3.level) + 1;
                        newSpheres.push(newSphere);
                    }
                }
            }
        }
        
        spheres.push(...newSpheres);
        this.apollonianRecursive(newSpheres, depth - 1);
    }
    
    calculateTangentSphere(s1, s2, s3) {
        // 簡略化された接触球の計算
        let avgX = (s1.x + s2.x + s3.x) / 3;
        let avgY = (s1.y + s2.y + s3.y) / 3;
        let avgZ = (s1.z + s2.z + s3.z) / 3;
        let avgR = (s1.r + s2.r + s3.r) / 3;
        
        return {
            x: avgX + random(-20, 20),
            y: avgY + random(-20, 20),
            z: avgZ + random(-20, 20),
            r: avgR * 0.5
        };
    }
    
    drawQuaternionJulia() {
        // 四元数ジュリア集合の3Dスライス
        let size = 150;
        let step = size / 30;
        
        for (let x = -size; x <= size; x += step) {
            for (let y = -size; y <= size; y += step) {
                for (let z = -size; z <= size; z += step) {
                    if (this.isInQuaternionJulia(x/100, y/100, z/100)) {
                        this.mainBuffer.push();
                        this.mainBuffer.translate(x, y, z);
                        
                        // 距離に基づいた色
                        let dist = sqrt(x*x + y*y + z*z);
                        this.applyDistanceBasedMaterial(dist, size);
                        
                        this.mainBuffer.box(step * 0.8);
                        this.mainBuffer.pop();
                    }
                }
            }
        }
    }
    
    isInQuaternionJulia(x, y, z) {
        let qx = x, qy = y, qz = z, qw = 0;
        let cx = 0.285, cy = 0.01, cz = 0, cw = 0;
        
        for (let i = 0; i < this.iteration; i++) {
            // 四元数の乗算
            let newX = qx*qx - qy*qy - qz*qz - qw*qw + cx;
            let newY = 2*qx*qy + cy;
            let newZ = 2*qx*qz + cz;
            let newW = 2*qx*qw + cw;
            
            qx = newX; qy = newY; qz = newZ; qw = newW;
            
            if (qx*qx + qy*qy + qz*qz + qw*qw > 4) {
                return false;
            }
        }
        return true;
    }
    
    drawMandelbox() {
        // Mandelbox フラクタル
        let size = 100;
        let scale = 2.0;
        let fixedRadius = 1.0;
        let minRadius = 0.5;
        
        for (let i = 0; i < 2000; i++) {
            let x = random(-size, size);
            let y = random(-size, size);
            let z = random(-size, size);
            
            let point = this.mandelboxIteration(x/size, y/size, z/size, scale, fixedRadius, minRadius);
            
            if (point.iterations < this.iteration) {
                this.mainBuffer.push();
                this.mainBuffer.translate(point.x * size, point.y * size, point.z * size);
                
                this.applyFractalMaterial(point.iterations);
                
                let boxSize = map(point.iterations, 0, this.iteration, 8, 2);
                this.mainBuffer.box(boxSize);
                this.mainBuffer.pop();
            }
        }
    }
    
    mandelboxIteration(x, y, z, scale, fixedRadius, minRadius) {
        let posX = x, posY = y, posZ = z;
        let dr = 1.0;
        
        for (let i = 0; i < this.iteration; i++) {
            // Box fold
            posX = this.boxFold(posX);
            posY = this.boxFold(posY);
            posZ = this.boxFold(posZ);
            
            // Sphere fold
            let r2 = posX*posX + posY*posY + posZ*posZ;
            if (r2 < minRadius * minRadius) {
                let temp = fixedRadius * fixedRadius / (minRadius * minRadius);
                posX *= temp;
                posY *= temp;
                posZ *= temp;
                dr *= temp;
            } else if (r2 < fixedRadius * fixedRadius) {
                let temp = fixedRadius * fixedRadius / r2;
                posX *= temp;
                posY *= temp;
                posZ *= temp;
                dr *= temp;
            }
            
            // Scale and translate
            posX = scale * posX + x;
            posY = scale * posY + y;
            posZ = scale * posZ + z;
            dr = dr * abs(scale) + 1.0;
            
            if (posX*posX + posY*posY + posZ*posZ > 4) {
                return {x: posX, y: posY, z: posZ, iterations: i};
            }
        }
        
        return {x: posX, y: posY, z: posZ, iterations: this.iteration};
    }
    
    boxFold(v) {
        if (v > 1) return 2 - v;
        else if (v < -1) return -2 - v;
        return v;
    }
    
    drawKleinianGroup() {
        // Kleinian Group limit set
        let points = [];
        let generators = this.getKleinianGenerators();
        
        // 初期点
        for (let i = 0; i < 100; i++) {
            let theta = random(TWO_PI);
            let phi = random(PI);
            points.push({
                x: sin(phi) * cos(theta) * 100,
                y: sin(phi) * sin(theta) * 100,
                z: cos(phi) * 100
            });
        }
        
        // 変換を適用
        for (let iter = 0; iter < this.iteration; iter++) {
            let newPoints = [];
            for (let point of points) {
                for (let gen of generators) {
                    let transformed = this.applyMobiusTransform(point, gen);
                    if (transformed) {
                        newPoints.push(transformed);
                    }
                }
            }
            points = newPoints;
            
            // ポイント数を制限
            if (points.length > 5000) {
                points = points.slice(0, 5000);
            }
        }
        
        // ポイントを描画
        this.mainBuffer.strokeWeight(2);
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            
            // 深度に基づいた色
            let depth = map(i, 0, points.length, 0, 1);
            let c = lerpColor(this.colorPalette[1], this.colorPalette[3], depth);
            this.mainBuffer.stroke(c);
            
            this.mainBuffer.point(p.x, p.y, p.z);
        }
    }
    
    getKleinianGenerators() {
        // Kleinian group の生成元
        return [
            {a: 1.87, b: 0, c: 0, d: 1},
            {a: 1, b: 0, c: -0.5, d: 1},
            {a: cos(this.time), b: sin(this.time), c: -sin(this.time), d: cos(this.time)}
        ];
    }
    
    applyMobiusTransform(point, gen) {
        // 3D Möbius変換の簡略版
        let x = point.x * gen.a + point.y * gen.b;
        let y = point.x * gen.c + point.y * gen.d;
        let z = point.z * (gen.a * gen.d - gen.b * gen.c);
        
        let scale = 1 / (gen.c * point.x + gen.d * point.y + 0.1);
        
        return {
            x: x * scale,
            y: y * scale,
            z: z * scale
        };
    }
    
    applyFractalMaterial(level) {
        let t = map(level, 0, this.maxIterations, 0, 1);
        let baseColor = lerpColor(this.colorPalette[1], this.colorPalette[3], t);
        
        switch(this.materialType) {
            case 'metallic':
                this.mainBuffer.specularMaterial(red(baseColor), green(baseColor), blue(baseColor));
                this.mainBuffer.shininess(100);
                break;
            case 'glass':
                this.mainBuffer.fill(red(baseColor), green(baseColor), blue(baseColor), 180);
                this.mainBuffer.specularMaterial(255);
                this.mainBuffer.shininess(50);
                break;
            case 'organic':
                this.mainBuffer.fill(baseColor);
                this.mainBuffer.noStroke();
                break;
        }
    }
    
    applyDistanceBasedMaterial(dist, maxDist) {
        let t = map(dist, 0, maxDist, 0, 1);
        let c = lerpColor(this.colorPalette[4], this.colorPalette[2], t);
        this.mainBuffer.fill(c);
        this.mainBuffer.noStroke();
    }
    
    applyGlowEffect() {
        // シンプルなグロー効果
        push();
        blendMode(ADD);
        tint(255, 30);
        image(this.mainBuffer, -width/2 - 2, -height/2 - 2);
        image(this.mainBuffer, -width/2 + 2, -height/2 + 2);
        blendMode(BLEND);
        pop();
    }
    
    drawGrid() {
        this.mainBuffer.push();
        this.mainBuffer.stroke(255, 255, 255, 20);
        this.mainBuffer.strokeWeight(0.5);
        
        let gridSize = 500;
        let gridStep = 50;
        
        for (let i = -gridSize; i <= gridSize; i += gridStep) {
            this.mainBuffer.line(-gridSize, -200, i, gridSize, -200, i);
            this.mainBuffer.line(i, -200, -gridSize, i, -200, gridSize);
        }
        
        this.mainBuffer.pop();
    }
    
    drawUI() {
        push();
        camera();
        
        // 背景パネル
        fill(0, 0, 0, 180);
        noStroke();
        rect(10, 10, 320, 120, 10);
        
        fill(255);
        textAlign(LEFT, TOP);
        textSize(14);
        textFont('monospace');
        
        let fractalNames = ['Apollonian Gasket', 'Quaternion Julia', 'Mandelbox', 'Kleinian Group'];
        text(`Fractal: ${fractalNames[this.fractalType]}`, 20, 20);
        text(`Iterations: ${this.iteration}`, 20, 40);
        text(`Quality: ${this.quality}`, 20, 60);
        text(`Material: ${this.materialType}`, 20, 80);
        
        // コントロール
        textSize(12);
        fill(200);
        text('Keys: 1-4 (type), ↑↓ (iterations), Q (quality), M (material)', 20, 105);
        
        // FPS
        fill(255, 255, 0);
        text(`FPS: ${frameRate().toFixed(0)}`, width - 80, 20);
        
        pop();
    }
    
    // マウス操作
    mousePressed() {
        this.isDragging = true;
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
    }
    
    mouseReleased() {
        this.isDragging = false;
    }
    
    mouseDragged() {
        if (this.isDragging) {
            let deltaX = mouseX - this.lastMouseX;
            let deltaY = mouseY - this.lastMouseY;
            
            this.targetTheta -= deltaX * 0.01;
            this.targetPhi = constrain(this.targetPhi - deltaY * 0.01, 0.1, PI - 0.1);
            
            this.lastMouseX = mouseX;
            this.lastMouseY = mouseY;
        }
    }
    
    mouseWheel(event) {
        this.targetRadius = constrain(this.targetRadius + event.delta * 0.5, 100, 800);
    }
    
    keyPressed() {
        // フラクタルタイプ
        if (key >= '1' && key <= '4') {
            this.fractalType = parseInt(key) - 1;
        }
        
        // イテレーション
        if (keyCode === UP_ARROW) {
            this.iteration = min(this.iteration + 1, this.maxIterations);
        } else if (keyCode === DOWN_ARROW) {
            this.iteration = max(this.iteration - 1, 1);
        }
        
        // クオリティ
        if (key === 'q' || key === 'Q') {
            let qualities = ['low', 'medium', 'high'];
            let idx = qualities.indexOf(this.quality);
            this.quality = qualities[(idx + 1) % 3];
        }
        
        // マテリアル
        if (key === 'm' || key === 'M') {
            let materials = ['metallic', 'glass', 'organic'];
            let idx = materials.indexOf(this.materialType);
            this.materialType = materials[(idx + 1) % 3];
        }
        
        // エフェクト
        if (key === 'g' || key === 'G') {
            this.showGlow = !this.showGlow;
        }
        
        // グリッド
        if (key === 'h' || key === 'H') {
            this.showGrid = !this.showGrid;
        }
    }
    
    windowResized() {
        this.setupBuffers();
    }
}

// グローバル変数とp5.js関数
let fractal3d;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    fractal3d = new Fractal3D();
    
    // パフォーマンス設定
    frameRate(60);
    pixelDensity(1);
}

function draw() {
    fractal3d.update();
    fractal3d.draw();
}

function keyPressed() {
    fractal3d.keyPressed();
}

function mousePressed() {
    fractal3d.mousePressed();
}

function mouseReleased() {
    fractal3d.mouseReleased();
}

function mouseDragged() {
    fractal3d.mouseDragged();
}

function mouseWheel(event) {
    fractal3d.mouseWheel(event);
    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    fractal3d.windowResized();
}