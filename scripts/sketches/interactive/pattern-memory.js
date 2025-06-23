let gameState = 'menu'; // menu, showing, waiting, playing, result
let pattern = [];
let userInput = [];
let currentLevel = 1;
let score = 0;
let showingIndex = 0;
let isShowing = false;
let lastShowTime = 0;
let showDuration = 800;
let pauseDuration = 200;
let gameMode = 'classic';
let bestScore = parseInt(localStorage.getItem('pattern-memory-best') || '0');

let grid = {
    cols: 3,
    rows: 3,
    size: 80,
    spacing: 10
};

let colors = [
    {r: 255, g: 100, b: 100}, // Red
    {r: 100, g: 255, b: 100}, // Green  
    {r: 100, g: 100, b: 255}, // Blue
    {r: 255, g: 255, b: 100}, // Yellow
    {r: 255, g: 100, b: 255}, // Magenta
    {r: 100, g: 255, b: 255}, // Cyan
    {r: 255, g: 200, b: 100}, // Orange
    {r: 200, g: 100, b: 255}, // Purple
    {r: 150, g: 255, b: 150}  // Light Green
];

let feedback = {
    show: false,
    message: '',
    color: {r: 255, g: 255, b: 255},
    timer: 0
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // グリッドサイズを画面に合わせて調整
    let maxGridWidth = min(width * 0.6, height * 0.6);
    grid.size = floor((maxGridWidth - (grid.cols - 1) * grid.spacing) / grid.cols);
    grid.size = max(grid.size, 40); // 最小サイズ
}

function draw() {
    background(20);
    
    switch (gameState) {
        case 'menu':
            drawMenu();
            break;
        case 'showing':
            drawGame();
            handlePatternShowing();
            break;
        case 'waiting':
            drawGame();
            drawWaitingMessage();
            break;
        case 'playing':
            drawGame();
            break;
        case 'result':
            drawResult();
            break;
    }
    
    drawFeedback();
}

function drawMenu() {
    textAlign(CENTER, CENTER);
    
    // タイトル
    fill(255);
    textSize(48);
    text("Pattern Memory", width/2, height/4);
    
    textSize(20);
    fill(200);
    text("パターンを記憶して順番通りにクリックしよう！", width/2, height/3);
    
    // ゲームモード選択
    textSize(18);
    fill(255);
    text("ゲームモード:", width/2, height/2 - 60);
    
    let buttonY = height/2 - 20;
    let buttonW = 120;
    let buttonH = 40;
    
    // Classic mode
    fill(gameMode === 'classic' ? 80 : 50);
    rect(width/2 - 130, buttonY, buttonW, buttonH);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Classic", width/2 - 70, buttonY + 20);
    
    // Speed mode
    fill(gameMode === 'speed' ? 80 : 50);
    rect(width/2 - 10, buttonY, buttonW, buttonH);
    fill(255);
    text("Speed", width/2 + 50, buttonY + 20);
    
    // スタートボタン
    fill(0, 200, 0);
    rect(width/2 - 75, height/2 + 40, 150, 50);
    fill(255);
    textSize(24);
    text("START", width/2, height/2 + 65);
    
    // ベストスコア
    textSize(18);
    fill(255, 255, 0);
    text(`Best Score: ${bestScore}`, width/2, height - 120);
    
    // ルール説明
    textSize(14);
    fill(180);
    textAlign(CENTER, TOP);
    text("光るパターンを覚えて、同じ順番でタイルをクリックしてください", width/2, height - 100);
    text("レベルが上がるとパターンが長くなります", width/2, height - 80);
    text("Classic: 普通の速度 | Speed: 高速モード", width/2, height - 60);
}

function drawGame() {
    // ヘッダー情報
    fill(255);
    textAlign(LEFT, TOP);
    textSize(20);
    text(`Level: ${currentLevel}`, 30, 30);
    text(`Score: ${score}`, 30, 60);
    text(`Mode: ${gameMode}`, 30, 90);
    
    textAlign(RIGHT, TOP);
    text(`Pattern Length: ${pattern.length}`, width - 30, 30);
    text(`Progress: ${userInput.length}/${pattern.length}`, width - 30, 60);
    
    // グリッドを描画
    drawGrid();
    
    // 状態表示
    textAlign(CENTER, TOP);
    textSize(18);
    
    if (gameState === 'showing') {
        fill(255, 255, 0);
        text("パターンを覚えてください...", width/2, 120);
    } else if (gameState === 'waiting') {
        fill(100, 255, 100);
        text("準備はいいですか？", width/2, 120);
    } else if (gameState === 'playing') {
        fill(100, 200, 255);
        text("パターンを再現してください", width/2, 120);
    }
}

function drawGrid() {
    let totalWidth = grid.cols * grid.size + (grid.cols - 1) * grid.spacing;
    let totalHeight = grid.rows * grid.size + (grid.rows - 1) * grid.spacing;
    let startX = (width - totalWidth) / 2;
    let startY = (height - totalHeight) / 2;
    
    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            let x = startX + col * (grid.size + grid.spacing);
            let y = startY + row * (grid.size + grid.spacing);
            let index = row * grid.cols + col;
            
            // タイルの状態に応じて色を決定
            let tileColor = getTileColor(index);
            
            fill(tileColor.r, tileColor.g, tileColor.b);
            stroke(255, 150);
            strokeWeight(2);
            rect(x, y, grid.size, grid.size, 10);
            
            // タイル番号（デバッグ用、通常は非表示）
            if (keyIsDown(68)) { // D key for debug
                fill(255);
                textAlign(CENTER, CENTER);
                textSize(12);
                text(index, x + grid.size/2, y + grid.size/2);
            }
        }
    }
}

function getTileColor(index) {
    let baseColor = {r: 60, g: 60, b: 60}; // デフォルト色
    
    // パターン表示中
    if (gameState === 'showing' && isShowing) {
        if (showingIndex < pattern.length && pattern[showingIndex] === index) {
            return colors[index % colors.length];
        }
    }
    
    // ユーザー入力中のハイライト
    if (gameState === 'playing') {
        if (userInput.includes(index)) {
            let inputIndex = userInput.indexOf(index);
            let alpha = map(inputIndex, 0, userInput.length, 150, 50);
            let color = colors[index % colors.length];
            return {
                r: color.r * (alpha / 255),
                g: color.g * (alpha / 255),
                b: color.b * (alpha / 255)
            };
        }
        
        // ホバー効果
        let tilePos = getTilePosition(index);
        if (mouseX >= tilePos.x && mouseX <= tilePos.x + grid.size &&
            mouseY >= tilePos.y && mouseY <= tilePos.y + grid.size) {
            return {r: 100, g: 100, b: 100};
        }
    }
    
    return baseColor;
}

function getTilePosition(index) {
    let row = floor(index / grid.cols);
    let col = index % grid.cols;
    let totalWidth = grid.cols * grid.size + (grid.cols - 1) * grid.spacing;
    let totalHeight = grid.rows * grid.size + (grid.rows - 1) * grid.spacing;
    let startX = (width - totalWidth) / 2;
    let startY = (height - totalHeight) / 2;
    
    return {
        x: startX + col * (grid.size + grid.spacing),
        y: startY + row * (grid.size + grid.spacing)
    };
}

function drawWaitingMessage() {
    textAlign(CENTER, CENTER);
    fill(255, 255, 100);
    textSize(24);
    text("クリックして開始", width/2, height - 100);
}

function handlePatternShowing() {
    if (millis() - lastShowTime > (isShowing ? showDuration : pauseDuration)) {
        isShowing = !isShowing;
        lastShowTime = millis();
        
        if (isShowing) {
            // 次のパターンを表示
            if (showingIndex >= pattern.length) {
                // パターン表示完了
                gameState = 'waiting';
                showingIndex = 0;
                isShowing = false;
            }
        } else {
            // 次のインデックスに進む
            showingIndex++;
        }
    }
}

function drawResult() {
    textAlign(CENTER, CENTER);
    
    // 背景
    background(30);
    
    if (score > bestScore) {
        // 新記録
        fill(255, 215, 0);
        textSize(48);
        text("🎉 NEW RECORD! 🎉", width/2, height/4);
        
        fill(255, 255, 0);
        textSize(32);
        text(`Level ${currentLevel} Reached!`, width/2, height/3);
        
        bestScore = score;
        localStorage.setItem('pattern-memory-best', bestScore.toString());
    } else {
        // 通常のゲームオーバー
        fill(255, 100, 100);
        textSize(48);
        text("Game Over", width/2, height/4);
        
        fill(255);
        textSize(32);
        text(`Level ${currentLevel} Reached`, width/2, height/3);
    }
    
    // スコア表示
    fill(255);
    textSize(24);
    text(`Score: ${score}`, width/2, height/2 - 20);
    text(`Best: ${bestScore}`, width/2, height/2 + 20);
    
    // 統計
    textSize(18);
    fill(200);
    text(`Patterns Memorized: ${score}`, width/2, height/2 + 60);
    text(`Mode: ${gameMode}`, width/2, height/2 + 85);
    
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

function drawFeedback() {
    if (feedback.show && feedback.timer > 0) {
        textAlign(CENTER, CENTER);
        fill(feedback.color.r, feedback.color.g, feedback.color.b, feedback.timer);
        textSize(32);
        text(feedback.message, width/2, height/2 - 100);
        
        feedback.timer -= 5;
        if (feedback.timer <= 0) {
            feedback.show = false;
        }
    }
}

function showFeedback(message, color) {
    feedback.message = message;
    feedback.color = color;
    feedback.timer = 255;
    feedback.show = true;
}

function startGame() {
    gameState = 'showing';
    currentLevel = 1;
    score = 0;
    userInput = [];
    pattern = [];
    
    // 速度設定
    if (gameMode === 'speed') {
        showDuration = 400;
        pauseDuration = 100;
    } else {
        showDuration = 800;
        pauseDuration = 200;
    }
    
    generateNewPattern();
}

function generateNewPattern() {
    // 新しいパターンを生成（レベルに応じて長さを増加）
    pattern = [];
    let patternLength = currentLevel + 2; // レベル1で3個、レベル2で4個...
    
    for (let i = 0; i < patternLength; i++) {
        let newTile;
        do {
            newTile = floor(random(grid.cols * grid.rows));
        } while (pattern.length > 0 && newTile === pattern[pattern.length - 1]); // 連続重複を避ける
        
        pattern.push(newTile);
    }
    
    // パターン表示開始
    showingIndex = 0;
    isShowing = false;
    lastShowTime = millis();
    userInput = [];
}

function checkUserInput() {
    // 現在の入力が正しいかチェック
    for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] !== pattern[i]) {
            // 間違い
            showFeedback("Wrong!", {r: 255, g: 100, b: 100});
            gameState = 'result';
            return;
        }
    }
    
    // 完全に正解
    if (userInput.length === pattern.length) {
        score++;
        currentLevel++;
        showFeedback("Perfect!", {r: 100, g: 255, b: 100});
        
        // 次のレベルへ
        setTimeout(() => {
            gameState = 'showing';
            generateNewPattern();
        }, 1500);
    }
}

function mousePressed() {
    if (gameState === 'menu') {
        // ゲームモード選択
        let buttonY = height/2 - 20;
        let buttonW = 120;
        let buttonH = 40;
        
        if (mouseY >= buttonY && mouseY <= buttonY + buttonH) {
            if (mouseX >= width/2 - 130 && mouseX <= width/2 - 10) {
                gameMode = 'classic';
            } else if (mouseX >= width/2 - 10 && mouseX <= width/2 + 110) {
                gameMode = 'speed';
            }
        }
        
        // スタートボタン
        if (mouseX >= width/2 - 75 && mouseX <= width/2 + 75 &&
            mouseY >= height/2 + 40 && mouseY <= height/2 + 90) {
            startGame();
        }
    } else if (gameState === 'waiting') {
        gameState = 'playing';
    } else if (gameState === 'playing') {
        // タイルクリックを検出
        let totalWidth = grid.cols * grid.size + (grid.cols - 1) * grid.spacing;
        let totalHeight = grid.rows * grid.size + (grid.rows - 1) * grid.spacing;
        let startX = (width - totalWidth) / 2;
        let startY = (height - totalHeight) / 2;
        
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                let x = startX + col * (grid.size + grid.spacing);
                let y = startY + row * (grid.size + grid.spacing);
                
                if (mouseX >= x && mouseX <= x + grid.size &&
                    mouseY >= y && mouseY <= y + grid.size) {
                    let index = row * grid.cols + col;
                    userInput.push(index);
                    checkUserInput();
                    return;
                }
            }
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

function keyPressed() {
    if (gameState === 'waiting' && key === ' ') {
        gameState = 'playing';
    } else if ((gameState === 'result' || gameState === 'menu') && key === ' ') {
        if (gameState === 'menu') {
            startGame();
        } else {
            startGame();
        }
    } else if (key === 'r' || key === 'R') {
        if (gameState === 'playing' || gameState === 'showing' || gameState === 'waiting') {
            gameState = 'menu';
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // グリッドサイズを再計算
    let maxGridWidth = min(width * 0.6, height * 0.6);
    grid.size = floor((maxGridWidth - (grid.cols - 1) * grid.spacing) / grid.cols);
    grid.size = max(grid.size, 40);
}