// L-System Garden - 完全改修版
let plants = [];
let currentRule = 0;
let maxPlants = 12;
let showGrowth = true;
let colorMode = 0;
let backgroundMode = 0;

// L-System のルール定義
const lSystemRules = [
    {
        name: "Basic Tree",
        axiom: "F",
        rules: { "F": "F[+F]F[-F]F" },
        angle: 25.7,
        iterations: 4,
        length: 100,
        lengthFactor: 0.8,
        color: [60, 80, 40]
    },
    {
        name: "Fractal Plant",
        axiom: "X",
        rules: { "X": "F+[[X]-X]-F[-FX]+X", "F": "FF" },
        angle: 25,
        iterations: 5,
        length: 80,
        lengthFactor: 0.7,
        color: [30, 120, 60]
    },
    {
        name: "Leafy Bush",
        axiom: "F",
        rules: { "F": "F[+F]F[-F][F]" },
        angle: 20,
        iterations: 4,
        length: 90,
        lengthFactor: 0.75,
        color: [40, 100, 50]
    },
    {
        name: "Dragon Tree",
        axiom: "FX",
        rules: { "X": "X+YF+", "Y": "-FX-Y" },
        angle: 90,
        iterations: 8,
        length: 60,
        lengthFactor: 0.9,
        color: [80, 60, 30]
    },
    {
        name: "Fern",
        axiom: "X",
        rules: { "X": "F+[[X]-X]-F[-FX]+X", "F": "FF" },
        angle: 22.5,
        iterations: 5,
        length: 75,
        lengthFactor: 0.65,
        color: [20, 140, 70]
    },
    {
        name: "Spiral Tree",
        axiom: "F",
        rules: { "F": "F[+F[+F][-F]F][-F[+F][-F]F]F" },
        angle: 30,
        iterations: 3,
        length: 120,
        lengthFactor: 0.6,
        color: [45, 90, 35]
    }
];

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(RGB);
    
    // 初期植物を生成
    generateInitialGarden();
}

function draw() {
    drawBackground();
    
    // 植物を描画
    for (let plant of plants) {
        drawPlant(plant);
    }
    
    drawUI();
}

function generateInitialGarden() {
    plants = [];
    
    // ランダムに植物を配置
    for (let i = 0; i < 6; i++) {
        addRandomPlant();
    }
}

function addRandomPlant() {
    if (plants.length >= maxPlants) return;
    
    let rule = lSystemRules[Math.floor(Math.random() * lSystemRules.length)];
    let plant = createPlant(
        random(width * 0.1, width * 0.9),
        random(height * 0.6, height * 0.95),
        rule,
        random(0.7, 1.3) // サイズバリエーション
    );
    
    plants.push(plant);
}

function addPlantAtPosition(x, y) {
    if (plants.length >= maxPlants) return;
    
    let rule = lSystemRules[currentRule];
    let plant = createPlant(x, y, rule, random(0.8, 1.2));
    plants.push(plant);
}

function createPlant(x, y, rule, sizeMultiplier = 1) {
    let sentence = rule.axiom;
    
    // L-System を展開
    for (let i = 0; i < rule.iterations; i++) {
        sentence = expandLSystem(sentence, rule.rules);
    }
    
    return {
        x: x,
        y: y,
        sentence: sentence,
        rule: rule,
        size: sizeMultiplier,
        age: 0,
        maxAge: showGrowth ? sentence.length : sentence.length,
        growth: 0
    };
}

function expandLSystem(sentence, rules) {
    let newSentence = "";
    
    for (let char of sentence) {
        if (rules[char]) {
            newSentence += rules[char];
        } else {
            newSentence += char;
        }
    }
    
    return newSentence;
}

function drawPlant(plant) {
    push();
    translate(plant.x, plant.y);
    
    let currentAge = showGrowth ? plant.age : plant.sentence.length;
    let drawLength = Math.min(currentAge, plant.sentence.length);
    
    // 植物の色を設定
    let baseColor = plant.rule.color;
    let plantHue = map(plants.indexOf(plant), 0, plants.length, 0, 60);
    
    if (colorMode === 0) {
        stroke(baseColor[0] + plantHue, baseColor[1], baseColor[2]);
    } else if (colorMode === 1) {
        let season = (frameCount * 0.01) % (2 * PI);
        let seasonR = baseColor[0] + sin(season) * 30;
        let seasonG = baseColor[1] + cos(season) * 20;
        let seasonB = baseColor[2] + sin(season + PI) * 10;
        stroke(seasonR, seasonG, seasonB);
    } else {
        colorMode(HSB);
        stroke((frameCount + plants.indexOf(plant) * 50) % 360, 70, 80);
        colorMode(RGB);
    }
    
    strokeWeight(2);
    
    // L-System を描画
    drawLSystem(plant.sentence, plant.rule, plant.size, drawLength);
    
    pop();
    
    // 成長アニメーション
    if (showGrowth && plant.age < plant.sentence.length) {
        plant.age += 0.5;
    }
}

function drawLSystem(sentence, rule, sizeMultiplier, drawLength) {
    let length = rule.length * sizeMultiplier;
    let angle = rule.angle;
    let stack = [];
    
    // 上向きから開始
    rotate(-PI/2);
    
    for (let i = 0; i < Math.min(drawLength, sentence.length); i++) {
        let char = sentence[i];
        
        switch (char) {
            case 'F':
                // 線を描画
                line(0, 0, 0, -length);
                translate(0, -length);
                length *= rule.lengthFactor;
                break;
                
            case '+':
                // 右回転
                rotate(radians(angle));
                break;
                
            case '-':
                // 左回転
                rotate(radians(-angle));
                break;
                
            case '[':
                // 状態を保存
                stack.push({
                    x: 0,
                    y: 0,
                    rotation: 0,
                    length: length
                });
                push();
                break;
                
            case ']':
                // 状態を復元
                if (stack.length > 0) {
                    let state = stack.pop();
                    length = state.length;
                }
                pop();
                break;
                
            case 'X':
            case 'Y':
                // 非描画文字（制御用）
                break;
        }
    }
}

function drawBackground() {
    if (backgroundMode === 0) {
        // シンプルグラデーション
        for (let y = 0; y < height; y++) {
            let inter = map(y, 0, height, 0, 1);
            let c1 = color(135, 206, 250); // 空色
            let c2 = color(152, 251, 152); // 薄緑
            let currentColor = lerpColor(c1, c2, inter);
            stroke(currentColor);
            line(0, y, width, y);
        }
    } else if (backgroundMode === 1) {
        // 夜空
        background(25, 25, 50);
        
        // 星を描画
        fill(255, 255, 200, 150);
        noStroke();
        for (let i = 0; i < 50; i++) {
            let x = (noise(i * 0.1, frameCount * 0.001) * width);
            let y = (noise(i * 0.1 + 100, frameCount * 0.001) * height * 0.7);
            let twinkle = sin(frameCount * 0.05 + i) * 0.5 + 0.5;
            ellipse(x, y, twinkle * 3);
        }
    } else {
        // 動的グラデーション
        let time = frameCount * 0.01;
        for (let y = 0; y < height; y++) {
            let inter = map(y, 0, height, 0, 1);
            let r = 100 + sin(time) * 50 + inter * 100;
            let g = 150 + cos(time * 0.7) * 30 + inter * 80;
            let b = 200 + sin(time * 0.5) * 40 + inter * 55;
            stroke(r, g, b);
            line(0, y, width, y);
        }
    }
}

function drawUI() {
    // 半透明パネル
    fill(0, 0, 0, 120);
    noStroke();
    rect(15, 15, 300, 140, 10);
    
    // タイトル
    fill(100, 255, 150);
    textAlign(LEFT, TOP);
    textSize(16);
    textStyle(BOLD);
    text("L-System Garden", 25, 30);
    
    // 現在のルール情報
    fill(200, 255, 200);
    textSize(12);
    textStyle(NORMAL);
    text("Current: " + lSystemRules[currentRule].name, 25, 55);
    text("Plants: " + plants.length + "/" + maxPlants, 25, 75);
    text("Growth: " + (showGrowth ? "ON" : "OFF"), 25, 95);
    text("Colors: " + ["Natural", "Seasonal", "Rainbow"][colorMode], 25, 115);
    
    // 操作説明
    fill(150, 200, 150);
    textAlign(LEFT, BOTTOM);
    textSize(10);
    text("Click: Add plant | 1-6: Change type | G: Growth | C: Colors | B: Background | Space: Reset", 25, height - 25);
}

function mousePressed() {
    // マウス位置に植物を追加
    addPlantAtPosition(mouseX, mouseY);
}

function keyPressed() {
    if (key >= '1' && key <= '6') {
        // 植物タイプを変更
        currentRule = parseInt(key) - 1;
        if (currentRule >= lSystemRules.length) {
            currentRule = 0;
        }
    } else if (key === 'g' || key === 'G') {
        // 成長アニメーション切替
        showGrowth = !showGrowth;
        
        // 成長をリセット
        for (let plant of plants) {
            plant.age = showGrowth ? 0 : plant.sentence.length;
        }
    } else if (key === 'c' || key === 'C') {
        // 色モード切替
        colorMode = (colorMode + 1) % 3;
    } else if (key === 'b' || key === 'B') {
        // 背景モード切替
        backgroundMode = (backgroundMode + 1) % 3;
    } else if (key === ' ') {
        // リセット
        generateInitialGarden();
    } else if (key === 'r' || key === 'R') {
        // すべての植物をランダム化
        plants = [];
        for (let i = 0; i < 8; i++) {
            addRandomPlant();
        }
    } else if (key === '+' || key === '=') {
        // 植物を追加
        addRandomPlant();
    } else if (key === '-' || key === '_') {
        // 植物を削除
        if (plants.length > 0) {
            plants.pop();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // 植物の位置を調整
    for (let plant of plants) {
        plant.x = constrain(plant.x, width * 0.1, width * 0.9);
        plant.y = constrain(plant.y, height * 0.6, height * 0.95);
    }
}