let gameState = 'menu'; // menu, playing, result
let targetColor;
let userColor;
let score = 0;
let round = 1;
let maxRounds = 10;
let timeLeft = 30;
let gameTimer;
let difficulty = 'medium';
let colorHistory = [];
let bestScore = parseInt(localStorage.getItem('color-matching-best') || '0');

let sliders = {
    red: 128,
    green: 128,
    blue: 128
};

let difficultySettings = {
    easy: { time: 45, tolerance: 30 },
    medium: { time: 30, tolerance: 20 },
    hard: { time: 20, tolerance: 10 }
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(RGB, 255);
    
    generateTargetColor();
    resetUserColor();
}

function draw() {
    background(20);
    
    switch (gameState) {
        case 'menu':
            drawMenu();
            break;
        case 'playing':
            drawGame();
            break;
        case 'result':
            drawResult();
            break;
    }
}

function drawMenu() {
    textAlign(CENTER, CENTER);
    
    // タイトル
    fill(255);
    textSize(48);
    text("Color Matching Game", width/2, height/4);
    
    textSize(24);
    fill(200);
    text("目標の色と同じ色を作ってみましょう！", width/2, height/3);
    
    // 難易度選択
    textSize(20);
    fill(255);
    text("難易度を選択:", width/2, height/2 - 60);
    
    let buttonY = height/2;
    let buttonW = 120;
    let buttonH = 40;
    
    // Easy button
    fill(difficulty === 'easy' ? 100 : 60);
    rect(width/2 - 180, buttonY, buttonW, buttonH);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Easy", width/2 - 120, buttonY + 20);
    
    // Medium button
    fill(difficulty === 'medium' ? 100 : 60);
    rect(width/2 - 60, buttonY, buttonW, buttonH);
    fill(255);
    text("Medium", width/2, buttonY + 20);
    
    // Hard button
    fill(difficulty === 'hard' ? 100 : 60);
    rect(width/2 + 60, buttonY, buttonW, buttonH);
    fill(255);
    text("Hard", width/2 + 120, buttonY + 20);
    
    // スタートボタン
    fill(0, 200, 0);
    rect(width/2 - 75, height/2 + 80, 150, 50);
    fill(255);
    textSize(24);
    text("START", width/2, height/2 + 105);
    
    // ベストスコア
    textSize(18);
    fill(255, 255, 0);
    text(`Best Score: ${bestScore}`, width/2, height - 100);
    
    // ルール説明
    textSize(16);
    fill(180);
    textAlign(CENTER, TOP);
    text("RGBスライダーを使って目標色に近い色を作成してください", width/2, height - 80);
    text("色が近いほど高得点！制限時間内にできるだけ多くの色を作りましょう", width/2, height - 60);
}

function drawGame() {
    // 背景
    background(30);
    
    // ヘッダー情報
    drawGameHeader();
    
    // メイン色表示エリア
    drawColorAreas();
    
    // スライダー
    drawSliders();
    
    // 提出ボタン
    drawSubmitButton();
    
    // 時間管理
    updateTimer();
}

function drawGameHeader() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(20);
    text(`Round: ${round}/${maxRounds}`, 30, 30);
    text(`Score: ${score}`, 30, 60);
    
    textAlign(RIGHT, TOP);
    fill(timeLeft < 10 ? color(255, 0, 0) : color(255));
    text(`Time: ${timeLeft}s`, width - 30, 30);
    text(`Difficulty: ${difficulty}`, width - 30, 60);
}

function drawColorAreas() {
    let colorSize = 200;
    let centerY = height/2 - 50;
    
    // 目標色
    fill(targetColor.r, targetColor.g, targetColor.b);
    rect(width/2 - colorSize - 20, centerY - colorSize/2, colorSize, colorSize);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Target Color", width/2 - colorSize/2 - 20, centerY + colorSize/2 + 30);
    
    // ユーザー色
    fill(sliders.red, sliders.green, sliders.blue);
    rect(width/2 + 20, centerY - colorSize/2, colorSize, colorSize);
    
    fill(255);
    text("Your Color", width/2 + colorSize/2 + 20, centerY + colorSize/2 + 30);
    
    // RGB値表示
    textSize(14);
    textAlign(LEFT, TOP);
    
    // Target RGB
    fill(255);
    let targetX = width/2 - colorSize - 20;
    let targetTextY = centerY + colorSize/2 + 50;
    text(`Target RGB:`, targetX, targetTextY);
    fill(255, 100, 100);
    text(`R: ${targetColor.r}`, targetX, targetTextY + 20);
    fill(100, 255, 100);
    text(`G: ${targetColor.g}`, targetX + 60, targetTextY + 20);
    fill(100, 100, 255);
    text(`B: ${targetColor.b}`, targetX + 120, targetTextY + 20);
    
    // User RGB
    fill(255);
    let userX = width/2 + 20;
    text(`Your RGB:`, userX, targetTextY);
    fill(255, 100, 100);
    text(`R: ${sliders.red}`, userX, targetTextY + 20);
    fill(100, 255, 100);
    text(`G: ${sliders.green}`, userX + 60, targetTextY + 20);
    fill(100, 100, 255);
    text(`B: ${sliders.blue}`, userX + 120, targetTextY + 20);
}

function drawSliders() {
    let sliderY = height - 200;
    let sliderW = 300;
    let sliderH = 20;
    let sliderSpacing = 40;
    
    textAlign(CENTER, TOP);
    textSize(16);
    
    // Red slider
    fill(255, 100, 100);
    text("Red", width/2, sliderY - 25);
    drawSlider(width/2 - sliderW/2, sliderY, sliderW, sliderH, sliders.red, 255, color(255, 0, 0));
    
    // Green slider
    fill(100, 255, 100);
    text("Green", width/2, sliderY + sliderSpacing - 25);
    drawSlider(width/2 - sliderW/2, sliderY + sliderSpacing, sliderW, sliderH, sliders.green, 255, color(0, 255, 0));
    
    // Blue slider
    fill(100, 100, 255);
    text("Blue", width/2, sliderY + sliderSpacing * 2 - 25);
    drawSlider(width/2 - sliderW/2, sliderY + sliderSpacing * 2, sliderW, sliderH, sliders.blue, 255, color(0, 0, 255));
}

function drawSlider(x, y, w, h, value, maxValue, sliderColor) {
    // スライダー背景
    fill(80);
    rect(x, y, w, h);
    
    // スライダー値部分
    fill(sliderColor);
    rect(x, y, (value / maxValue) * w, h);
    
    // スライダーハンドル
    fill(255);
    let handleX = x + (value / maxValue) * w;
    ellipse(handleX, y + h/2, h + 5);
    
    // 値表示
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(value, handleX, y + h/2);
}

function drawSubmitButton() {
    let buttonW = 150;
    let buttonH = 50;
    let buttonX = width/2 - buttonW/2;
    let buttonY = height - 80;
    
    fill(0, 150, 255);
    rect(buttonX, buttonY, buttonW, buttonH);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Submit", buttonX + buttonW/2, buttonY + buttonH/2);
}

function updateTimer() {
    if (frameCount % 60 === 0 && timeLeft > 0) {
        timeLeft--;
        
        if (timeLeft === 0) {
            endGame();
        }
    }
}

function drawResult() {
    textAlign(CENTER, CENTER);
    
    // 背景
    background(40);
    
    // タイトル
    fill(255, 255, 0);
    textSize(48);
    text("Game Over!", width/2, height/4);
    
    // スコア表示
    fill(255);
    textSize(32);
    text(`Final Score: ${score}`, width/2, height/3);
    
    // ベストスコア更新チェック
    if (score > bestScore) {
        fill(255, 215, 0);
        textSize(24);
        text("🎉 NEW BEST SCORE! 🎉", width/2, height/3 + 50);
        bestScore = score;
        localStorage.setItem('color-matching-best', bestScore.toString());
    }
    
    // 統計
    textSize(18);
    fill(200);
    text(`Rounds Completed: ${round - 1}/${maxRounds}`, width/2, height/2);
    text(`Average Score per Round: ${round > 1 ? (score / (round - 1)).toFixed(1) : '0'}`, width/2, height/2 + 30);
    
    // カラーヒストリー表示
    if (colorHistory.length > 0) {
        textSize(16);
        text("Your color attempts:", width/2, height/2 + 80);
        
        let historyY = height/2 + 110;
        let colorSize = 30;
        let spacing = 40;
        let startX = width/2 - (colorHistory.length * spacing) / 2;
        
        for (let i = 0; i < min(colorHistory.length, 10); i++) {
            let attempt = colorHistory[i];
            
            // 目標色
            fill(attempt.target.r, attempt.target.g, attempt.target.b);
            rect(startX + i * spacing, historyY, colorSize, colorSize/2);
            
            // ユーザー色
            fill(attempt.user.r, attempt.user.g, attempt.user.b);
            rect(startX + i * spacing, historyY + colorSize/2, colorSize, colorSize/2);
            
            // スコア表示
            fill(255);
            textSize(10);
            text(attempt.roundScore, startX + i * spacing + colorSize/2, historyY + colorSize + 15);
        }
    }
    
    // ボタン
    drawMenuButton();
    drawPlayAgainButton();
}

function drawMenuButton() {
    let buttonW = 120;
    let buttonH = 40;
    let buttonX = width/2 - 70;
    let buttonY = height - 120;
    
    fill(100);
    rect(buttonX, buttonY, buttonW, buttonH);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Menu", buttonX + buttonW/2, buttonY + buttonH/2);
}

function drawPlayAgainButton() {
    let buttonW = 120;
    let buttonH = 40;
    let buttonX = width/2 + 50;
    let buttonY = height - 120;
    
    fill(0, 150, 0);
    rect(buttonX, buttonY, buttonW, buttonH);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Play Again", buttonX + buttonW/2, buttonY + buttonH/2);
}

function generateTargetColor() {
    targetColor = {
        r: floor(random(256)),
        g: floor(random(256)),
        b: floor(random(256))
    };
}

function resetUserColor() {
    sliders.red = 128;
    sliders.green = 128;
    sliders.blue = 128;
}

function startGame() {
    gameState = 'playing';
    score = 0;
    round = 1;
    timeLeft = difficultySettings[difficulty].time;
    colorHistory = [];
    generateTargetColor();
    resetUserColor();
}

function submitColor() {
    if (gameState !== 'playing') return;
    
    // 色の差を計算
    let rDiff = abs(targetColor.r - sliders.red);
    let gDiff = abs(targetColor.g - sliders.green);
    let bDiff = abs(targetColor.b - sliders.blue);
    let totalDiff = rDiff + gDiff + bDiff;
    
    // スコア計算（差が小さいほど高得点）
    let maxDiff = 255 * 3;
    let roundScore = Math.max(0, Math.round((1 - totalDiff / maxDiff) * 100));
    
    // ボーナスポイント
    if (totalDiff < difficultySettings[difficulty].tolerance) {
        roundScore += 50; // Perfect bonus
    }
    
    score += roundScore;
    
    // 履歴に記録
    colorHistory.push({
        target: {r: targetColor.r, g: targetColor.g, b: targetColor.b},
        user: {r: sliders.red, g: sliders.green, b: sliders.blue},
        roundScore: roundScore
    });
    
    round++;
    
    if (round > maxRounds) {
        endGame();
    } else {
        generateTargetColor();
        resetUserColor();
    }
}

function endGame() {
    gameState = 'result';
}

function mousePressed() {
    if (gameState === 'menu') {
        // 難易度ボタン
        let buttonY = height/2;
        let buttonW = 120;
        let buttonH = 40;
        
        if (mouseY >= buttonY && mouseY <= buttonY + buttonH) {
            if (mouseX >= width/2 - 180 && mouseX <= width/2 - 60) {
                difficulty = 'easy';
            } else if (mouseX >= width/2 - 60 && mouseX <= width/2 + 60) {
                difficulty = 'medium';
            } else if (mouseX >= width/2 + 60 && mouseX <= width/2 + 180) {
                difficulty = 'hard';
            }
        }
        
        // スタートボタン
        if (mouseX >= width/2 - 75 && mouseX <= width/2 + 75 &&
            mouseY >= height/2 + 80 && mouseY <= height/2 + 130) {
            startGame();
        }
    } else if (gameState === 'playing') {
        // 提出ボタン
        let buttonW = 150;
        let buttonH = 50;
        let buttonX = width/2 - buttonW/2;
        let buttonY = height - 80;
        
        if (mouseX >= buttonX && mouseX <= buttonX + buttonW &&
            mouseY >= buttonY && mouseY <= buttonY + buttonH) {
            submitColor();
        }
    } else if (gameState === 'result') {
        // メニューボタン
        if (mouseX >= width/2 - 70 && mouseX <= width/2 + 50 &&
            mouseY >= height - 120 && mouseY <= height - 80) {
            gameState = 'menu';
        }
        
        // プレイアゲインボタン
        if (mouseX >= width/2 + 50 && mouseX <= width/2 + 170 &&
            mouseY >= height - 120 && mouseY <= height - 80) {
            startGame();
        }
    }
}

function mouseDragged() {
    if (gameState === 'playing') {
        updateSliders();
    }
}

function updateSliders() {
    let sliderY = height - 200;
    let sliderW = 300;
    let sliderH = 20;
    let sliderSpacing = 40;
    let sliderX = width/2 - sliderW/2;
    
    // Red slider
    if (mouseY >= sliderY && mouseY <= sliderY + sliderH &&
        mouseX >= sliderX && mouseX <= sliderX + sliderW) {
        sliders.red = Math.round(map(mouseX, sliderX, sliderX + sliderW, 0, 255));
        sliders.red = constrain(sliders.red, 0, 255);
    }
    
    // Green slider
    if (mouseY >= sliderY + sliderSpacing && mouseY <= sliderY + sliderSpacing + sliderH &&
        mouseX >= sliderX && mouseX <= sliderX + sliderW) {
        sliders.green = Math.round(map(mouseX, sliderX, sliderX + sliderW, 0, 255));
        sliders.green = constrain(sliders.green, 0, 255);
    }
    
    // Blue slider
    if (mouseY >= sliderY + sliderSpacing * 2 && mouseY <= sliderY + sliderSpacing * 2 + sliderH &&
        mouseX >= sliderX && mouseX <= sliderX + sliderW) {
        sliders.blue = Math.round(map(mouseX, sliderX, sliderX + sliderW, 0, 255));
        sliders.blue = constrain(sliders.blue, 0, 255);
    }
}

function keyPressed() {
    if (gameState === 'playing') {
        if (key === ' ' || keyCode === ENTER) {
            submitColor();
        }
    } else if (gameState === 'result' || gameState === 'menu') {
        if (key === ' ') {
            if (gameState === 'menu') {
                startGame();
            } else {
                startGame();
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}