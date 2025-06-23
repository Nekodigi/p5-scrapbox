let shapes = [];
let numShapes = 50;
let time = 0;
let compositionStyle = 'geometric';
let colorPalette = 'vibrant';
let animationSpeed = 1;
let showTrails = true;
let symmetryMode = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    generateComposition();
    background(0);
}

function draw() {
    if (showTrails) {
        background(0, 0, 0, 20);
    } else {
        background(0);
    }
    
    time += 0.01 * animationSpeed;
    
    updateShapes();
    drawComposition();
    drawUI();
}

function generateComposition() {
    shapes = [];
    
    for (let i = 0; i < numShapes; i++) {
        let shape = createShape(i);
        shapes.push(shape);
    }
}

function createShape(index) {
    let shape = {
        x: random(width),
        y: random(height),
        originalX: 0,
        originalY: 0,
        size: random(10, 100),
        rotation: random(TWO_PI),
        rotationSpeed: random(-0.05, 0.05),
        type: '',
        color: { h: 0, s: 0, b: 0, a: 80 },
        movement: {
            amplitude: random(50, 200),
            frequency: random(0.5, 2),
            phase: random(TWO_PI)
        },
        scale: 1,
        scaleSpeed: random(0.01, 0.03)
    };
    
    shape.originalX = shape.x;
    shape.originalY = shape.y;
    
    // 形状タイプを決定
    switch (compositionStyle) {
        case 'geometric':
            shape.type = random(['circle', 'triangle', 'square', 'hexagon']);
            break;
        case 'organic':
            shape.type = random(['blob', 'flower', 'leaf', 'spiral']);
            break;
        case 'linear':
            shape.type = random(['line', 'curve', 'zigzag', 'wave']);
            break;
        case 'mixed':
            shape.type = random(['circle', 'triangle', 'square', 'blob', 'line', 'spiral']);
            break;
    }
    
    // 色を設定
    shape.color = getColor(index);
    
    return shape;
}

function getColor(index) {
    let color = { h: 0, s: 80, b: 90, a: 80 };
    
    switch (colorPalette) {
        case 'vibrant':
            color.h = (index * 137.5) % 360; // ゴールデンアングル
            color.s = random(70, 100);
            color.b = random(70, 100);
            break;
            
        case 'monochrome':
            color.h = 0;
            color.s = 0;
            color.b = random(20, 100);
            break;
            
        case 'warm':
            color.h = random(0, 60);
            color.s = random(60, 100);
            color.b = random(60, 100);
            break;
            
        case 'cool':
            color.h = random(180, 270);
            color.s = random(60, 100);
            color.b = random(60, 100);
            break;
            
        case 'pastel':
            color.h = random(360);
            color.s = random(30, 60);
            color.b = random(80, 100);
            break;
            
        case 'neon':
            color.h = random(360);
            color.s = 100;
            color.b = 100;
            color.a = random(60, 100);
            break;
    }
    
    return color;
}

function updateShapes() {
    for (let i = 0; i < shapes.length; i++) {
        let shape = shapes[i];
        
        // 回転
        shape.rotation += shape.rotationSpeed;
        
        // 動的な動き
        let moveX = sin(time * shape.movement.frequency + shape.movement.phase) * shape.movement.amplitude;
        let moveY = cos(time * shape.movement.frequency * 0.7 + shape.movement.phase) * shape.movement.amplitude * 0.5;
        
        shape.x = shape.originalX + moveX;
        shape.y = shape.originalY + moveY;
        
        // スケールアニメーション
        shape.scale = 1 + sin(time + i) * 0.3;
        
        // 画面端での反射
        if (shape.x < 0 || shape.x > width) {
            shape.movement.frequency *= -1;
            shape.originalX = constrain(shape.originalX, 0, width);
        }
        if (shape.y < 0 || shape.y > height) {
            shape.movement.frequency *= -1;
            shape.originalY = constrain(shape.originalY, 0, height);
        }
        
        // 色の動的変化
        if (colorPalette === 'dynamic') {
            shape.color.h = (shape.color.h + 1) % 360;
        }
    }
}

function drawComposition() {
    for (let shape of shapes) {
        push();
        
        translate(shape.x, shape.y);
        rotate(shape.rotation);
        scale(shape.scale);
        
        // 色の設定
        fill(shape.color.h, shape.color.s, shape.color.b, shape.color.a);
        stroke(shape.color.h, shape.color.s * 0.7, shape.color.b * 1.2, shape.color.a * 0.8);
        strokeWeight(2);
        
        // 形状の描画
        drawShape(shape);
        
        // 対称モード
        if (symmetryMode) {
            push();
            scale(-1, 1);
            drawShape(shape);
            pop();
            
            push();
            scale(1, -1);
            drawShape(shape);
            pop();
            
            push();
            scale(-1, -1);
            drawShape(shape);
            pop();
        }
        
        pop();
    }
}

function drawShape(shape) {
    switch (shape.type) {
        case 'circle':
            ellipse(0, 0, shape.size);
            break;
            
        case 'triangle':
            beginShape();
            for (let i = 0; i < 3; i++) {
                let angle = (i / 3) * TWO_PI - PI/2;
                let x = cos(angle) * shape.size / 2;
                let y = sin(angle) * shape.size / 2;
                vertex(x, y);
            }
            endShape(CLOSE);
            break;
            
        case 'square':
            rectMode(CENTER);
            rect(0, 0, shape.size, shape.size);
            break;
            
        case 'hexagon':
            beginShape();
            for (let i = 0; i < 6; i++) {
                let angle = (i / 6) * TWO_PI;
                let x = cos(angle) * shape.size / 2;
                let y = sin(angle) * shape.size / 2;
                vertex(x, y);
            }
            endShape(CLOSE);
            break;
            
        case 'blob':
            beginShape();
            for (let i = 0; i < 16; i++) {
                let angle = (i / 16) * TWO_PI;
                let radius = shape.size / 2 + noise(i * 0.5, time) * 20;
                let x = cos(angle) * radius;
                let y = sin(angle) * radius;
                vertex(x, y);
            }
            endShape(CLOSE);
            break;
            
        case 'flower':
            noFill();
            for (let i = 0; i < 8; i++) {
                push();
                rotate((i / 8) * TWO_PI);
                ellipse(0, shape.size / 4, shape.size / 3, shape.size / 6);
                pop();
            }
            break;
            
        case 'leaf':
            beginShape();
            for (let i = 0; i <= 20; i++) {
                let t = i / 20;
                let angle = t * PI;
                let radius = sin(angle) * shape.size / 2;
                let x = cos(angle) * radius;
                let y = sin(angle) * radius - shape.size / 4;
                vertex(x, y);
            }
            endShape();
            break;
            
        case 'spiral':
            noFill();
            beginShape();
            for (let i = 0; i < 100; i++) {
                let angle = i * 0.2;
                let radius = i * shape.size / 200;
                let x = cos(angle) * radius;
                let y = sin(angle) * radius;
                vertex(x, y);
            }
            endShape();
            break;
            
        case 'line':
            line(-shape.size/2, 0, shape.size/2, 0);
            break;
            
        case 'curve':
            noFill();
            beginShape();
            for (let i = 0; i <= 20; i++) {
                let t = map(i, 0, 20, -1, 1);
                let x = t * shape.size / 2;
                let y = sin(t * PI) * shape.size / 4;
                vertex(x, y);
            }
            endShape();
            break;
            
        case 'zigzag':
            noFill();
            beginShape();
            for (let i = 0; i <= 10; i++) {
                let x = map(i, 0, 10, -shape.size/2, shape.size/2);
                let y = (i % 2 === 0) ? -shape.size/4 : shape.size/4;
                vertex(x, y);
            }
            endShape();
            break;
            
        case 'wave':
            noFill();
            beginShape();
            for (let i = 0; i <= 50; i++) {
                let x = map(i, 0, 50, -shape.size/2, shape.size/2);
                let y = sin(i * 0.3 + time) * shape.size / 6;
                vertex(x, y);
            }
            endShape();
            break;
    }
}

function drawUI() {
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, 320, 160);
    
    fill(0, 0, 100, 90);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Abstract Compositions", 20, 20);
    
    textSize(12);
    text(`Style: ${compositionStyle}`, 20, 50);
    text(`Palette: ${colorPalette}`, 20, 70);
    text(`Shapes: ${numShapes}`, 20, 90);
    text(`Speed: ${animationSpeed.toFixed(1)}`, 20, 110);
    text(`Trails: ${showTrails ? 'ON' : 'OFF'}`, 20, 130);
    
    // コントロール情報
    fill(0, 0, 100, 80);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`Controls:`, 20, height - 160);
    text(`1-4: Composition style | Q-U: Color palette`, 20, height - 140);
    text(`+/-: Shape count | SPACE: Regenerate`, 20, height - 120);
    text(`T: Toggle trails | S: Symmetry mode`, 20, height - 100);
    text(`UP/DOWN: Animation speed`, 20, height - 80);
    text(`Click: Add shape | R: Reset`, 20, height - 60);
    text(`F: Freeze animation`, 20, height - 40);
}

function keyPressed() {
    if (key === '1') {
        compositionStyle = 'geometric';
        generateComposition();
    } else if (key === '2') {
        compositionStyle = 'organic';
        generateComposition();
    } else if (key === '3') {
        compositionStyle = 'linear';
        generateComposition();
    } else if (key === '4') {
        compositionStyle = 'mixed';
        generateComposition();
    } else if (key === 'q' || key === 'Q') {
        colorPalette = 'vibrant';
        updateColors();
    } else if (key === 'w' || key === 'W') {
        colorPalette = 'monochrome';
        updateColors();
    } else if (key === 'e' || key === 'E') {
        colorPalette = 'warm';
        updateColors();
    } else if (key === 'r' || key === 'R') {
        colorPalette = 'cool';
        updateColors();
    } else if (key === 't' || key === 'T') {
        showTrails = !showTrails;
    } else if (key === 'y' || key === 'Y') {
        colorPalette = 'pastel';
        updateColors();
    } else if (key === 'u' || key === 'U') {
        colorPalette = 'neon';
        updateColors();
    } else if (key === '+' || key === '=') {
        numShapes = min(numShapes + 5, 100);
        generateComposition();
    } else if (key === '-') {
        numShapes = max(numShapes - 5, 5);
        generateComposition();
    } else if (key === ' ') {
        generateComposition();
    } else if (key === 's' || key === 'S') {
        symmetryMode = !symmetryMode;
    } else if (keyCode === UP_ARROW) {
        animationSpeed = min(animationSpeed + 0.2, 3);
    } else if (keyCode === DOWN_ARROW) {
        animationSpeed = max(animationSpeed - 0.2, 0);
    } else if (key === 'f' || key === 'F') {
        animationSpeed = animationSpeed > 0 ? 0 : 1;
    }
}

function updateColors() {
    for (let i = 0; i < shapes.length; i++) {
        shapes[i].color = getColor(i);
    }
}

function mousePressed() {
    // マウス位置に新しい形状を追加
    let newShape = createShape(shapes.length);
    newShape.x = mouseX;
    newShape.y = mouseY;
    newShape.originalX = mouseX;
    newShape.originalY = mouseY;
    shapes.push(newShape);
    numShapes = shapes.length;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // 形状の位置を画面サイズに合わせて調整
    for (let shape of shapes) {
        shape.x = map(shape.x, 0, windowWidth, 0, width);
        shape.y = map(shape.y, 0, windowHeight, 0, height);
        shape.originalX = shape.x;
        shape.originalY = shape.y;
    }
}