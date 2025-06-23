let particles = [];
let flowField = [];
let cols, rows;
let zoff = 0;
let scl = 20;
let showField = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    cols = floor(width / scl) + 1;
    rows = floor(height / scl) + 1;
    
    // パーティクルを初期化
    for (let i = 0; i < 300; i++) {
        particles.push(new Particle());
    }
    
    background(0);
}

function draw() {
    background(0, 0, 0, 20);
    
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            let index = x + y * cols;
            let angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
            let v = p5.Vector.fromAngle(angle);
            v.setMag(1);
            flowField[index] = v;
            
            // フローフィールドの可視化
            if (showField) {
                push();
                translate(x * scl, y * scl);
                stroke(angle * 10 % 360, 60, 100, 30);
                strokeWeight(3);
                rotate(v.heading());
                let len = scl * 0.4;
                line(0, 0, len, 0);
                // 矢印の先端
                line(len, 0, len - 3, -2);
                line(len, 0, len - 3, 2);
                pop();
            }
            
            xoff += 0.1;
        }
        yoff += 0.1;
        zoff += 0.0003;
    }
    
    // パーティクルの更新と描画
    for (let particle of particles) {
        particle.follow(flowField);
        particle.update();
        particle.show();
        particle.edges();
    }
    
    // インストラクション
    fill(0, 0, 100, 60);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Press F to toggle flow field | Click to add particles", 20, 20);
}

class Particle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 4;
        this.prevPos = this.pos.copy();
        this.hue = random(360);
        this.brightness = random(60, 100);
        this.size = random(2, 4);
        this.alpha = random(60, 100);
        this.life = random(200, 400);
        this.maxLife = this.life;
    }
    
    follow(vectors) {
        let x = floor(this.pos.x / scl);
        let y = floor(this.pos.y / scl);
        let index = x + y * cols;
        
        if (index >= 0 && index < vectors.length) {
            let force = vectors[index];
            this.applyForce(force);
        }
    }
    
    applyForce(force) {
        this.acc.add(force);
    }
    
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.prevPos = this.pos.copy();
        this.pos.add(this.vel);
        this.acc.mult(0);
        
        this.life--;
        
        // 生命が尽きたら再生成
        if (this.life <= 0) {
            this.respawn();
        }
    }
    
    show() {
        let lifeRatio = this.life / this.maxLife;
        
        // 死にかけのパーティクルのフェードアウト効果を改善
        let fadeThreshold = 0.2; // 残り寿命20%からフェード開始
        let alpha;
        if (lifeRatio < fadeThreshold) {
            // スムーズなフェードアウト
            alpha = this.alpha * (lifeRatio / fadeThreshold);
        } else {
            alpha = this.alpha;
        }
        
        // 軌跡（アルファ値が低すぎる場合は描画しない）
        if (alpha > 5) {
            stroke(this.hue, 70, this.brightness, alpha * 0.6);
            strokeWeight(3);
            line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        }
        
        // パーティクル本体
        let speed = this.vel.mag();
        let dynamicBrightness = map(speed, 0, this.maxSpeed, 40, this.brightness);
        let dynamicSize = map(speed, 0, this.maxSpeed, 1, this.size) * (0.5 + lifeRatio * 0.5);
        
        if (alpha > 2) {
            fill(this.hue, 60, dynamicBrightness, alpha);
            noStroke();
            ellipse(this.pos.x, this.pos.y, dynamicSize);
            
            // 高速移動時のグロー効果
            if (speed > this.maxSpeed * 0.7 && lifeRatio > 0.3) {
                for (let r = dynamicSize * 3; r > 0; r -= 2) {
                    let glowAlpha = map(r, 0, dynamicSize * 3, alpha * 0.3, 0);
                    fill(this.hue, 40, 100, glowAlpha);
                    ellipse(this.pos.x, this.pos.y, r);
                }
            }
        }
    }
    
    edges() {
        if (this.pos.x > width) {
            this.pos.x = 0;
            this.updatePrev();
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
            this.updatePrev();
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
            this.updatePrev();
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
            this.updatePrev();
        }
    }
    
    updatePrev() {
        this.prevPos = this.pos.copy();
    }
    
    respawn() {
        this.pos = createVector(random(width), random(height));
        this.prevPos = this.pos.copy(); // 重要: prevPosも更新して軌跡の不具合を防ぐ
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.hue = random(360);
        this.brightness = random(60, 100);
        this.life = random(200, 400);
        this.maxLife = this.life;
        this.alpha = random(60, 100);
        this.size = random(2, 4);
    }
}

function mousePressed() {
    // マウス位置に新しいパーティクルを追加
    for (let i = 0; i < 10; i++) {
        let p = new Particle();
        p.pos = createVector(mouseX + random(-20, 20), mouseY + random(-20, 20));
        p.hue = random(mouseX / width * 360, (mouseX / width * 360 + 60) % 360);
        particles.push(p);
    }
    
    // パーティクル数を制限
    if (particles.length > 800) {
        particles.splice(0, particles.length - 800);
    }
}

function mouseDragged() {
    // ドラッグ中は連続してパーティクルを追加
    if (frameCount % 3 === 0) {
        let p = new Particle();
        p.pos = createVector(mouseX, mouseY);
        p.vel = createVector(mouseX - pmouseX, mouseY - pmouseY);
        p.vel.mult(0.1);
        p.hue = random(mouseX / width * 360, (mouseX / width * 360 + 30) % 360);
        particles.push(p);
    }
}

function keyPressed() {
    if (key === 'f' || key === 'F') {
        showField = !showField;
    }
    
    if (key === 'r' || key === 'R') {
        particles = [];
        for (let i = 0; i < 300; i++) {
            particles.push(new Particle());
        }
        background(0);
    }
    
    if (key === 'c' || key === 'C') {
        background(0);
    }
    
    if (key === '+') {
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }
    }
    
    if (key === '-') {
        particles.splice(0, min(50, particles.length));
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = floor(width / scl) + 1;
    rows = floor(height / scl) + 1;
    flowField = [];
}