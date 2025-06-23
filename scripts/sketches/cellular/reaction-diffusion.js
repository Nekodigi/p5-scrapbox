// Reaction Diffusion - 反応拡散系シミュレーション
let grid;
let next;
let dA = 1;
let dB = 0.5;
let feed = 0.055;
let kill = 0.062;
let cols, rows;
let cellSize = 2;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('sketchContainer');
    pixelDensity(1);
    
    cols = width / cellSize;
    rows = height / cellSize;
    
    grid = [];
    next = [];
    
    for (let x = 0; x < cols; x++) {
        grid[x] = [];
        next[x] = [];
        for (let y = 0; y < rows; y++) {
            grid[x][y] = {
                a: 1,
                b: 0
            };
            next[x][y] = {
                a: 1,
                b: 0
            };
        }
    }
    
    // 初期の種を配置
    seedPattern();
    
    window.currentP5Instance = this;
}

function draw() {
    background(51);
    
    // 反応拡散の計算を複数回実行して高速化
    for (let i = 0; i < 5; i++) {
        update();
    }
    
    // 描画
    loadPixels();
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            let pix = (x * cellSize + y * cellSize * width) * 4;
            let a = next[x][y].a;
            let b = next[x][y].b;
            let c = floor((a - b) * 255);
            c = constrain(c, 0, 255);
            
            // 美しいグラデーション
            pixels[pix + 0] = c;
            pixels[pix + 1] = c * 0.5 + b * 255;
            pixels[pix + 2] = b * 255;
            pixels[pix + 3] = 255;
        }
    }
    updatePixels();
    
    displayInfo();
}

function update() {
    for (let x = 1; x < cols - 1; x++) {
        for (let y = 1; y < rows - 1; y++) {
            let a = grid[x][y].a;
            let b = grid[x][y].b;
            
            // ラプラシアン計算
            let laplaceA = 0;
            let laplaceB = 0;
            
            laplaceA += a * -1;
            laplaceA += grid[x + 1][y].a * 0.2;
            laplaceA += grid[x - 1][y].a * 0.2;
            laplaceA += grid[x][y + 1].a * 0.2;
            laplaceA += grid[x][y - 1].a * 0.2;
            laplaceA += grid[x + 1][y + 1].a * 0.05;
            laplaceA += grid[x - 1][y - 1].a * 0.05;
            laplaceA += grid[x - 1][y + 1].a * 0.05;
            laplaceA += grid[x + 1][y - 1].a * 0.05;
            
            laplaceB += b * -1;
            laplaceB += grid[x + 1][y].b * 0.2;
            laplaceB += grid[x - 1][y].b * 0.2;
            laplaceB += grid[x][y + 1].b * 0.2;
            laplaceB += grid[x][y - 1].b * 0.2;
            laplaceB += grid[x + 1][y + 1].b * 0.05;
            laplaceB += grid[x - 1][y - 1].b * 0.05;
            laplaceB += grid[x - 1][y + 1].b * 0.05;
            laplaceB += grid[x + 1][y - 1].b * 0.05;
            
            // 反応拡散方程式
            next[x][y].a = a + (dA * laplaceA - a * b * b + feed * (1 - a));
            next[x][y].b = b + (dB * laplaceB + a * b * b - (kill + feed) * b);
            
            next[x][y].a = constrain(next[x][y].a, 0, 1);
            next[x][y].b = constrain(next[x][y].b, 0, 1);
        }
    }
    
    // スワップ
    let temp = grid;
    grid = next;
    next = temp;
}

function seedPattern() {
    // 中央に種を配置
    let centerX = floor(cols / 2);
    let centerY = floor(rows / 2);
    let size = 10;
    
    for (let i = centerX - size; i < centerX + size; i++) {
        for (let j = centerY - size; j < centerY + size; j++) {
            if (i >= 0 && i < cols && j >= 0 && j < rows) {
                grid[i][j].b = 1;
            }
        }
    }
}

function mousePressed() {
    // マウス位置に種を配置
    let x = floor(mouseX / cellSize);
    let y = floor(mouseY / cellSize);
    let size = 5;
    
    for (let i = x - size; i < x + size; i++) {
        for (let j = y - size; j < y + size; j++) {
            if (i >= 0 && i < cols && j >= 0 && j < rows) {
                grid[i][j].b = 1;
            }
        }
    }
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        // リセット
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                grid[x][y].a = 1;
                grid[x][y].b = 0;
            }
        }
        seedPattern();
    }
    
    // パラメータ調整
    if (key === '1') {
        feed = 0.055;
        kill = 0.062;
    }
    if (key === '2') {
        feed = 0.03;
        kill = 0.062;
    }
    if (key === '3') {
        feed = 0.025;
        kill = 0.06;
    }
    if (key === '4') {
        feed = 0.039;
        kill = 0.058;
    }
}

function displayInfo() {
    fill(255, 200);
    textSize(14);
    text(`Feed: ${feed.toFixed(3)}, Kill: ${kill.toFixed(3)}`, 10, 25);
    text('クリック: 種を配置', 10, 50);
    text('1-4: プリセット', 10, 70);
    text('R: リセット', 10, 90);
}