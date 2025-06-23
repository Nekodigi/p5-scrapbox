let sites = [];
let numSites = 50;
let diagram = null;
let time = 0;
let animationMode = 'static';
let colorMode = 'rainbow';
let showSites = true;
let showEdges = true;
let fillCells = true;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    generateSites();
    background(0);
}

function draw() {
    background(0, 0, 10); // 黒背景で色が映えるように
    
    time += 0.01;
    
    // サイトのアニメーション
    updateSites();
    
    // ボロノイ図の生成と描画
    generateVoronoi();
    drawVoronoi();
    
    // サイトの描画
    if (showSites) {
        drawSites();
    }
    
    drawUI();
}

function generateSites() {
    sites = [];
    
    for (let i = 0; i < numSites; i++) {
        let site = {
            x: random(width),
            y: random(height),
            originalX: 0,
            originalY: 0,
            vx: random(-2, 2),
            vy: random(-2, 2),
            color: { h: 0, s: 0, b: 0 },
            size: random(5, 15),
            pulsePhase: random(TWO_PI),
            spiralRadius: random(50, 200),
            spiralSpeed: random(0.5, 2),
            spiralPhase: random(TWO_PI)
        };
        
        site.originalX = site.x;
        site.originalY = site.y;
        site.color = getSiteColor(i);
        
        sites.push(site);
    }
}

function getSiteColor(index) {
    let color = { h: 0, s: 80, b: 90 };
    
    switch (colorMode) {
        case 'rainbow':
            // より分かりやすいレインボー配色
            color.h = map(index, 0, numSites, 0, 360);
            color.s = 90;
            color.b = 95;
            break;
            
        case 'warm':
            color.h = random(0, 60) + random(-10, 10);
            color.s = 85;
            color.b = 90;
            break;
            
        case 'cool':
            color.h = random(180, 270);
            color.s = 85;
            color.b = 90;
            break;
            
        case 'monochrome':
            let baseHue = 200; // Blue-ish monochrome instead of gray
            color.h = baseHue + random(-10, 10);
            color.s = random(10, 30);
            color.b = random(70, 100);
            break;
            
        case 'pastel':
            color.h = random(360);
            color.s = random(40, 70);
            color.b = random(85, 100);
            break;
            
        case 'neon':
            let neonHues = [0, 30, 120, 180, 270, 300]; // Red, Orange, Green, Cyan, Blue, Magenta
            color.h = random(neonHues) + random(-15, 15);
            color.s = 100;
            color.b = 100;
            break;
    }
    
    return color;
}

function updateSites() {
    for (let i = 0; i < sites.length; i++) {
        let site = sites[i];
        
        switch (animationMode) {
            case 'static':
                // 静止状態
                break;
                
            case 'drift':
                // ランダムドリフト
                site.x += site.vx * 0.5;
                site.y += site.vy * 0.5;
                
                // 境界で反射
                if (site.x < 0 || site.x > width) {
                    site.vx *= -1;
                    site.x = constrain(site.x, 0, width);
                }
                if (site.y < 0 || site.y > height) {
                    site.vy *= -1;
                    site.y = constrain(site.y, 0, height);
                }
                break;
                
            case 'pulse':
                // 脈動
                let pulseOffset = sin(time * 3 + site.pulsePhase) * 30;
                site.x = site.originalX + pulseOffset;
                site.y = site.originalY + cos(time * 2.5 + site.pulsePhase) * 20;
                break;
                
            case 'spiral':
                // スパイラル運動
                let spiralAngle = time * site.spiralSpeed + site.spiralPhase;
                let spiralX = cos(spiralAngle) * site.spiralRadius * sin(time * 0.5);
                let spiralY = sin(spiralAngle) * site.spiralRadius * cos(time * 0.3);
                
                site.x = site.originalX + spiralX;
                site.y = site.originalY + spiralY;
                break;
                
            case 'gravity':
                // 重力的な引力
                let centerX = width / 2;
                let centerY = height / 2;
                let dx = centerX - site.x;
                let dy = centerY - site.y;
                let distance = sqrt(dx * dx + dy * dy);
                
                if (distance > 10) {
                    let force = 50 / (distance * distance);
                    site.vx += (dx / distance) * force;
                    site.vy += (dy / distance) * force;
                }
                
                site.vx *= 0.98; // ダンピング
                site.vy *= 0.98;
                site.x += site.vx;
                site.y += site.vy;
                break;
                
            case 'turbulence':
                // パーリンノイズによる乱流
                let noiseX = noise(site.x * 0.01, site.y * 0.01, time) - 0.5;
                let noiseY = noise(site.x * 0.01 + 100, site.y * 0.01 + 100, time) - 0.5;
                
                site.x += noiseX * 3;
                site.y += noiseY * 3;
                
                // 境界内に保持
                site.x = constrain(site.x, 20, width - 20);
                site.y = constrain(site.y, 20, height - 20);
                break;
        }
        
        // 色の動的変化
        if (colorMode === 'dynamic') {
            site.color.h = (site.color.h + 0.5) % 360;
        }
    }
}

function generateVoronoi() {
    // 簡易ボロノイ図の生成（ピクセルベース）
    // 実装を簡素化するため、距離フィールドアプローチを使用
}

function drawVoronoi() {
    if (!fillCells && !showEdges) return;
    
    // ピクセルごとに最近傍サイトを計算
    loadPixels();
    
    let step = 3; // パフォーマンス向上のためステップサイズを設定
    
    for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
            let minDist = Infinity;
            let closestSite = null;
            let secondClosest = null;
            let secondMinDist = Infinity;
            
            // 最近傍と二番目に近いサイトを見つける
            for (let site of sites) {
                let dist = sqrt((x - site.x) * (x - site.x) + (y - site.y) * (y - site.y));
                
                if (dist < minDist) {
                    secondMinDist = minDist;
                    secondClosest = closestSite;
                    minDist = dist;
                    closestSite = site;
                } else if (dist < secondMinDist) {
                    secondMinDist = dist;
                    secondClosest = site;
                }
            }
            
            if (closestSite) {
                // エッジの検出（距離の差が小さい場合）
                let edgeThreshold = 8;
                let isEdge = secondClosest && (secondMinDist - minDist) < edgeThreshold;
                
                if (fillCells && !isEdge) {
                    // セルを塗りつぶし - より鮮やかな色で
                    let distanceRatio = minDist / (width * 0.3);
                    let saturation = closestSite.color.s - (distanceRatio * 30);
                    saturation = constrain(saturation, 60, 100);
                    fill(closestSite.color.h, saturation, closestSite.color.b, 90);
                    noStroke();
                    rect(x, y, step, step);
                } else if (showEdges && isEdge) {
                    // エッジを描画 - 白で目立たせる
                    stroke(0, 0, 100, 80);
                    strokeWeight(1.5);
                    point(x, y);
                }
            }
        }
    }
}

function drawSites() {
    for (let site of sites) {
        push();
        
        translate(site.x, site.y);
        
        // サイトの光源効果
        push();
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = `hsla(${site.color.h}, ${site.color.s}%, ${site.color.b}%, 1.0)`;
        
        // サイトの描画 - より鮮やかに
        fill(site.color.h, site.color.s, site.color.b, 100);
        stroke(0, 0, 100, 80);
        strokeWeight(2);
        
        let pulseSize = site.size + sin(time * 4 + site.pulsePhase) * 3;
        ellipse(0, 0, pulseSize);
        
        // サイトの中心点 - 白いコア
        fill(0, 0, 100, 100);
        noStroke();
        ellipse(0, 0, pulseSize * 0.3);
        
        pop();
        
        pop();
    }
}

function drawUI() {
    // 半透明黒背景
    fill(0, 0, 0, 80);
    noStroke();
    rect(10, 10, 280, 160, 5);
    
    fill(0, 0, 100, 90);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Voronoi Art", 20, 20);
    
    textSize(12);
    text(`Animation: ${animationMode}`, 20, 50);
    text(`Color Mode: ${colorMode}`, 20, 70);
    text(`Sites: ${numSites}`, 20, 90);
    text(`Show Sites: ${showSites ? 'ON' : 'OFF'}`, 20, 110);
    text(`Show Edges: ${showEdges ? 'ON' : 'OFF'}`, 20, 130);
    text(`Fill Cells: ${fillCells ? 'ON' : 'OFF'}`, 20, 150);
    
    // コントロール情報
    fill(0, 0, 20, 80);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`Controls:`, 20, height - 180);
    text(`1-6: Animation modes | Q-U: Color modes`, 20, height - 160);
    text(`+/-: Site count | S/E/F: Display toggles`, 20, height - 140);
    text(`SPACE: Regenerate | R: Reset positions`, 20, height - 120);
    text(`Click: Add site | Drag: Move nearest site`, 20, height - 100);
    text(`T: Toggle turbulence`, 20, height - 80);
    text(`C: Clear trails`, 20, height - 60);
}

function keyPressed() {
    if (key === '1') {
        animationMode = 'static';
    } else if (key === '2') {
        animationMode = 'drift';
    } else if (key === '3') {
        animationMode = 'pulse';
    } else if (key === '4') {
        animationMode = 'spiral';
    } else if (key === '5') {
        animationMode = 'gravity';
    } else if (key === '6') {
        animationMode = 'turbulence';
    } else if (key === 'q' || key === 'Q') {
        colorMode = 'rainbow';
        updateColors();
    } else if (key === 'w' || key === 'W') {
        colorMode = 'warm';
        updateColors();
    } else if (key === 'e' || key === 'E') {
        colorMode = 'cool';
        updateColors();
    } else if (key === 'r' || key === 'R') {
        resetPositions();
    } else if (key === 't' || key === 'T') {
        colorMode = 'pastel';
        updateColors();
    } else if (key === 'y' || key === 'Y') {
        colorMode = 'neon';
        updateColors();
    } else if (key === 'u' || key === 'U') {
        colorMode = 'monochrome';
        updateColors();
    } else if (key === '+' || key === '=') {
        numSites = min(numSites + 5, 200);
        generateSites();
    } else if (key === '-') {
        numSites = max(numSites - 5, 10);
        sites = sites.slice(0, numSites);
    } else if (key === ' ') {
        generateSites();
    } else if (key === 's' || key === 'S') {
        showSites = !showSites;
    } else if (key === 'e' || key === 'E') {
        showEdges = !showEdges;
    } else if (key === 'f' || key === 'F') {
        fillCells = !fillCells;
    } else if (key === 'c' || key === 'C') {
        background(0, 0, 10);
    }
}

function updateColors() {
    for (let i = 0; i < sites.length; i++) {
        sites[i].color = getSiteColor(i);
    }
}

function resetPositions() {
    for (let site of sites) {
        site.x = site.originalX;
        site.y = site.originalY;
        site.vx = random(-2, 2);
        site.vy = random(-2, 2);
    }
}

function mousePressed() {
    // 新しいサイトを追加
    let newSite = {
        x: mouseX,
        y: mouseY,
        originalX: mouseX,
        originalY: mouseY,
        vx: random(-2, 2),
        vy: random(-2, 2),
        color: getSiteColor(sites.length),
        size: random(5, 15),
        pulsePhase: random(TWO_PI),
        spiralRadius: random(50, 200),
        spiralSpeed: random(0.5, 2),
        spiralPhase: random(TWO_PI)
    };
    
    sites.push(newSite);
    numSites = sites.length;
}

function mouseDragged() {
    // 最も近いサイトを移動
    let minDist = Infinity;
    let closestSite = null;
    
    for (let site of sites) {
        let dist = sqrt((mouseX - site.x) * (mouseX - site.x) + (mouseY - site.y) * (mouseY - site.y));
        if (dist < minDist) {
            minDist = dist;
            closestSite = site;
        }
    }
    
    if (closestSite && minDist < 50) {
        closestSite.x = mouseX;
        closestSite.y = mouseY;
        closestSite.originalX = mouseX;
        closestSite.originalY = mouseY;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // サイト位置をスケール調整
    let scaleX = windowWidth / width;
    let scaleY = windowHeight / height;
    
    for (let site of sites) {
        site.x *= scaleX;
        site.y *= scaleY;
        site.originalX *= scaleX;
        site.originalY *= scaleY;
    }
}