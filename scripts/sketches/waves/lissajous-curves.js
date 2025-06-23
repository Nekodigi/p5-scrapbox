// Lissajous Curves - リサージュ曲線のアニメーション
let freqRatioX = 3;
let freqRatioY = 4;
let phaseShift = 0;
let trailPoints = [];
let maxTrailLength = 500;
let time = 0;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('sketchContainer');
    colorMode(HSB, 360, 100, 100);
    window.currentP5Instance = this;
}

function draw() {
    background(0, 10);
    
    time += 0.02;
    
    // リサージュ曲線の計算
    let centerX = width / 2;
    let centerY = height / 2;
    let amplitude = min(width, height) * 0.35;
    
    let x = centerX + amplitude * sin(freqRatioX * time + phaseShift);
    let y = centerY + amplitude * sin(freqRatioY * time);
    
    // 軌跡を記録
    trailPoints.push({x: x, y: y});
    if (trailPoints.length > maxTrailLength) {
        trailPoints.shift();
    }
    
    // 軌跡を描画
    noFill();
    strokeWeight(2);
    for (let i = 1; i < trailPoints.length; i++) {
        let alpha = map(i, 0, trailPoints.length - 1, 0, 100);
        let hue = map(i, 0, trailPoints.length - 1, 180, 300);
        stroke(hue, 80, 90, alpha);
        line(trailPoints[i-1].x, trailPoints[i-1].y, trailPoints[i].x, trailPoints[i].y);
    }
    
    // 現在の点を描画
    fill(60, 100, 100);
    noStroke();
    ellipse(x, y, 12);
    
    // 光のエフェクト
    fill(60, 100, 100, 50);
    ellipse(x, y, 24);
    
    // 中心から現在点への線
    stroke(0, 0, 100, 30);
    strokeWeight(1);
    line(centerX, centerY, x, y);
    
    // X軸、Y軸の投影
    stroke(0, 100, 100, 50);
    line(x, centerY, x, y);
    stroke(120, 100, 100, 50);
    line(centerX, y, x, y);
    
    displayInfo();
}

function mousePressed() {
    // マウスクリックで周波数比をランダムに変更
    freqRatioX = int(random(1, 8));
    freqRatioY = int(random(1, 8));
    trailPoints = [];
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        freqRatioX = 3;
        freqRatioY = 4;
        phaseShift = 0;
        trailPoints = [];
        time = 0;
    }
    if (key === ' ') {
        phaseShift += PI / 4;
        trailPoints = [];
    }
    if (keyCode === UP_ARROW) {
        freqRatioY = min(freqRatioY + 1, 10);
        trailPoints = [];
    }
    if (keyCode === DOWN_ARROW) {
        freqRatioY = max(freqRatioY - 1, 1);
        trailPoints = [];
    }
    if (keyCode === RIGHT_ARROW) {
        freqRatioX = min(freqRatioX + 1, 10);
        trailPoints = [];
    }
    if (keyCode === LEFT_ARROW) {
        freqRatioX = max(freqRatioX - 1, 1);
        trailPoints = [];
    }
}

function displayInfo() {
    colorMode(RGB, 255);
    fill(255, 200);
    textSize(14);
    text(`周波数比 X:Y = ${freqRatioX}:${freqRatioY}`, 10, 25);
    text(`位相差: ${(phaseShift / PI * 180).toFixed(0)}°`, 10, 45);
    text('クリック: ランダム周波数', 10, 70);
    text('矢印キー: 周波数調整', 10, 90);
    text('SPACE: 位相シフト', 10, 110);
    text('R: リセット', 10, 130);
}