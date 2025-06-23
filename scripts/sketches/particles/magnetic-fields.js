class MagneticFields {
    constructor() {
        this.poles = [];
        this.particles = [];
        this.fieldResolution = 40;
        this.showFieldLines = true;
        this.showParticles = true;
        this.animationOffset = 0;
        this.trailLength = 25;
    }

    init() {
        // Initialize with two poles
        this.poles.push({
            x: width * 0.3,
            y: height / 2,
            strength: 100,
            type: 'N'
        });
        
        this.poles.push({
            x: width * 0.7,
            y: height / 2,
            strength: 100,
            type: 'S'
        });

        // Create particles with trailing
        for (let i = 0; i < 500; i++) {
            this.particles.push({
                x: random(width),
                y: random(height),
                vx: 0,
                vy: 0,
                charge: random([-1, 1]),
                trail: []
            });
        }
    }

    update() {
        this.animationOffset += 0.02;
        
        // Update particles
        for (let particle of this.particles) {
            // Store current position in trail
            particle.trail.push({x: particle.x, y: particle.y});
            if (particle.trail.length > this.trailLength) {
                particle.trail.shift();
            }
            
            let fx = 0;
            let fy = 0;

            // Calculate force from each pole
            for (let pole of this.poles) {
                let dx = pole.x - particle.x;
                let dy = pole.y - particle.y;
                let dist = sqrt(dx * dx + dy * dy);
                
                if (dist > 5) {
                    let force = pole.strength / (dist * dist);
                    // Magnetic interaction: opposite charges attract
                    let attraction = (pole.type === 'N' ? 1 : -1) * particle.charge;
                    fx += attraction * force * dx / dist;
                    fy += attraction * force * dy / dist;
                }
            }

            // Apply forces (increased for faster movement)
            particle.vx += fx * 0.25;
            particle.vy += fy * 0.25;
            
            // Reduced damping for faster movement
            particle.vx *= 0.97;
            particle.vy *= 0.97;
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
        }
    }

    draw() {
        background(2, 2, 8, 35);
        
        // Draw field lines
        if (this.showFieldLines) {
            this.drawFieldLines();
        }
        
        // Draw enhanced poles with pulsing effects
        for (let pole of this.poles) {
            push();
            translate(pole.x, pole.y);
            
            // Pulsing effect
            let pulse = sin(this.animationOffset * 3) * 5 + 40;
            
            // Outer glow
            noStroke();
            if (pole.type === 'N') {
                fill(255, 100, 100, 50);
                circle(0, 0, pulse + 20);
                fill(255, 150, 150, 100);
                circle(0, 0, pulse + 10);
                fill(255, 200, 200);
            } else {
                fill(100, 100, 255, 50);
                circle(0, 0, pulse + 20);
                fill(150, 150, 255, 100);
                circle(0, 0, pulse + 10);
                fill(200, 200, 255);
            }
            circle(0, 0, pulse);
            
            // Pole label
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(20);
            text(pole.type, 0, 0);
            pop();
        }
        
        // Draw particles with trails
        if (this.showParticles) {
            for (let particle of this.particles) {
                // Enhanced trail with multiple effects
                if (particle.trail.length > 1) {
                    for (let i = 1; i < particle.trail.length; i++) {
                        let alpha = map(i, 0, particle.trail.length, 5, 180);
                        let thickness = map(i, 0, particle.trail.length, 0.5, 4);
                        
                        // Outer trail glow
                        if (particle.charge > 0) {
                            stroke(255, 80, 50, alpha * 0.4);
                        } else {
                            stroke(50, 120, 255, alpha * 0.4);
                        }
                        strokeWeight(thickness + 2);
                        line(particle.trail[i-1].x, particle.trail[i-1].y,
                             particle.trail[i].x, particle.trail[i].y);
                        
                        // Inner trail core
                        if (particle.charge > 0) {
                            stroke(255, 180, 100, alpha);
                        } else {
                            stroke(100, 180, 255, alpha);
                        }
                        strokeWeight(thickness);
                        line(particle.trail[i-1].x, particle.trail[i-1].y,
                             particle.trail[i].x, particle.trail[i].y);
                    }
                }
                
                // Draw particle
                push();
                translate(particle.x, particle.y);
                noStroke();
                
                // Enhanced particle glow effect
                let speed = sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                let glowSize = map(speed, 0, 8, 10, 20);
                
                if (particle.charge > 0) {
                    // Positive charge - bright red/orange glow
                    fill(255, 50, 0, 50);
                    circle(0, 0, glowSize + 8);
                    fill(255, 100, 50, 100);
                    circle(0, 0, glowSize);
                    fill(255, 200, 100, 240);
                } else {
                    // Negative charge - bright blue/cyan glow
                    fill(0, 50, 255, 50);
                    circle(0, 0, glowSize + 8);
                    fill(50, 100, 255, 100);
                    circle(0, 0, glowSize);
                    fill(100, 200, 255, 240);
                }
                circle(0, 0, 8);
                pop();
            }
        }
    }

    drawFieldLines() {
        // Draw enhanced field lines with animation and gradients
        let spacing = width / this.fieldResolution;
        
        for (let i = 0; i < this.fieldResolution; i++) {
            for (let j = 0; j < this.fieldResolution; j++) {
                let x = i * spacing + spacing/2;
                let y = j * spacing + spacing/2;
                
                // Calculate field at this point
                let fx = 0;
                let fy = 0;
                let totalMag = 0;
                
                for (let pole of this.poles) {
                    let dx = x - pole.x;
                    let dy = y - pole.y;
                    let dist = sqrt(dx * dx + dy * dy);
                    
                    if (dist > 0.1) {
                        let strength = pole.strength / (dist * dist);
                        let polarity = pole.type === 'N' ? 1 : -1;
                        fx += polarity * strength * dx / dist;
                        fy += polarity * strength * dy / dist;
                        totalMag += strength / dist;
                    }
                }
                
                // Normalize and draw with enhanced visuals
                let mag = sqrt(fx * fx + fy * fy);
                if (mag > 0) {
                    fx /= mag;
                    fy /= mag;
                    
                    // Enhanced color based on field strength and pole type
                    let intensity = map(totalMag, 0, 50, 100, 255);
                    intensity = constrain(intensity, 100, 255);
                    
                    // Determine dominant pole type for color coding
                    let dominantPole = this.getDominantPole(x, y);
                    let r, g, b;
                    if (dominantPole === 'N') {
                        // North pole - bright red/orange
                        r = intensity;
                        g = intensity * 0.3;
                        b = intensity * 0.1;
                    } else {
                        // South pole - bright blue/cyan
                        r = intensity * 0.1;
                        g = intensity * 0.4;
                        b = intensity;
                    }
                    
                    // Thickness based on field strength
                    let thickness = map(totalMag, 0, 50, 1.5, 5);
                    thickness = constrain(thickness, 1.5, 5);
                    
                    // Animated flow effect
                    let flowOffset = sin(this.animationOffset + i * 0.15 + j * 0.15) * 4;
                    
                    let len = min(spacing * 0.9, 30);
                    
                    // Draw multiple layers for enhanced glow effect
                    // Outer glow
                    stroke(r * 0.4, g * 0.4, b * 0.4, 50);
                    strokeWeight(thickness + 3);
                    line(x - fx * (len/2 + flowOffset), y - fy * (len/2 + flowOffset), 
                         x + fx * (len/2 + flowOffset), y + fy * (len/2 + flowOffset));
                    
                    // Middle glow
                    stroke(r * 0.7, g * 0.7, b * 0.7, 100);
                    strokeWeight(thickness + 1);
                    line(x - fx * (len/2 + flowOffset), y - fy * (len/2 + flowOffset), 
                         x + fx * (len/2 + flowOffset), y + fy * (len/2 + flowOffset));
                    
                    // Inner core
                    stroke(r, g, b, 180);
                    strokeWeight(thickness);
                    line(x - fx * (len/2 + flowOffset), y - fy * (len/2 + flowOffset), 
                         x + fx * (len/2 + flowOffset), y + fy * (len/2 + flowOffset));
                    
                    // Directional arrows for stronger fields
                    if (totalMag > 15) {
                        push();
                        translate(x + fx * (len/2 + flowOffset), y + fy * (len/2 + flowOffset));
                        rotate(atan2(fy, fx));
                        stroke(r, g, b, 200);
                        strokeWeight(thickness * 0.8);
                        line(0, 0, -6, -3);
                        line(0, 0, -6, 3);
                        pop();
                    }
                }
            }
        }
    }

    getDominantPole(x, y) {
        let nInfluence = 0;
        let sInfluence = 0;
        
        for (let pole of this.poles) {
            let dx = x - pole.x;
            let dy = y - pole.y;
            let dist = sqrt(dx * dx + dy * dy);
            
            if (dist > 0.1) {
                let influence = pole.strength / (dist * dist);
                if (pole.type === 'N') {
                    nInfluence += influence;
                } else {
                    sInfluence += influence;
                }
            }
        }
        
        return nInfluence > sInfluence ? 'N' : 'S';
    }

    mousePressed() {
        // Left click adds N pole, right click adds S pole
        if (mouseButton === LEFT) {
            this.poles.push({
                x: mouseX,
                y: mouseY,
                strength: 100,
                type: 'N'
            });
        } else if (mouseButton === RIGHT) {
            this.poles.push({
                x: mouseX,
                y: mouseY,
                strength: 100,
                type: 'S'
            });
        }
    }

    keyPressed() {
        if (key === 'c' || key === 'C') {
            // Clear all poles
            this.poles = [];
        } else if (key === 'f' || key === 'F') {
            // Toggle field lines
            this.showFieldLines = !this.showFieldLines;
        } else if (key === 'p' || key === 'P') {
            // Toggle particles
            this.showParticles = !this.showParticles;
        } else if (key === 'r' || key === 'R') {
            // Reset
            this.poles = [];
            this.particles = [];
            this.init();
        } else if (key === 't' || key === 'T') {
            // Toggle trail length
            this.trailLength = this.trailLength === 15 ? 30 : 15;
        } else if (key === 'a' || key === 'A') {
            // Add random charged particles
            for (let i = 0; i < 50; i++) {
                this.particles.push({
                    x: random(width),
                    y: random(height),
                    vx: random(-2, 2),
                    vy: random(-2, 2),
                    charge: random([-1, 1]),
                    trail: []
                });
            }
        }
    }
}

// This script is loaded by the HTML file