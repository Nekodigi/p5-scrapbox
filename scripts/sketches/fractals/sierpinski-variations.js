let currentMode = 0;
let modes = ['triangle', 'carpet', 'gasket_chaos', 'tree'];
let modeNames = ['Sierpinski Triangle', 'Sierpinski Carpet', 'Chaos Game', 'Sierpinski Tree'];
let depth = 6;
let chaosPoints = [];
let currentPoint = null;
let animationSpeed = 5;
let isAnimating = true;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    background(0);
    
    initializeChaosGame();
}

function draw() {
    background(0, 0, 5, 40);
    
    translate(width/2, height/2);
    
    switch(modes[currentMode]) {
        case 'triangle':
            drawSierpinskiTriangle();
            break;
        case 'carpet':
            drawSierpinskiCarpet();
            break;
        case 'gasket_chaos':
            drawChaosGame();
            break;
        case 'tree':
            drawSierpinskiTree();
            break;
    }
    
    // UI情報
    resetMatrix();
    fill(0, 0, 100, 80);
    textAlign(LEFT, TOP);
    textSize(14);
    text(`Mode: ${modeNames[currentMode]}`, 20, 20);
    text(`Depth: ${depth}`, 20, 40);
    text(`Animation: ${isAnimating ? 'ON' : 'OFF'}`, 20, 60);
    
    text(`Controls:`, 20, height - 100);
    text(`TAB: Next mode | UP/DOWN: Change depth`, 20, height - 80);
    text(`SPACE: Toggle animation | R: Reset`, 20, height - 60);
    text(`C: Clear canvas`, 20, height - 40);
}

function drawSierpinskiTriangle() {
    let size = min(width, height) * 0.7;
    
    stroke(180 + frameCount * 0.5 % 180, 80, 90, 80);
    strokeWeight(1);
    noFill();
    
    drawTriangleFractal(0, -size/2, -size/2, size/2, size/2, size/2, depth);
}

function drawTriangleFractal(x1, y1, x2, y2, x3, y3, depth) {
    if (depth === 0) {
        let hue = (frameCount + depth * 30) % 360;
        stroke(hue, 70, 90, 70);
        
        beginShape();
        vertex(x1, y1);
        vertex(x2, y2);
        vertex(x3, y3);
        endShape(CLOSE);
    } else {
        let mx1 = (x1 + x2) / 2;
        let my1 = (y1 + y2) / 2;
        let mx2 = (x2 + x3) / 2;
        let my2 = (y2 + y3) / 2;
        let mx3 = (x3 + x1) / 2;
        let my3 = (y3 + y1) / 2;
        
        drawTriangleFractal(x1, y1, mx1, my1, mx3, my3, depth - 1);
        drawTriangleFractal(mx1, my1, x2, y2, mx2, my2, depth - 1);
        drawTriangleFractal(mx3, my3, mx2, my2, x3, y3, depth - 1);
    }
}

function drawSierpinskiCarpet() {
    let size = min(width, height) * 0.8;
    
    fill(240 + frameCount * 0.5 % 120, 80, 80, 80);
    noStroke();
    
    drawCarpetFractal(-size/2, -size/2, size, depth);
}

function drawCarpetFractal(x, y, size, depth) {
    if (depth === 0) {
        let hue = (frameCount + x + y) * 0.1 % 360;
        fill(hue, 70, 90, 60);
        rect(x, y, size, size);
    } else {
        let newSize = size / 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (!(i === 1 && j === 1)) { // 中央の正方形を除く
                    drawCarpetFractal(x + i * newSize, y + j * newSize, newSize, depth - 1);
                }
            }
        }
    }
}

function drawChaosGame() {
    let size = min(width, height) * 0.6;
    
    // 三角形の頂点
    let vertices = [
        {x: 0, y: -size/2},
        {x: -size/2, y: size/2},
        {x: size/2, y: size/2}
    ];
    
    // 頂点を描画
    for (let i = 0; i < vertices.length; i++) {
        fill(i * 120, 80, 100, 80);
        noStroke();
        ellipse(vertices[i].x, vertices[i].y, 10);
    }
    
    // カオスゲームの点を描画
    for (let point of chaosPoints) {
        let hue = (point.generation * 30) % 360;
        fill(hue, 80, 90, 60);
        noStroke();
        ellipse(point.x, point.y, 2);
    }
    
    // アニメーション
    if (isAnimating && frameCount % 2 === 0) {
        if (currentPoint) {
            let targetVertex = vertices[floor(random(3))];
            currentPoint = {
                x: (currentPoint.x + targetVertex.x) / 2,
                y: (currentPoint.y + targetVertex.y) / 2,
                generation: chaosPoints.length
            };
            chaosPoints.push(currentPoint);
            
            // 点数制限
            if (chaosPoints.length > 3000) {
                chaosPoints.splice(0, 100);
            }
        }
    }
    
    // 現在の点をハイライト
    if (currentPoint) {
        fill(60, 100, 100, 100);
        noStroke();
        ellipse(currentPoint.x, currentPoint.y, 6);
    }
}

function drawSierpinskiTree() {
    let length = min(width, height) * 0.3;
    
    stroke(120 + frameCount * 0.3 % 120, 80, 90, 80);
    strokeWeight(2);
    
    rotate(PI);
    drawTreeBranch(0, 0, length, 0, depth);
}

function drawTreeBranch(x, y, length, angle, depth) {
    if (depth === 0) return;
    
    let endX = x + cos(angle) * length;
    let endY = y + sin(angle) * length;
    
    let hue = (depth * 40 + frameCount * 0.5) % 360;
    stroke(hue, 80, 90, map(depth, 0, this.depth, 30, 90));
    strokeWeight(map(depth, 0, this.depth, 1, 3));
    
    line(x, y, endX, endY);
    
    let newLength = length * 0.7;
    let angleOffset = PI / 6;
    
    // 左の枝
    drawTreeBranch(endX, endY, newLength, angle - angleOffset, depth - 1);
    // 右の枝
    drawTreeBranch(endX, endY, newLength, angle + angleOffset, depth - 1);
    // 中央の枝（シェルピンスキーの特徴）
    if (depth > 2) {
        drawTreeBranch(endX, endY, newLength * 0.5, angle, depth - 2);
    }
}

function initializeChaosGame() {
    chaosPoints = [];
    let size = min(width, height) * 0.6;
    currentPoint = {
        x: random(-size/4, size/4),
        y: random(-size/4, size/4),
        generation: 0
    };
}

function keyPressed() {
    if (keyCode === TAB) {
        currentMode = (currentMode + 1) % modes.length;
        if (modes[currentMode] === 'gasket_chaos') {
            initializeChaosGame();
        }
    } else if (keyCode === UP_ARROW) {
        depth = min(depth + 1, 8);
    } else if (keyCode === DOWN_ARROW) {
        depth = max(depth - 1, 1);
    } else if (key === ' ') {
        isAnimating = !isAnimating;
    } else if (key === 'r' || key === 'R') {
        depth = 6;
        if (modes[currentMode] === 'gasket_chaos') {
            initializeChaosGame();
        }
    } else if (key === 'c' || key === 'C') {
        background(0);
        if (modes[currentMode] === 'gasket_chaos') {
            chaosPoints = [];
        }
    } else if (key >= '1' && key <= '4') {
        currentMode = parseInt(key) - 1;
        if (modes[currentMode] === 'gasket_chaos') {
            initializeChaosGame();
        }
    }
}

function mousePressed() {
    if (modes[currentMode] === 'gasket_chaos') {
        // マウスクリックで新しい開始点を設定
        currentPoint = {
            x: mouseX - width/2,
            y: mouseY - height/2,
            generation: 0
        };
        chaosPoints = [];
    } else {
        // 他のモードでは次のバリエーションへ
        currentMode = (currentMode + 1) % modes.length;
        if (modes[currentMode] === 'gasket_chaos') {
            initializeChaosGame();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (modes[currentMode] === 'gasket_chaos') {
        initializeChaosGame();
    }
}