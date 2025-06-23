let cloth = {
    width: 20,
    height: 15,
    spacing: 20,
    points: [],
    constraints: []
};

let gravity = 0.3;
let wind = {x: 0, y: 0};
let damping = 0.998;
let iterations = 1;
let tearDistance = 50;
let mouseInfluence = 60;
let isPinned = true;
let frameTime = 1/60; // Fixed timestep for stability

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    resetCloth(); // ロード時にリセット
    background(0);
}

function resetCloth() {
    initializeCloth();
}

function draw() {
    background(0, 0, 8, 40);
    
    // 風の更新
    updateWind();
    
    // 物理演算
    for (let iteration = 0; iteration < iterations; iteration++) {
        updatePhysics();
        satisfyConstraints();
    }
    
    // マウスとの相互作用
    handleMouseInteraction();
    
    // 描画
    drawCloth();
    drawUI();
}

function initializeCloth() {
    cloth.points = [];
    cloth.constraints = [];
    
    let startX = (width - cloth.width * cloth.spacing) / 2;
    let startY = 100;
    
    // 点を作成
    for (let y = 0; y < cloth.height; y++) {
        for (let x = 0; x < cloth.width; x++) {
            let pointX = startX + x * cloth.spacing;
            let pointY = startY + y * cloth.spacing;
            cloth.points.push({
                x: pointX,
                y: pointY,
                oldX: pointX - random(-1, 1), // Add slight randomness to prevent perfect alignment
                oldY: pointY - random(-1, 1),
                pinned: (y === 0 && isPinned) && (x % 2 === 0), // Pin every other point on top row
                mass: 1
            });
        }
    }
    
    // 制約を作成
    for (let y = 0; y < cloth.height; y++) {
        for (let x = 0; x < cloth.width; x++) {
            if (x < cloth.width - 1) {
                // 水平制約
                addConstraint(getIndex(x, y), getIndex(x + 1, y));
            }
            if (y < cloth.height - 1) {
                // 垂直制約
                addConstraint(getIndex(x, y), getIndex(x, y + 1));
            }
            // 斜め制約（構造安定性のため）
            if (x < cloth.width - 1 && y < cloth.height - 1) {
                addConstraint(getIndex(x, y), getIndex(x + 1, y + 1));
                addConstraint(getIndex(x + 1, y), getIndex(x, y + 1));
            }
        }
    }
}

function getIndex(x, y) {
    return y * cloth.width + x;
}

function addConstraint(p1Index, p2Index) {
    let p1 = cloth.points[p1Index];
    let p2 = cloth.points[p2Index];
    let distance = dist(p1.x, p1.y, p2.x, p2.y);
    
    cloth.constraints.push({
        p1: p1Index,
        p2: p2Index,
        restLength: distance,
        broken: false
    });
}

function updateWind() {
    // More gentle and realistic wind patterns
    wind.x = sin(frameCount * 0.01) * 0.2 + cos(frameCount * 0.005) * 0.15;
    wind.y = sin(frameCount * 0.008) * 0.05; // Reduced vertical wind
}

function updatePhysics() {
    for (let point of cloth.points) {
        if (!point.pinned) {
            // Store current position
            let tempX = point.x;
            let tempY = point.y;
            
            // Verlet integration: current_pos = current_pos + (current_pos - old_pos) * damping + acceleration * dt^2
            let velX = (point.x - point.oldX) * damping;
            let velY = (point.y - point.oldY) * damping;
            
            // Update position
            point.x += velX + gravity * frameTime * frameTime * 0.5; // Add gravity acceleration
            point.y += velY + gravity * frameTime * frameTime;
            
            // Add wind force
            point.x += wind.x * frameTime;
            point.y += wind.y * frameTime;
            
            // Update old position
            point.oldX = tempX;
            point.oldY = tempY;
            
            // Keep points within canvas bounds
            if (point.x < 10) {
                point.x = 10;
                point.oldX = point.x + (point.x - point.oldX) * 0.8; // Bounce damping
            }
            if (point.x > width - 10) {
                point.x = width - 10;
                point.oldX = point.x + (point.x - point.oldX) * 0.8;
            }
            if (point.y > height - 10) {
                point.y = height - 10;
                point.oldY = point.y + (point.y - point.oldY) * 0.8;
            }
        }
    }
}

function satisfyConstraints() {
    for (let constraint of cloth.constraints) {
        if (constraint.broken) continue;
        
        let p1 = cloth.points[constraint.p1];
        let p2 = cloth.points[constraint.p2];
        
        // Check if points exist
        if (!p1 || !p2) continue;
        
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let distance = sqrt(dx * dx + dy * dy);
        
        // Handle tearing
        if (distance > tearDistance) {
            constraint.broken = true;
            continue;
        }
        
        // Avoid division by zero
        if (distance < 0.001) continue;
        
        let difference = constraint.restLength - distance;
        let percent = difference / distance * 0.3; // Reduced stiffness for softer cloth
        let offsetX = dx * percent;
        let offsetY = dy * percent;
        
        // Calculate mass ratio for more realistic physics
        let totalMass = p1.mass + p2.mass;
        let p1Ratio = p2.mass / totalMass;
        let p2Ratio = p1.mass / totalMass;
        
        if (!p1.pinned) {
            p1.x -= offsetX * p1Ratio;
            p1.y -= offsetY * p1Ratio;
        }
        if (!p2.pinned) {
            p2.x += offsetX * p2Ratio;
            p2.y += offsetY * p2Ratio;
        }
    }
}

function handleMouseInteraction() {
    if (mouseIsPressed) {
        for (let point of cloth.points) {
            let distance = dist(mouseX, mouseY, point.x, point.y);
            
            if (distance < mouseInfluence) {
                if (mouseButton === LEFT) {
                    // 引っ張る
                    let force = map(distance, 0, mouseInfluence, 1, 0);
                    let dx = mouseX - point.x;
                    let dy = mouseY - point.y;
                    
                    if (!point.pinned) {
                        point.x += dx * force * 0.1;
                        point.y += dy * force * 0.1;
                    }
                } else if (mouseButton === RIGHT) {
                    // 押す
                    let force = map(distance, 0, mouseInfluence, 1, 0);
                    let dx = point.x - mouseX;
                    let dy = point.y - mouseY;
                    let length = sqrt(dx * dx + dy * dy);
                    
                    if (length > 0 && !point.pinned) {
                        point.x += (dx / length) * force * 20;
                        point.y += (dy / length) * force * 20;
                    }
                }
            }
        }
    }
}

function drawCloth() {
    // 制約（線）を描画
    strokeWeight(1);
    for (let constraint of cloth.constraints) {
        if (constraint.broken) continue;
        
        let p1 = cloth.points[constraint.p1];
        let p2 = cloth.points[constraint.p2];
        
        // 点が存在しない場合はスキップ
        if (!p1 || !p2) continue;
        
        let distance = dist(p1.x, p1.y, p2.x, p2.y);
        let strain = distance / constraint.restLength;
        
        // ストレインに基づく色
        let hue = map(strain, 0.8, 1.5, 240, 0);
        hue = constrain(hue, 0, 240);
        let saturation = map(strain, 0.8, 1.2, 30, 90);
        
        stroke(hue, saturation, 80, 60);
        line(p1.x, p1.y, p2.x, p2.y);
    }
    
    // 三角形で布の面を描画
    drawClothSurface();
    
    // 点を描画
    for (let point of cloth.points) {
        if (point.pinned) {
            fill(0, 100, 100, 80);
            stroke(0, 80, 100);
            strokeWeight(2);
        } else {
            fill(60, 80, 90, 60);
            noStroke();
        }
        ellipse(point.x, point.y, point.pinned ? 6 : 3);
    }
    
    // マウス影響範囲
    if (mouseIsPressed) {
        stroke(mouseButton === LEFT ? 120 : 0, 80, 100, 40);
        strokeWeight(1);
        noFill();
        ellipse(mouseX, mouseY, mouseInfluence * 2);
    }
}

function drawClothSurface() {
    // グラデーション効果で布の面を描画
    for (let y = 0; y < cloth.height - 1; y++) {
        for (let x = 0; x < cloth.width - 1; x++) {
            let p1 = cloth.points[getIndex(x, y)];
            let p2 = cloth.points[getIndex(x + 1, y)];
            let p3 = cloth.points[getIndex(x, y + 1)];
            let p4 = cloth.points[getIndex(x + 1, y + 1)];
            
            // 全ての点が存在するかチェック
            if (p1 && p2 && p3 && p4) {
                // 位置に基づく色の変化
                let avgY = (p1.y + p2.y + p3.y + p4.y) / 4;
                let hue = map(avgY, 0, height, 240, 300); // 青から紫
                let brightness = map(avgY, 0, height, 80, 40);
                
                fill(hue, 60, brightness, 60);
                noStroke();
                
                // 2つの三角形で四角形を描画
                beginShape(TRIANGLES);
                vertex(p1.x, p1.y);
                vertex(p2.x, p2.y);
                vertex(p3.x, p3.y);
                
                vertex(p2.x, p2.y);
                vertex(p3.x, p3.y);
                vertex(p4.x, p4.y);
                endShape();
            }
        }
    }
}

function drawUI() {
    // 背景
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, 300, 200);
    
    fill(0, 0, 100, 90);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Cloth Simulation", 20, 20);
    
    textSize(12);
    text(`Gravity: ${gravity.toFixed(2)}`, 20, 50);
    text(`Damping: ${damping.toFixed(2)}`, 20, 70);
    text(`Wind: (${wind.x.toFixed(2)}, ${wind.y.toFixed(2)})`, 20, 90);
    text(`Iterations: ${iterations}`, 20, 110);
    text(`Tear Distance: ${tearDistance}`, 20, 130);
    text(`Points: ${cloth.points.length}`, 20, 150);
    
    let brokenConstraints = cloth.constraints.filter(c => c.broken).length;
    text(`Broken: ${brokenConstraints}/${cloth.constraints.length}`, 20, 170);
    
    // コントロール情報
    fill(0, 0, 100, 80);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`Controls:`, 20, height - 160);
    text(`LEFT DRAG: Pull cloth`, 20, height - 140);
    text(`RIGHT DRAG: Push cloth`, 20, height - 120);
    text(`G/F: Gravity | D/S: Damping`, 20, height - 100);
    text(`I/K: Iterations | T/R: Tear resistance`, 20, height - 80);
    text(`P: Toggle pins | SPACE: Reset`, 20, height - 60);
    text(`W: Wind burst`, 20, height - 40);
}

function keyPressed() {
    if (key === 'g' || key === 'G') {
        gravity = min(gravity + 0.05, 1);
    } else if (key === 'f' || key === 'F') {
        gravity = max(gravity - 0.05, 0);
    } else if (key === 'd' || key === 'D') {
        damping = min(damping + 0.01, 0.99);
    } else if (key === 's' || key === 'S') {
        damping = max(damping - 0.01, 0.8);
    } else if (key === 'i' || key === 'I') {
        iterations = min(iterations + 1, 10);
    } else if (key === 'k' || key === 'K') {
        iterations = max(iterations - 1, 1);
    } else if (key === 't' || key === 'T') {
        tearDistance = min(tearDistance + 2, 50);
    } else if (key === 'r' || key === 'R') {
        tearDistance = max(tearDistance - 2, 10);
    } else if (key === 'p' || key === 'P') {
        isPinned = !isPinned;
        initializeCloth();
    } else if (key === ' ') {
        resetCloth();
    } else if (key === 'w' || key === 'W') {
        // 風の突風
        wind.x += random(-2, 2);
        wind.y += random(-1, 1);
    }
}

function mousePressed() {
    // マウス位置の近くの点を固定/固定解除
    if (keyIsDown(CONTROL)) {
        for (let point of cloth.points) {
            let distance = dist(mouseX, mouseY, point.x, point.y);
            if (distance < 20) {
                point.pinned = !point.pinned;
                break;
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    initializeCloth();
}