// Fourier Series - フーリエ級数の可視化
let harmonics = 5;
let waveType = 'square';
let time = 0;
let wave = [];
let maxWaveLength = 400;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('sketchContainer');
    window.currentP5Instance = this;
}

function draw() {
    background(20);
    
    translate(200, height / 2);
    
    let x = 0;
    let y = 0;
    
    // フーリエ級数の各項を描画
    for (let i = 0; i < harmonics; i++) {
        let prevX = x;
        let prevY = y;
        
        let n = i * 2 + 1;
        let radius = 75 * (4 / (n * PI));
        
        if (waveType === 'square') {
            // 方形波: 奇数項のみ
            x += radius * cos(n * time);
            y += radius * sin(n * time);
        } else if (waveType === 'sawtooth') {
            // のこぎり波
            n = i + 1;
            radius = 75 * (2 / (n * PI)) * pow(-1, n + 1);
            x += radius * cos(n * time);
            y += radius * sin(n * time);
        } else if (waveType === 'triangle') {
            // 三角波: 奇数項のみ、符号交互
            radius = 75 * (8 / (PI * PI * n * n)) * pow(-1, (n - 1) / 2);
            x += radius * cos(n * time);
            y += radius * sin(n * time);
        }
        
        // 円を描画
        noFill();
        stroke(255, 100);
        strokeWeight(1);
        ellipse(prevX, prevY, radius * 2);
        
        // 半径線を描画
        stroke(255, 150);
        line(prevX, prevY, x, y);
        
        // 各円の中心点
        fill(255, 200, 100);
        noStroke();
        ellipse(prevX, prevY, 4);
    }
    
    // 最終点
    fill(255, 100, 100);
    noStroke();
    ellipse(x, y, 8);
    
    // 波形に点を追加
    wave.unshift(y);
    if (wave.length > maxWaveLength) {
        wave.pop();
    }
    
    // 波形を描画
    translate(150, 0);
    stroke(100, 255, 100);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < wave.length; i++) {
        vertex(i, wave[i]);
    }
    endShape();
    
    // 接続線
    stroke(255, 50);
    strokeWeight(1);
    line(x - 150, y, 0, wave[0]);
    
    // 現在の値を示す点
    fill(100, 255, 100);
    noStroke();
    ellipse(0, wave[0], 8);
    
    time += 0.03;
    
    // 情報表示
    resetMatrix();
    displayInfo();
}

function keyPressed() {
    if (key === '+' || key === '=') {
        harmonics = min(harmonics + 1, 20);
    }
    if (key === '-') {
        harmonics = max(harmonics - 1, 1);
    }
    if (key === '1') waveType = 'square';
    if (key === '2') waveType = 'sawtooth';
    if (key === '3') waveType = 'triangle';
    if (key === 'r' || key === 'R') {
        harmonics = 5;
        waveType = 'square';
        wave = [];
        time = 0;
    }
}

function mousePressed() {
    // マウスクリックで波形タイプを切り替え
    const types = ['square', 'sawtooth', 'triangle'];
    let currentIndex = types.indexOf(waveType);
    waveType = types[(currentIndex + 1) % types.length];
    wave = [];
}

function displayInfo() {
    fill(255, 200);
    textSize(14);
    text(`高調波数: ${harmonics}`, 10, 25);
    text(`波形: ${getWaveTypeName(waveType)}`, 10, 45);
    text('+/-: 高調波数調整', 10, 70);
    text('1/2/3: 波形選択', 10, 90);
    text('クリック: 波形切替', 10, 110);
    text('R: リセット', 10, 130);
}

function getWaveTypeName(type) {
    const names = {
        'square': '方形波',
        'sawtooth': 'のこぎり波',
        'triangle': '三角波'
    };
    return names[type] || type;
}