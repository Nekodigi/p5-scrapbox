// 重力井戸シミュレーション - アーティスティック物理版
let particles = [];
let wells = [];
let particleSystem;
let fieldStrength = 1.0;
let timeStep = 1.0;
let showOrbits = true;
let showField = true;
let colorModeType = 'velocity'; // 'velocity', 'energy', 'distance'

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    if (document.getElementById('sketch-container')) {
        canvas.parent('sketch-container');
    }
    
    colorMode(HSB, 360, 100, 100, 100);
    
    // 重力井戸を配置（より現実的な質量と配置）
    wells = [
        { 
            x: width * 0.3, 
            y: height * 0.5, 
            mass: 100000,
            color: { h: 30, s: 80, b: 90 },
            radius: 40,
            type: 'attract'
        },
        { 
            x: width * 0.7, 
            y: height * 0.5, 
            mass: 80000,
            color: { h: 200, s: 70, b: 85 },
            radius: 35,
            type: 'attract'
        }
    ];
    
    // パーティクルシステムの初期化
    particleSystem = new ParticleSystem();
    particleSystem.initialize(500);
    
    // 初期速度は0のまま（削除）
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    initialize(count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            // より多様な初期条件
            let angle = random(TWO_PI);
            let distance = random(50, min(width, height) * 0.4);
            let centerX = width / 2;
            let centerY = height / 2;
            
            // 軌道速度の計算（円軌道に近い初期速度）
            let x = centerX + distance * cos(angle);
            let y = centerY + distance * sin(angle);
            let orbitalSpeed = this.calculateOrbitalSpeed(x, y);
            
            // 初期速度を0に設定
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                trail: [],
                size: random(0.5, 2),
                mass: 1,
                life: 1.0,
                maxLife: random(500, 1000),
                age: 0,
                color: { h: 0, s: 0, b: 100 },
                energy: 0,
                angularMomentum: 0
            });
        }
    }
    
    calculateOrbitalSpeed(x, y) {
        let totalForce = 0;
        for (let well of wells) {
            let dx = well.x - x;
            let dy = well.y - y;
            let dist = sqrt(dx * dx + dy * dy);
            totalForce += well.mass / dist;
        }
        return sqrt(totalForce * 0.01);
    }
}

function draw() {
    // ダイナミックな背景効果
    colorMode(RGB, 255);
    fill(10, 12, 20, 25);
    rect(0, 0, width, height);
    colorMode(HSB, 360, 100, 100, 100);
    
    // ベクトル場の可視化
    if (showField && frameCount % 3 === 0) {
        drawGravityField();
    }
    
    // 物理シミュレーション更新
    particleSystem.update();
    
    // パーティクルの描画
    particleSystem.draw();
    
    // 重力井戸の描画
    drawGravityWells();
    
    // インタラクティブUI
    drawUI();
}

// ParticleSystemクラスの更新メソッド
ParticleSystem.prototype.update = function() {
    for (let i = 0; i < this.particles.length; i++) {
        let p = this.particles[i];
        p.age++;
        
        // ライフサイクル管理（より滑らかな遷移）
        if (p.age > p.maxLife * 0.8) {
            p.life = map(p.age, p.maxLife * 0.8, p.maxLife, 1.0, 0.0);
        }
        
        // パーティクルの再生成
        if (p.life <= 0 || this.isEscaped(p)) {
            this.respawnParticle(p);
            continue;
        }
        
        // 軌跡の更新（適応的な長さ）
        let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
        p.trail.push({ x: p.x, y: p.y, speed: speed });
        let maxTrailLength = map(speed, 0, 10, 15, 50);
        while (p.trail.length > maxTrailLength) {
            p.trail.shift();
        }
        
        // 高精度な物理計算（Verlet積分）
        let ax = 0, ay = 0;
        let potentialEnergy = 0;
        
        for (let well of wells) {
            let dx = well.x - p.x;
            let dy = well.y - p.y;
            let distSq = dx * dx + dy * dy;
            let dist = sqrt(distSq);
            
            // ソフトニングパラメータで特異点を回避
            let softening = well.radius * 0.5;
            distSq = max(distSq, softening * softening);
            
            // 重力加速度の計算（物理的に正確）
            let G = 0.01 * fieldStrength; // 重力定数を100倍に強化
            let accel = G * well.mass / distSq;
            
            if (well.type === 'attract') {
                ax += (dx / dist) * accel;
                ay += (dy / dist) * accel;
                potentialEnergy -= G * well.mass / dist;
            } else {
                ax -= (dx / dist) * accel;
                ay -= (dy / dist) * accel;
                potentialEnergy += G * well.mass / dist;
            }
        }
        
        // 微小な摂動（星間物質との相互作用をシミュレート）
        ax += random(-0.05, 0.05) * fieldStrength;
        ay += random(-0.05, 0.05) * fieldStrength;
        
        // Verlet積分による位置と速度の更新
        let dt = timeStep * 0.5; // より大きなタイムステップ
        p.x += p.vx * dt + 0.5 * ax * dt * dt;
        p.y += p.vy * dt + 0.5 * ay * dt * dt;
        p.vx += ax * dt;
        p.vy += ay * dt;
        
        // エネルギーと角運動量の計算
        let kineticEnergy = 0.5 * (p.vx * p.vx + p.vy * p.vy);
        p.energy = kineticEnergy + potentialEnergy;
        p.angularMomentum = p.x * p.vy - p.y * p.vx;
        
        // 色の更新
        this.updateParticleColor(p);
        
        // 境界処理（トーラストポロジー）
        this.handleBoundaries(p);
    }
};

ParticleSystem.prototype.isEscaped = function(p) {
    return p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100;
};

ParticleSystem.prototype.respawnParticle = function(p) {
    let spawnMode = random(['orbital', 'random', 'stream']);
    
    if (spawnMode === 'orbital') {
        // 軌道投入
        let well = random(wells);
        let angle = random(TWO_PI);
        let distance = random(well.radius * 2, well.radius * 5);
        p.x = well.x + distance * cos(angle);
        p.y = well.y + distance * sin(angle);
        let orbitalSpeed = sqrt(0.001 * well.mass / distance) * random(0.7, 1.3);
        p.vx = -orbitalSpeed * sin(angle);
        p.vy = orbitalSpeed * cos(angle);
    } else if (spawnMode === 'stream') {
        // ストリーム投入
        p.x = random(width);
        p.y = 0;
        p.vx = random(-1, 1);
        p.vy = random(2, 4);
    } else {
        // ランダム投入
        p.x = random(width);
        p.y = random(height);
        p.vx = random(-1, 1);
        p.vy = random(-1, 1);
    }
    
    p.trail = [];
    p.life = 1.0;
    p.age = 0;
    p.maxLife = random(500, 1500);
};

ParticleSystem.prototype.updateParticleColor = function(p) {
    if (colorModeType === 'velocity') {
        let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
        p.color.h = map(speed, 0, 10, 240, 0); // 青から赤へ
        p.color.s = 80;
        p.color.b = 90;
    } else if (colorModeType === 'energy') {
        p.color.h = map(p.energy, -50, 50, 280, 60); // 紫から黄色へ
        p.color.s = 70;
        p.color.b = 85;
    } else if (colorModeType === 'distance') {
        let minDist = Infinity;
        for (let well of wells) {
            let dist = dist(p.x, p.y, well.x, well.y);
            minDist = min(minDist, dist);
        }
        p.color.h = map(minDist, 0, 300, 30, 200); // 近い:オレンジ、遠い:青
        p.color.s = 75;
        p.color.b = 88;
    }
};

ParticleSystem.prototype.handleBoundaries = function(p) {
    let margin = 50;
    let warped = false;
    
    if (p.x < -margin) {
        p.x = width + margin;
        warped = true;
    }
    if (p.x > width + margin) {
        p.x = -margin;
        warped = true;
    }
    if (p.y < -margin) {
        p.y = height + margin;
        warped = true;
    }
    if (p.y > height + margin) {
        p.y = -margin;
        warped = true;
    }
    
    // ワープした場合は軌跡をクリア
    if (warped) {
        p.trail = [];
    }
};


ParticleSystem.prototype.draw = function() {
    // 軌道の描画（オプション）
    if (showOrbits) {
        this.drawOrbitalPaths();
    }
    
    // パーティクルとその軌跡の描画
    for (let i = 0; i < this.particles.length; i++) {
        let p = this.particles[i];
        
        // 軌跡の描画（グラデーション効果）
        if (p.trail.length > 2) {
            noFill();
            for (let j = 1; j < p.trail.length; j++) {
                let t = j / p.trail.length;
                let alpha = t * 50 * p.life;
                let weight = map(j, 0, p.trail.length, 0.5, 2);
                
                // 速度に基づく色
                let trailSpeed = p.trail[j].speed || 0;
                let h = map(trailSpeed, 0, 10, p.color.h + 20, p.color.h - 20);
                stroke(h, p.color.s * 0.7, p.color.b * 0.8, alpha);
                strokeWeight(weight);
                
                // ワープを検出して線を描画しない
                let dx = abs(p.trail[j].x - p.trail[j-1].x);
                let dy = abs(p.trail[j].y - p.trail[j-1].y);
                if (dx < width * 0.5 && dy < height * 0.5) {
                    line(p.trail[j-1].x, p.trail[j-1].y, p.trail[j].x, p.trail[j].y);
                }
            }
        }
        
        // パーティクル本体（多層グロー効果）
        push();
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = `hsla(${p.color.h}, ${p.color.s}%, ${p.color.b}%, ${0.5 * p.life})`;
        
        // 外側のグロー
        noStroke();
        fill(p.color.h, p.color.s * 0.5, p.color.b, 15 * p.life);
        ellipse(p.x, p.y, p.size * 8);
        
        fill(p.color.h, p.color.s * 0.7, p.color.b, 30 * p.life);
        ellipse(p.x, p.y, p.size * 5);
        
        fill(p.color.h, p.color.s, p.color.b, 60 * p.life);
        ellipse(p.x, p.y, p.size * 3);
        
        // コア
        fill(p.color.h, p.color.s * 0.3, 100, 90 * p.life);
        ellipse(p.x, p.y, p.size);
        
        pop();
    }
};

ParticleSystem.prototype.drawOrbitalPaths = function() {
    // 安定した軌道を持つパーティクルの予測軌道を描画
    push();
    strokeWeight(0.5);
    noFill();
    
    for (let p of this.particles) {
        if (abs(p.energy) < 20 && p.age > 100) {
            // エネルギーが安定している粒子のみ
            stroke(p.color.h, 30, 70, 20);
            beginShape();
            
            // 簡易的な軌道予測
            let px = p.x, py = p.y;
            let pvx = p.vx, pvy = p.vy;
            
            for (let i = 0; i < 50; i++) {
                vertex(px, py);
                
                let ax = 0, ay = 0;
                for (let well of wells) {
                    let dx = well.x - px;
                    let dy = well.y - py;
                    let dist = sqrt(dx * dx + dy * dy);
                    let force = 0.0001 * well.mass / (dist * dist);
                    ax += (dx / dist) * force;
                    ay += (dy / dist) * force;
                }
                
                pvx += ax * 0.5;
                pvy += ay * 0.5;
                px += pvx * 0.5;
                py += pvy * 0.5;
            }
            
            endShape();
        }
    }
    pop();
};

function drawGravityField() {
    let step = 40;
    
    push();
    colorMode(RGB, 255);
    
    for (let x = step/2; x < width; x += step) {
        for (let y = step/2; y < height; y += step) {
            let fx = 0, fy = 0;
            let potential = 0;
            
            for (let well of wells) {
                let dx = well.x - x;
                let dy = well.y - y;
                let distSq = dx * dx + dy * dy;
                let dist = sqrt(distSq);
                
                let softening = well.radius * 0.5;
                distSq = max(distSq, softening * softening);
                
                let force = 0.0001 * fieldStrength * well.mass / distSq;
                if (well.type === 'attract') {
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                    potential -= well.mass / dist;
                } else {
                    fx -= (dx / dist) * force;
                    fy -= (dy / dist) * force;
                    potential += well.mass / dist;
                }
            }
            
            let magnitude = sqrt(fx * fx + fy * fy) * 1000;
            
            if (magnitude > 0.1) {
                // 等ポテンシャル線の色
                let potentialNorm = map(potential, -5000, 5000, 0, 1);
                let r = lerp(50, 200, potentialNorm);
                let g = lerp(100, 50, abs(potentialNorm - 0.5) * 2);
                let b = lerp(200, 50, 1 - potentialNorm);
                
                // ベクトル場の矢印
                let alpha = map(magnitude, 0.1, 10, 30, 100);
                stroke(r, g, b, alpha);
                strokeWeight(map(magnitude, 0.1, 10, 0.5, 2));
                
                let arrowLength = map(magnitude, 0.1, 10, 5, 20);
                let endX = x + (fx / sqrt(fx * fx + fy * fy)) * arrowLength;
                let endY = y + (fy / sqrt(fx * fx + fy * fy)) * arrowLength;
                
                line(x, y, endX, endY);
                
                // 矢じり
                push();
                translate(endX, endY);
                rotate(atan2(fy, fx));
                let arrowSize = map(magnitude, 0.1, 10, 2, 5);
                line(0, 0, -arrowSize, -arrowSize * 0.4);
                line(0, 0, -arrowSize, arrowSize * 0.4);
                pop();
            }
        }
    }
    
    pop();
    colorMode(HSB, 360, 100, 100, 100);
}

function drawGravityWells() {
    for (let i = 0; i < wells.length; i++) {
        let well = wells[i];
        
        push();
        
        // 歪んだ空間の表現
        drawingContext.shadowBlur = 40;
        drawingContext.shadowColor = `hsla(${well.color.h}, ${well.color.s}%, ${well.color.b}%, 0.5)`;
        
        // 重力場の可視化（波紋効果）
        noFill();
        for (let r = 0; r < 5; r++) {
            let radius = well.radius * (1 + r * 0.5) + sin(frameCount * 0.02 + r) * 5;
            let alpha = map(r, 0, 5, 30, 5);
            stroke(well.color.h, well.color.s, well.color.b, alpha);
            strokeWeight(2 - r * 0.3);
            ellipse(well.x, well.y, radius * 2);
        }
        
        // イベントホライズン
        let eventHorizon = well.radius * 0.3;
        fill(0, 0, 0, 80);
        noStroke();
        ellipse(well.x, well.y, eventHorizon * 2);
        
        // 重力井戸本体（パルス効果）
        let pulse = 1 + sin(frameCount * 0.03 + i * PI) * 0.1;
        
        // 多層グロー効果
        for (let layer = 3; layer > 0; layer--) {
            let size = well.radius * pulse * (0.5 + layer * 0.3);
            let alpha = map(layer, 0, 3, 80, 20);
            fill(well.color.h, well.color.s, well.color.b, alpha);
            ellipse(well.x, well.y, size * 2);
        }
        
        // エネルギーコア
        fill(well.color.h, well.color.s * 0.5, 100, 90);
        ellipse(well.x, well.y, well.radius * pulse * 0.4);
        
        // 内部の渦巻き
        push();
        translate(well.x, well.y);
        rotate(frameCount * 0.01 * (well.type === 'attract' ? 1 : -1));
        noFill();
        stroke(well.color.h, well.color.s * 0.3, 100, 60);
        strokeWeight(1);
        beginShape();
        for (let a = 0; a < TWO_PI * 3; a += 0.1) {
            let r = a * 2;
            let x = r * cos(a);
            let y = r * sin(a);
            if (r < well.radius * 0.8) {
                vertex(x, y);
            }
        }
        endShape();
        pop();
        
        // 情報表示
        colorMode(RGB, 255);
        fill(255, 255, 255, 180);
        textAlign(CENTER, CENTER);
        textSize(11);
        textFont('monospace');
        text(`M: ${(well.mass/1000).toFixed(0)}k`, well.x, well.y + well.radius + 20);
        
        // タイプ表示
        textSize(9);
        fill(255, 255, 255, 120);
        text(well.type.toUpperCase(), well.x, well.y + well.radius + 35);
        
        pop();
        colorMode(HSB, 360, 100, 100, 100);
    }
}

function drawUI() {
    push();
    colorMode(RGB, 255);
    
    // グラスモーフィズムパネル
    drawingContext.filter = 'blur(10px)';
    fill(10, 15, 25, 100);
    noStroke();
    rect(20, 20, 300, 140, 15);
    drawingContext.filter = 'none';
    
    // パネル枠
    stroke(255, 255, 255, 20);
    strokeWeight(1);
    noFill();
    rect(20, 20, 300, 140, 15);
    
    // タイトル
    fill(220, 230, 255);
    textAlign(LEFT, TOP);
    textSize(16);
    textFont('Arial');
    text("Gravity Wells - Artistic Physics", 35, 35);
    
    // 統計情報
    fill(180, 200, 220);
    textSize(11);
    text(`Particles: ${particleSystem.particles.length}`, 35, 60);
    text(`Field Strength: ${fieldStrength.toFixed(1)}x`, 35, 78);
    text(`Time Step: ${timeStep.toFixed(1)}x`, 35, 96);
    text(`Color Mode: ${colorModeType}`, 35, 114);
    
    // アクティブな粒子数
    let activeCount = particleSystem.particles.filter(p => p.life > 0.5).length;
    text(`Active: ${activeCount}`, 180, 60);
    
    // FPS
    text(`FPS: ${frameRate().toFixed(0)}`, 180, 78);
    
    // コントロール説明
    fill(140, 160, 180);
    textSize(10);
    textAlign(LEFT, BOTTOM);
    text("[Space] Reset | [Click] Add Well | [Right Click] Add Repulsor", 25, height - 40);
    text("[F] Toggle Field | [O] Toggle Orbits | [C] Cycle Colors", 25, height - 25);
    text("[←→] Field Strength | [↑↓] Time Step | [R] Remove Wells", 25, height - 10);
    
    pop();
}

function keyPressed() {
    if (key === ' ') {
        // システムリセット
        particleSystem.initialize(500);
    } else if (key === 'f' || key === 'F') {
        showField = !showField;
    } else if (key === 'o' || key === 'O') {
        showOrbits = !showOrbits;
    } else if (key === 'c' || key === 'C') {
        // カラーモードサイクル
        let modes = ['velocity', 'energy', 'distance'];
        let currentIndex = modes.indexOf(colorModeType);
        colorModeType = modes[(currentIndex + 1) % modes.length];
    } else if (key === 'r' || key === 'R') {
        // 最後の重力井戸を削除
        if (wells.length > 0) {
            wells.pop();
        }
    } else if (keyCode === LEFT_ARROW) {
        fieldStrength = max(0.1, fieldStrength - 0.1);
    } else if (keyCode === RIGHT_ARROW) {
        fieldStrength = min(3.0, fieldStrength + 0.1);
    } else if (keyCode === UP_ARROW) {
        timeStep = min(3.0, timeStep + 0.1);
    } else if (keyCode === DOWN_ARROW) {
        timeStep = max(0.1, timeStep - 0.1);
    }
}

function mousePressed() {
    if (mouseButton === LEFT) {
        // 引力井戸を追加
        wells.push({
            x: mouseX,
            y: mouseY,
            mass: random(60000, 120000),
            color: { 
                h: random(0, 360), 
                s: random(60, 90), 
                b: random(80, 95) 
            },
            radius: random(30, 50),
            type: 'attract'
        });
    } else if (mouseButton === RIGHT) {
        // 斥力井戸を追加
        wells.push({
            x: mouseX,
            y: mouseY,
            mass: random(40000, 80000),
            color: { 
                h: random(180, 280), 
                s: random(70, 90), 
                b: random(70, 85) 
            },
            radius: random(25, 40),
            type: 'repel'
        });
    }
    return false; // コンテキストメニューを防ぐ
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}