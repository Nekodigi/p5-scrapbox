// シンプルで確実に動作するリズムビジュアライザー
let audioContext;
let analyser;
let microphone;
let dataArray;
let bufferLength;
let isListening = false;

// ビジュアル設定
let visualMode = 0; // 0: circular, 1: bars, 2: waveform, 3: particles
let particles = [];
let beatThreshold = 100;
let lastBeatTime = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100);
    
    // パーティクルシステム初期化
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: random(width),
            y: random(height),
            vx: random(-2, 2),
            vy: random(-2, 2),
            size: random(2, 8),
            hue: random(360),
            life: 255
        });
    }
    
    background(0);
    showStartScreen();
}

function draw() {
    background(0, 0, 0, 50);
    
    if (isListening && analyser && dataArray) {
        // オーディオデータを取得
        analyser.getByteFrequencyData(dataArray);
        
        // ビジュアライゼーション描画
        drawVisualization();
        
        // ビート検出
        detectBeat();
    } else {
        showStartScreen();
    }
    
    drawUI();
}

function drawVisualization() {
    push();
    translate(width/2, height/2);
    
    switch(visualMode) {
        case 0:
            drawCircular();
            break;
        case 1:
            drawBars();
            break;
        case 2:
            drawWaveform();
            break;
        case 3:
            drawParticles();
            break;
    }
    
    pop();
}

function drawCircular() {
    let radius = 100;
    let angleStep = TWO_PI / bufferLength * 4; // より少ないポイントで描画
    
    for (let i = 0; i < bufferLength; i += 4) {
        let amplitude = dataArray[i];
        let angle = i * angleStep;
        
        if (amplitude > 0) {
            let x = cos(angle) * (radius + amplitude);
            let y = sin(angle) * (radius + amplitude);
            
            let hue = map(i, 0, bufferLength, 0, 360);
            let brightness = map(amplitude, 0, 255, 50, 100);
            
            fill(hue, 80, brightness);
            noStroke();
            ellipse(x, y, amplitude/10 + 2);
        }
    }
}

function drawBars() {
    let barWidth = width / 64;
    
    for (let i = 0; i < 64; i++) {
        let amplitude = dataArray[i * 4] || 0;
        let barHeight = map(amplitude, 0, 255, 0, height/2);
        
        let hue = map(i, 0, 64, 240, 0);
        let brightness = map(amplitude, 0, 255, 30, 100);
        
        fill(hue, 80, brightness);
        noStroke();
        
        // 上向きのバー
        rect(i * barWidth - width/2, -barHeight/2, barWidth-2, barHeight);
    }
}

function drawWaveform() {
    stroke(180, 80, 100);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < bufferLength; i += 8) {
        let amplitude = dataArray[i];
        let x = map(i, 0, bufferLength, -width/2, width/2);
        let y = map(amplitude, 0, 255, -100, 100);
        vertex(x, y);
    }
    endShape();
}

function drawParticles() {
    // 音量に基づいてパーティクルを更新
    let avgAmplitude = 0;
    for (let i = 0; i < bufferLength; i += 10) {
        avgAmplitude += dataArray[i];
    }
    avgAmplitude /= (bufferLength / 10);
    
    for (let particle of particles) {
        // 音量に基づいて動きを調整
        let speed = map(avgAmplitude, 0, 255, 0.5, 3);
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;
        
        // 画面外に出たら反対側から出現
        if (particle.x < -width/2) particle.x = width/2;
        if (particle.x > width/2) particle.x = -width/2;
        if (particle.y < -height/2) particle.y = height/2;
        if (particle.y > height/2) particle.y = -height/2;
        
        // 色を音量に基づいて変更
        particle.hue = map(avgAmplitude, 0, 255, 240, 0);
        
        // 描画
        fill(particle.hue, 80, 90, map(avgAmplitude, 0, 255, 50, 255));
        noStroke();
        ellipse(particle.x, particle.y, particle.size + avgAmplitude/20);
    }
}

function detectBeat() {
    // 低音域の平均を計算
    let bass = 0;
    for (let i = 0; i < 10; i++) {
        bass += dataArray[i];
    }
    bass /= 10;
    
    // ビート検出
    if (bass > beatThreshold && millis() - lastBeatTime > 300) {
        lastBeatTime = millis();
        
        // ビートエフェクト
        push();
        translate(width/2, height/2);
        fill(0, 100, 100, 150);
        noStroke();
        ellipse(0, 0, bass * 2);
        pop();
    }
}

function showStartScreen() {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Rhythm Visualizer", width/2, height/2 - 50);
    
    textSize(16);
    fill(200);
    text("Click to start microphone", width/2, height/2 + 20);
    
    fill(100, 80, 100);
    rect(width/2 - 100, height/2 + 50, 200, 50);
    fill(255);
    textSize(18);
    text("START", width/2, height/2 + 75);
}

function drawUI() {
    fill(0, 0, 0, 150);
    rect(10, 10, 250, 120);
    
    fill(255);
    textAlign(LEFT, TOP);
    textSize(16);
    text("Rhythm Visualizer", 20, 25);
    
    textSize(12);
    text(`Status: ${isListening ? 'Listening' : 'Stopped'}`, 20, 50);
    text(`Mode: ${['Circular', 'Bars', 'Waveform', 'Particles'][visualMode]}`, 20, 70);
    text("Controls:", 20, 90);
    text("SPACE: Start/Stop | V: Change mode", 20, 105);
    
    if (isListening) {
        // 音量レベル表示
        let avgLevel = 0;
        if (dataArray) {
            for (let i = 0; i < bufferLength; i += 10) {
                avgLevel += dataArray[i];
            }
            avgLevel /= (bufferLength / 10);
        }
        
        fill(120, 80, 100);
        rect(width - 120, 20, 100, 10);
        fill(0, 100, 100);
        rect(width - 120, 20, map(avgLevel, 0, 255, 0, 100), 10);
        
        fill(255);
        textAlign(RIGHT, TOP);
        textSize(10);
        text("Audio Level", width - 25, 35);
    }
}

async function startMicrophone() {
    try {
        console.log('マイクアクセスを開始...');
        
        // AudioContextを作成
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // マイクストリームを取得
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });
        
        console.log('マイクアクセス許可');
        
        // AudioContextを再開（ユーザージェスチャー後）
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        // マイクソースを作成
        microphone = audioContext.createMediaStreamSource(stream);
        
        // アナライザーを作成
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; // より小さなサイズで安定性向上
        analyser.smoothingTimeConstant = 0.8;
        
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // マイクをアナライザーに接続
        microphone.connect(analyser);
        
        isListening = true;
        console.log('音声解析開始');
        
    } catch (error) {
        console.error('マイクエラー:', error);
        alert('マイクへのアクセスが必要です。ブラウザの設定を確認してください。');
    }
}

function stopMicrophone() {
    isListening = false;
    
    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    
    console.log('音声解析停止');
}

function keyPressed() {
    if (key === ' ') {
        if (isListening) {
            stopMicrophone();
        } else {
            startMicrophone();
        }
    } else if (key === 'v' || key === 'V') {
        visualMode = (visualMode + 1) % 4;
    }
}

function mousePressed() {
    // スタートボタンクリック
    if (!isListening && 
        mouseX >= width/2 - 100 && mouseX <= width/2 + 100 &&
        mouseY >= height/2 + 50 && mouseY <= height/2 + 100) {
        startMicrophone();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}