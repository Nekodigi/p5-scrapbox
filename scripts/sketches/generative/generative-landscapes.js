// 美しいジェネラティブランドスケープ
let time = 0;
let layers = [];
let colorPalette = [];
let animationSpeed = 0.003;
let landscapeScale = 0.008;
let showMountains = true;
let showClouds = true;
let showFog = true;
let showStars = true;
let seedValue = 12345;
let autoColor = true;
let timeOfDay = 0.5; // 0=夜, 0.5=夕方, 1=昼
let stars = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    initializeLandscape();
    generateStars();
}

function draw() {
    // 時間に基づく空のグラデーション
    drawSky();
    
    // 星空（夜間のみ）
    if (showStars && timeOfDay < 0.3) {
        drawStars();
    }
    
    if (showMountains) {
        drawMountains();
    }
    
    if (showClouds) {
        drawClouds();
    }
    
    if (showFog) {
        drawFog();
    }
    
    // UI
    drawUI();
    
    // 時間を進める
    time += animationSpeed;
    
    // 自動色変化
    if (autoColor) {
        timeOfDay = (sin(time * 0.1) + 1) * 0.5;
        updateColors();
    }
}

function initializeLandscape() {
    // 色パレットを生成
    updateColors();
    
    // 山の層を初期化
    layers = [];
    for (let i = 0; i < 7; i++) {
        layers.push({
            offset: random(1000),
            scale: 0.002 + i * 0.001,
            height: 0.2 + i * 0.12,
            opacity: 20 + i * 12,
            speed: 0.3 + i * 0.2,
            detail: 3 + i
        });
    }
}

function updateColors() {
    let baseHue = 240 + timeOfDay * 60; // 青→紫→オレンジ
    let saturation = 60 + timeOfDay * 30;
    let brightness = 20 + timeOfDay * 60;
    
    colorPalette = [
        [baseHue % 360, saturation, brightness * 0.3],           // 最遠の山
        [(baseHue + 20) % 360, saturation * 0.8, brightness * 0.5], // 遠い山
        [(baseHue + 40) % 360, saturation * 0.6, brightness * 0.7], // 中間の山
        [(baseHue + 60) % 360, saturation * 0.4, brightness * 0.9], // 近い山
        [(baseHue + 80) % 360, 20, 95], // 雲
        [(baseHue + 100) % 360, 15, 90], // 霧
        [(baseHue + 180) % 360, 40, 30 + timeOfDay * 40] // 空の色
    ];
}

function drawSky() {
    // 時間に基づく空のグラデーション
    let skyHue = (240 + timeOfDay * 120) % 360;
    let topBrightness = 10 + timeOfDay * 30;
    let bottomBrightness = 30 + timeOfDay * 50;
    
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let currentBrightness = lerp(topBrightness, bottomBrightness, inter);
        let currentSat = 60 - inter * 20;
        
        stroke(skyHue, currentSat, currentBrightness);
        line(0, y, width, y);
    }
    
    // 太陽/月
    if (timeOfDay > 0.2) {
        let sunX = width * (0.7 + sin(time * 0.05) * 0.1);
        let sunY = height * (0.2 + timeOfDay * 0.3);
        
        // 太陽のグロー
        for (let r = 80; r > 0; r -= 5) {
            let alpha = map(r, 0, 80, 60, 5);
            fill(45, 80, 95, alpha);
            noStroke();
            ellipse(sunX, sunY, r);
        }
        
        // 太陽本体
        fill(50, 60, 98);
        ellipse(sunX, sunY, 30);
    }
}

function generateStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: random(width),
            y: random(height * 0.6),
            size: random(1, 3),
            brightness: random(50, 100),
            twinkle: random(TWO_PI)
        });
    }
}

function drawStars() {
    for (let star of stars) {
        let twinkle = sin(time * 2 + star.twinkle) * 0.3 + 0.7;
        let alpha = star.brightness * twinkle * (0.3 - timeOfDay) / 0.3;
        
        if (alpha > 0) {
            fill(50, 30, 100, alpha);
            noStroke();
            ellipse(star.x, star.y, star.size * twinkle);
        }
    }
}

function drawMountains() {
    // 複数の山の層を描画
    for (let i = layers.length - 1; i >= 0; i--) {
        let layer = layers[i];
        let paletteIndex = Math.min(i, colorPalette.length - 3);
        
        // 山のシルエットを生成
        noStroke();
        fill(colorPalette[paletteIndex][0], 
             colorPalette[paletteIndex][1], 
             colorPalette[paletteIndex][2], 
             layer.opacity);
        
        beginShape();
        vertex(0, height);
        
        // ノイズを使って山の形を生成
        for (let x = 0; x <= width; x += 3) {
            let noiseValue = 0;
            let amplitude = 1;
            let frequency = layer.scale;
            
            // 複数のオクターブを重ねて複雑な形状を作成
            for (let octave = 0; octave < layer.detail; octave++) {
                noiseValue += noise(
                    x * frequency, 
                    time * layer.speed + layer.offset,
                    seedValue * 0.001 + octave
                ) * amplitude;
                amplitude *= 0.5;
                frequency *= 2;
            }
            
            let mountainHeight = noiseValue * height * layer.height;
            let y = height - mountainHeight;
            
            vertex(x, y);
        }
        
        vertex(width, height);
        endShape(CLOSE);
        
        // 山の稜線にグロー効果
        if (i < 4) {
            stroke(colorPalette[paletteIndex][0], 
                   colorPalette[paletteIndex][1], 
                   colorPalette[paletteIndex][2] + 30, 
                   layer.opacity * 0.6);
            strokeWeight(1 + i * 0.5);
            noFill();
            
            beginShape();
            for (let x = 0; x <= width; x += 8) {
                let noiseValue = 0;
                let amplitude = 1;
                let frequency = layer.scale;
                
                for (let octave = 0; octave < layer.detail; octave++) {
                    noiseValue += noise(
                        x * frequency, 
                        time * layer.speed + layer.offset,
                        seedValue * 0.001 + octave
                    ) * amplitude;
                    amplitude *= 0.5;
                    frequency *= 2;
                }
                
                let mountainHeight = noiseValue * height * layer.height;
                let y = height - mountainHeight;
                
                vertex(x, y);
            }
            endShape();
        }
    }
}

function drawClouds() {
    // 雲を描画
    for (let cloudLayer = 0; cloudLayer < 3; cloudLayer++) {
        let cloudY = height * (0.15 + cloudLayer * 0.12);
        let cloudSpeed = 0.4 + cloudLayer * 0.2;
        let cloudScale = 0.008 + cloudLayer * 0.003;
        
        for (let x = -100; x < width + 100; x += 40) {
            let cloudNoise = noise(
                x * cloudScale + time * cloudSpeed,
                cloudY * 0.003,
                seedValue * 0.002 + cloudLayer
            );
            
            if (cloudNoise > 0.35) {
                let cloudSize = map(cloudNoise, 0.35, 1, 30, 100);
                let cloudOpacity = map(cloudNoise, 0.35, 1, 20, 50);
                
                // 雲のグラデーション
                for (let r = cloudSize; r > 0; r -= 8) {
                    let alpha = map(r, 0, cloudSize, cloudOpacity, 3);
                    fill(colorPalette[4][0], colorPalette[4][1], colorPalette[4][2], alpha);
                    noStroke();
                    
                    let offsetX = noise(time * 0.3 + x * 0.01) * 15 - 7.5;
                    let offsetY = noise(time * 0.2 + cloudY * 0.01 + 100) * 8 - 4;
                    
                    ellipse(x + offsetX, cloudY + offsetY, r, r * 0.7);
                }
            }
        }
    }
}

function drawFog() {
    // 霧を描画
    for (let fogLayer = 0; fogLayer < 5; fogLayer++) {
        let fogY = height * (0.7 + fogLayer * 0.06);
        let fogSpeed = 0.1 + fogLayer * 0.05;
        let fogScale = 0.02 + fogLayer * 0.008;
        
        stroke(colorPalette[5][0], colorPalette[5][1], colorPalette[5][2], 25);
        strokeWeight(15 + fogLayer * 3);
        
        for (let x = 0; x < width; x += 10) {
            let fogNoise = noise(
                x * fogScale + time * fogSpeed,
                fogY * 0.01,
                seedValue * 0.003 + fogLayer
            );
            
            if (fogNoise > 0.25) {
                let fogHeight = map(fogNoise, 0.25, 1, 5, 30);
                let offsetY = sin(time * 1.5 + x * 0.015) * 3;
                
                line(x, fogY + offsetY, x, fogY + offsetY + fogHeight);
            }
        }
    }
}

function drawUI() {
    // 半透明の背景パネル
    fill(0, 0, 0, 40);
    stroke(255, 255, 255, 30);
    strokeWeight(1);
    rect(15, 15, 320, 160);
    
    // タイトル
    fill(50, 70, 95);
    textAlign(LEFT, TOP);
    textSize(18);
    textStyle(BOLD);
    text("Generative Landscapes", 25, 30);
    
    // 状態表示
    fill(200, 50, 90);
    textSize(12);
    textStyle(NORMAL);
    text("Time of Day: " + (timeOfDay * 100).toFixed(0) + "%", 25, 55);
    text("Animation: " + (animationSpeed > 0 ? "ON" : "OFF"), 25, 75);
    
    // 表示要素
    fill(180, 40, 85);
    text("Mountains: " + (showMountains ? "ON" : "OFF"), 25, 95);
    text("Clouds: " + (showClouds ? "ON" : "OFF"), 25, 115);
    text("Fog: " + (showFog ? "ON" : "OFF"), 25, 135);
    text("Auto Color: " + (autoColor ? "ON" : "OFF"), 25, 155);
    
    // 操作説明
    fill(160, 30, 95);
    textAlign(LEFT, BOTTOM);
    textSize(11);
    text("Controls: SPACE=pause | M=mountains | C=clouds | F=fog | S=stars | A=auto | ↑↓=time | R=reset", 25, height - 25);
}

function mousePressed() {
    // マウスクリックで新しい風景を生成
    seedValue = random(10000);
    noiseSeed(seedValue);
    initializeLandscape();
    generateStars();
    time = 0;
}

function keyPressed() {
    if (key === ' ') {
        // アニメーション一時停止/再開
        animationSpeed = animationSpeed > 0 ? 0 : 0.003;
    } else if (key === 'r' || key === 'R') {
        // リセット
        time = 0;
        timeOfDay = 0.5;
        seedValue = random(10000);
        noiseSeed(seedValue);
        initializeLandscape();
        generateStars();
    } else if (key === 'm' || key === 'M') {
        // 山の表示切替
        showMountains = !showMountains;
    } else if (key === 'c' || key === 'C') {
        // 雲の表示切替
        showClouds = !showClouds;
    } else if (key === 'f' || key === 'F') {
        // 霧の表示切替
        showFog = !showFog;
    } else if (key === 's' || key === 'S') {
        // 星の表示切替
        showStars = !showStars;
    } else if (key === 'a' || key === 'A') {
        // 自動色変化切替
        autoColor = !autoColor;
    } else if (keyCode === UP_ARROW) {
        // 時間を進める（昼に向かう）
        timeOfDay = min(timeOfDay + 0.1, 1);
        if (!autoColor) updateColors();
    } else if (keyCode === DOWN_ARROW) {
        // 時間を戻す（夜に向かう）
        timeOfDay = max(timeOfDay - 0.1, 0);
        if (!autoColor) updateColors();
    } else if (keyCode === LEFT_ARROW) {
        // アニメーション速度を下げる
        animationSpeed = max(animationSpeed - 0.001, 0);
    } else if (keyCode === RIGHT_ARROW) {
        // アニメーション速度を上げる
        animationSpeed = min(animationSpeed + 0.001, 0.01);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    generateStars();
    initializeLandscape();
}