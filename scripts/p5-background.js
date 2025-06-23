// 背景のパーティクルアニメーション
let particles = [];
let flowField;
let cols, rows;
let zoff = 0;
let inc = 0.1;
let scl = 20;
let hueOffset = 0;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-background');
    canvas.style('position', 'fixed');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-1');
    
    colorMode(HSB, 360, 100, 100, 100);
    background(0, 0, 5);
    
    cols = floor(width / scl);
    rows = floor(height / scl);
    flowField = new Array(cols * rows);
    
    // パーティクルを生成
    for (let i = 0; i < 800; i++) {
        particles.push(new FlowParticle());
    }
}

function draw() {
    // 半透明の黒でフェード効果
    noStroke();
    fill(240, 20, 5, 3);
    rect(0, 0, width, height);
    
    // フローフィールドを更新
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            let index = x + y * cols;
            let angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
            let v = p5.Vector.fromAngle(angle);
            v.setMag(0.5);
            flowField[index] = v;
            xoff += inc;
        }
        yoff += inc;
    }
    zoff += 0.003;
    hueOffset += 0.1;
    
    // パーティクルを更新・描画
    for (let particle of particles) {
        particle.follow(flowField);
        particle.update();
        particle.edges();
        particle.show();
    }
}

class FlowParticle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 2;
        this.prevPos = this.pos.copy();
        this.hue = random(360);
        this.life = random(100, 200);
        this.maxLife = this.life;
    }
    
    follow(vectors) {
        let x = floor(this.pos.x / scl);
        let y = floor(this.pos.y / scl);
        let index = x + y * cols;
        let force = vectors[index];
        if (force) {
            this.applyForce(force);
        }
    }
    
    applyForce(force) {
        this.acc.add(force);
    }
    
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.life--;
        
        if (this.life <= 0) {
            this.respawn();
        }
    }
    
    respawn() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.prevPos = this.pos.copy();
        this.life = random(100, 200);
        this.maxLife = this.life;
        this.hue = random(360);
    }
    
    show() {
        let lifeRatio = this.life / this.maxLife;
        let alpha = lifeRatio * 50;
        
        // グロー効果のある線
        strokeWeight(2);
        stroke((this.hue + hueOffset) % 360, 70, 80, alpha);
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        
        // より細い明るい線
        strokeWeight(1);
        stroke((this.hue + hueOffset) % 360, 50, 100, alpha * 0.8);
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        
        this.updatePrev();
    }
    
    updatePrev() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
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
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(0, 0, 5);
    
    // フローフィールドを再計算
    cols = floor(width / scl);
    rows = floor(height / scl);
    flowField = new Array(cols * rows);
}