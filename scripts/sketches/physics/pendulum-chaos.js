let pendulums = [];
let numPendulums = 5;
let trailLength = 300;
let gravity = 0.4;
let damping = 0.995;
let showTrails = true;
let showEnergy = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    initializePendulums();
    background(0);
}

function draw() {
    background(0, 0, 5, 50);
    
    updatePendulums();
    drawPendulums();
    drawUI();
}

function initializePendulums() {
    pendulums = [];
    
    for (let i = 0; i < numPendulums; i++) {
        let pendulum = {
            // 第一段
            x1: width / 2,
            y1: 100,
            x2: 0,
            y2: 0,
            // 第二段
            x3: 0,
            y3: 0,
            // 角度と角速度
            a1: PI / 2 + random(-0.1, 0.1), // 微小な初期条件の違い
            a2: PI / 2 + random(-0.1, 0.1),
            a1_v: 0,
            a2_v: 0,
            // パラメータ
            r1: 100,
            r2: 100,
            m1: 20,
            m2: 20,
            // 軌跡
            trail: [],
            // 色
            hue: (i / numPendulums) * 360,
            // エネルギー
            energy: []
        };
        
        pendulums.push(pendulum);
    }
}

function updatePendulums() {
    for (let pendulum of pendulums) {
        // 二重振り子の運動方程式（ラグランジアン力学）
        let num1 = -pendulum.m2 * pendulum.r2 * pendulum.a2_v * pendulum.a2_v * sin(pendulum.a1 - pendulum.a2) * cos(pendulum.a1 - pendulum.a2);
        let num2 = pendulum.m2 * gravity * sin(pendulum.a2) * cos(pendulum.a1 - pendulum.a2);
        let num3 = pendulum.m2 * pendulum.r2 * pendulum.a2_v * pendulum.a2_v * sin(pendulum.a1 - pendulum.a2);
        let num4 = -(pendulum.m1 + pendulum.m2) * gravity * sin(pendulum.a1);
        let den = pendulum.r1 * (pendulum.m1 + pendulum.m2 - pendulum.m2 * cos(pendulum.a1 - pendulum.a2) * cos(pendulum.a1 - pendulum.a2));
        
        let a1_a = (num1 + num2 + num3 + num4) / den;
        
        num1 = pendulum.m2 * pendulum.r2 * pendulum.a2_v * pendulum.a2_v * sin(pendulum.a1 - pendulum.a2);
        num2 = (pendulum.m1 + pendulum.m2) * (gravity * sin(pendulum.a1) * cos(pendulum.a1 - pendulum.a2) - pendulum.r1 * pendulum.a1_v * pendulum.a1_v * sin(pendulum.a1 - pendulum.a2));
        num3 = -(pendulum.m1 + pendulum.m2) * gravity * sin(pendulum.a2);
        den = pendulum.r2 * (pendulum.m1 + pendulum.m2 - pendulum.m2 * cos(pendulum.a1 - pendulum.a2) * cos(pendulum.a1 - pendulum.a2));
        
        let a2_a = (num1 + num2 + num3) / den;
        
        // 角速度と角度の更新
        pendulum.a1_v += a1_a;
        pendulum.a2_v += a2_a;
        
        // ダンピング
        pendulum.a1_v *= damping;
        pendulum.a2_v *= damping;
        
        pendulum.a1 += pendulum.a1_v;
        pendulum.a2 += pendulum.a2_v;
        
        // 位置の計算
        pendulum.x2 = pendulum.x1 + pendulum.r1 * sin(pendulum.a1);
        pendulum.y2 = pendulum.y1 + pendulum.r1 * cos(pendulum.a1);
        
        pendulum.x3 = pendulum.x2 + pendulum.r2 * sin(pendulum.a2);
        pendulum.y3 = pendulum.y2 + pendulum.r2 * cos(pendulum.a2);
        
        // 軌跡の記録
        if (showTrails) {
            pendulum.trail.push({ x: pendulum.x3, y: pendulum.y3 });
            if (pendulum.trail.length > trailLength) {
                pendulum.trail.shift();
            }
        }
        
        // エネルギーの計算
        if (showEnergy) {
            let energy = calculateEnergy(pendulum);
            pendulum.energy.push(energy);
            if (pendulum.energy.length > 200) {
                pendulum.energy.shift();
            }
        }
    }
}

function calculateEnergy(pendulum) {
    // 運動エネルギー
    let v1x = pendulum.r1 * pendulum.a1_v * cos(pendulum.a1);
    let v1y = -pendulum.r1 * pendulum.a1_v * sin(pendulum.a1);
    
    let v2x = v1x + pendulum.r2 * pendulum.a2_v * cos(pendulum.a2);
    let v2y = v1y - pendulum.r2 * pendulum.a2_v * sin(pendulum.a2);
    
    let ke1 = 0.5 * pendulum.m1 * (v1x * v1x + v1y * v1y);
    let ke2 = 0.5 * pendulum.m2 * (v2x * v2x + v2y * v2y);
    
    // ポテンシャルエネルギー
    let pe1 = -pendulum.m1 * gravity * pendulum.y2;
    let pe2 = -pendulum.m2 * gravity * pendulum.y3;
    
    return ke1 + ke2 + pe1 + pe2;
}

function drawPendulums() {
    for (let i = 0; i < pendulums.length; i++) {
        let pendulum = pendulums[i];
        
        // 軌跡を描画
        if (showTrails && pendulum.trail.length > 1) {
            stroke(pendulum.hue, 80, 90, 60);
            strokeWeight(1);
            noFill();
            
            beginShape();
            for (let j = 0; j < pendulum.trail.length; j++) {
                let alpha = map(j, 0, pendulum.trail.length - 1, 0, 60);
                stroke(pendulum.hue, 80, 90, alpha);
                vertex(pendulum.trail[j].x, pendulum.trail[j].y);
            }
            endShape();
        }
        
        // 振り子の棒を描画
        stroke(pendulum.hue, 60, 80, 80);
        strokeWeight(2);
        
        // 第一段の棒
        line(pendulum.x1, pendulum.y1, pendulum.x2, pendulum.y2);
        
        // 第二段の棒
        line(pendulum.x2, pendulum.y2, pendulum.x3, pendulum.y3);
        
        // 質量を描画
        fill(pendulum.hue, 80, 90, 90);
        stroke(pendulum.hue, 60, 100);
        strokeWeight(1);
        
        // 支点
        ellipse(pendulum.x1, pendulum.y1, 8);
        
        // 第一質量
        ellipse(pendulum.x2, pendulum.y2, pendulum.m1);
        
        // 第二質量
        ellipse(pendulum.x3, pendulum.y3, pendulum.m2);
        
        // 速度ベクトル（オプション）
        if (keyIsPressed && key === 'v') {
            let v1x = pendulum.r1 * pendulum.a1_v * cos(pendulum.a1);
            let v1y = -pendulum.r1 * pendulum.a1_v * sin(pendulum.a1);
            let v2x = v1x + pendulum.r2 * pendulum.a2_v * cos(pendulum.a2);
            let v2y = v1y - pendulum.r2 * pendulum.a2_v * sin(pendulum.a2);
            
            stroke(pendulum.hue, 40, 100, 60);
            strokeWeight(2);
            
            line(pendulum.x2, pendulum.y2, 
                 pendulum.x2 + v1x * 10, pendulum.y2 + v1y * 10);
            line(pendulum.x3, pendulum.y3, 
                 pendulum.x3 + v2x * 10, pendulum.y3 + v2y * 10);
        }
    }
    
    // エネルギーグラフ
    if (showEnergy) {
        drawEnergyGraph();
    }
}

function drawEnergyGraph() {
    let graphX = width - 250;
    let graphY = 50;
    let graphW = 200;
    let graphH = 150;
    
    // 背景
    fill(0, 0, 0, 80);
    noStroke();
    rect(graphX, graphY, graphW, graphH);
    
    // グラフのタイトル
    fill(0, 0, 100, 80);
    textAlign(CENTER, TOP);
    textSize(12);
    text("Energy", graphX + graphW / 2, graphY + 5);
    
    // エネルギーの最大・最小値を求める
    let minEnergy = Infinity;
    let maxEnergy = -Infinity;
    
    for (let pendulum of pendulums) {
        for (let energy of pendulum.energy) {
            minEnergy = min(minEnergy, energy);
            maxEnergy = max(maxEnergy, energy);
        }
    }
    
    if (maxEnergy > minEnergy) {
        for (let i = 0; i < pendulums.length; i++) {
            let pendulum = pendulums[i];
            if (pendulum.energy.length < 2) continue;
            
            stroke(pendulum.hue, 80, 90, 80);
            strokeWeight(1);
            noFill();
            
            beginShape();
            for (let j = 0; j < pendulum.energy.length; j++) {
                let x = map(j, 0, pendulum.energy.length - 1, graphX, graphX + graphW);
                let y = map(pendulum.energy[j], minEnergy, maxEnergy, graphY + graphH, graphY + 20);
                vertex(x, y);
            }
            endShape();
        }
    }
}

function drawUI() {
    // 背景
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, 280, 160);
    
    fill(0, 0, 100, 90);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Pendulum Chaos", 20, 20);
    
    textSize(12);
    text(`Pendulums: ${numPendulums}`, 20, 50);
    text(`Gravity: ${gravity.toFixed(2)}`, 20, 70);
    text(`Damping: ${damping.toFixed(3)}`, 20, 90);
    text(`Trails: ${showTrails ? 'ON' : 'OFF'}`, 20, 110);
    text(`Energy Graph: ${showEnergy ? 'ON' : 'OFF'}`, 20, 130);
    
    // コントロール情報
    fill(0, 0, 100, 80);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`Controls:`, 20, height - 140);
    text(`+/-: Number of pendulums`, 20, height - 120);
    text(`G/H: Gravity | D/F: Damping`, 20, height - 100);
    text(`T: Toggle trails | E: Energy graph`, 20, height - 80);
    text(`V (hold): Show velocity vectors`, 20, height - 60);
    text(`R: Reset | Space: Chaos test`, 20, height - 40);
}

function keyPressed() {
    if (key === '+' || key === '=') {
        numPendulums = min(numPendulums + 1, 10);
        while (pendulums.length < numPendulums) {
            let pendulum = {
                x1: width / 2,
                y1: 100,
                x2: 0,
                y2: 0,
                x3: 0,
                y3: 0,
                a1: PI / 2 + random(-0.1, 0.1),
                a2: PI / 2 + random(-0.1, 0.1),
                a1_v: 0,
                a2_v: 0,
                r1: 100,
                r2: 100,
                m1: 20,
                m2: 20,
                trail: [],
                hue: (pendulums.length / numPendulums) * 360,
                energy: []
            };
            pendulums.push(pendulum);
        }
    } else if (key === '-') {
        numPendulums = max(numPendulums - 1, 1);
        while (pendulums.length > numPendulums) {
            pendulums.pop();
        }
    } else if (key === 'g' || key === 'G') {
        gravity = min(gravity + 0.05, 1);
    } else if (key === 'h' || key === 'H') {
        gravity = max(gravity - 0.05, 0.1);
    } else if (key === 'd' || key === 'D') {
        damping = min(damping + 0.001, 0.999);
    } else if (key === 'f' || key === 'F') {
        damping = max(damping - 0.001, 0.99);
    } else if (key === 't' || key === 'T') {
        showTrails = !showTrails;
        if (!showTrails) {
            for (let pendulum of pendulums) {
                pendulum.trail = [];
            }
        }
    } else if (key === 'e' || key === 'E') {
        showEnergy = !showEnergy;
    } else if (key === 'r' || key === 'R') {
        initializePendulums();
    } else if (key === ' ') {
        // カオステスト：わずかに異なる初期条件を設定
        for (let i = 0; i < pendulums.length; i++) {
            pendulums[i].a1 = PI / 2 + i * 0.01;
            pendulums[i].a2 = PI / 2 + i * 0.01;
            pendulums[i].a1_v = 0;
            pendulums[i].a2_v = 0;
            pendulums[i].trail = [];
            pendulums[i].energy = [];
        }
    }
}

function mousePressed() {
    // マウス位置に新しい振り子を追加
    if (pendulums.length < 10) {
        let pendulum = {
            x1: mouseX,
            y1: mouseY,
            x2: 0,
            y2: 0,
            x3: 0,
            y3: 0,
            a1: PI / 2 + random(-0.5, 0.5),
            a2: PI / 2 + random(-0.5, 0.5),
            a1_v: 0,
            a2_v: 0,
            r1: random(50, 150),
            r2: random(50, 150),
            m1: random(15, 25),
            m2: random(15, 25),
            trail: [],
            hue: random(360),
            energy: []
        };
        
        pendulums.push(pendulum);
        numPendulums = pendulums.length;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // 振り子の支点を画面中央上部に調整
    let newCenterX = width / 2;
    
    for (let pendulum of pendulums) {
        let offsetX = newCenterX - pendulum.x1;
        pendulum.x1 = newCenterX;
        // 軌跡も調整
        for (let point of pendulum.trail) {
            point.x += offsetX;
        }
    }
}