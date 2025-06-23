let dragonSequence = "";
let currentGeneration = 0;
let maxGeneration = 15;
let isAnimating = false;
let animationSpeed = 5;
let drawIndex = 0;
let paths = [];
let currentPath = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    background(0);
    
    generateDragonSequence(8);
    calculatePath();
}

function draw() {
    background(0, 0, 5, 30);
    
    translate(width/2, height/2);
    
    if (isAnimating) {
        drawAnimatedDragon();
    } else {
        drawCompleteDragon();
    }
    
    // UI情報
    resetMatrix();
    fill(0, 0, 100, 80);
    textAlign(LEFT, TOP);
    textSize(12);
    text(`Generation: ${currentGeneration}`, 20, 20);
    text(`Sequence Length: ${dragonSequence.length}`, 20, 40);
    text(`Animation: ${isAnimating ? 'ON' : 'OFF'}`, 20, 60);
    
    text(`Controls:`, 20, height - 120);
    text(`UP/DOWN: Change generation`, 20, height - 100);
    text(`SPACE: Toggle animation`, 20, height - 80);
    text(`R: Reset | A: Auto-increment`, 20, height - 60);
    text(`C: Change colors`, 20, height - 40);
}

function generateDragonSequence(generation) {
    currentGeneration = generation;
    dragonSequence = "1";
    
    for (let i = 0; i < generation; i++) {
        let newSequence = dragonSequence + "1" + reverseAndComplement(dragonSequence);
        dragonSequence = newSequence;
    }
    
    calculatePath();
}

function reverseAndComplement(sequence) {
    let result = "";
    for (let i = sequence.length - 1; i >= 0; i--) {
        result += sequence[i] === "1" ? "0" : "1";
    }
    return result;
}

function calculatePath() {
    paths = [];
    currentPath = [];
    
    let x = 0, y = 0;
    let direction = 0; // 0: right, 1: down, 2: left, 3: up
    let stepSize = calculateStepSize();
    
    currentPath.push({x: x, y: y});
    
    for (let i = 0; i < dragonSequence.length; i++) {
        // 前進
        switch(direction) {
            case 0: x += stepSize; break;
            case 1: y += stepSize; break;
            case 2: x -= stepSize; break;
            case 3: y -= stepSize; break;
        }
        
        currentPath.push({x: x, y: y});
        
        // 次の方向を決定
        if (i < dragonSequence.length - 1) {
            if (dragonSequence[i] === "1") {
                direction = (direction + 1) % 4; // 右折
            } else {
                direction = (direction + 3) % 4; // 左折
            }
        }
    }
    
    paths.push(currentPath);
    drawIndex = 0;
}

function calculateStepSize() {
    // 世代に応じて適切なステップサイズを計算
    let estimatedSize = pow(2, currentGeneration / 2) * 10;
    let maxDimension = min(width, height) * 0.8;
    return max(1, maxDimension / estimatedSize);
}

function drawAnimatedDragon() {
    if (currentPath.length === 0) return;
    
    stroke(0, 0, 100, 80);
    strokeWeight(2);
    noFill();
    
    // アニメーション描画
    let segmentsPerFrame = max(1, floor(currentPath.length / 200));
    
    for (let i = 0; i < min(drawIndex, currentPath.length - 1); i++) {
        let progress = i / (currentPath.length - 1);
        let hue = (progress * 360 + frameCount * 2) % 360;
        let alpha = map(i, max(0, drawIndex - 100), drawIndex, 20, 80);
        
        stroke(hue, 70, 90, alpha);
        
        if (i < currentPath.length - 1) {
            line(currentPath[i].x, currentPath[i].y, 
                 currentPath[i + 1].x, currentPath[i + 1].y);
        }
    }
    
    // 現在の描画位置を表示
    if (drawIndex < currentPath.length) {
        fill(60, 100, 100, 100);
        noStroke();
        ellipse(currentPath[drawIndex].x, currentPath[drawIndex].y, 6);
    }
    
    drawIndex += segmentsPerFrame;
    
    if (drawIndex >= currentPath.length) {
        drawIndex = currentPath.length;
        // アニメーション完了後、少し待ってリスタート
        setTimeout(() => {
            drawIndex = 0;
        }, 2000);
    }
}

function drawCompleteDragon() {
    if (currentPath.length === 0) return;
    
    strokeWeight(1.5);
    noFill();
    
    // 完全な描画
    for (let i = 0; i < currentPath.length - 1; i++) {
        let progress = i / (currentPath.length - 1);
        let hue = (progress * 360 + frameCount * 0.5) % 360;
        let brightness = map(sin(progress * PI * 4 + frameCount * 0.1), -1, 1, 60, 100);
        
        stroke(hue, 80, brightness, 70);
        
        line(currentPath[i].x, currentPath[i].y, 
             currentPath[i + 1].x, currentPath[i + 1].y);
    }
    
    // 特別なポイントをハイライト
    if (frameCount % 60 < 30) {
        let quarterPoints = [
            floor(currentPath.length * 0.25),
            floor(currentPath.length * 0.5),
            floor(currentPath.length * 0.75)
        ];
        
        for (let pointIndex of quarterPoints) {
            if (pointIndex < currentPath.length) {
                fill(180, 80, 100, 60);
                noStroke();
                ellipse(currentPath[pointIndex].x, currentPath[pointIndex].y, 8);
            }
        }
    }
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        if (currentGeneration < maxGeneration) {
            generateDragonSequence(currentGeneration + 1);
        }
    } else if (keyCode === DOWN_ARROW) {
        if (currentGeneration > 1) {
            generateDragonSequence(currentGeneration - 1);
        }
    } else if (key === ' ') {
        isAnimating = !isAnimating;
        if (isAnimating) {
            drawIndex = 0;
        }
    } else if (key === 'r' || key === 'R') {
        generateDragonSequence(8);
        drawIndex = 0;
        isAnimating = false;
    } else if (key === 'a' || key === 'A') {
        // 自動世代増加
        let targetGeneration = min(currentGeneration + 1, maxGeneration);
        if (targetGeneration > currentGeneration) {
            generateDragonSequence(targetGeneration);
        }
    } else if (key === 'c' || key === 'C') {
        // カラーモード切り替え（将来の拡張用）
        background(0);
    } else if (key === 's' || key === 'S') {
        saveCanvas(`dragon_curve_gen_${currentGeneration}_${Date.now()}`, 'png');
    }
}

function mousePressed() {
    // マウスクリックで次の世代へ
    if (currentGeneration < maxGeneration) {
        generateDragonSequence(currentGeneration + 1);
    } else {
        generateDragonSequence(1);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculatePath();
}