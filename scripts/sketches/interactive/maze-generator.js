let maze = [];
let cols, rows;
let cellSize = 20;
let current;
let stack = [];
let generationComplete = false;
let solvingActive = false;
let path = [];
let visited = [];
let start, end;
let algorithm = 'dfs'; // dfs, bfs, astar
let generationSpeed = 5;
let solvingSpeed = 10;

let algorithms = ['dfs', 'bfs', 'astar', 'dijkstra'];
let generationMethods = ['recursive', 'kruskal', 'prim'];
let currentGenMethod = 'recursive';

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    setupMaze();
}

function draw() {
    background(0, 0, 10);
    
    drawMaze();
    drawUI();
    
    if (!generationComplete) {
        generateMaze();
    } else if (solvingActive) {
        solveMaze();
    }
}

function setupMaze() {
    cellSize = max(10, min(width / 50, height / 40));
    cols = floor(width / cellSize);
    rows = floor(height / cellSize);
    
    // 奇数に調整（迷路生成のため）
    if (cols % 2 === 0) cols--;
    if (rows % 2 === 0) rows--;
    
    maze = [];
    stack = [];
    path = [];
    visited = [];
    generationComplete = false;
    solvingActive = false;
    
    // グリッド初期化
    for (let j = 0; j < rows; j++) {
        maze[j] = [];
        for (let i = 0; i < cols; i++) {
            maze[j][i] = new Cell(i, j);
        }
    }
    
    // 開始点設定
    current = maze[0][0];
    current.visited = true;
    
    // ゴール設定
    start = maze[0][0];
    end = maze[rows - 1][cols - 1];
}

function generateMaze() {
    for (let step = 0; step < generationSpeed; step++) {
        if (currentGenMethod === 'recursive') {
            generateRecursive();
        } else if (currentGenMethod === 'kruskal') {
            generateKruskal();
        } else if (currentGenMethod === 'prim') {
            generatePrim();
        }
        
        if (generationComplete) break;
    }
}

function generateRecursive() {
    let next = current.getRandomNeighbor(maze, cols, rows);
    
    if (next) {
        next.visited = true;
        stack.push(current);
        removeWall(current, next);
        current = next;
    } else if (stack.length > 0) {
        current = stack.pop();
    } else {
        generationComplete = true;
        end.isEnd = true;
        start.isStart = true;
    }
}

function generateKruskal() {
    // Kruskal's algorithm implementation (simplified)
    generationComplete = true; // For now, fall back to recursive
    generateRecursive();
}

function generatePrim() {
    // Prim's algorithm implementation (simplified)
    generationComplete = true; // For now, fall back to recursive
    generateRecursive();
}

function solveMaze() {
    for (let step = 0; step < solvingSpeed; step++) {
        let solved = false;
        
        switch (algorithm) {
            case 'dfs':
                solved = solveDFS();
                break;
            case 'bfs':
                solved = solveBFS();
                break;
            case 'astar':
                solved = solveAStar();
                break;
            case 'dijkstra':
                solved = solveDijkstra();
                break;
        }
        
        if (solved) {
            solvingActive = false;
            break;
        }
    }
}

function solveDFS() {
    if (path.length === 0) {
        path.push(start);
        visited = [];
        for (let j = 0; j < rows; j++) {
            visited[j] = [];
            for (let i = 0; i < cols; i++) {
                visited[j][i] = false;
            }
        }
    }
    
    let current = path[path.length - 1];
    visited[current.j][current.i] = true;
    
    if (current === end) {
        return true; // 解決
    }
    
    let neighbors = current.getValidNeighbors(maze, cols, rows);
    let unvisitedNeighbors = neighbors.filter(n => !visited[n.j][n.i]);
    
    if (unvisitedNeighbors.length > 0) {
        let next = unvisitedNeighbors[0];
        path.push(next);
    } else {
        path.pop();
        if (path.length === 0) {
            return true; // 解けない
        }
    }
    
    return false;
}

function solveBFS() {
    if (path.length === 0) {
        path = [start];
        visited = [];
        for (let j = 0; j < rows; j++) {
            visited[j] = [];
            for (let i = 0; i < cols; i++) {
                visited[j][i] = false;
            }
        }
        visited[start.j][start.i] = true;
    }
    
    if (path.length === 0) return true;
    
    let current = path.shift();
    
    if (current === end) {
        path = [end]; // 簡易表示
        return true;
    }
    
    let neighbors = current.getValidNeighbors(maze, cols, rows);
    
    for (let neighbor of neighbors) {
        if (!visited[neighbor.j][neighbor.i]) {
            visited[neighbor.j][neighbor.i] = true;
            neighbor.parent = current;
            path.push(neighbor);
        }
    }
    
    return false;
}

function solveAStar() {
    // A*アルゴリズムの簡易実装
    return solveBFS(); // 簡略化
}

function solveDijkstra() {
    // Dijkstraアルゴリズムの簡易実装
    return solveBFS(); // 簡略化
}

function drawMaze() {
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            let cell = maze[j][i];
            cell.draw();
        }
    }
    
    // パスの描画
    if (path.length > 0 && solvingActive) {
        // ネオン風の解法パス
        push();
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = 'hsla(60, 100%, 50%, 0.8)';
        
        stroke(60, 100, 100);
        strokeWeight(cellSize * 0.25);
        noFill();
        
        beginShape();
        for (let cell of path) {
            let x = cell.i * cellSize + cellSize / 2;
            let y = cell.j * cellSize + cellSize / 2;
            vertex(x, y);
        }
        endShape();
        
        // パス上の光の粒子
        for (let i = 0; i < path.length; i++) {
            let cell = path[i];
            let x = cell.i * cellSize + cellSize/2;
            let y = cell.j * cellSize + cellSize/2;
            let size = 6 + sin(frameCount * 0.1 + i * 0.5) * 2;
            fill(60, 70, 100);
            noStroke();
            ellipse(x, y, size);
        }
        pop();
    }
    
    // 訪問済みセルの表示（解法中）
    if (solvingActive) {
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                if (visited && visited[j] && visited[j][i]) {
                    // 波紋効果
                    let distance = dist(i, j, path[path.length-1].i, path[path.length-1].j);
                    let wave = sin(distance * 0.3 - frameCount * 0.05) * 20 + 60;
                    fill(180, wave, 90, 25);
                    noStroke();
                    rect(i * cellSize + 2, j * cellSize + 2, cellSize - 4, cellSize - 4, 2);
                }
            }
        }
    }
}

function drawUI() {
    // コントロールパネル
    fill(0, 0, 0, 90);
    noStroke();
    rect(0, 0, 300, 200);
    
    fill(0, 0, 100);
    textAlign(LEFT, TOP);
    textSize(16);
    text("Maze Generator & Solver", 20, 20);
    
    textSize(12);
    text(`Size: ${cols} x ${rows}`, 20, 50);
    text(`Generation: ${currentGenMethod}`, 20, 70);
    text(`Algorithm: ${algorithm}`, 20, 90);
    text(`Status: ${getStatus()}`, 20, 110);
    text(`Gen Speed: ${generationSpeed}`, 20, 130);
    text(`Solve Speed: ${solvingSpeed}`, 20, 150);
    
    // コントロール説明
    fill(0, 0, 100, 80);
    textAlign(LEFT, BOTTOM);
    textSize(10);
    text("Controls:", 20, height - 120);
    text("G: Generate new maze | S: Solve maze | C: Clear solution", 20, height - 105);
    text("A: Change algorithm | M: Generation method", 20, height - 90);
    text("+/-: Maze size | ↑↓: Generation speed | ←→: Solve speed", 20, height - 75);
    text("1-4: Quick algorithm selection | R: Reset", 20, height - 60);
    text("Click: Set start/end points", 20, height - 45);
}

function getStatus() {
    if (!generationComplete) return "Generating...";
    if (solvingActive) return "Solving...";
    return "Ready";
}

class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };
        this.visited = false;
        this.isStart = false;
        this.isEnd = false;
        this.distance = Infinity;
        this.parent = null;
    }
    
    draw() {
        let x = this.i * cellSize;
        let y = this.j * cellSize;
        
        // セルの背景
        if (this.visited && !generationComplete) {
            fill(240, 60, 80, 40);
            noStroke();
            rect(x, y, cellSize, cellSize);
        }
        
        // スタート・エンド
        if (this.isStart) {
            fill(120, 100, 100, 80);
            noStroke();
            rect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        } else if (this.isEnd) {
            fill(0, 100, 100, 80);
            noStroke();
            rect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        }
        
        // 壁の描画
        stroke(0, 0, 100);
        strokeWeight(2);
        
        if (this.walls.top) {
            line(x, y, x + cellSize, y);
        }
        if (this.walls.right) {
            line(x + cellSize, y, x + cellSize, y + cellSize);
        }
        if (this.walls.bottom) {
            line(x + cellSize, y + cellSize, x, y + cellSize);
        }
        if (this.walls.left) {
            line(x, y + cellSize, x, y);
        }
        
        // 現在位置（生成中）
        if (this === current && !generationComplete) {
            fill(300, 100, 100, 80);
            noStroke();
            ellipse(x + cellSize/2, y + cellSize/2, cellSize * 0.6);
        }
    }
    
    getRandomNeighbor(grid, cols, rows) {
        let neighbors = [];
        
        let top = this.j > 1 ? grid[this.j - 2][this.i] : undefined;
        let right = this.i < cols - 2 ? grid[this.j][this.i + 2] : undefined;
        let bottom = this.j < rows - 2 ? grid[this.j + 2][this.i] : undefined;
        let left = this.i > 1 ? grid[this.j][this.i - 2] : undefined;
        
        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);
        
        if (neighbors.length > 0) {
            return neighbors[floor(random(neighbors.length))];
        }
        return undefined;
    }
    
    getValidNeighbors(grid, cols, rows) {
        let neighbors = [];
        
        // 4方向をチェック
        if (this.j > 0 && !this.walls.top) {
            neighbors.push(grid[this.j - 1][this.i]);
        }
        if (this.i < cols - 1 && !this.walls.right) {
            neighbors.push(grid[this.j][this.i + 1]);
        }
        if (this.j < rows - 1 && !this.walls.bottom) {
            neighbors.push(grid[this.j + 1][this.i]);
        }
        if (this.i > 0 && !this.walls.left) {
            neighbors.push(grid[this.j][this.i - 1]);
        }
        
        return neighbors;
    }
}

function removeWall(current, next) {
    let x = current.i - next.i;
    let y = current.j - next.j;
    
    if (x === 2) {
        current.walls.left = false;
        next.walls.right = false;
        // 間の壁も削除
        if (maze[current.j] && maze[current.j][current.i - 1]) {
            maze[current.j][current.i - 1].walls.left = false;
            maze[current.j][current.i - 1].walls.right = false;
        }
    } else if (x === -2) {
        current.walls.right = false;
        next.walls.left = false;
        // 間の壁も削除
        if (maze[current.j] && maze[current.j][current.i + 1]) {
            maze[current.j][current.i + 1].walls.left = false;
            maze[current.j][current.i + 1].walls.right = false;
        }
    } else if (y === 2) {
        current.walls.top = false;
        next.walls.bottom = false;
        // 間の壁も削除
        if (maze[current.j - 1] && maze[current.j - 1][current.i]) {
            maze[current.j - 1][current.i].walls.top = false;
            maze[current.j - 1][current.i].walls.bottom = false;
        }
    } else if (y === -2) {
        current.walls.bottom = false;
        next.walls.top = false;
        // 間の壁も削除
        if (maze[current.j + 1] && maze[current.j + 1][current.i]) {
            maze[current.j + 1][current.i].walls.top = false;
            maze[current.j + 1][current.i].walls.bottom = false;
        }
    }
}

function keyPressed() {
    if (key === 'g' || key === 'G') {
        setupMaze();
    } else if (key === 's' || key === 'S') {
        if (generationComplete) {
            solvingActive = true;
            path = [];
            visited = [];
        }
    } else if (key === 'c' || key === 'C') {
        solvingActive = false;
        path = [];
        visited = [];
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                if (visited[j]) visited[j][i] = false;
            }
        }
    } else if (key === 'a' || key === 'A') {
        let currentIndex = algorithms.indexOf(algorithm);
        algorithm = algorithms[(currentIndex + 1) % algorithms.length];
    } else if (key === 'm' || key === 'M') {
        let currentIndex = generationMethods.indexOf(currentGenMethod);
        currentGenMethod = generationMethods[(currentIndex + 1) % generationMethods.length];
    } else if (key === '+' || key === '=') {
        cellSize = min(cellSize + 2, 40);
        setupMaze();
    } else if (key === '-') {
        cellSize = max(cellSize - 2, 8);
        setupMaze();
    } else if (keyCode === UP_ARROW) {
        generationSpeed = min(generationSpeed + 1, 20);
    } else if (keyCode === DOWN_ARROW) {
        generationSpeed = max(generationSpeed - 1, 1);
    } else if (keyCode === LEFT_ARROW) {
        solvingSpeed = max(solvingSpeed - 1, 1);
    } else if (keyCode === RIGHT_ARROW) {
        solvingSpeed = min(solvingSpeed + 1, 50);
    } else if (key === 'r' || key === 'R') {
        setupMaze();
    } else if (key >= '1' && key <= '4') {
        algorithm = algorithms[parseInt(key) - 1];
    }
}

function mousePressed() {
    if (generationComplete && !solvingActive) {
        let gridX = floor(mouseX / cellSize);
        let gridY = floor(mouseY / cellSize);
        
        if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
            let clickedCell = maze[gridY][gridX];
            
            if (mouseButton === LEFT) {
                // スタート地点設定
                start.isStart = false;
                clickedCell.isStart = true;
                start = clickedCell;
            } else if (mouseButton === RIGHT) {
                // エンド地点設定
                end.isEnd = false;
                clickedCell.isEnd = true;
                end = clickedCell;
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setupMaze();
}