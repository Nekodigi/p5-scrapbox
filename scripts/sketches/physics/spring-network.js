let nodes = [];
let springs = [];
let numNodes = 20;
let springLength = 80;
let springStrength = 0.02;
let damping = 0.95;
let repulsion = 500;
let centerForce = 0.001;
let showConnections = true;
let networkType = 'grid'; // ネットワークタイプ1（グリッド）を初期値に設定

function setup() {
    // HTML側のsketch-containerに合わせてキャンバスサイズを調整
    const canvas = createCanvas(windowWidth * 0.7, windowHeight * 0.8);
    canvas.parent('sketch-container');
    colorMode(HSB, 360, 100, 100, 100);
    
    // 物理パラメータを高速収束に調整
    springStrength = 0.02; // 適度な強さで速やかな収束
    damping = 0.85; // 基本ダンピング（適応的に変更される）
    repulsion = 100; // 反発力をさらに弱く
    centerForce = 0.001; // 中心への引力
    
    // 初期設定でnetwork type 1（グリッド）を生成
    networkType = 'grid';
    createNetwork(networkType);
    background(0);
    
    // 数フレーム後に追加の初期化（canvasサイズが確定してから）
    setTimeout(() => {
        // resetと同じ処理を実行
        createNetwork(networkType);
        console.log("Spring Network: 初期化完了, ノード数:", nodes.length);
    }, 100);
}

function draw() {
    background(0, 0, 5, 80);
    
    // 物理演算を毎フレーム実行（CA Elementaryと違い、Spring Networkは連続的な物理演算が必要）
    updatePhysics();
    drawNetwork();
    drawUI();
}

function createNetwork(type) {
    nodes = [];
    springs = [];
    
    switch (type) {
        case 'grid':
            createGridNetwork();
            break;
        case 'random':
            createRandomNetwork();
            break;
        case 'circular':
            createCircularNetwork();
            break;
        case 'tree':
            createTreeNetwork();
            break;
    }
    
    // ネットワーク作成後に初期動作を追加
    addInitialMotion();
}

function addInitialMotion() {
    console.log("addInitialMotion 実行中, ノード数:", nodes.length, "画面サイズ:", width, "x", height);
    
    // 安定した初期速度を全ノードに設定
    for (let node of nodes) {
        if (!node.pinned) {
            // より小さな初期速度で発散を防ぐ
            node.vx = random(-2, 2);
            node.vy = random(-2, 2);
        }
    }
    
    // 中央付近のノードに少し大きな揺れを追加
    let centerX = width / 2;
    let centerY = height / 2;
    for (let node of nodes) {
        let distFromCenter = dist(node.x, node.y, centerX, centerY);
        if (distFromCenter < 100 && !node.pinned) {
            node.vx += random(-1, 1);
            node.vy += random(-1, 1);
        }
    }
    
    console.log("初期速度設定完了, 最初のノード速度:", nodes.length > 0 ? `(${nodes[0].vx.toFixed(2)}, ${nodes[0].vy.toFixed(2)})` : "ノードなし");
}

function createGridNetwork() {
    let gridSize = floor(sqrt(numNodes));
    let spacing = width / (gridSize + 1);
    
    // ノードを作成
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            nodes.push({
                x: (i + 1) * spacing,
                y: (j + 1) * spacing,
                vx: 0,
                vy: 0,
                mass: random(0.5, 2),
                pinned: false,
                id: i * gridSize + j,
                connections: 0
            });
        }
    }
    
    // スプリングを作成
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            let currentIndex = i * gridSize + j;
            
            // 右のノードとの接続
            if (i < gridSize - 1) {
                let rightIndex = (i + 1) * gridSize + j;
                springs.push({
                    a: currentIndex,
                    b: rightIndex,
                    restLength: springLength,
                    strength: springStrength
                });
                nodes[currentIndex].connections++;
                nodes[rightIndex].connections++;
            }
            
            // 下のノードとの接続
            if (j < gridSize - 1) {
                let bottomIndex = i * gridSize + (j + 1);
                springs.push({
                    a: currentIndex,
                    b: bottomIndex,
                    restLength: springLength,
                    strength: springStrength
                });
                nodes[currentIndex].connections++;
                nodes[bottomIndex].connections++;
            }
        }
    }
}

function createRandomNetwork() {
    // ランダムにノードを配置
    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: random(width * 0.2, width * 0.8),
            y: random(height * 0.2, height * 0.8),
            vx: 0,
            vy: 0,
            mass: random(0.5, 2),
            pinned: false,
            id: i,
            connections: 0
        });
    }
    
    // ランダムにスプリングを作成
    for (let i = 0; i < numNodes; i++) {
        let numConnections = floor(random(1, 4));
        for (let j = 0; j < numConnections; j++) {
            let target = floor(random(numNodes));
            if (target !== i && !isConnected(i, target)) {
                springs.push({
                    a: i,
                    b: target,
                    restLength: springLength,
                    strength: springStrength
                });
                nodes[i].connections++;
                nodes[target].connections++;
            }
        }
    }
}

function createCircularNetwork() {
    let radius = min(width, height) * 0.3;
    let centerX = width / 2;
    let centerY = height / 2;
    
    // 円形にノードを配置
    for (let i = 0; i < numNodes; i++) {
        let angle = (i / numNodes) * TWO_PI;
        nodes.push({
            x: centerX + cos(angle) * radius,
            y: centerY + sin(angle) * radius,
            vx: 0,
            vy: 0,
            mass: random(0.5, 2),
            pinned: false,
            id: i,
            connections: 0
        });
    }
    
    // 隣接ノードとの接続
    for (let i = 0; i < numNodes; i++) {
        let next = (i + 1) % numNodes;
        springs.push({
            a: i,
            b: next,
            restLength: springLength,
            strength: springStrength
        });
        nodes[i].connections++;
        nodes[next].connections++;
        
        // 対角線の接続（少し）
        if (i < numNodes / 2) {
            let opposite = i + floor(numNodes / 2);
            springs.push({
                a: i,
                b: opposite,
                restLength: springLength * 1.5,
                strength: springStrength * 0.5
            });
            nodes[i].connections++;
            nodes[opposite].connections++;
        }
    }
}

function createTreeNetwork() {
    // 中央にルートノードを配置
    nodes.push({
        x: width / 2,
        y: height / 2,
        vx: 0,
        vy: 0,
        mass: 2,
        pinned: false,
        id: 0,
        connections: 0
    });
    
    // 階層的にノードを追加
    for (let level = 1; level < 4; level++) {
        let nodesInLevel = Math.pow(2, level);
        let angleStep = TWO_PI / nodesInLevel;
        let radius = level * 60;
        
        for (let i = 0; i < nodesInLevel && nodes.length < numNodes; i++) {
            let angle = i * angleStep;
            let x = width / 2 + cos(angle) * radius;
            let y = height / 2 + sin(angle) * radius;
            
            nodes.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                mass: random(0.5, 1.5),
                pinned: false,
                id: nodes.length,
                connections: 0
            });
            
            // 親ノードとの接続
            let parentIndex = floor((nodes.length - 2) / 2);
            if (parentIndex >= 0) {
                springs.push({
                    a: parentIndex,
                    b: nodes.length - 1,
                    restLength: springLength,
                    strength: springStrength
                });
                nodes[parentIndex].connections++;
                nodes[nodes.length - 1].connections++;
            }
        }
    }
}

function isConnected(a, b) {
    for (let spring of springs) {
        if ((spring.a === a && spring.b === b) || (spring.a === b && spring.b === a)) {
            return true;
        }
    }
    return false;
}

function updatePhysics() {
    // スプリング力を計算
    for (let spring of springs) {
        let nodeA = nodes[spring.a];
        let nodeB = nodes[spring.b];
        
        let dx = nodeB.x - nodeA.x;
        let dy = nodeB.y - nodeA.y;
        let distance = sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            let force = (distance - spring.restLength) * spring.strength;
            let fx = (dx / distance) * force;
            let fy = (dy / distance) * force;
            
            if (!nodeA.pinned) {
                nodeA.vx += fx / nodeA.mass;
                nodeA.vy += fy / nodeA.mass;
            }
            if (!nodeB.pinned) {
                nodeB.vx -= fx / nodeB.mass;
                nodeB.vy -= fy / nodeB.mass;
            }
        }
    }
    
    // 反発力を計算
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let nodeA = nodes[i];
            let nodeB = nodes[j];
            
            let dx = nodeB.x - nodeA.x;
            let dy = nodeB.y - nodeA.y;
            let distance = sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < 100) {
                let force = repulsion / (distance * distance);
                let fx = (dx / distance) * force;
                let fy = (dy / distance) * force;
                
                if (!nodeA.pinned) {
                    nodeA.vx -= fx / nodeA.mass;
                    nodeA.vy -= fy / nodeA.mass;
                }
                if (!nodeB.pinned) {
                    nodeB.vx += fx / nodeB.mass;
                    nodeB.vy += fy / nodeB.mass;
                }
            }
        }
    }
    
    // 中心への引力
    let centerX = width / 2;
    let centerY = height / 2;
    
    for (let node of nodes) {
        if (!node.pinned) {
            let dx = centerX - node.x;
            let dy = centerY - node.y;
            
            node.vx += dx * centerForce;
            node.vy += dy * centerForce;
        }
    }
    
    // 適応的ダンピングを計算
    let totalKineticEnergy = 0;
    for (let node of nodes) {
        if (!node.pinned) {
            totalKineticEnergy += node.vx * node.vx + node.vy * node.vy;
        }
    }
    
    // エネルギーに基づく適応的ダンピング
    let adaptiveDamping = damping;
    if (totalKineticEnergy > 50) {
        adaptiveDamping = 0.7; // 高エネルギー時は強いダンピング
    } else if (totalKineticEnergy > 10) {
        adaptiveDamping = 0.85; // 中エネルギー時は普通のダンピング
    } else if (totalKineticEnergy > 1) {
        adaptiveDamping = 0.95; // 低エネルギー時は弱いダンピング
    } else {
        adaptiveDamping = 0.99; // 極低エネルギー時は最小ダンピング
    }
    
    // ノードの位置を更新
    for (let node of nodes) {
        if (!node.pinned) {
            // 速度しきい値で微小な動きを停止
            if (abs(node.vx) < 0.01 && abs(node.vy) < 0.01) {
                node.vx *= 0.5;
                node.vy *= 0.5;
            }
            
            node.x += node.vx;
            node.y += node.vy;
            
            node.vx *= adaptiveDamping;
            node.vy *= adaptiveDamping;
            
            // 境界条件
            if (node.x < 20) {
                node.x = 20;
                node.vx *= -0.5;
            }
            if (node.x > width - 20) {
                node.x = width - 20;
                node.vx *= -0.5;
            }
            if (node.y < 20) {
                node.y = 20;
                node.vy *= -0.5;
            }
            if (node.y > height - 20) {
                node.y = height - 20;
                node.vy *= -0.5;
            }
        }
    }
}

function drawNetwork() {
    // スプリングを描画
    if (showConnections) {
        for (let spring of springs) {
            let nodeA = nodes[spring.a];
            let nodeB = nodes[spring.b];
            
            let dx = nodeB.x - nodeA.x;
            let dy = nodeB.y - nodeA.y;
            let distance = sqrt(dx * dx + dy * dy);
            let strain = distance / spring.restLength;
            
            // ストレインに基づく色
            let hue = map(strain, 0.5, 2, 240, 0);
            hue = constrain(hue, 0, 360);
            let alpha = map(strain, 0.5, 1.5, 30, 80);
            
            stroke(hue, 80, 90, alpha);
            strokeWeight(map(spring.strength, 0, springStrength * 2, 1, 3));
            line(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
        }
    }
    
    // ノードを描画
    for (let node of nodes) {
        let speed = sqrt(node.vx * node.vx + node.vy * node.vy);
        let hue = map(node.connections, 0, 8, 120, 60);
        let brightness = map(speed, 0, 5, 60, 100);
        let size = map(node.mass, 0.5, 2, 8, 16);
        
        if (node.pinned) {
            fill(0, 100, 100, 90);
            stroke(0, 80, 100);
            strokeWeight(2);
        } else {
            fill(hue, 80, brightness, 80);
            stroke(hue, 60, 100, 60);
            strokeWeight(1);
        }
        
        ellipse(node.x, node.y, size);
        
        // 速度ベクトル
        if (speed > 1) {
            stroke(hue, 40, 100, 40);
            strokeWeight(1);
            line(node.x, node.y, 
                 node.x + node.vx * 10, 
                 node.y + node.vy * 10);
        }
    }
}

function drawUI() {
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, 280, 160);
    
    fill(0, 0, 100, 90);
    textAlign(LEFT, TOP);
    textSize(14);
    text("Spring Network", 20, 20);
    
    textSize(12);
    text(`Network: ${networkType}`, 20, 50);
    text(`Nodes: ${nodes.length}`, 20, 70);
    text(`Springs: ${springs.length}`, 20, 90);
    text(`Spring Strength: ${springStrength.toFixed(4)}`, 20, 110);
    text(`Damping: ${damping.toFixed(3)} (adaptive)`, 20, 130);
    text(`Repulsion: ${repulsion}`, 20, 150);
    
    // エネルギー情報を表示
    let totalEnergy = 0;
    for (let node of nodes) {
        if (!node.pinned) {
            totalEnergy += node.vx * node.vx + node.vy * node.vy;
        }
    }
    text(`Total Energy: ${totalEnergy.toFixed(2)}`, 20, 170);
    
    // コントロール情報
    fill(0, 0, 100, 80);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`Controls:`, 20, height - 140);
    text(`1-4: Network type | Click: Impact | Shift+Click: Pin`, 20, height - 120);
    text(`S/A: Spring strength | D/F: Damping`, 20, height - 100);
    text(`C: Toggle connections | Space: Shake`, 20, height - 80);
    text(`R: Reset network`, 20, height - 60);
}

function keyPressed() {
    if (key === '1') {
        networkType = 'grid';
        createNetwork(networkType);
        background(0); // 背景をクリア
    } else if (key === '2') {
        networkType = 'random';
        createNetwork(networkType);
        background(0); // 背景をクリア
    } else if (key === '3') {
        networkType = 'circular';
        createNetwork(networkType);
        background(0); // 背景をクリア
    } else if (key === '4') {
        networkType = 'tree';
        createNetwork(networkType);
        background(0); // 背景をクリア
    } else if (key === 's' || key === 'S') {
        springStrength = min(springStrength + 0.005, 0.1);
    } else if (key === 'a' || key === 'A') {
        springStrength = max(springStrength - 0.005, 0.001);
    } else if (key === 'd' || key === 'D') {
        damping = min(damping + 0.01, 0.99);
    } else if (key === 'f' || key === 'F') {
        damping = max(damping - 0.01, 0.8);
    } else if (key === 'c' || key === 'C') {
        showConnections = !showConnections;
    } else if (key === ' ') {
        // ネットワークを揺らす（より穏やかに）
        for (let node of nodes) {
            if (!node.pinned) {
                node.vx += random(-1, 1); // より小さな刺激
                node.vy += random(-1, 1);
            }
        }
    } else if (key === 'r' || key === 'R') {
        createNetwork(networkType);
    }
}

function mousePressed() {
    // マウス位置に最も近いノードを検索してピン留め、または衝撃を与える
    let minDistance = Infinity;
    let closestNode = null;
    
    for (let node of nodes) {
        let distance = dist(mouseX, mouseY, node.x, node.y);
        if (distance < minDistance && distance < 50) {
            minDistance = distance;
            closestNode = node;
        }
    }
    
    if (closestNode) {
        if (keyIsDown(SHIFT)) {
            // Shiftキーが押されている場合はピン留め
            closestNode.pinned = !closestNode.pinned;
            if (closestNode.pinned) {
                closestNode.vx = 0;
                closestNode.vy = 0;
            }
        } else {
            // 通常のクリックは穏やかな衝撃を与える
            let force = 3; // より弱い力
            let dx = closestNode.x - mouseX;
            let dy = closestNode.y - mouseY;
            let distance = sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                closestNode.vx += (dx / distance) * force;
                closestNode.vy += (dy / distance) * force;
            }
            
            // 周辺のノードにも穏やかな影響を与える
            for (let node of nodes) {
                let nodeDistance = dist(mouseX, mouseY, node.x, node.y);
                if (nodeDistance < 80 && node !== closestNode) {
                    let nodeForce = map(nodeDistance, 0, 80, force * 0.3, 0);
                    let nodeDx = node.x - mouseX;
                    let nodeDy = node.y - mouseY;
                    let nodeDistanceNorm = sqrt(nodeDx * nodeDx + nodeDy * nodeDy);
                    
                    if (nodeDistanceNorm > 0) {
                        node.vx += (nodeDx / nodeDistanceNorm) * nodeForce;
                        node.vy += (nodeDy / nodeDistanceNorm) * nodeForce;
                    }
                }
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth * 0.7, windowHeight * 0.8);
    createNetwork(networkType);
}