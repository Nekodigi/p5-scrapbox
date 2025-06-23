// 背景のパーティクルアニメーション（インスタンスモード）
const backgroundSketch = (p) => {
    let bgParticles = [];
    let bgParticleCount = 60;
    let bgConnectionDistance = 120;
    let bgMouseInfluence = 150;
    let bgTime = 0;

    p.setup = function() {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('p5-background');
        
        for (let i = 0; i < bgParticleCount; i++) {
            bgParticles.push(new BackgroundParticle(p));
        }
    }

    p.draw = function() {
        p.clear();
        
        bgTime += 0.01;
        
        for (let particle of bgParticles) {
            particle.update();
            particle.display();
        }
        
        drawConnections();
        
        // 新しいパーティクルを定期的に追加
        if (p.frameCount % 300 === 0) {
            addRandomParticle();
        }
    }

    class BackgroundParticle {
        constructor(p, x, y) {
            this.p = p;
            this.pos = p.createVector(x || p.random(p.width), y || p.random(p.height));
            this.vel = p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5));
            this.acc = p.createVector(0, 0);
            this.maxSpeed = 1.2;
            this.size = p.random(2, 5);
            this.alpha = p.random(80, 180);
            this.hue = p.random(180, 220);
            this.pulseSpeed = p.random(0.02, 0.05);
            this.noiseOffset = p.random(1000);
        }
    
    update() {
        // Perlinノイズによる自然な動き
        let noiseX = noise(this.pos.x * 0.01, this.pos.y * 0.01, bgTime) * 0.5 - 0.25;
        let noiseY = noise(this.pos.x * 0.01 + 1000, this.pos.y * 0.01 + 1000, bgTime) * 0.5 - 0.25;
        
        this.acc.add(noiseX, noiseY);
        
        // マウスの影響
        if (mouseX > 0 && mouseY > 0) {
            let mouse = createVector(mouseX, mouseY);
            let distance = p5.Vector.dist(this.pos, mouse);
            
            if (distance < bgMouseInfluence) {
                let force = p5.Vector.sub(this.pos, mouse);
                force.normalize();
                force.mult(map(distance, 0, bgMouseInfluence, 0.6, 0));
                this.acc.add(force);
            }
        }
        
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        
        // 画面端での処理
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = height;
        if (this.pos.y > height) this.pos.y = 0;
        
        // パルス効果
        this.alpha = 120 + sin(bgTime * this.pulseSpeed + this.noiseOffset) * 40;
    }
    
    display() {
        push();
        colorMode(HSB, 360, 100, 100, 255);
        
        // 動的な色変化
        let dynamicHue = (this.hue + bgTime * 8) % 360;
        fill(dynamicHue, 60, 85, this.alpha);
        noStroke();
        
        // パルスするサイズ
        let pulseSize = this.size + sin(bgTime * this.pulseSpeed + this.noiseOffset) * 1;
        ellipse(this.pos.x, this.pos.y, pulseSize);
        
        // 光のハロー効果
        fill(dynamicHue, 30, 95, this.alpha * 0.3);
        ellipse(this.pos.x, this.pos.y, pulseSize * 2.5);
        
        pop();
    }
}

function drawConnections() {
    push();
    colorMode(HSB, 360, 100, 100, 255);
    
    for (let i = 0; i < bgParticles.length; i++) {
        for (let j = i + 1; j < bgParticles.length; j++) {
            let distance = p5.Vector.dist(bgParticles[i].pos, bgParticles[j].pos);
            
            if (distance < bgConnectionDistance) {
                let alpha = map(distance, 0, bgConnectionDistance, 60, 0);
                let hue = (200 + bgTime * 12) % 360;
                
                stroke(hue, 40, 90, alpha);
                strokeWeight(map(distance, 0, bgConnectionDistance, 1.2, 0.2));
                
                line(bgParticles[i].pos.x, bgParticles[i].pos.y, 
                     bgParticles[j].pos.x, bgParticles[j].pos.y);
            }
        }
    }
    pop();
}

function addRandomParticle() {
    if (bgParticles.length < bgParticleCount + 15) {
        let side = floor(random(4));
        let x, y;
        
        switch(side) {
            case 0: x = 0; y = random(height); break;
            case 1: x = width; y = random(height); break;
            case 2: x = random(width); y = 0; break;
            case 3: x = random(width); y = height; break;
        }
        
        bgParticles.push(new BackgroundParticle(x, y));
        
        // 最大数を超えたら古いものを削除
        if (bgParticles.length > bgParticleCount + 20) {
            bgParticles.splice(0, 1);
        }
    }
}

function mouseMoved() {
    // マウス移動時に新しいパーティクルを追加
    if (random() < 0.08) {
        bgParticles.push(new BackgroundParticle(
            mouseX + random(-30, 30), 
            mouseY + random(-30, 30)
        ));
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
    if (key === ' ') {
        // スペースキーでリセット
        bgParticles = [];
        for (let i = 0; i < bgParticleCount; i++) {
            bgParticles.push(new BackgroundParticle());
        }
    }
}