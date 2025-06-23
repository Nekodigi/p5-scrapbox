// シンプルで確実に動作するオーディオスペクトラム
let mic;
let fft;
let isListening = false;
let simulationMode = true;

// 設定
let numBands = 64;
let smoothingFactor = 0.8;
let bars = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100);
    
    // バーの初期化
    initializeBars();
    
    // マイクとFFTの初期化
    setupAudio();
    
    background(0);
}

function draw() {
    background(0, 0, 0, 30);
    
    if (isListening && mic && fft) {
        updateRealAudio();
    } else {
        updateSimulation();
    }
    
    drawSpectrum();
    drawUI();
}

function setupAudio() {
    try {
        // p5.soundのマイクとFFTを作成
        mic = new p5.AudioIn();
        fft = new p5.FFT(smoothingFactor, numBands * 2);
        fft.setInput(mic);
        
        console.log('Audio components initialized');
    } catch (error) {
        console.error('Audio setup failed:', error);
        simulationMode = true;
    }
}

function initializeBars() {
    bars = [];
    for (let i = 0; i < numBands; i++) {
        bars.push({
            current: 0,
            target: 0,
            peak: 0,
            peakTime: 0,
            color: map(i, 0, numBands-1, 240, 0) // Blue to Red
        });
    }
}

function updateRealAudio() {
    if (!fft) return;
    
    let spectrum = fft.analyze();
    
    for (let i = 0; i < numBands && i < spectrum.length; i++) {
        let amplitude = spectrum[i] / 255;
        bars[i].target = amplitude * height * 0.8;
        
        // ピーク検出
        if (bars[i].target > bars[i].peak) {
            bars[i].peak = bars[i].target;
            bars[i].peakTime = millis();
        }
        
        // ピークの減衰
        if (millis() - bars[i].peakTime > 1000) {
            bars[i].peak *= 0.95;
        }
    }
    
    // スムーズなアニメーション
    for (let bar of bars) {
        bar.current = lerp(bar.current, bar.target, 0.3);
    }
}

function updateSimulation() {
    // シミュレーションモード：美しい疑似データを生成
    let time = millis() * 0.001;
    
    for (let i = 0; i < numBands; i++) {
        let frequency = map(i, 0, numBands, 0.1, 4);
        let amplitude = 0;
        
        // 複数の周波数を合成
        amplitude += sin(time * frequency) * 0.3;
        amplitude += sin(time * frequency * 2.1) * 0.2;
        amplitude += sin(time * frequency * 0.5) * 0.1;
        amplitude += noise(i * 0.1, time * 0.5) * 0.4;
        
        // 低音域を強調
        if (i < numBands * 0.3) {
            amplitude *= 1.5;
        }
        
        amplitude = max(0, amplitude);
        bars[i].target = amplitude * height * 0.6;
        
        // ピーク設定
        if (bars[i].target > bars[i].peak) {
            bars[i].peak = bars[i].target;
            bars[i].peakTime = millis();
        }
        
        // ピークの減衰
        if (millis() - bars[i].peakTime > 800) {
            bars[i].peak *= 0.98;
        }
    }
    
    // スムーズなアニメーション
    for (let bar of bars) {
        bar.current = lerp(bar.current, bar.target, 0.2);
    }
}

function drawSpectrum() {
    let barWidth = width / numBands;
    
    for (let i = 0; i < numBands; i++) {
        let x = i * barWidth;
        let barHeight = bars[i].current;
        let peakHeight = bars[i].peak;
        
        // メインバー
        let brightness = map(barHeight, 0, height*0.8, 40, 100);
        fill(bars[i].color, 80, brightness);
        noStroke();
        rect(x, height - barHeight, barWidth - 2, barHeight);
        
        // グロー効果
        fill(bars[i].color, 60, brightness, 100);
        rect(x-1, height - barHeight, barWidth, barHeight);
        
        // ピークライン
        if (peakHeight > barHeight + 5) {
            stroke(bars[i].color, 100, 100);
            strokeWeight(2);
            line(x, height - peakHeight, x + barWidth - 2, height - peakHeight);
        }
        
        // リフレクション効果
        fill(bars[i].color, 40, brightness * 0.3, 100);
        noStroke();
        rect(x, height, barWidth - 2, -barHeight * 0.3);
    }
    
    // 周波数ラベル
    drawFrequencyLabels();
}

function drawFrequencyLabels() {
    fill(0, 0, 100, 150);
    textAlign(CENTER, BOTTOM);
    textSize(10);
    
    let labels = ['Bass', 'Low Mid', 'Mid', 'High Mid', 'Treble'];
    for (let i = 0; i < labels.length; i++) {
        let x = map(i, 0, labels.length - 1, 0, width);
        text(labels[i], x, height - 5);
    }
}

function drawUI() {
    // 背景パネル
    fill(0, 0, 0, 180);
    rect(10, 10, 300, 140);
    
    // タイトル
    fill(180, 80, 100);
    textAlign(LEFT, TOP);
    textSize(18);
    text("Audio Spectrum Analyzer", 20, 25);
    
    // 状態表示
    fill(255);
    textSize(12);
    text(`Mode: ${isListening ? 'Live Audio' : 'Simulation'}`, 20, 55);
    text(`Bands: ${numBands}`, 20, 75);
    text(`Smoothing: ${smoothingFactor.toFixed(1)}`, 20, 95);
    
    // コントロール
    fill(200);
    textSize(10);
    text("Controls:", 20, 115);
    text("SPACE: Toggle Live/Simulation | Click: Start Microphone", 20, 130);
    
    // マイクレベル表示（ライブモード時）
    if (isListening && mic) {
        let level = mic.getLevel();
        
        fill(120, 80, 100);
        textAlign(RIGHT, TOP);
        textSize(12);
        text(`Mic Level: ${(level * 100).toFixed(1)}%`, width - 20, 25);
        
        // レベルメーター
        stroke(120, 80, 100);
        strokeWeight(2);
        noFill();
        rect(width - 120, 50, 100, 15);
        
        fill(120, 80, map(level, 0, 1, 50, 100));
        noStroke();
        rect(width - 120, 50, level * 100, 15);
    }
    
    // 開始ボタン（非リスニング時）
    if (!isListening) {
        fill(120, 80, 100);
        rect(width/2 - 80, height - 80, 160, 40);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(16);
        text("START MICROPHONE", width/2, height - 60);
    }
}

async function startMicrophone() {
    try {
        console.log('Starting microphone...');
        
        // p5.soundのAudioContextを開始
        await getAudioContext().resume();
        console.log('AudioContext started');
        
        // マイクを開始
        mic.start(() => {
            isListening = true;
            simulationMode = false;
            console.log('Microphone started successfully');
        }, (error) => {
            console.error('Microphone start failed:', error);
            alert('マイクへのアクセスが必要です。ブラウザの設定を確認してください。');
            simulationMode = true;
        });
        
    } catch (error) {
        console.error('Audio start failed:', error);
        alert('オーディオの開始に失敗しました: ' + error.message);
        simulationMode = true;
    }
}

function stopMicrophone() {
    if (mic && isListening) {
        mic.stop();
        isListening = false;
        simulationMode = true;
        console.log('Microphone stopped');
    }
}

function keyPressed() {
    if (key === ' ') {
        if (isListening) {
            stopMicrophone();
        } else {
            startMicrophone();
        }
    } else if (key === '+' || key === '=') {
        smoothingFactor = min(smoothingFactor + 0.1, 0.9);
        if (fft) fft.smooth(smoothingFactor);
    } else if (key === '-') {
        smoothingFactor = max(smoothingFactor - 0.1, 0.1);
        if (fft) fft.smooth(smoothingFactor);
    } else if (keyCode === UP_ARROW) {
        numBands = min(numBands * 2, 128);
        initializeBars();
        if (fft) {
            fft = new p5.FFT(smoothingFactor, numBands * 2);
            if (mic && isListening) fft.setInput(mic);
        }
    } else if (keyCode === DOWN_ARROW) {
        numBands = max(numBands / 2, 16);
        initializeBars();
        if (fft) {
            fft = new p5.FFT(smoothingFactor, numBands * 2);
            if (mic && isListening) fft.setInput(mic);
        }
    }
}

function mousePressed() {
    // スタートボタンクリック
    if (!isListening && 
        mouseX >= width/2 - 80 && mouseX <= width/2 + 80 &&
        mouseY >= height - 80 && mouseY <= height - 40) {
        startMicrophone();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}