let bodies = [];
let trails = [];
let G = 10.0; // 重力定数を大幅に増加してスイングバイ効果を強化
let timeScale = 1;
let showVectors = false;
let showOrbits = true;
let centralMass = null;
let trailLength = 500; // 軌道の軌跡を長くして変化を見やすく
let showGravityField = true; // 重力場の可視化
let showInfluenceZones = true; // 影響圏の表示
let spacecraft = null; // スイングバイ用の宇宙船
let showPrediction = true; // 軌道予測の表示

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    initializeSolarSystem();
    background(0);
}

function draw() {
    background(0, 0, 5, 60);
    
    // 重力場の可視化
    if (showGravityField) {
        drawGravityField();
    }
    
    // 影響圏の表示
    if (showInfluenceZones) {
        drawInfluenceZones();
    }
    
    updatePhysics();
    drawTrails();
    
    // 軌道予測を表示
    if (showPrediction && spacecraft) {
        drawTrajectoryPrediction();
    }
    
    drawBodies();
    drawUI();
    
    // スイングバイ中の速度変化を表示
    if (spacecraft) {
        drawSwingByInfo();
    }
}

function initializeSolarSystem() {
    bodies = [];
    trails = [];
    
    // 中央の太陽
    centralMass = {
        x: width / 2,
        y: height / 2,
        vx: 0,
        vy: 0,
        mass: 100,
        radius: 20,
        hue: 60,
        name: "Sun",
        fixed: true
    };
    bodies.push(centralMass);
    trails.push([]);
    
    // 惑星を追加 - より大きな質量でスイングバイ効果を強化
    addPlanet(80, 10, 30, "Mercury");
    addPlanet(120, 15, 120, "Venus");
    addPlanet(160, 20, 180, "Earth");
    addPlanet(200, 12, 0, "Mars");
    addPlanet(280, 80, 40, "Jupiter"); // 木星の質量を大幅に増加
    addPlanet(350, 60, 220, "Saturn"); // 土星の質量を大幅に増加
    
    // 衛星を追加（地球の月） - より近く、より重く
    addMoon(3, 25, 1.5, 0, "Moon");
    // 木星の衛星たち
    addMoon(5, 35, 1, 120, "Io");
    addMoon(5, 45, 1, 240, "Europa");
}

function addPlanet(distance, mass, hue, name) {
    let angle = random(TWO_PI);
    let x = centralMass.x + cos(angle) * distance;
    let y = centralMass.y + sin(angle) * distance;
    
    // 円軌道の速度を計算
    let orbitalSpeed = sqrt(G * centralMass.mass / distance);
    let vx = -sin(angle) * orbitalSpeed;
    let vy = cos(angle) * orbitalSpeed;
    
    bodies.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: mass,
        radius: map(mass, 1, 25, 4, 20),
        hue: hue,
        name: name,
        fixed: false
    });
    
    trails.push([]);
}

function addMoon(planetIndex, distance, mass, hue, name) {
    if (planetIndex < bodies.length) {
        let planet = bodies[planetIndex];
        let angle = random(TWO_PI);
        let x = planet.x + cos(angle) * distance;
        let y = planet.y + sin(angle) * distance;
        
        let orbitalSpeed = sqrt(G * planet.mass / distance);
        let vx = planet.vx - sin(angle) * orbitalSpeed;
        let vy = planet.vy + cos(angle) * orbitalSpeed;
        
        bodies.push({
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            mass: mass,
            radius: 2,
            hue: hue,
            name: name,
            fixed: false
        });
        
        trails.push([]);
    }
}

function updatePhysics() {
    // 重力計算
    for (let i = 0; i < bodies.length; i++) {
        let bodyA = bodies[i];
        if (bodyA.fixed) continue;
        
        let totalFx = 0;
        let totalFy = 0;
        bodyA.closestBody = null;
        bodyA.closestDistance = Infinity;
        
        for (let j = 0; j < bodies.length; j++) {
            if (i === j) continue;
            
            let bodyB = bodies[j];
            let dx = bodyB.x - bodyA.x;
            let dy = bodyB.y - bodyA.y;
            let distance = sqrt(dx * dx + dy * dy);
            
            // 最も近い天体を記録（スイングバイ検出用）
            if (distance < bodyA.closestDistance) {
                bodyA.closestDistance = distance;
                bodyA.closestBody = bodyB;
            }
            
            if (distance > 0) {
                // ソフトニングパラメータで近距離での発散を防ぐ
                let softening = 5;
                let distSq = distance * distance + softening * softening;
                let force = G * bodyA.mass * bodyB.mass / distSq;
                let fx = (dx / distance) * force;
                let fy = (dy / distance) * force;
                
                totalFx += fx;
                totalFy += fy;
            }
        }
        
        // 加速度と速度の更新
        let ax = totalFx / bodyA.mass;
        let ay = totalFy / bodyA.mass;
        
        // スイングバイ中の宇宙船の速度変化を記録
        if (bodyA === spacecraft && bodyA.closestBody) {
            bodyA.speedBefore = sqrt(bodyA.vx * bodyA.vx + bodyA.vy * bodyA.vy);
        }
        
        bodyA.vx += ax * timeScale;
        bodyA.vy += ay * timeScale;
        
        if (bodyA === spacecraft && bodyA.closestBody) {
            bodyA.speedAfter = sqrt(bodyA.vx * bodyA.vx + bodyA.vy * bodyA.vy);
        }
    }
    
    // 位置の更新
    for (let i = 0; i < bodies.length; i++) {
        let body = bodies[i];
        if (!body.fixed) {
            body.x += body.vx * timeScale;
            body.y += body.vy * timeScale;
        }
        
        // 軌道の記録
        if (showOrbits) {
            trails[i].push({ x: body.x, y: body.y });
            if (trails[i].length > trailLength) {
                trails[i].shift();
            }
        }
    }
}

function drawTrails() {
    if (!showOrbits) return;
    
    for (let i = 0; i < trails.length; i++) {
        let trail = trails[i];
        let body = bodies[i];
        
        if (trail.length < 2) continue;
        
        stroke(body.hue, 60, 80, 40);
        strokeWeight(1);
        noFill();
        
        beginShape();
        for (let j = 0; j < trail.length; j++) {
            let alpha = map(j, 0, trail.length - 1, 0, 40);
            stroke(body.hue, 60, 80, alpha);
            vertex(trail[j].x, trail[j].y);
        }
        endShape();
    }
}

function drawBodies() {
    for (let i = 0; i < bodies.length; i++) {
        let body = bodies[i];
        
        // グロー効果
        for (let r = body.radius * 3; r > body.radius; r -= 2) {
            let alpha = map(r, body.radius, body.radius * 3, 80, 0);
            fill(body.hue, 80, 100, alpha);
            noStroke();
            ellipse(body.x, body.y, r * 2);
        }
        
        // 本体
        fill(body.hue, 80, 100);
        stroke(body.hue, 60, 100);
        strokeWeight(1);
        ellipse(body.x, body.y, body.radius * 2);
        
        // 速度ベクトル
        if (showVectors && !body.fixed) {
            let speed = sqrt(body.vx * body.vx + body.vy * body.vy);
            stroke(body.hue, 40, 100, 60);
            strokeWeight(2);
            line(body.x, body.y, 
                 body.x + body.vx * 20, 
                 body.y + body.vy * 20);
            
            // 矢印の先端
            let angle = atan2(body.vy, body.vx);
            let arrowLength = 5;
            line(body.x + body.vx * 20, body.y + body.vy * 20,
                 body.x + body.vx * 20 - cos(angle - 0.3) * arrowLength,
                 body.y + body.vy * 20 - sin(angle - 0.3) * arrowLength);
            line(body.x + body.vx * 20, body.y + body.vy * 20,
                 body.x + body.vx * 20 - cos(angle + 0.3) * arrowLength,
                 body.y + body.vy * 20 - sin(angle + 0.3) * arrowLength);
        }
        
        // 名前の表示
        if (body.radius > 5) {
            fill(0, 0, 100, 80);
            textAlign(CENTER, TOP);
            textSize(10);
            text(body.name, body.x, body.y + body.radius + 5);
        }
    }
}

function drawUI() {
    // 背景
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, 280, 140);
    
    fill(0, 0, 100, 90);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Orbital Mechanics", 20, 20);
    
    textSize(12);
    text(`Time Scale: ${timeScale.toFixed(1)}`, 20, 50);
    text(`G Constant: ${G.toFixed(2)}`, 20, 70);
    text(`Bodies: ${bodies.length}`, 20, 90);
    text(`Vectors: ${showVectors ? 'ON' : 'OFF'}`, 20, 110);
    
    // 統計情報
    let totalEnergy = calculateTotalEnergy();
    let totalMomentum = calculateTotalMomentum();
    
    fill(0, 0, 100, 70);
    textAlign(RIGHT, TOP);
    textSize(10);
    text(`Total Energy: ${totalEnergy.toFixed(2)}`, width - 20, 20);
    text(`Momentum: ${totalMomentum.toFixed(2)}`, width - 20, 35);
    
    // コントロール情報
    fill(0, 0, 100, 80);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`Controls:`, 20, height - 160);
    text(`+/-: Time scale | G/H: Gravity`, 20, height - 140);
    text(`V: Toggle vectors | O: Toggle orbits`, 20, height - 120);
    text(`F: Toggle gravity field | I: Toggle influence zones`, 20, height - 100);
    text(`S: Launch spacecraft | P: Toggle prediction`, 20, height - 80);
    text(`Click: Add body | R: Reset | 1-3: Presets`, 20, height - 60);
    text(`Space: Pause`, 20, height - 40);
}

function calculateTotalEnergy() {
    let energy = 0;
    
    // 運動エネルギー
    for (let body of bodies) {
        if (!body.fixed) {
            let speed = sqrt(body.vx * body.vx + body.vy * body.vy);
            energy += 0.5 * body.mass * speed * speed;
        }
    }
    
    // ポテンシャルエネルギー
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            let dx = bodies[j].x - bodies[i].x;
            let dy = bodies[j].y - bodies[i].y;
            let distance = sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                energy -= G * bodies[i].mass * bodies[j].mass / distance;
            }
        }
    }
    
    return energy;
}

function calculateTotalMomentum() {
    let totalMx = 0;
    let totalMy = 0;
    
    for (let body of bodies) {
        if (!body.fixed) {
            totalMx += body.mass * body.vx;
            totalMy += body.mass * body.vy;
        }
    }
    
    return sqrt(totalMx * totalMx + totalMy * totalMy);
}

function keyPressed() {
    if (key === '+' || key === '=') {
        timeScale = min(timeScale + 0.1, 3);
    } else if (key === '-') {
        timeScale = max(timeScale - 0.1, 0.1);
    } else if (key === 'g' || key === 'G') {
        G = min(G + 2, 50);
    } else if (key === 'h' || key === 'H') {
        G = max(G - 2, 0.1);
    } else if (key === 'v' || key === 'V') {
        showVectors = !showVectors;
    } else if (key === 'o' || key === 'O') {
        showOrbits = !showOrbits;
        if (!showOrbits) {
            trails = trails.map(() => []);
        }
    } else if (key === 'f' || key === 'F') {
        showGravityField = !showGravityField;
    } else if (key === 'i' || key === 'I') {
        showInfluenceZones = !showInfluenceZones;
    } else if (key === 's' || key === 'S') {
        launchSpacecraft();
    } else if (key === 'p' || key === 'P') {
        showPrediction = !showPrediction;
    } else if (key === 'r' || key === 'R') {
        initializeSolarSystem();
        spacecraft = null;
    } else if (key === ' ') {
        timeScale = timeScale > 0 ? 0 : 1;
    } else if (key === '1') {
        createBinarySystem();
    } else if (key === '2') {
        createThreeBodySystem();
    } else if (key === '3') {
        initializeSolarSystem();
    }
}

function createBinarySystem() {
    bodies = [];
    trails = [];
    
    // 二つの恒星 - より大きな質量と速度
    bodies.push({
        x: width / 2 - 80,
        y: height / 2,
        vx: 0,
        vy: -3,
        mass: 150,
        radius: 25,
        hue: 60,
        name: "Star A",
        fixed: false
    });
    
    bodies.push({
        x: width / 2 + 80,
        y: height / 2,
        vx: 0,
        vy: 3,
        mass: 150,
        radius: 25,
        hue: 0,
        name: "Star B",
        fixed: false
    });
    
    // 連星系を周回する惑星
    bodies.push({
        x: width / 2 + 200,
        y: height / 2,
        vx: 0,
        vy: 4,
        mass: 8,
        radius: 12,
        hue: 180,
        name: "Planet",
        fixed: false
    });
    
    trails.push([]);
    trails.push([]);
    trails.push([]);
}

function createThreeBodySystem() {
    bodies = [];
    trails = [];
    
    let radius = 100;
    for (let i = 0; i < 3; i++) {
        let angle = (i / 3) * TWO_PI;
        let x = width / 2 + cos(angle) * radius;
        let y = height / 2 + sin(angle) * radius;
        
        bodies.push({
            x: x,
            y: y,
            vx: -sin(angle) * 2,
            vy: cos(angle) * 2,
            mass: 80,
            radius: 18,
            hue: i * 120,
            name: `Body ${i + 1}`,
            fixed: false
        });
        
        trails.push([]);
    }
    
    // 追加の小さな天体でカオス的な動きを演出
    for (let i = 0; i < 3; i++) {
        bodies.push({
            x: width / 2 + random(-150, 150),
            y: height / 2 + random(-150, 150),
            vx: random(-3, 3),
            vy: random(-3, 3),
            mass: random(5, 15),
            radius: random(6, 10),
            hue: random(360),
            name: `Particle ${i + 1}`,
            fixed: false
        });
        
        trails.push([]);
    }
}

function mousePressed() {
    // マウス位置に新しい天体を追加
    let newMass = random(1, 5);
    let newBody = {
        x: mouseX,
        y: mouseY,
        vx: random(-2, 2),
        vy: random(-2, 2),
        mass: newMass,
        radius: map(newMass, 1, 5, 3, 8),
        hue: random(360),
        name: `Body ${bodies.length}`,
        fixed: false
    };
    
    bodies.push(newBody);
    trails.push([]);
}

// 重力場の可視化
function drawGravityField() {
    let gridSize = 40;
    strokeWeight(1);
    
    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            let totalFx = 0;
            let totalFy = 0;
            let totalPotential = 0;
            
            for (let body of bodies) {
                let dx = body.x - x;
                let dy = body.y - y;
                let distance = sqrt(dx * dx + dy * dy);
                
                if (distance > 5) {
                    let force = G * body.mass / (distance * distance);
                    totalFx += (dx / distance) * force;
                    totalFy += (dy / distance) * force;
                    totalPotential += body.mass / distance;
                }
            }
            
            let magnitude = sqrt(totalFx * totalFx + totalFy * totalFy);
            magnitude = min(magnitude, 20);
            
            // 重力の強さを色で表現
            let hue = map(totalPotential, 0, 50, 240, 0);
            stroke(hue, 50, 60, 30);
            
            // ベクトルを描画
            if (magnitude > 0.1) {
                let endX = x + (totalFx / magnitude) * 15;
                let endY = y + (totalFy / magnitude) * 15;
                line(x, y, endX, endY);
            }
        }
    }
}

// 影響圏の表示
function drawInfluenceZones() {
    for (let body of bodies) {
        if (body.mass > 10) { // 大きな天体のみ表示
            // Hill球の半径を計算（簡略化）
            let hillRadius = body.radius * sqrt(body.mass / 10) * 10;
            
            // 影響圏を同心円で表現
            for (let r = hillRadius; r > body.radius; r -= hillRadius / 5) {
                let alpha = map(r, body.radius, hillRadius, 5, 30);
                stroke(body.hue, 40, 100, alpha);
                strokeWeight(1);
                noFill();
                ellipse(body.x, body.y, r * 2);
            }
            
            // 強い影響圏
            stroke(body.hue, 60, 100, 50);
            strokeWeight(2);
            noFill();
            ellipse(body.x, body.y, hillRadius * 0.5);
        }
    }
}

// 宇宙船を発射
function launchSpacecraft() {
    // 既存の宇宙船を削除
    if (spacecraft) {
        let index = bodies.indexOf(spacecraft);
        if (index > -1) {
            bodies.splice(index, 1);
            trails.splice(index, 1);
        }
    }
    
    // 画面端から高速で発射
    let angle = random(TWO_PI);
    let startX = width / 2 + cos(angle) * (width / 2);
    let startY = height / 2 + sin(angle) * (height / 2);
    
    // 中心に向かう初速度（高速）
    let speed = 15;
    let vx = -cos(angle) * speed;
    let vy = -sin(angle) * speed;
    
    spacecraft = {
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        mass: 0.1,
        radius: 3,
        hue: 300,
        name: "Spacecraft",
        fixed: false,
        isSpacecraft: true,
        speedBefore: speed,
        speedAfter: speed
    };
    
    bodies.push(spacecraft);
    trails.push([]);
}

// 軌道予測の描画
function drawTrajectoryPrediction() {
    if (!spacecraft) return;
    
    // 予測する未来のステップ数
    let predictionSteps = 200;
    let predictionDt = timeScale * 2;
    
    // 現在の状態をコピー
    let futureX = spacecraft.x;
    let futureY = spacecraft.y;
    let futureVx = spacecraft.vx;
    let futureVy = spacecraft.vy;
    
    // 予測軌道の点を保存
    let predictionPoints = [];
    
    for (let step = 0; step < predictionSteps; step++) {
        // 重力計算
        let totalFx = 0;
        let totalFy = 0;
        
        for (let body of bodies) {
            if (body === spacecraft) continue;
            
            let dx = body.x - futureX;
            let dy = body.y - futureY;
            let distance = sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                let softening = 5;
                let distSq = distance * distance + softening * softening;
                let force = G * spacecraft.mass * body.mass / distSq;
                totalFx += (dx / distance) * force;
                totalFy += (dy / distance) * force;
            }
        }
        
        // 加速度と速度の更新
        let ax = totalFx / spacecraft.mass;
        let ay = totalFy / spacecraft.mass;
        
        futureVx += ax * predictionDt;
        futureVy += ay * predictionDt;
        futureX += futureVx * predictionDt;
        futureY += futureVy * predictionDt;
        
        predictionPoints.push({ x: futureX, y: futureY });
    }
    
    // 予測軌道を描画
    stroke(300, 40, 100, 60);
    strokeWeight(2);
    noFill();
    
    beginShape();
    vertex(spacecraft.x, spacecraft.y);
    for (let point of predictionPoints) {
        vertex(point.x, point.y);
    }
    endShape();
    
    // 予測軌道上の点を表示
    strokeWeight(1);
    for (let i = 0; i < predictionPoints.length; i += 20) {
        let alpha = map(i, 0, predictionPoints.length, 60, 20);
        fill(300, 40, 100, alpha);
        noStroke();
        ellipse(predictionPoints[i].x, predictionPoints[i].y, 4);
    }
}

// スイングバイ情報の表示
function drawSwingByInfo() {
    if (!spacecraft || !spacecraft.closestBody) return;
    
    // 最接近天体との距離が影響圏内にある場合
    let hillRadius = spacecraft.closestBody.radius * sqrt(spacecraft.closestBody.mass / 10) * 10;
    
    if (spacecraft.closestDistance < hillRadius) {
        // スイングバイ中を強調表示
        push();
        strokeWeight(3);
        stroke(120, 100, 100, 80);
        noFill();
        ellipse(spacecraft.x, spacecraft.y, 30);
        
        // 速度ベクトルを強調
        stroke(300, 100, 100);
        strokeWeight(3);
        let vScale = 30;
        line(spacecraft.x, spacecraft.y,
             spacecraft.x + spacecraft.vx * vScale / 15,
             spacecraft.y + spacecraft.vy * vScale / 15);
        pop();
        
        // 速度変化情報
        fill(0, 0, 0, 80);
        noStroke();
        rect(width - 300, 20, 280, 100);
        
        fill(300, 100, 100);
        textAlign(RIGHT, TOP);
        textSize(16);
        text("SWING-BY ACTIVE!", width - 20, 30);
        
        textSize(12);
        fill(0, 0, 100, 90);
        text(`Target: ${spacecraft.closestBody.name}`, width - 20, 55);
        text(`Distance: ${spacecraft.closestDistance.toFixed(0)}`, width - 20, 75);
        text(`Speed change: ${(spacecraft.speedAfter - spacecraft.speedBefore).toFixed(2)}`, width - 20, 95);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // 天体の位置を画面中央に調整
    let centerX = width / 2;
    let centerY = height / 2;
    
    for (let body of bodies) {
        body.x = centerX + (body.x - width / 2);
        body.y = centerY + (body.y - height / 2);
    }
}