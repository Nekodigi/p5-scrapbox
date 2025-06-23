class Terrain3D {
    constructor() {
        this.cols = 80;
        this.rows = 80;
        this.scale = 15;
        this.terrain = [];
        this.flying = 0;
        this.noiseScale = 0.02; // より大きなNoise地形に調整
        this.heightMultiplier = 500; // 高さの倍率を大幅に増加
        this.noiseSeed = random(10000); // Noiseシード
        this.colorMode = 0;
        this.wireframe = false;
        this.animate = true;
        
        // マウスベースのズーム制御用
        this.baseNoiseScale = 0.02;
        this.zoomFactor = 1.0;
        this.minZoom = 0.05; // 最小ズーム（より縮小可能）
        this.maxZoom = 8.0; // 最大ズーム（より詳細に）
        
        // 地形のサイズ計算
        this.terrainWidth = this.cols * this.scale;  // 80 * 15 = 1200
        this.terrainHeight = this.rows * this.scale; // 80 * 15 = 1200
        
        // 45度の見下ろし角度
        this.viewAngle = PI/4;
        
        // カメラ位置を地形サイズに基づいて設定
        // 地形の中心は(0,0,0)、範囲は±600 x ±600
        this.cameraX = 0;
        this.cameraY = -800;  // 地形より800px上方
        this.cameraZ = -1000; // 地形より1000px後方
        
        this.generateTerrain();
    }

    generateTerrain() {
        this.terrain = [];
        noiseSeed(this.noiseSeed); // シードを設定
        let yoff = this.flying;
        
        for (let y = 0; y < this.rows; y++) {
            let xoff = 0;
            this.terrain[y] = [];
            
            for (let x = 0; x < this.cols; x++) {
                let height = 0;
                let amplitude = 1;
                let frequency = this.noiseScale * this.zoomFactor;
                
                // Multiple octaves for detail (より多くのオクターブで詳細度向上)
                for (let i = 0; i < 8; i++) {
                    height += noise(xoff * frequency, yoff * frequency) * amplitude;
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                
                // さらに急峻な地形を作るための補正
                height = pow(height, 1.5); // より極端な高低差を作る
                
                // シンプルにNoiseの結果を使用
                
                this.terrain[y][x] = height * this.heightMultiplier;
                xoff += this.noiseScale * this.zoomFactor;
            }
            yoff += this.noiseScale * this.zoomFactor;
        }
        
        if (this.animate) {
            this.flying -= 0.003; // アニメーションを少し遅く
        }
    }

    update() {
        // マウスX座標でズーム
        this.zoomFactor = map(mouseX, 0, width, this.minZoom, this.maxZoom);
        
        this.generateTerrain();
    }

    draw() {
        // 画面中央からスタート
        translate(width/2, height/2, 0);
        
        // カメラ位置設定
        translate(this.cameraX, this.cameraY, this.cameraZ);
        
        // 45度の見下ろし角度
        rotateX(this.viewAngle);
        
        // 地形は既に中心座標で描画される（translateの調整なし）
        
        if (this.wireframe) {
            this.drawWireframe();
        } else {
            this.drawSolid();
        }
    }

    drawWireframe() {
        stroke(255);
        strokeWeight(1);
        noFill();
        
        for (let y = 0; y < this.rows - 1; y++) {
            beginShape(TRIANGLE_STRIP);
            for (let x = 0; x < this.cols; x++) {
                let height1 = this.terrain[y][x];
                let height2 = this.terrain[y + 1][x];
                
                this.setTerrainColor(height1, x, y);
                vertex((x - this.cols/2) * this.scale, (y - this.rows/2) * this.scale, -height1);
                
                this.setTerrainColor(height2, x, y + 1);
                vertex((x - this.cols/2) * this.scale, ((y + 1) - this.rows/2) * this.scale, -height2);
            }
            endShape();
        }
    }

    drawSolid() {
        // 微細なエッジを追加して立体感を強化
        strokeWeight(0.5);
        stroke(0, 0, 0, 30);
        
        for (let y = 0; y < this.rows - 1; y++) {
            beginShape(TRIANGLE_STRIP);
            for (let x = 0; x < this.cols; x++) {
                let height1 = this.terrain[y][x];
                let height2 = this.terrain[y + 1][x];
                
                this.setTerrainColor(height1, x, y);
                vertex((x - this.cols/2) * this.scale, (y - this.rows/2) * this.scale, -height1);
                
                this.setTerrainColor(height2, x, y + 1);
                vertex((x - this.cols/2) * this.scale, ((y + 1) - this.rows/2) * this.scale, -height2);
            }
            endShape();
        }
    }

    setTerrainColor(height, x, y) {
        let normalizedHeight = height / this.heightMultiplier;
        
        if (this.colorMode === 0) {
            // Natural terrain with realistic colors and lighting
            let lightFactor = map(normalizedHeight, 0, 1, 0.7, 1.1);
            
            if (normalizedHeight > 0.95) {
                // Deep ocean - 深海（低い場所）
                fill(8 * lightFactor, 25 * lightFactor, 120 * lightFactor);
            } else if (normalizedHeight > 0.85) {
                // Ocean - 海
                fill(15 * lightFactor, 50 * lightFactor, 160 * lightFactor);
            } else if (normalizedHeight > 0.82) {
                // Shallow water - 浅瀬
                fill(30 * lightFactor, 120 * lightFactor, 180 * lightFactor);
            } else if (normalizedHeight > 0.78) {
                // Beach/Sand - 砂浜
                fill(240 * lightFactor, 220 * lightFactor, 160 * lightFactor);
            } else if (normalizedHeight > 0.75) {
                // Coastal vegetation - 海岸植生
                fill(180 * lightFactor, 200 * lightFactor, 120 * lightFactor);
            } else if (normalizedHeight > 0.6) {
                // Grassland - 草原
                fill(120 * lightFactor, 180 * lightFactor, 80 * lightFactor);
            } else if (normalizedHeight > 0.4) {
                // Forest - 森林
                fill(80 * lightFactor, 140 * lightFactor, 60 * lightFactor);
            } else if (normalizedHeight > 0.25) {
                // Mountain vegetation - 山地植生
                fill(100 * lightFactor, 120 * lightFactor, 70 * lightFactor);
            } else if (normalizedHeight > 0.15) {
                // Rocky terrain - 岩場
                fill(160 * lightFactor, 150 * lightFactor, 140 * lightFactor);
            } else if (normalizedHeight > 0.05) {
                // High mountains - 高山
                fill(180 * lightFactor, 170 * lightFactor, 160 * lightFactor);
            } else {
                // Snow peaks - 雪山（高い場所）
                fill(250 * lightFactor, 250 * lightFactor, 255 * lightFactor);
            }
        } else if (this.colorMode === 1) {
            // Height gradient with blue base
            let c = map(normalizedHeight, 0, 1, 0, 255);
            if (normalizedHeight < 0.2) {
                // Water areas remain blue
                fill(30, 100, 200);
            } else {
                fill(c, c * 0.8, c * 0.6);
            }
        } else if (this.colorMode === 2) {
            // Ocean theme - 海洋テーマ
            let hue = map(normalizedHeight, 0, 1, 200, 120); // Blue to green gradient
            let saturation = map(normalizedHeight, 0, 1, 100, 60);
            let brightness = map(normalizedHeight, 0, 1, 60, 95);
            colorMode(HSB);
            fill(hue, saturation, brightness);
            colorMode(RGB);
        } else {
            // Volcanic theme - 火山テーマ
            let hue = map(normalizedHeight + sin(x * 0.1) + cos(y * 0.1), 0, 2, 0, 60);
            colorMode(HSB);
            fill(hue, 80, 90);
            colorMode(RGB);
        }
        
        if (this.wireframe) {
            stroke(200, 200, 220);
        }
    }

    keyPressed() {
        if (key === 'w' || key === 'W') {
            this.wireframe = !this.wireframe;
        } else if (key === 'c' || key === 'C') {
            this.colorMode = (this.colorMode + 1) % 4;
        } else if (key === 'a' || key === 'A') {
            this.animate = !this.animate;
        } else if (key === 'r' || key === 'R') {
            this.flying = 0;
            this.generateTerrain();
        } else if (keyCode === UP_ARROW) {
            this.cameraY -= 20;
            this.cameraY = constrain(this.cameraY, -this.terrainHeight, 0);
        } else if (keyCode === DOWN_ARROW) {
            this.cameraY += 20;
            this.cameraY = constrain(this.cameraY, -this.terrainHeight, 0);
        } else if (keyCode === LEFT_ARROW) {
            this.cameraX -= 20;
            this.cameraX = constrain(this.cameraX, -this.terrainWidth/2, this.terrainWidth/2);
        } else if (keyCode === RIGHT_ARROW) {
            this.cameraX += 20;
            this.cameraX = constrain(this.cameraX, -this.terrainWidth/2, this.terrainWidth/2);
        } else if (key === ' ') {
            // スペースキーでカメラリセット
            this.cameraX = 0;
            this.cameraY = -800;
            this.cameraZ = -1000;
        }
    }
    
    mousePressed() {
        // 左クリックで新しい地形を生成（元の機能を復活）
        this.noiseSeed = random(10000);
        this.generateTerrain();
    }
    
    // ドラッグ機能は削除（マウス位置による回転に変更）
    
    mouseWheel(event) {
        // ホイールでカメラZ位置調整
        this.cameraZ += event.delta * 20;
        this.cameraZ = constrain(this.cameraZ, -2000, -300);
        return false;
    }
    
    drawInfo() {
        // ズームレベルの表示
        push();
        resetMatrix();
        camera();
        ortho();
        fill(255);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(14);
        text(`Zoom: ${this.zoomFactor.toFixed(2)}x - Mouse X`, 10, 10);
        text(`Camera: (${this.cameraX.toFixed(0)}, ${this.cameraY.toFixed(0)}, ${this.cameraZ.toFixed(0)})`, 10, 30);
        text(`Terrain: ${this.terrainWidth}x${this.terrainHeight}, Center: (0,0,0), View: 45°`, 10, 50);
        text(`Height multiplier: ${this.heightMultiplier}`, 10, 70);
        text(`Color mode: ${['Natural', 'Height', 'Ocean', 'Volcanic'][this.colorMode]}`, 10, 90);
        text(`Controls: Mouse X: Zoom | Wheel: Z | Arrows: Move (±${this.terrainWidth/2}) | Space: Reset`, 10, 110);
        text(`W: Wireframe | C: Color | A: Animation | R: Reset | Click: New terrain`, 10, 130);
        pop();
    }
}

