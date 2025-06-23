let trees = [];
let maxDepth = 8;
let branchAngle = 0.4;
let lengthRatio = 0.67;
let treeStyle = 'classic';
let colorMode = 'natural';
let animationMode = 'static';
let time = 0;
let windStrength = 0;
let showLeaves = true;
let seasonalMode = false;
let season = 0; // 0-1 春から冬へ

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    generateTrees();
    background(20, 80, 5);
}

function draw() {
    // 背景の季節変化
    drawBackground();
    
    time += 0.01;
    
    if (seasonalMode) {
        season = (sin(time * 0.2) + 1) / 2; // 0-1の間で変化
    }
    
    // 風の効果
    if (animationMode === 'wind') {
        windStrength = sin(time * 2) * 0.1 + noise(time) * 0.05;
    } else {
        windStrength = 0;
    }
    
    // 木の描画
    drawTrees();
    drawUI();
}

function drawBackground() {
    let bgColor = { h: 20, s: 80, b: 5 };
    
    if (seasonalMode) {
        // 季節による背景色の変化
        if (season < 0.25) { // 春
            bgColor.h = 120;
            bgColor.s = 60;
            bgColor.b = 10;
        } else if (season < 0.5) { // 夏
            bgColor.h = 200;
            bgColor.s = 80;
            bgColor.b = 15;
        } else if (season < 0.75) { // 秋
            bgColor.h = 30;
            bgColor.s = 70;
            bgColor.b = 8;
        } else { // 冬
            bgColor.h = 240;
            bgColor.s = 30;
            bgColor.b = 12;
        }
    }
    
    background(bgColor.h, bgColor.s, bgColor.b);
}

function generateTrees() {
    trees = [];
    
    let numTrees = 3;
    for (let i = 0; i < numTrees; i++) {
        let tree = {
            x: (i + 1) * width / (numTrees + 1),
            y: height - 50,
            baseLength: random(80, 120),
            baseWidth: random(8, 15),
            angle: 0,
            branches: []
        };
        
        // ルートブランチから開始
        generateBranch(tree, tree.x, tree.y, -PI/2, tree.baseLength, tree.baseWidth, 0);
        trees.push(tree);
    }
}

function generateBranch(tree, x, y, angle, length, width, depth) {
    if (depth >= maxDepth || length < 3) return;
    
    let branch = {
        x1: x,
        y1: y,
        x2: x + cos(angle) * length,
        y2: y + sin(angle) * length,
        angle: angle,
        length: length,
        width: width,
        depth: depth,
        children: [],
        hasLeaves: depth >= maxDepth - 2,
        leafCount: random(3, 8),
        leafPositions: []
    };
    
    // 葉っぱの位置を事前計算
    if (branch.hasLeaves && showLeaves) {
        for (let i = 0; i < branch.leafCount; i++) {
            let leafPos = {
                x: lerp(branch.x1, branch.x2, random(0.5, 1)),
                y: lerp(branch.y1, branch.y2, random(0.5, 1)),
                size: random(3, 8),
                angle: random(-PI, PI),
                color: getLeafColor(depth)
            };
            branch.leafPositions.push(leafPos);
        }
    }
    
    tree.branches.push(branch);
    
    // スタイルに応じた分岐
    let numChildren = getBranchCount(treeStyle, depth);
    
    for (let i = 0; i < numChildren; i++) {
        let childAngle = angle + getBranchAngle(treeStyle, i, numChildren, depth);
        let childLength = length * getLengthRatio(treeStyle, depth);
        let childWidth = width * 0.7;
        
        generateBranch(tree, branch.x2, branch.y2, childAngle, childLength, childWidth, depth + 1);
    }
}

function getBranchCount(style, depth) {
    switch (style) {
        case 'classic':
            return depth < 3 ? 2 : random() > 0.3 ? 2 : 1;
        case 'dense':
            return depth < 4 ? 3 : 2;
        case 'sparse':
            return depth < 2 ? 2 : 1;
        case 'asymmetric':
            return random() > 0.4 ? 2 : 1;
        case 'palm':
            return depth === 0 ? 5 : depth < 2 ? 3 : 0;
        case 'pine':
            return depth < 5 ? floor(random(3, 6)) : 0;
        default:
            return 2;
    }
}

function getBranchAngle(style, index, total, depth) {
    let baseAngle = branchAngle * (1 + depth * 0.1);
    
    switch (style) {
        case 'classic':
            return (index === 0 ? -baseAngle : baseAngle) + random(-0.2, 0.2);
        case 'dense':
            return map(index, 0, total - 1, -baseAngle * 1.5, baseAngle * 1.5);
        case 'sparse':
            return (index === 0 ? -baseAngle * 0.5 : baseAngle * 0.5);
        case 'asymmetric':
            return index === 0 ? -baseAngle * 0.3 : baseAngle * 1.2;
        case 'palm':
            return map(index, 0, total - 1, -PI/3, PI/3);
        case 'pine':
            return map(index, 0, total - 1, -PI/2, PI/2) + random(-0.3, 0.3);
        default:
            return (index === 0 ? -baseAngle : baseAngle);
    }
}

function getLengthRatio(style, depth) {
    switch (style) {
        case 'classic':
            return lengthRatio + random(-0.1, 0.1);
        case 'dense':
            return lengthRatio * 0.9;
        case 'sparse':
            return lengthRatio * 1.1;
        case 'asymmetric':
            return lengthRatio + random(-0.2, 0.2);
        case 'palm':
            return depth === 0 ? 0.8 : 0.6;
        case 'pine':
            return 0.8 + random(-0.1, 0.1);
        default:
            return lengthRatio;
    }
}

function drawTrees() {
    for (let tree of trees) {
        drawTree(tree);
    }
}

function drawTree(tree) {
    // 枝の描画
    for (let branch of tree.branches) {
        drawBranch(branch);
    }
    
    // 葉っぱの描画
    if (showLeaves) {
        for (let branch of tree.branches) {
            if (branch.hasLeaves) {
                drawLeaves(branch);
            }
        }
    }
}

function drawBranch(branch) {
    let windOffset = 0;
    if (animationMode === 'wind' && branch.depth > 2) {
        windOffset = sin(time * 3 + branch.depth) * windStrength * (branch.depth * 2);
    }
    
    let x1 = branch.x1;
    let y1 = branch.y1;
    let x2 = branch.x2 + windOffset;
    let y2 = branch.y2;
    
    // 枝の色
    let branchColor = getBranchColor(branch.depth);
    
    stroke(branchColor.h, branchColor.s, branchColor.b, 90);
    strokeWeight(branch.width);
    strokeCap(ROUND);
    
    if (animationMode === 'growth') {
        // 成長アニメーション
        let growthProgress = constrain((time * 2 - branch.depth * 0.5), 0, 1);
        x2 = lerp(x1, x2, growthProgress);
        y2 = lerp(y1, y2, growthProgress);
    }
    
    line(x1, y1, x2, y2);
    
    // テクスチャの追加
    if (branch.depth === 0 && branch.width > 5) {
        // 幹のテクスチャ
        drawBarkTexture(branch);
    }
}

function drawBarkTexture(branch) {
    push();
    translate(branch.x1, branch.y1);
    rotate(branch.angle);
    
    stroke(0, 0, 20, 40);
    strokeWeight(1);
    
    for (let i = 0; i < branch.length; i += 8) {
        let offset = sin(i * 0.1) * 2;
        line(-branch.width/2 + offset, i, branch.width/2 + offset, i);
    }
    
    pop();
}

function drawLeaves(branch) {
    for (let leaf of branch.leafPositions) {
        let windOffset = 0;
        if (animationMode === 'wind') {
            windOffset = sin(time * 4 + leaf.x * 0.01) * windStrength * 5;
        }
        
        push();
        translate(leaf.x + windOffset, leaf.y);
        rotate(leaf.angle + windOffset * 0.5);
        
        let leafColor = leaf.color;
        if (seasonalMode) {
            leafColor = getSeasonalLeafColor(leafColor);
        }
        
        fill(leafColor.h, leafColor.s, leafColor.b, 80);
        noStroke();
        
        // 葉っぱの形状
        switch (treeStyle) {
            case 'classic':
            case 'sparse':
                ellipse(0, 0, leaf.size, leaf.size * 0.7);
                break;
            case 'palm':
                beginShape();
                vertex(-leaf.size/2, 0);
                vertex(0, -leaf.size);
                vertex(leaf.size/2, 0);
                vertex(0, leaf.size * 0.3);
                endShape(CLOSE);
                break;
            case 'pine':
                triangle(-leaf.size/3, 0, leaf.size/3, 0, 0, -leaf.size);
                break;
            default:
                ellipse(0, 0, leaf.size);
        }
        
        pop();
    }
}

function getBranchColor(depth) {
    let color = { h: 30, s: 60, b: 40 };
    
    switch (colorMode) {
        case 'natural':
            color.h = 30 + depth * 5;
            color.s = 60 - depth * 5;
            color.b = 40 - depth * 3;
            break;
        case 'autumn':
            color.h = 20 + depth * 3;
            color.s = 70;
            color.b = 30;
            break;
        case 'winter':
            color.h = 0;
            color.s = 0;
            color.b = 30 + depth * 5;
            break;
        case 'fantasy':
            color.h = (depth * 60) % 360;
            color.s = 80;
            color.b = 60;
            break;
    }
    
    return color;
}

function getLeafColor(depth) {
    let color = { h: 120, s: 80, b: 70 };
    
    switch (colorMode) {
        case 'natural':
            color.h = 120 + random(-20, 20);
            color.s = 80 + random(-20, 20);
            color.b = 70 + random(-20, 20);
            break;
        case 'autumn':
            let autumnColors = [
                { h: 60, s: 100, b: 90 },  // 黄
                { h: 30, s: 100, b: 80 },  // オレンジ
                { h: 0, s: 100, b: 70 },   // 赤
                { h: 20, s: 80, b: 60 }    // 茶
            ];
            color = random(autumnColors);
            break;
        case 'winter':
            color.h = 0;
            color.s = 0;
            color.b = 90;
            break;
        case 'fantasy':
            color.h = random(360);
            color.s = 100;
            color.b = 80;
            break;
    }
    
    return color;
}

function getSeasonalLeafColor(baseColor) {
    let color = Object.assign({}, baseColor);
    
    if (season < 0.25) { // 春 - 新緑
        color.h = 120;
        color.s = 60;
        color.b = 90;
    } else if (season < 0.5) { // 夏 - 濃い緑
        color.h = 120;
        color.s = 80;
        color.b = 70;
    } else if (season < 0.75) { // 秋 - 紅葉
        let autumn = map(season, 0.5, 0.75, 0, 1);
        color.h = lerp(120, 30, autumn);
        color.s = 100;
        color.b = 80;
    } else { // 冬 - 落葉
        color.b *= 0.3; // 暗くして落葉を表現
    }
    
    return color;
}

function drawUI() {
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, 320, 200);
    
    fill(0, 0, 100, 90);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Recursive Trees", 20, 20);
    
    textSize(12);
    text(`Style: ${treeStyle}`, 20, 50);
    text(`Color: ${colorMode}`, 20, 70);
    text(`Animation: ${animationMode}`, 20, 90);
    text(`Max Depth: ${maxDepth}`, 20, 110);
    text(`Branch Angle: ${branchAngle.toFixed(2)}`, 20, 130);
    text(`Leaves: ${showLeaves ? 'ON' : 'OFF'}`, 20, 150);
    text(`Seasonal: ${seasonalMode ? 'ON' : 'OFF'}`, 20, 170);
    
    // コントロール情報
    fill(0, 0, 100, 80);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`Controls:`, 20, height - 200);
    text(`1-6: Tree styles | Q-T: Color modes`, 20, height - 180);
    text(`+/-: Max depth | A/S: Branch angle`, 20, height - 160);
    text(`Z/X: Length ratio | L: Toggle leaves`, 20, height - 140);
    text(`SPACE: Regenerate | R: Reset settings`, 20, height - 120);
    text(`W: Wind animation | G: Growth animation`, 20, height - 100);
    text(`N: Seasonal mode | Click: New tree`, 20, height - 80);
    text(`F: Freeze/unfreeze`, 20, height - 60);
}

function keyPressed() {
    if (key === '1') {
        treeStyle = 'classic';
        generateTrees();
    } else if (key === '2') {
        treeStyle = 'dense';
        generateTrees();
    } else if (key === '3') {
        treeStyle = 'sparse';
        generateTrees();
    } else if (key === '4') {
        treeStyle = 'asymmetric';
        generateTrees();
    } else if (key === '5') {
        treeStyle = 'palm';
        generateTrees();
    } else if (key === '6') {
        treeStyle = 'pine';
        generateTrees();
    } else if (key === 'q' || key === 'Q') {
        colorMode = 'natural';
        generateTrees();
    } else if (key === 'w' || key === 'W') {
        animationMode = animationMode === 'wind' ? 'static' : 'wind';
    } else if (key === 'e' || key === 'E') {
        colorMode = 'autumn';
        generateTrees();
    } else if (key === 'r' || key === 'R') {
        maxDepth = 8;
        branchAngle = 0.4;
        lengthRatio = 0.67;
        generateTrees();
    } else if (key === 't' || key === 'T') {
        colorMode = 'winter';
        generateTrees();
    } else if (key === 'y' || key === 'Y') {
        colorMode = 'fantasy';
        generateTrees();
    } else if (key === '+' || key === '=') {
        maxDepth = min(maxDepth + 1, 12);
        generateTrees();
    } else if (key === '-') {
        maxDepth = max(maxDepth - 1, 3);
        generateTrees();
    } else if (key === 'a' || key === 'A') {
        branchAngle = min(branchAngle + 0.1, 1.5);
        generateTrees();
    } else if (key === 's' || key === 'S') {
        branchAngle = max(branchAngle - 0.1, 0.1);
        generateTrees();
    } else if (key === 'z' || key === 'Z') {
        lengthRatio = min(lengthRatio + 0.05, 0.9);
        generateTrees();
    } else if (key === 'x' || key === 'X') {
        lengthRatio = max(lengthRatio - 0.05, 0.3);
        generateTrees();
    } else if (key === 'l' || key === 'L') {
        showLeaves = !showLeaves;
        generateTrees();
    } else if (key === ' ') {
        generateTrees();
    } else if (key === 'g' || key === 'G') {
        animationMode = animationMode === 'growth' ? 'static' : 'growth';
        time = 0;
    } else if (key === 'n' || key === 'N') {
        seasonalMode = !seasonalMode;
    } else if (key === 'f' || key === 'F') {
        if (animationMode === 'static') {
            animationMode = 'wind';
        } else {
            animationMode = 'static';
        }
    }
}

function mousePressed() {
    // マウス位置に新しい木を追加
    let newTree = {
        x: mouseX,
        y: height - 50,
        baseLength: random(80, 120),
        baseWidth: random(8, 15),
        angle: 0,
        branches: []
    };
    
    generateBranch(newTree, newTree.x, newTree.y, -PI/2, newTree.baseLength, newTree.baseWidth, 0);
    trees.push(newTree);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    generateTrees();
}