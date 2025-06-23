let cells = [];
let generation = 0;
let cellSize = 4;
let rows, cols;
let rule = 90; // デフォルトのルール
let ruleSet = [];

// 有名なルール番号
const interestingRules = [30, 54, 60, 73, 86, 90, 110, 150, 184];
let currentRuleIndex = 5; // ルール90から開始

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100);
    
    cols = floor(width / cellSize);
    rows = floor(height / cellSize);
    
    // ルールを設定
    rule = interestingRules[currentRuleIndex];
    generateRuleSet(rule);
    
    // 初期状態を設定（中央に1つのセル）
    initializeCells();
    
    background(0);
}

function draw() {
    // 現在の世代を描画
    drawGeneration();
    
    // 次の世代を計算
    nextGeneration();
    
    // 画面下端に達したらリセット
    if (generation * cellSize >= height) {
        resetSimulation();
    }
}

function initializeCells() {
    cells = new Array(cols);
    for (let i = 0; i < cols; i++) {
        cells[i] = 0;
    }
    // 中央に1つのセルを配置
    cells[floor(cols / 2)] = 1;
    generation = 0;
}

function generateRuleSet(ruleNumber) {
    ruleSet = [];
    // ルール番号を8ビットの配列に変換
    for (let i = 0; i < 8; i++) {
        ruleSet[i] = (ruleNumber >> i) & 1;
    }
}

function nextGeneration() {
    let newCells = new Array(cols);
    
    for (let i = 0; i < cols; i++) {
        // 左、中央、右のセルの状態を取得（端の処理）
        let left = cells[(i - 1 + cols) % cols];
        let center = cells[i];
        let right = cells[(i + 1) % cols];
        
        // 3つのセルの状態から新しい状態を決定
        let newState = rules(left, center, right);
        newCells[i] = newState;
    }
    
    cells = newCells;
    generation++;
}

function rules(a, b, c) {
    // 3つのセルの状態を1つの数値に変換（0-7）
    let index = a * 4 + b * 2 + c;
    return ruleSet[index];
}

function drawGeneration() {
    let y = generation * cellSize;
    
    for (let i = 0; i < cols; i++) {
        if (cells[i] === 1) {
            // ルール番号に基づいて色を変化
            let hue = map(rule, 0, 255, 0, 360);
            let brightness = map(generation, 0, rows, 80, 100);
            fill(hue, 70, brightness);
            noStroke();
            rect(i * cellSize, y, cellSize, cellSize);
        }
    }
    
    // 現在のルール番号を表示
    fill(0, 0, 100);
    textAlign(LEFT, TOP);
    textSize(16);
    text(`Rule ${rule} (Click to cycle through rules)`, 10, 10);
    text(`Generation: ${generation}`, 10, 30);
}

function resetSimulation() {
    background(0);
    initializeCells();
}

function mousePressed() {
    // ルールをサイクル
    currentRuleIndex = (currentRuleIndex + 1) % interestingRules.length;
    rule = interestingRules[currentRuleIndex];
    generateRuleSet(rule);
    resetSimulation();
}

function keyPressed() {
    if (key === ' ') {
        resetSimulation();
    } else if (key >= '1' && key <= '9') {
        // 数字キーでルールを直接選択
        let index = parseInt(key) - 1;
        if (index < interestingRules.length) {
            currentRuleIndex = index;
            rule = interestingRules[currentRuleIndex];
            generateRuleSet(rule);
            resetSimulation();
        }
    } else if (key === 'r' || key === 'R') {
        // ランダムなルール
        rule = floor(random(256));
        generateRuleSet(rule);
        resetSimulation();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = floor(width / cellSize);
    rows = floor(height / cellSize);
    resetSimulation();
}