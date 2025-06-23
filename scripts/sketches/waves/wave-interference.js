// Wave Interference - 波の干渉パターン
let waveSpeed = 0.05;
let waveLength = 50;
let sources = [];
let gridSize = 5;
let time = 0;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('sketchContainer');
    
    // 初期波源を配置
    sources.push({x: width * 0.3, y: height * 0.5});
    sources.push({x: width * 0.7, y: height * 0.5});
    
    window.currentP5Instance = this;
}

function draw() {
    background(0);
    
    time += waveSpeed;
    
    // グリッド上の各点で波の干渉を計算
    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            let amplitude = 0;
            
            // 各波源からの波を合成
            for (let source of sources) {
                let distance = dist(x, y, source.x, source.y);
                let wave = sin((distance / waveLength - time) * TWO_PI);
                amplitude += wave;
            }
            
            // 振幅を色に変換
            amplitude = amplitude / sources.length;
            let brightness = map(amplitude, -1, 1, 0, 255);
            
            // ピクセルを描画
            noStroke();
            fill(brightness, brightness * 0.7, brightness * 0.8);
            rect(x, y, gridSize, gridSize);
        }
    }
    
    // 波源を描画
    for (let source of sources) {
        // 波紋エフェクト
        noFill();
        strokeWeight(2);
        for (let r = 0; r < 5; r++) {
            let radius = (time * waveLength + r * 20) % 200;
            let alpha = map(radius, 0, 200, 255, 0);
            stroke(255, 200, 100, alpha);
            ellipse(source.x, source.y, radius * 2);
        }
        
        // 波源本体
        fill(255, 200, 100);
        noStroke();
        ellipse(source.x, source.y, 20);
    }
    
    displayInfo();
}

function mousePressed() {
    // マウスクリックで波源を追加
    if (sources.length < 5) {
        sources.push({x: mouseX, y: mouseY});
    }
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        sources = [];
        sources.push({x: width * 0.3, y: height * 0.5});
        sources.push({x: width * 0.7, y: height * 0.5});
        time = 0;
    }
    if (key === 'c' || key === 'C') {
        sources = [];
    }
    if (key === '+' || key === '=') {
        waveLength = min(waveLength + 5, 100);
    }
    if (key === '-') {
        waveLength = max(waveLength - 5, 20);
    }
}

function displayInfo() {
    fill(255, 200);
    textSize(14);
    text(`波源: ${sources.length}個`, 10, 25);
    text(`波長: ${waveLength}`, 10, 45);
    text(`波速: ${(waveSpeed * 60).toFixed(1)}`, 10, 65);
    text('クリック: 波源追加', 10, 90);
    text('+/-: 波長調整', 10, 110);
    text('R: リセット, C: クリア', 10, 130);
}