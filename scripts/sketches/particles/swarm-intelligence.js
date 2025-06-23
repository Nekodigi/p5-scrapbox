let boids = [];
let numBoids = 50;
let separationRadius = 25;
let alignmentRadius = 50;
let cohesionRadius = 50;
let maxSpeed = 2;
let maxForce = 0.03;
let showTrails = true;
let showForces = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    // Initialize boids
    for (let i = 0; i < numBoids; i++) {
        boids.push(new Boid(random(width), random(height)));
    }
    
    background(0, 0, 10);
}

function draw() {
    if (showTrails) {
        background(0, 0, 10, 20);
    } else {
        background(0, 0, 10);
    }
    
    // Update and display all boids
    for (let boid of boids) {
        boid.flock(boids);
        boid.update();
        boid.show();
        
        if (showForces) {
            boid.showForces();
        }
    }
    
    drawUI();
}

class Boid {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector(0, 0);
        this.maxSpeed = maxSpeed;
        this.maxForce = maxForce;
        this.size = random(3, 8);
        this.hue = random(360);
    }
    
    flock(boids) {
        let sep = this.separate(boids);
        let ali = this.align(boids);
        let coh = this.cohesion(boids);
        
        // Weight the forces
        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);
        
        // Apply forces
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
        
        // Store forces for visualization
        this.separationForce = sep;
        this.alignmentForce = ali;
        this.cohesionForce = coh;
    }
    
    applyForce(force) {
        this.acceleration.add(force);
    }
    
    // Separation: steer to avoid crowding local flockmates
    separate(boids) {
        let steer = createVector(0, 0);
        let count = 0;
        
        for (let other of boids) {
            let d = p5.Vector.dist(this.position, other.position);
            if (d > 0 && d < separationRadius) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff);
                count++;
            }
        }
        
        if (count > 0) {
            steer.div(count);
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        
        return steer;
    }
    
    // Alignment: steer towards the average heading of neighbors
    align(boids) {
        let sum = createVector(0, 0);
        let count = 0;
        
        for (let other of boids) {
            let d = p5.Vector.dist(this.position, other.position);
            if (d > 0 && d < alignmentRadius) {
                sum.add(other.velocity);
                count++;
            }
        }
        
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxForce);
            return steer;
        }
        
        return createVector(0, 0);
    }
    
    // Cohesion: steer to move toward the average position of neighbors
    cohesion(boids) {
        let sum = createVector(0, 0);
        let count = 0;
        
        for (let other of boids) {
            let d = p5.Vector.dist(this.position, other.position);
            if (d > 0 && d < cohesionRadius) {
                sum.add(other.position);
                count++;
            }
        }
        
        if (count > 0) {
            sum.div(count);
            return this.seek(sum);
        }
        
        return createVector(0, 0);
    }
    
    // Seek a target
    seek(target) {
        let desired = p5.Vector.sub(target, this.position);
        desired.normalize();
        desired.mult(this.maxSpeed);
        
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
    
    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        
        // Wrap around edges
        if (this.position.x < 0) this.position.x = width;
        if (this.position.x > width) this.position.x = 0;
        if (this.position.y < 0) this.position.y = height;
        if (this.position.y > height) this.position.y = 0;
    }
    
    show() {
        let theta = this.velocity.heading() + PI / 2;
        
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        
        // Color based on speed and direction
        let speed = this.velocity.mag();
        let brightness = map(speed, 0, this.maxSpeed, 30, 100);
        
        fill(this.hue, 80, brightness, 80);
        stroke(this.hue, 60, 100, 60);
        strokeWeight(1);
        
        // Draw boid as triangle
        beginShape();
        vertex(0, -this.size);
        vertex(-this.size/2, this.size);
        vertex(this.size/2, this.size);
        endShape(CLOSE);
        
        pop();
    }
    
    showForces() {
        let scale = 100;
        
        push();
        translate(this.position.x, this.position.y);
        
        // Separation force (red)
        if (this.separationForce && this.separationForce.mag() > 0) {
            stroke(0, 100, 100, 80);
            strokeWeight(2);
            line(0, 0, this.separationForce.x * scale, this.separationForce.y * scale);
        }
        
        // Alignment force (green)
        if (this.alignmentForce && this.alignmentForce.mag() > 0) {
            stroke(120, 100, 100, 80);
            strokeWeight(2);
            line(0, 0, this.alignmentForce.x * scale, this.alignmentForce.y * scale);
        }
        
        // Cohesion force (blue)
        if (this.cohesionForce && this.cohesionForce.mag() > 0) {
            stroke(240, 100, 100, 80);
            strokeWeight(2);
            line(0, 0, this.cohesionForce.x * scale, this.cohesionForce.y * scale);
        }
        
        pop();
    }
}

function drawUI() {
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, 300, 180);
    
    fill(0, 0, 100, 90);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Swarm Intelligence (Boids)", 20, 20);
    
    textSize(12);
    text(`Boids: ${numBoids}`, 20, 50);
    text(`Separation: ${separationRadius}`, 20, 70);
    text(`Alignment: ${alignmentRadius}`, 20, 90);
    text(`Cohesion: ${cohesionRadius}`, 20, 110);
    text(`Trails: ${showTrails ? 'ON' : 'OFF'}`, 20, 130);
    text(`Forces: ${showForces ? 'ON' : 'OFF'}`, 20, 150);
    
    // Controls
    fill(0, 0, 100, 80);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`Controls:`, 20, height - 160);
    text(`+/-: Number of boids`, 20, height - 140);
    text(`Q/A: Separation radius`, 20, height - 120);
    text(`W/S: Alignment radius`, 20, height - 100);
    text(`E/D: Cohesion radius`, 20, height - 80);
    text(`T: Toggle trails | F: Toggle forces`, 20, height - 60);
    text(`SPACE: Reset | Click: Add boid`, 20, height - 40);
}

function keyPressed() {
    if (key === '+' || key === '=') {
        numBoids = min(numBoids + 5, 200);
        for (let i = boids.length; i < numBoids; i++) {
            boids.push(new Boid(random(width), random(height)));
        }
    } else if (key === '-') {
        numBoids = max(numBoids - 5, 5);
        boids = boids.slice(0, numBoids);
    } else if (key === 'q' || key === 'Q') {
        separationRadius = min(separationRadius + 5, 100);
    } else if (key === 'a' || key === 'A') {
        separationRadius = max(separationRadius - 5, 10);
    } else if (key === 'w' || key === 'W') {
        alignmentRadius = min(alignmentRadius + 5, 150);
    } else if (key === 's' || key === 'S') {
        alignmentRadius = max(alignmentRadius - 5, 10);
    } else if (key === 'e' || key === 'E') {
        cohesionRadius = min(cohesionRadius + 5, 150);
    } else if (key === 'd' || key === 'D') {
        cohesionRadius = max(cohesionRadius - 5, 10);
    } else if (key === 't' || key === 'T') {
        showTrails = !showTrails;
    } else if (key === 'f' || key === 'F') {
        showForces = !showForces;
    } else if (key === ' ') {
        // Reset with new random positions
        boids = [];
        for (let i = 0; i < numBoids; i++) {
            boids.push(new Boid(random(width), random(height)));
        }
    } else if (key === 'r' || key === 'R') {
        // Reset parameters
        separationRadius = 25;
        alignmentRadius = 50;
        cohesionRadius = 50;
        maxSpeed = 2;
        maxForce = 0.03;
    }
}

function mousePressed() {
    // Add new boid at mouse position
    boids.push(new Boid(mouseX, mouseY));
    numBoids = boids.length;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}