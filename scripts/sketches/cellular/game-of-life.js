// Game of Life HD - 高解像度ライフゲーム
let grid;
let cols, rows;
let cellSize = 5;
let isRunning = true;
let generation = 0;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('sketchContainer');
    
    cols = width / cellSize;
    rows = height / cellSize;
    
    grid = make2DArray(cols, rows);
    initializeGrid();
    
    window.currentP5Instance = this;
}

function draw() {
    background(0);
    
    // グリッドを描画
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * cellSize;
            let y = j * cellSize;
            
            if (grid[i][j] === 1) {
                // 生きているセルの色を世代によって変化
                let hue = (generation * 2) % 360;
                colorMode(HSB, 360, 100, 100);
                fill(hue, 80, 90);
                noStroke();
                rect(x, y, cellSize - 1, cellSize - 1);
            }
        }
    }
    
    // 次世代を計算
    if (isRunning && frameCount % 5 === 0) {
        grid = nextGeneration();
        generation++;
    }
    
    displayInfo();
}

function make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
        for (let j = 0; j < rows; j++) {
            arr[i][j] = 0;
        }
    }
    return arr;
}

function initializeGrid() {
    // ランダム初期化
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = random() < 0.2 ? 1 : 0;
        }
    }
    generation = 0;
}

function nextGeneration() {
    let next = make2DArray(cols, rows);
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let state = grid[i][j];
            let neighbors = countNeighbors(i, j);
            
            // ライフゲームのルール
            if (state === 0 && neighbors === 3) {
                next[i][j] = 1;
            } else if (state === 1 && (neighbors === 2 || neighbors === 3)) {
                next[i][j] = 1;
            } else {
                next[i][j] = 0;
            }
        }
    }
    
    return next;
}

function countNeighbors(x, y) {
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let col = (x + i + cols) % cols;
            let row = (y + j + rows) % rows;
            sum += grid[col][row];
        }
    }
    sum -= grid[x][y];
    return sum;
}

function mousePressed() {
    // マウス位置のセルをトグル
    let i = floor(mouseX / cellSize);
    let j = floor(mouseY / cellSize);
    
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
        grid[i][j] = 1 - grid[i][j];
    }
}

function mouseDragged() {
    // ドラッグで描画
    let i = floor(mouseX / cellSize);
    let j = floor(mouseY / cellSize);
    
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
        grid[i][j] = 1;
    }
}

function keyPressed() {
    if (key === ' ') {
        isRunning = !isRunning;
    }
    if (key === 'r' || key === 'R') {
        initializeGrid();
    }
    if (key === 'c' || key === 'C') {
        grid = make2DArray(cols, rows);
        generation = 0;
    }
    if (key === 'g' || key === 'G') {
        // グライダーを配置
        let centerX = floor(cols / 2);
        let centerY = floor(rows / 2);
        
        // グライダーパターン
        grid[centerX][centerY] = 1;
        grid[centerX + 1][centerY + 1] = 1;
        grid[centerX - 1][centerY + 2] = 1;
        grid[centerX][centerY + 2] = 1;
        grid[centerX + 1][centerY + 2] = 1;
    }
}

function displayInfo() {
    colorMode(RGB, 255);
    fill(255, 200);
    textSize(14);
    text(`世代: ${generation}`, 10, 25);
    text(`状態: ${isRunning ? '実行中' : '一時停止'}`, 10, 45);
    text('SPACE: 再生/停止', 10, 70);
    text('クリック/ドラッグ: セル描画', 10, 90);
    text('R: ランダム, C: クリア', 10, 110);
    text('G: グライダー配置', 10, 130);
}