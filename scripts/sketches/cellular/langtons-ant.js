// Langton's Ant - ラングトンのアリ
let grid;
let cols, rows;
let cellSize = 2;
let ants = [];
let steps = 0;
let speed = 100;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('sketchContainer');
    
    cols = width / cellSize;
    rows = height / cellSize;
    
    // グリッド初期化
    grid = new Array(cols);
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
        for (let j = 0; j < rows; j++) {
            grid[i][j] = 0;
        }
    }
    
    // アリを配置
    ants.push(new Ant(floor(cols / 2), floor(rows / 2), 0));
    
    window.currentP5Instance = this;
}

function draw() {
    // 背景を描画（最初のフレームのみ）
    if (frameCount === 1) {
        background(255);
    }
    
    // アリを移動
    for (let n = 0; n < speed; n++) {
        for (let ant of ants) {
            ant.move();
        }
        steps++;
    }
    
    // アリを描画
    for (let ant of ants) {
        ant.display();
    }
    
    displayInfo();
}

class Ant {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir; // 0:上, 1:右, 2:下, 3:左
        this.color = color(random(255), random(255), random(255));
    }
    
    move() {
        // 現在のセルの状態を確認
        if (this.x >= 0 && this.x < cols && this.y >= 0 && this.y < rows) {
            if (grid[this.x][this.y] === 0) {
                // 白いセル：右に回転、セルを黒にする
                this.turnRight();
                grid[this.x][this.y] = 1;
                
                // セルを描画
                fill(0);
                noStroke();
                rect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
            } else {
                // 黒いセル：左に回転、セルを白にする
                this.turnLeft();
                grid[this.x][this.y] = 0;
                
                // セルを描画
                fill(255);
                noStroke();
                rect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
            }
            
            // 前進
            this.forward();
        }
    }
    
    turnRight() {
        this.dir = (this.dir + 1) % 4;
    }
    
    turnLeft() {
        this.dir = (this.dir + 3) % 4;
    }
    
    forward() {
        switch(this.dir) {
            case 0: this.y--; break; // 上
            case 1: this.x++; break; // 右
            case 2: this.y++; break; // 下
            case 3: this.x--; break; // 左
        }
        
        // 境界チェック（ラップアラウンド）
        if (this.x < 0) this.x = cols - 1;
        if (this.x >= cols) this.x = 0;
        if (this.y < 0) this.y = rows - 1;
        if (this.y >= rows) this.y = 0;
    }
    
    display() {
        // アリの位置を表示
        fill(this.color);
        noStroke();
        let displayX = this.x * cellSize;
        let displayY = this.y * cellSize;
        
        // アリを三角形で描画
        push();
        translate(displayX + cellSize / 2, displayY + cellSize / 2);
        rotate(this.dir * PI / 2);
        triangle(0, -cellSize, -cellSize/2, cellSize/2, cellSize/2, cellSize/2);
        pop();
    }
}

function mousePressed() {
    // マウス位置に新しいアリを追加
    let x = floor(mouseX / cellSize);
    let y = floor(mouseY / cellSize);
    
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        ants.push(new Ant(x, y, floor(random(4))));
    }
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        // リセット
        background(255);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j] = 0;
            }
        }
        ants = [];
        ants.push(new Ant(floor(cols / 2), floor(rows / 2), 0));
        steps = 0;
    }
    
    if (key === 'c' || key === 'C') {
        // アリをクリア
        ants = [];
    }
    
    if (key === '+' || key === '=') {
        speed = min(speed * 2, 1000);
    }
    
    if (key === '-') {
        speed = max(floor(speed / 2), 1);
    }
}

function displayInfo() {
    // 情報パネルの背景
    fill(0, 200);
    noStroke();
    rect(0, 0, 200, 120);
    
    fill(255);
    textSize(14);
    text(`ステップ: ${steps}`, 10, 25);
    text(`アリ: ${ants.length}匹`, 10, 45);
    text(`速度: ${speed}ステップ/フレーム`, 10, 65);
    text('クリック: アリ追加', 10, 85);
    text('R: リセット, +/-: 速度', 10, 105);
}