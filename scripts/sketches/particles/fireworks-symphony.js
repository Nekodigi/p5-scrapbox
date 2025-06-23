let fireworks = [];
let explosions = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    background(0);
}

function draw() {
    background(0, 0, 5, 40);
    
    // 自動的に花火を打ち上げ
    if (random(100) < 3) {
        launchFirework();
    }
    
    // 花火の更新と描画
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let fw = fireworks[i];
        
        // 物理更新
        fw.vy += 0.2; // 重力
        fw.x += fw.vx;
        fw.y += fw.vy;
        
        // 軌跡（グロー効果付き）
        // 外側のグロー
        stroke(fw.hue, 50, 100, 30);
        strokeWeight(8);
        line(fw.x, fw.y, fw.x - fw.vx * 5, fw.y - fw.vy * 5);
        
        // 中間のグロー
        stroke(fw.hue, 70, 100, 70);
        strokeWeight(4);
        line(fw.x, fw.y, fw.x - fw.vx * 4, fw.y - fw.vy * 4);
        
        // 内側のコア
        stroke(fw.hue, 90, 100, 90);
        strokeWeight(2);
        line(fw.x, fw.y, fw.x - fw.vx * 3, fw.y - fw.vy * 3);
        
        // 本体（グロー効果付き）
        // 外側のグロー
        fill(fw.hue, 40, 100, 40);
        noStroke();
        ellipse(fw.x, fw.y, 12);
        
        // 中間のグロー
        fill(fw.hue, 70, 100, 70);
        ellipse(fw.x, fw.y, 8);
        
        // 内側のコア
        fill(fw.hue, 90, 100, 95);
        ellipse(fw.x, fw.y, 4);
        
        // 爆発判定
        if (fw.vy > 0 && fw.y > fw.targetY) {
            explode(fw.x, fw.y, fw.hue);
            fireworks.splice(i, 1);
        }
        
        // 画面外削除
        if (fw.y > height + 50) {
            fireworks.splice(i, 1);
        }
    }
    
    // 爆発パーティクルの更新と描画
    for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];
        
        for (let j = exp.particles.length - 1; j >= 0; j--) {
            let p = exp.particles[j];
            
            // 物理更新
            p.vy += 0.05; // 重力
            p.vx *= 0.98; // 空気抵抗
            p.vy *= 0.98;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 2;
            
            // 描画（グロー効果付き）
            if (p.life > 0) {
                let alpha = map(p.life, 0, 255, 0, 100);
                
                // パーティクルのグロー
                fill(p.hue, p.sat * 0.5, 100, alpha * 0.3);
                noStroke();
                ellipse(p.x, p.y, 8);
                
                fill(p.hue, p.sat, 100, alpha * 0.7);
                ellipse(p.x, p.y, 5);
                
                fill(p.hue, p.sat, 100, alpha);
                ellipse(p.x, p.y, 3);
                
                // 尾を描画（より太く長く）
                stroke(p.hue, p.sat, 80, alpha * 0.4);
                strokeWeight(3);
                line(p.x, p.y, p.x - p.vx * 4, p.y - p.vy * 4);
                
                stroke(p.hue, p.sat, 90, alpha * 0.7);
                strokeWeight(1.5);
                line(p.x, p.y, p.x - p.vx * 3, p.y - p.vy * 3);
            } else {
                exp.particles.splice(j, 1);
            }
        }
        
        // 爆発が終わったら削除
        if (exp.particles.length === 0) {
            explosions.splice(i, 1);
        }
    }
}

function launchFirework() {
    let startX = random(width * 0.2, width * 0.8);
    let startY = height;
    let targetY = random(height * 0.2, height * 0.6);
    
    let vx = random(-1, 1);
    let vy = -sqrt(2 * 0.2 * (startY - targetY)) - random(2, 5);
    
    fireworks.push({
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        targetY: targetY,
        hue: random(360)
    });
}

function explode(x, y, baseHue) {
    let numParticles = random(30, 80);
    let particles = [];
    
    for (let i = 0; i < numParticles; i++) {
        let angle = random(TWO_PI);
        let speed = random(2, 8);
        let hue = (baseHue + random(-30, 30)) % 360;
        if (hue < 0) hue += 360;
        
        particles.push({
            x: x,
            y: y,
            vx: cos(angle) * speed,
            vy: sin(angle) * speed,
            life: random(150, 255),
            hue: hue,
            sat: random(60, 100)
        });
    }
    
    explosions.push({ particles: particles });
    
    // 二次爆発の可能性
    if (random(100) < 20) {
        setTimeout(() => {
            if (random(100) < 50) {
                explode(x + random(-50, 50), y + random(-30, 30), (baseHue + 60) % 360);
            }
        }, 500);
    }
}

function mousePressed() {
    // マウスクリック位置に向けて花火を打ち上げ
    let startX = random(width * 0.2, width * 0.8);
    let startY = height;
    let targetY = mouseY;
    
    let vx = (mouseX - startX) * 0.05;
    let vy = -sqrt(2 * 0.2 * (startY - targetY)) - 2;
    
    fireworks.push({
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        targetY: targetY,
        hue: random(360)
    });
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        fireworks = [];
        explosions = [];
        background(0);
    }
    
    if (key === ' ') {
        // スペースキーで複数の花火を同時発射
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                launchFirework();
            }, i * 200);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}