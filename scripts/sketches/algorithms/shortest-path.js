// 最短経路探索アルゴリズム可視化
class PathfindingGrid {
    constructor(cols, rows, cellSize) {
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;
        this.grid = [];
        this.start = null;
        this.end = null;
        this.obstacles = new Set();
        this.path = [];
        this.visitedNodes = [];
        this.searchingNodes = [];
        this.algorithm = 'astar'; // 'astar', 'dijkstra', 'bfs', 'dfs', 'greedy'
        this.heuristicType = 'manhattan'; // 'manhattan', 'euclidean', 'octile', 'chebyshev'
        this.allowDiagonal = true;
        this.animationSpeed = 10; // より速いアニメーションで感動的に
        this.isSearching = false;
        this.searchComplete = false;
        this.isComparing = false;
        this.comparisonResults = [];
        this.clickEffect = { active: false, x: 0, y: 0, radius: 0 };
        
        this.initializeGrid();
    }
    
    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Node(i, j);
            }
        }
        
        // より興味深い位置にスタートとゴールを配置
        let margin = 3;
        let startCorner = floor(random(4)); // ランダムにコーナーを選択
        
        switch(startCorner) {
            case 0: // 左上
                this.start = this.grid[margin][margin];
                this.end = this.grid[this.cols-1-margin][this.rows-1-margin];
                break;
            case 1: // 右上
                this.start = this.grid[this.cols-1-margin][margin];
                this.end = this.grid[margin][this.rows-1-margin];
                break;
            case 2: // 左下
                this.start = this.grid[margin][this.rows-1-margin];
                this.end = this.grid[this.cols-1-margin][margin];
                break;
            case 3: // 右下
                this.start = this.grid[this.cols-1-margin][this.rows-1-margin];
                this.end = this.grid[margin][margin];
                break;
        }
        
        this.start.isStart = true;
        this.end.isEnd = true;
    }
    
    reset() {
        this.path = [];
        this.visitedNodes = [];
        this.searchingNodes = [];
        this.isSearching = false;
        this.searchComplete = false;
        
        // ノードのリセット
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let node = this.grid[i][j];
                node.reset();
                if (node === this.start) node.isStart = true;
                if (node === this.end) node.isEnd = true;
                if (this.obstacles.has(`${i},${j}`)) node.isWall = true;
            }
        }
    }
    
    clearWalls() {
        this.obstacles.clear();
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j].isWall = false;
            }
        }
        this.reset();
    }
    
    generateMaze() {
        this.clearWalls();
        
        // ランダムな迷路生成（再帰的分割法）
        this.recursiveDivision(0, 0, this.cols - 1, this.rows - 1);
        this.reset();
    }
    
    generateRandomObstacles(density = 0.2) {
        this.clearWalls();
        
        // ランダムに障害物を配置
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (random() < density) {
                    let node = this.grid[i][j];
                    if (node !== this.start && node !== this.end) {
                        node.isWall = true;
                        this.obstacles.add(`${i},${j}`);
                    }
                }
            }
        }
        
        // スタートとゴールの周りは必ず空ける
        this.clearAroundNode(this.start);
        this.clearAroundNode(this.end);
        
        // パスが存在することを確認
        this.ensurePathExists();
        this.reset();
    }
    
    clearAroundNode(node) {
        let neighbors = this.getNeighbors(node);
        for (let neighbor of neighbors) {
            if (neighbor.isWall) {
                neighbor.isWall = false;
                this.obstacles.delete(`${neighbor.col},${neighbor.row}`);
            }
        }
    }
    
    ensurePathExists() {
        // 簡単なBFSでパスが存在するか確認
        let queue = [this.start];
        let visited = new Set();
        visited.add(`${this.start.col},${this.start.row}`);
        
        while (queue.length > 0) {
            let current = queue.shift();
            
            if (current === this.end) {
                return true; // パスが存在
            }
            
            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                let key = `${neighbor.col},${neighbor.row}`;
                if (!visited.has(key) && !neighbor.isWall) {
                    visited.add(key);
                    queue.push(neighbor);
                }
            }
        }
        
        // パスが存在しない場合、一部の壁を削除
        this.createPath();
        return false;
    }
    
    createPath() {
        // スタートからゴールへの直線経路を作成
        let x1 = this.start.col;
        let y1 = this.start.row;
        let x2 = this.end.col;
        let y2 = this.end.row;
        
        // Bresenham's line algorithm の簡易版
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let sx = x1 < x2 ? 1 : -1;
        let sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        while (x1 !== x2 || y1 !== y2) {
            let node = this.grid[x1][y1];
            if (node.isWall) {
                node.isWall = false;
                this.obstacles.delete(`${x1},${y1}`);
            }
            
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
    }
    
    recursiveDivision(x1, y1, x2, y2) {
        if (x2 - x1 < 2 || y2 - y1 < 2) return;
        
        let horizontal = random() > 0.5;
        
        if (horizontal) {
            let y = floor(random(y1 + 1, y2));
            let hole = floor(random(x1, x2 + 1));
            
            for (let x = x1; x <= x2; x++) {
                if (x !== hole && this.grid[x][y] !== this.start && this.grid[x][y] !== this.end) {
                    this.grid[x][y].isWall = true;
                    this.obstacles.add(`${x},${y}`);
                }
            }
            
            this.recursiveDivision(x1, y1, x2, y - 1);
            this.recursiveDivision(x1, y + 1, x2, y2);
        } else {
            let x = floor(random(x1 + 1, x2));
            let hole = floor(random(y1, y2 + 1));
            
            for (let y = y1; y <= y2; y++) {
                if (y !== hole && this.grid[x][y] !== this.start && this.grid[x][y] !== this.end) {
                    this.grid[x][y].isWall = true;
                    this.obstacles.add(`${x},${y}`);
                }
            }
            
            this.recursiveDivision(x1, y1, x - 1, y2);
            this.recursiveDivision(x + 1, y1, x2, y2);
        }
    }
    
    toggleWall(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
        
        let node = this.grid[col][row];
        if (node === this.start || node === this.end) return;
        
        node.isWall = !node.isWall;
        if (node.isWall) {
            this.obstacles.add(`${col},${row}`);
        } else {
            this.obstacles.delete(`${col},${row}`);
        }
    }
    
    setStart(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
        
        let node = this.grid[col][row];
        if (node === this.end || node.isWall) return;
        
        if (this.start) this.start.isStart = false;
        this.start = node;
        this.start.isStart = true;
        this.reset();
    }
    
    setEnd(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
        
        let node = this.grid[col][row];
        if (node === this.start || node.isWall) return;
        
        if (this.end) this.end.isEnd = false;
        this.end = node;
        this.end.isEnd = true;
        this.reset();
    }
    
    startSearch() {
        if (!this.start || !this.end || this.isSearching) return;
        
        this.reset();
        this.isSearching = true;
        
        switch (this.algorithm) {
            case 'astar':
                this.astar();
                break;
            case 'dijkstra':
                this.dijkstra();
                break;
            case 'bfs':
                this.bfs();
                break;
            case 'dfs':
                this.dfs();
                break;
            case 'greedy':
                this.greedyBestFirst();
                break;
        }
    }
    
    async startHeuristicComparison() {
        if (!this.start || !this.end || this.isSearching || this.isComparing) return;
        
        this.isComparing = true;
        this.comparisonResults = [];
        
        // 新しいマップを生成
        this.generateRandomObstacles(0.3);
        
        const heuristics = ['manhattan', 'euclidean', 'octile', 'chebyshev'];
        const colors = [
            [255, 0, 0],    // Red
            [0, 255, 0],    // Green  
            [0, 0, 255],    // Blue
            [255, 165, 0]   // Orange
        ];
        
        // 各ヒューリスティックで探索を実行
        for (let i = 0; i < heuristics.length; i++) {
            const originalHeuristic = this.heuristicType;
            this.heuristicType = heuristics[i];
            
            this.reset();
            
            const startTime = Date.now();
            const originalAlgorithm = this.algorithm;
            this.algorithm = 'astar'; // A*で比較
            
            await this.astarComparison(colors[i]);
            
            const endTime = Date.now();
            
            this.comparisonResults.push({
                heuristic: heuristics[i],
                pathLength: this.path.length > 0 ? this.path.length - 1 : -1,
                nodesVisited: this.visitedNodes.length,
                timeTaken: endTime - startTime,
                color: colors[i]
            });
            
            this.algorithm = originalAlgorithm;
            this.heuristicType = originalHeuristic;
            
            await this.delay(1000); // 各探索の間に1秒待機
        }
        
        this.isComparing = false;
    }
    
    async astarComparison(color) {
        let openSet = [this.start];
        this.start.g = 0;
        this.start.f = this.heuristic(this.start, this.end);
        
        while (openSet.length > 0 && this.isComparing) {
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            if (current === this.end) {
                this.reconstructPath(current);
                // パスに色を設定
                for (let node of this.path) {
                    node.pathColor = color;
                }
                return;
            }
            
            openSet.splice(currentIndex, 1);
            current.closed = true;
            current.visitedColor = color;
            this.visitedNodes.push(current);
            
            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                if (neighbor.closed) continue;
                
                let tempG = current.g + 1;
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tempG >= neighbor.g) {
                    continue;
                }
                
                neighbor.previous = current;
                neighbor.g = tempG;
                neighbor.f = neighbor.g + this.heuristic(neighbor, this.end);
            }
            
            await this.delay(Math.max(1, this.animationSpeed / 4)); // 高速実行
        }
    }
    
    heuristic(a, b) {
        switch (this.heuristicType) {
            case 'manhattan':
                return abs(a.col - b.col) + abs(a.row - b.row);
            case 'euclidean':
                return dist(a.col, a.row, b.col, b.row);
            case 'octile':
                let dx = abs(a.col - b.col);
                let dy = abs(a.row - b.row);
                return (dx + dy) + (sqrt(2) - 2) * min(dx, dy);
            case 'chebyshev':
                return max(abs(a.col - b.col), abs(a.row - b.row));
            default:
                return 0;
        }
    }
    
    getNeighbors(node) {
        let neighbors = [];
        let { col, row } = node;
        
        // 4方向
        let directions = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];
        
        // 8方向（対角線を含む）
        if (this.allowDiagonal) {
            directions.push(
                { x: -1, y: -1 }, // 左上
                { x: 1, y: -1 },  // 右上
                { x: 1, y: 1 },   // 右下
                { x: -1, y: 1 }   // 左下
            );
        }
        
        for (let dir of directions) {
            let newCol = col + dir.x;
            let newRow = row + dir.y;
            
            if (newCol >= 0 && newCol < this.cols && 
                newRow >= 0 && newRow < this.rows) {
                let neighbor = this.grid[newCol][newRow];
                if (!neighbor.isWall) {
                    neighbors.push(neighbor);
                }
            }
        }
        
        return neighbors;
    }
    
    async astar() {
        let openSet = [this.start];
        this.start.g = 0;
        this.start.f = this.heuristic(this.start, this.end);
        
        while (openSet.length > 0 && this.isSearching) {
            // f値が最小のノードを選択
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            // ゴールに到達
            if (current === this.end) {
                this.reconstructPath(current);
                this.isSearching = false;
                this.searchComplete = true;
                return;
            }
            
            openSet.splice(currentIndex, 1);
            current.closed = true;
            this.visitedNodes.push(current);
            
            // 隣接ノードを調べる
            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                if (neighbor.closed) continue;
                
                let tempG = current.g + 1;
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                    this.searchingNodes.push(neighbor);
                } else if (tempG >= neighbor.g) {
                    continue;
                }
                
                neighbor.previous = current;
                neighbor.g = tempG;
                neighbor.f = neighbor.g + this.heuristic(neighbor, this.end);
            }
            
            await this.delay(this.animationSpeed);
        }
        
        this.isSearching = false;
        this.searchComplete = true;
    }
    
    async dijkstra() {
        // Dijkstraはヒューリスティックを使わない（h = 0）
        let openSet = [this.start];
        this.start.g = 0;
        
        while (openSet.length > 0 && this.isSearching) {
            // g値が最小のノードを選択
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].g < current.g) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            if (current === this.end) {
                this.reconstructPath(current);
                this.isSearching = false;
                this.searchComplete = true;
                return;
            }
            
            openSet.splice(currentIndex, 1);
            current.closed = true;
            this.visitedNodes.push(current);
            
            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                if (neighbor.closed) continue;
                
                let tempG = current.g + 1;
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                    this.searchingNodes.push(neighbor);
                    neighbor.g = tempG;
                    neighbor.previous = current;
                } else if (tempG < neighbor.g) {
                    neighbor.g = tempG;
                    neighbor.previous = current;
                }
            }
            
            await this.delay(this.animationSpeed);
        }
        
        this.isSearching = false;
        this.searchComplete = true;
    }
    
    async bfs() {
        let queue = [this.start];
        this.start.visited = true;
        
        while (queue.length > 0 && this.isSearching) {
            let current = queue.shift();
            
            if (current === this.end) {
                this.reconstructPath(current);
                this.isSearching = false;
                this.searchComplete = true;
                return;
            }
            
            this.visitedNodes.push(current);
            
            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                if (!neighbor.visited) {
                    neighbor.visited = true;
                    neighbor.previous = current;
                    queue.push(neighbor);
                    this.searchingNodes.push(neighbor);
                }
            }
            
            await this.delay(this.animationSpeed);
        }
        
        this.isSearching = false;
        this.searchComplete = true;
    }
    
    async dfs() {
        let stack = [this.start];
        this.start.visited = true;
        
        while (stack.length > 0 && this.isSearching) {
            let current = stack.pop();
            
            if (current === this.end) {
                this.reconstructPath(current);
                this.isSearching = false;
                this.searchComplete = true;
                return;
            }
            
            this.visitedNodes.push(current);
            
            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                if (!neighbor.visited) {
                    neighbor.visited = true;
                    neighbor.previous = current;
                    stack.push(neighbor);
                    this.searchingNodes.push(neighbor);
                }
            }
            
            await this.delay(this.animationSpeed);
        }
        
        this.isSearching = false;
        this.searchComplete = true;
    }
    
    async greedyBestFirst() {
        let openSet = [this.start];
        this.start.h = this.heuristic(this.start, this.end);
        
        while (openSet.length > 0 && this.isSearching) {
            // h値が最小のノードを選択（ヒューリスティックのみ）
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].h < current.h) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            if (current === this.end) {
                this.reconstructPath(current);
                this.isSearching = false;
                this.searchComplete = true;
                return;
            }
            
            openSet.splice(currentIndex, 1);
            current.closed = true;
            this.visitedNodes.push(current);
            
            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                if (neighbor.closed) continue;
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                    this.searchingNodes.push(neighbor);
                    neighbor.h = this.heuristic(neighbor, this.end);
                    neighbor.previous = current;
                }
            }
            
            await this.delay(this.animationSpeed);
        }
        
        this.isSearching = false;
        this.searchComplete = true;
    }
    
    reconstructPath(endNode) {
        this.path = [];
        let current = endNode;
        
        while (current) {
            this.path.unshift(current);
            current = current.previous;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    draw() {
        // グリッドの描画
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let node = this.grid[i][j];
                let x = i * this.cellSize;
                let y = j * this.cellSize;
                
                // 背景色
                if (node.isWall) {
                    fill(50);
                } else if (node.isStart) {
                    fill(0, 255, 0);
                } else if (node.isEnd) {
                    fill(255, 0, 0);
                } else if (node.pathColor) {
                    // 比較モードでの経路表示
                    fill(node.pathColor[0], node.pathColor[1], node.pathColor[2], 200);
                } else if (this.path.includes(node)) {
                    fill(255, 255, 0);
                } else if (node.visitedColor) {
                    // 比較モードでの訪問済みノード表示
                    fill(node.visitedColor[0], node.visitedColor[1], node.visitedColor[2], 100);
                } else if (this.visitedNodes.includes(node)) {
                    fill(100, 150, 255, 150);
                } else if (this.searchingNodes.includes(node)) {
                    fill(150, 200, 255, 100);
                } else {
                    fill(255);
                }
                
                noStroke();
                rect(x, y, this.cellSize - 1, this.cellSize - 1);
                
                // コスト表示（デバッグ用）
                if (this.isSearching || this.searchComplete) {
                    if (node.g !== Infinity && !node.isWall) {
                        fill(0);
                        textSize(8);
                        textAlign(CENTER, CENTER);
                        text(node.g.toFixed(0), x + this.cellSize/2, y + this.cellSize/2);
                    }
                }
            }
        }
        
        // グリッド線
        stroke(200);
        strokeWeight(0.5);
        for (let i = 0; i <= this.cols; i++) {
            line(i * this.cellSize, 0, i * this.cellSize, this.rows * this.cellSize);
        }
        for (let j = 0; j <= this.rows; j++) {
            line(0, j * this.cellSize, this.cols * this.cellSize, j * this.cellSize);
        }
        
        // クリックエフェクト描画
        if (this.clickEffect.active) {
            push();
            noFill();
            stroke(255, 100, 0);
            strokeWeight(3);
            ellipse(this.clickEffect.x, this.clickEffect.y, this.clickEffect.radius * 2);
            
            stroke(255, 200, 100);
            strokeWeight(1);
            ellipse(this.clickEffect.x, this.clickEffect.y, this.clickEffect.radius * 1.5);
            pop();
            
            // エフェクトのアニメーション
            this.clickEffect.radius += 3;
            if (this.clickEffect.radius > 50) {
                this.clickEffect.active = false;
            }
        }
    }
}

class Node {
    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.f = 0;
        this.g = Infinity;
        this.h = 0;
        this.previous = null;
        this.isWall = false;
        this.isStart = false;
        this.isEnd = false;
        this.visited = false;
        this.closed = false;
        this.pathColor = null;
        this.visitedColor = null;
    }
    
    reset() {
        this.f = 0;
        this.g = Infinity;
        this.h = 0;
        this.previous = null;
        this.visited = false;
        this.closed = false;
        this.isWall = false;
        this.isStart = false;
        this.isEnd = false;
        this.pathColor = null;
        this.visitedColor = null;
    }
}

// P5.js グローバル変数と関数
let grid;
let mode = 'wall'; // 'wall', 'start', 'end'

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    let cellSize = 20;
    let cols = floor(width * 0.8 / cellSize);
    let rows = floor(height * 0.7 / cellSize);
    
    grid = new PathfindingGrid(cols, rows, cellSize);
    
    // 自動的に障害物を生成
    grid.generateRandomObstacles(0.25); // 25%の密度で障害物を配置
    
    // 少し遅延してから自動的に探索を開始
    setTimeout(() => {
        grid.startSearch();
    }, 500);
}

function draw() {
    background(240);
    
    push();
    translate((width - grid.cols * grid.cellSize) / 2, 50);
    grid.draw();
    pop();
    
    drawUI();
}

function drawUI() {
    // タイトル
    fill(0);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(24);
    text('Shortest Path Algorithms', width/2, 10);
    
    // インタラクション案内
    if (frameCount < 300) { // 最初の5秒間表示
        push();
        textAlign(CENTER, CENTER);
        textSize(20);
        fill(255, 100, 0, map(frameCount, 0, 300, 255, 0));
        text('🎯 CLICK ANYWHERE for Dynamic Algorithm Demo!', width/2, height/2 - 120);
        
        textSize(14);
        fill(100, 150, 255, map(frameCount, 0, 300, 255, 0));
        text('Each click generates new maze + random algorithm', width/2, height/2 - 95);
        pop();
    }
    
    // アルゴリズム情報
    textAlign(LEFT, TOP);
    textSize(14);
    let infoY = height - 180;
    
    fill(0);
    text(`Algorithm: ${grid.algorithm.toUpperCase()}`, 20, infoY);
    text(`Heuristic: ${grid.heuristicType}`, 20, infoY + 20);
    text(`Diagonal: ${grid.allowDiagonal ? 'ON' : 'OFF'}`, 20, infoY + 40);
    text(`Speed: ${grid.animationSpeed}ms`, 20, infoY + 60);
    text(`Mode: ${mode.toUpperCase()}`, 20, infoY + 80);
    
    if (grid.searchComplete && grid.path.length > 0) {
        text(`Path Length: ${grid.path.length - 1}`, 20, infoY + 100);
        text(`Nodes Visited: ${grid.visitedNodes.length}`, 20, infoY + 120);
    }
    
    // 比較結果の表示
    if (grid.comparisonResults.length > 0) {
        text('Heuristic Comparison Results:', 20, infoY + 140);
        for (let i = 0; i < grid.comparisonResults.length; i++) {
            let result = grid.comparisonResults[i];
            fill(result.color[0], result.color[1], result.color[2]);
            text(`${result.heuristic}: Path=${result.pathLength}, Visited=${result.nodesVisited}, Time=${result.timeTaken}ms`, 
                 20, infoY + 160 + i * 15);
        }
        fill(0); // Reset color
    }
    
    // 操作説明
    textAlign(RIGHT, TOP);
    text('Controls:', width - 20, infoY);
    text('[1-5] Select Algorithm', width - 20, infoY + 20);
    text('[H] Change Heuristic', width - 20, infoY + 40);
    text('[D] Toggle Diagonal', width - 20, infoY + 60);
    text('[Space] Start Search', width - 20, infoY + 80);
    text('[R] Reset | [C] Clear Walls', width - 20, infoY + 100);
    text('[M] Generate Maze', width - 20, infoY + 120);
    text('[W/S/E] Change Mode', width - 20, infoY + 140);
    text('Click: Place Wall/Start/End', width - 20, infoY + 160);
    
    // アルゴリズムの説明
    textAlign(CENTER, TOP);
    textSize(12);
    fill(100);
    let desc = getAlgorithmDescription();
    text(desc, width/2, height - 40);
}

function getAlgorithmDescription() {
    switch (grid.algorithm) {
        case 'astar':
            return 'A* - Uses both distance from start (g) and heuristic to goal (h). Optimal and efficient.';
        case 'dijkstra':
            return 'Dijkstra - Uses only distance from start. Guarantees shortest path but explores more nodes.';
        case 'bfs':
            return 'BFS - Explores all nodes at current depth before moving deeper. Unweighted shortest path.';
        case 'dfs':
            return 'DFS - Explores as far as possible along each branch. Not optimal for shortest path.';
        case 'greedy':
            return 'Greedy Best-First - Uses only heuristic to goal. Fast but not guaranteed optimal.';
        default:
            return '';
    }
}

function mousePressed() {
    let offsetX = (width - grid.cols * grid.cellSize) / 2;
    let offsetY = 50;
    let gridX = floor((mouseX - offsetX) / grid.cellSize);
    let gridY = floor((mouseY - offsetY) / grid.cellSize);
    
    if (gridX >= 0 && gridX < grid.cols && gridY >= 0 && gridY < grid.rows) {
        // クリックエフェクトを開始
        grid.clickEffect = {
            active: true,
            x: gridX * grid.cellSize + grid.cellSize / 2,
            y: gridY * grid.cellSize + grid.cellSize / 2,
            radius: 0
        };
        
        // クリック時に即座にダイナミックな反応
        grid.generateRandomObstacles(random(0.15, 0.35)); // ランダム密度のマップ生成
        
        // アルゴリズムとヒューリスティックをランダム選択
        let algorithms = ['astar', 'dijkstra', 'bfs', 'greedy'];
        let heuristics = ['manhattan', 'euclidean', 'octile', 'chebyshev'];
        
        grid.algorithm = algorithms[floor(random(algorithms.length))];
        grid.heuristicType = heuristics[floor(random(heuristics.length))];
        
        // 視覚的フィードバック用のフラッシュ効果
        let originalBackground = document.body.style.backgroundColor;
        document.body.style.backgroundColor = `hsl(${random(360)}, 70%, 95%)`;
        setTimeout(() => {
            document.body.style.backgroundColor = originalBackground;
        }, 150);
        
        // 短い遅延後に探索開始
        setTimeout(() => {
            grid.startSearch();
        }, 300);
        
        // 元の機能も保持（wallモードのみ）
        if (mode === 'wall') {
            grid.toggleWall(gridX, gridY);
        } else if (mode === 'start') {
            grid.setStart(gridX, gridY);
        } else if (mode === 'end') {
            grid.setEnd(gridX, gridY);
        }
    }
}

function mouseDragged() {
    if (mode === 'wall') {
        let gridX = floor((mouseX - (width - grid.cols * grid.cellSize) / 2) / grid.cellSize);
        let gridY = floor((mouseY - 50) / grid.cellSize);
        
        if (gridX >= 0 && gridX < grid.cols && gridY >= 0 && gridY < grid.rows) {
            let node = grid.grid[gridX][gridY];
            if (!node.isStart && !node.isEnd && !node.isWall) {
                grid.toggleWall(gridX, gridY);
            }
        }
    }
}

function keyPressed() {
    if (key === ' ') {
        grid.startSearch();
    } else if (key === 'r' || key === 'R') {
        grid.reset();
    } else if (key === 'c' || key === 'C') {
        grid.clearWalls();
    } else if (key === 'm' || key === 'M') {
        grid.generateMaze();
    } else if (key === 'w' || key === 'W') {
        mode = 'wall';
    } else if (key === 's' || key === 'S') {
        mode = 'start';
    } else if (key === 'e' || key === 'E') {
        mode = 'end';
    } else if (key === 'd' || key === 'D') {
        grid.allowDiagonal = !grid.allowDiagonal;
        grid.reset();
    } else if (key === 'h' || key === 'H') {
        // ヒューリスティックを切り替え
        let heuristics = ['manhattan', 'euclidean', 'octile', 'chebyshev'];
        let currentIndex = heuristics.indexOf(grid.heuristicType);
        grid.heuristicType = heuristics[(currentIndex + 1) % heuristics.length];
        grid.reset();
    } else if (key === '1') {
        grid.algorithm = 'astar';
        grid.reset();
    } else if (key === '2') {
        grid.algorithm = 'dijkstra';
        grid.reset();
    } else if (key === '3') {
        grid.algorithm = 'bfs';
        grid.reset();
    } else if (key === '4') {
        grid.algorithm = 'dfs';
        grid.reset();
    } else if (key === '5') {
        grid.algorithm = 'greedy';
        grid.reset();
    } else if (keyCode === UP_ARROW) {
        grid.animationSpeed = max(0, grid.animationSpeed - 10);
    } else if (keyCode === DOWN_ARROW) {
        grid.animationSpeed = min(100, grid.animationSpeed + 10);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}