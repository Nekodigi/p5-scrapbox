let objects = [];
let constraints = [];
let gravity = {x: 0, y: 0.5};
let airResistance = 0.99;
let mouseConstraint = null;
let selectedObject = null;
let tool = 'circle'; // circle, pin
let isCreating = false;
let creationStart = null;

let tools = ['circle', 'pin', 'delete'];
let objectTypes = ['dynamic', 'static', 'kinematic'];
let presets = ['tower', 'pendulum', 'chain', 'bridge', 'dominos'];

let settings = {
    showTrails: false,
    showForces: false,
    showConstraints: true,
    timeScale: 1.0,
    objectCount: 0,
    maxObjects: 100
};

function initializePhysics() {
    colorMode(HSB, 360, 100, 100, 100);
    
    // 初期サンプルオブジェクトを配置
    createInitialObjects();
}

function draw() {
    background(0, 0, 5, settings.showTrails ? 30 : 100);
    
    // 物理シミュレーション
    updatePhysics();
    
    // 描画
    drawObjects();
    drawConstraints();
    drawUI();
    drawCreationPreview();
    
    // マウス制約の更新
    updateMouseConstraint();
}

function updatePhysics() {
    for (let obj of objects) {
        if (obj.type === 'dynamic') {
            // 重力
            obj.acceleration.x += gravity.x;
            obj.acceleration.y += gravity.y;
            
            // 速度更新
            obj.velocity.x += obj.acceleration.x * settings.timeScale;
            obj.velocity.y += obj.acceleration.y * settings.timeScale;
            
            // 空気抵抗
            obj.velocity.x *= airResistance;
            obj.velocity.y *= airResistance;
            
            // 位置更新
            obj.position.x += obj.velocity.x * settings.timeScale;
            obj.position.y += obj.velocity.y * settings.timeScale;
            
            // 加速度リセット
            obj.acceleration.x = 0;
            obj.acceleration.y = 0;
        }
        
        // 境界チェック
        handleBoundaryCollision(obj);
    }
    
    // 制約の処理
    for (let constraint of constraints) {
        satisfyConstraint(constraint);
    }
    
    // オブジェクト間の衝突
    handleCollisions();
}

function handleBoundaryCollision(obj) {
    let bounce = 0.8;
    
    if (obj.shape === 'circle') {
        if (obj.position.x - obj.radius < 0) {
            obj.position.x = obj.radius;
            obj.velocity.x *= -bounce;
        }
        if (obj.position.x + obj.radius > width) {
            obj.position.x = width - obj.radius;
            obj.velocity.x *= -bounce;
        }
        if (obj.position.y - obj.radius < 0) {
            obj.position.y = obj.radius;
            obj.velocity.y *= -bounce;
        }
        if (obj.position.y + obj.radius > height) {
            obj.position.y = height - obj.radius;
            obj.velocity.y *= -bounce;
        }
    }
}

function handleCollisions() {
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            let obj1 = objects[i];
            let obj2 = objects[j];
            
            if (obj1.type === 'static' && obj2.type === 'static') continue;
            
            let collision = checkCollision(obj1, obj2);
            if (collision) {
                resolveCollision(obj1, obj2, collision);
            }
        }
    }
}

function checkCollision(obj1, obj2) {
    if (obj1.shape === 'circle' && obj2.shape === 'circle') {
        let dx = obj2.position.x - obj1.position.x;
        let dy = obj2.position.y - obj1.position.y;
        let distance = sqrt(dx * dx + dy * dy);
        let minDistance = obj1.radius + obj2.radius;
        
        if (distance < minDistance) {
            return {
                normal: {x: dx / distance, y: dy / distance},
                penetration: minDistance - distance
            };
        }
    }
    return null;
}

function resolveCollision(obj1, obj2, collision) {
    let restitution = 0.8;
    
    // 位置補正
    let correction = collision.penetration / 2;
    if (obj1.type === 'dynamic') {
        obj1.position.x -= collision.normal.x * correction;
        obj1.position.y -= collision.normal.y * correction;
    }
    if (obj2.type === 'dynamic') {
        obj2.position.x += collision.normal.x * correction;
        obj2.position.y += collision.normal.y * correction;
    }
    
    // 速度計算
    let relativeVelocity = {
        x: obj2.velocity.x - obj1.velocity.x,
        y: obj2.velocity.y - obj1.velocity.y
    };
    
    let velocityInNormal = relativeVelocity.x * collision.normal.x + 
                          relativeVelocity.y * collision.normal.y;
    
    if (velocityInNormal > 0) return; // 分離中
    
    let impulse = -(1 + restitution) * velocityInNormal;
    impulse /= (1/obj1.mass + 1/obj2.mass);
    
    if (obj1.type === 'dynamic') {
        obj1.velocity.x -= impulse * collision.normal.x / obj1.mass;
        obj1.velocity.y -= impulse * collision.normal.y / obj1.mass;
    }
    if (obj2.type === 'dynamic') {
        obj2.velocity.x += impulse * collision.normal.x / obj2.mass;
        obj2.velocity.y += impulse * collision.normal.y / obj2.mass;
    }
}

function satisfyConstraint(constraint) {
    if (constraint.type === 'distance') {
        let obj1 = constraint.obj1;
        let obj2 = constraint.obj2;
        
        let dx = obj2.position.x - obj1.position.x;
        let dy = obj2.position.y - obj1.position.y;
        let distance = sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            let difference = constraint.restLength - distance;
            let percent = difference / distance / 2;
            let offsetX = dx * percent;
            let offsetY = dy * percent;
            
            if (obj1.type === 'dynamic') {
                obj1.position.x -= offsetX;
                obj1.position.y -= offsetY;
            }
            if (obj2.type === 'dynamic') {
                obj2.position.x += offsetX;
                obj2.position.y += offsetY;
            }
        }
    } else if (constraint.type === 'pin') {
        constraint.obj.position.x = constraint.position.x;
        constraint.obj.position.y = constraint.position.y;
        constraint.obj.velocity.x = 0;
        constraint.obj.velocity.y = 0;
    }
}

function drawObjects() {
    for (let obj of objects) {
        push();
        translate(obj.position.x, obj.position.y);
        
        // 色の設定
        let hue = obj.type === 'static' ? 0 : 
                  obj.type === 'kinematic' ? 120 : 200;
        fill(hue, 70, 90, 80);
        stroke(hue, 80, 100);
        strokeWeight(2);
        
        // 選択されたオブジェクトのハイライト
        if (obj === selectedObject) {
            stroke(60, 100, 100);
            strokeWeight(3);
        }
        
        // 形状の描画
        if (obj.shape === 'circle') {
            ellipse(0, 0, obj.radius * 2);
        }
        
        // 力の可視化
        if (settings.showForces && obj.type === 'dynamic') {
            stroke(0, 100, 100, 60);
            strokeWeight(2);
            let forceScale = 50;
            line(0, 0, obj.velocity.x * forceScale, obj.velocity.y * forceScale);
        }
        
        pop();
        
        // トレイル
        if (settings.showTrails) {
            if (!obj.trail) obj.trail = [];
            obj.trail.push({x: obj.position.x, y: obj.position.y});
            if (obj.trail.length > 50) obj.trail.shift();
            
            stroke(hue, 60, 80, 40);
            strokeWeight(1);
            noFill();
            beginShape();
            for (let point of obj.trail) {
                vertex(point.x, point.y);
            }
            endShape();
        }
    }
}

function drawConstraints() {
    if (!settings.showConstraints) return;
    
    for (let constraint of constraints) {
        if (constraint.type === 'distance') {
            let obj1 = constraint.obj1;
            let obj2 = constraint.obj2;
            
            let distance = dist(obj1.position.x, obj1.position.y, 
                              obj2.position.x, obj2.position.y);
            let strain = distance / constraint.restLength;
            
            let hue = map(strain, 0.8, 1.2, 240, 0);
            hue = constrain(hue, 0, 240);
            
            stroke(hue, 80, 90, 80);
            strokeWeight(map(strain, 0.5, 2, 1, 4));
            line(obj1.position.x, obj1.position.y, 
                 obj2.position.x, obj2.position.y);
        } else if (constraint.type === 'pin') {
            fill(60, 100, 100, 80);
            stroke(60, 80, 100);
            strokeWeight(2);
            ellipse(constraint.position.x, constraint.position.y, 10);
        }
    }
}

function drawCreationPreview() {
    if (isCreating && creationStart) {
        stroke(120, 80, 100, 60);
        strokeWeight(2);
        
        if (tool === 'circle') {
            let radius = dist(creationStart.x, creationStart.y, mouseX, mouseY);
            noFill();
            ellipse(creationStart.x, creationStart.y, radius * 2);
        }
    }
}

function updateMouseConstraint() {
    if (mouseConstraint) {
        mouseConstraint.position.x = mouseX;
        mouseConstraint.position.y = mouseY;
    }
}

function drawUI() {
    // UI表示を削除（HTMLで管理）
}

function createObject(x, y, shape, options = {}) {
    if (objects.length >= settings.maxObjects) return null;
    
    let obj = {
        position: {x: x, y: y},
        velocity: {x: 0, y: 0},
        acceleration: {x: 0, y: 0},
        shape: shape,
        type: options.type || 'dynamic',
        mass: options.mass || 1,
        hue: options.hue || random(360),
        angle: options.angle || 0,
        angularVelocity: 0
    };
    
    if (shape === 'circle') {
        obj.radius = options.radius || 20;
        obj.mass = options.mass || (obj.radius * obj.radius * 0.01);
    }
    
    objects.push(obj);
    settings.objectCount = objects.length;
    return obj;
}

function createConstraint(type, obj1, obj2 = null, options = {}) {
    let constraint = {type: type};
    
    if (type === 'distance') {
        constraint.obj1 = obj1;
        constraint.obj2 = obj2;
        constraint.restLength = options.restLength || 
            dist(obj1.position.x, obj1.position.y, obj2.position.x, obj2.position.y);
    } else if (type === 'pin') {
        constraint.obj = obj1;
        constraint.position = {x: obj1.position.x, y: obj1.position.y};
    }
    
    constraints.push(constraint);
    return constraint;
}

function createPreset(presetName) {
    clearAll();
    
    switch (presetName) {
        case 'tower':
            for (let i = 0; i < 8; i++) {
                createObject(width/2, height - 50 - i * 42, 'circle', {
                    radius: 20, mass: 1
                });
            }
            break;
            
        case 'pendulum':
            let anchor = createObject(width/2, 100, 'circle', {
                radius: 5, type: 'static'
            });
            let bob = createObject(width/2, 300, 'circle', {
                radius: 20, mass: 2
            });
            createConstraint('distance', anchor, bob);
            createConstraint('pin', anchor);
            break;
            
        case 'chain':
            let prev = null;
            for (let i = 0; i < 8; i++) {
                let obj = createObject(width/2 + i * 20, 200, 'circle', {
                    radius: 8, mass: 0.5
                });
                if (i === 0) {
                    createConstraint('pin', obj);
                }
                if (prev) {
                    createConstraint('distance', prev, obj, {restLength: 18});
                }
                prev = obj;
            }
            break;
            
        case 'bridge':
            let anchors = [
                createObject(200, 300, 'circle', {radius: 8, type: 'static'}),
                createObject(width - 200, 300, 'circle', {radius: 8, type: 'static'})
            ];
            
            let bridgeParts = [];
            let partCount = 12;
            for (let i = 0; i < partCount; i++) {
                let x = map(i, 0, partCount - 1, 200, width - 200);
                bridgeParts.push(createObject(x, 300, 'circle', {
                    radius: 8, mass: 0.5
                }));
            }
            
            for (let i = 0; i < bridgeParts.length - 1; i++) {
                createConstraint('distance', bridgeParts[i], bridgeParts[i + 1]);
            }
            createConstraint('distance', anchors[0], bridgeParts[0]);
            createConstraint('distance', anchors[1], bridgeParts[bridgeParts.length - 1]);
            break;
            
        case 'dominos':
            for (let i = 0; i < 10; i++) {
                createObject(200 + i * 50, height - 40, 'circle', {
                    radius: 15, mass: 1
                });
            }
            break;
    }
}

function clearAll() {
    objects = [];
    constraints = [];
    selectedObject = null;
    mouseConstraint = null;
    settings.objectCount = 0;
}

function getObjectAt(x, y) {
    for (let obj of objects) {
        if (obj.shape === 'circle') {
            let distance = dist(x, y, obj.position.x, obj.position.y);
            if (distance < obj.radius) {
                return obj;
            }
        }
    }
    return null;
}

function mousePressed() {
    
    let clickedObj = getObjectAt(mouseX, mouseY);
    
    if (tool === 'delete' && clickedObj) {
        // オブジェクト削除
        let index = objects.indexOf(clickedObj);
        if (index !== -1) {
            objects.splice(index, 1);
            
            // 関連する制約も削除
            constraints = constraints.filter(c => 
                c.obj !== clickedObj && c.obj1 !== clickedObj && c.obj2 !== clickedObj
            );
            
            if (selectedObject === clickedObj) {
                selectedObject = null;
            }
        }
        return;
    }
    
    if (clickedObj) {
        selectedObject = clickedObj;
        
        if (mouseButton === RIGHT) {
            // ピン制約を追加
            createConstraint('pin', clickedObj);
        } else {
            // ドラッグ開始
            mouseConstraint = createConstraint('pin', clickedObj);
        }
    } else {
        // 新しいオブジェクト作成開始
        if (tool === 'circle') {
            isCreating = true;
            creationStart = {x: mouseX, y: mouseY};
        } else if (tool === 'pin') {
            let newObj = createObject(mouseX, mouseY, 'circle', {
                radius: 10, type: 'static'
            });
            createConstraint('pin', newObj);
        }
    }
}

function mouseDragged() {
    if (mouseConstraint) {
        if (keyIsDown(SHIFT)) {
            // 力を適用
            let force = {
                x: (mouseX - mouseConstraint.obj.position.x) * 0.1,
                y: (mouseY - mouseConstraint.obj.position.y) * 0.1
            };
            mouseConstraint.obj.velocity.x += force.x;
            mouseConstraint.obj.velocity.y += force.y;
        }
    }
}

function mouseReleased() {
    if (isCreating && creationStart) {
        if (tool === 'circle') {
            let radius = dist(creationStart.x, creationStart.y, mouseX, mouseY);
            if (radius > 5) {
                createObject(creationStart.x, creationStart.y, 'circle', {radius: radius});
            }
        }
        
        isCreating = false;
        creationStart = null;
    }
    
    if (mouseConstraint) {
        // マウス制約を削除
        let index = constraints.indexOf(mouseConstraint);
        if (index !== -1) {
            constraints.splice(index, 1);
        }
        mouseConstraint = null;
    }
}

function keyPressed() {
    if (key >= '1' && key <= '3') {
        tool = tools[parseInt(key) - 1];
    } else if (key === 'q' || key === 'Q') {
        gravity.y = max(gravity.y - 0.1, -2);
    } else if (key === 'w' || key === 'W') {
        gravity.y = min(gravity.y + 0.1, 2);
    } else if (key === 'e' || key === 'E') {
        settings.timeScale = max(settings.timeScale - 0.1, 0.1);
    } else if (key === 'r' || key === 'R') {
        settings.timeScale = min(settings.timeScale + 0.1, 3);
    } else if (key === 't' || key === 'T') {
        settings.showTrails = !settings.showTrails;
    } else if (key === 'f' || key === 'F') {
        settings.showForces = !settings.showForces;
    } else if (key === 'c' || key === 'C') {
        settings.showConstraints = !settings.showConstraints;
    } else if (key === 'p' || key === 'P') {
        let presetNames = ['tower', 'pendulum', 'chain', 'bridge', 'dominos'];
        let randomPreset = presetNames[floor(random(presetNames.length))];
        createPreset(randomPreset);
    } else if (key === ' ') {
        // 現在のオブジェクトをリセット（速度をゼロに）
        for (let obj of objects) {
            obj.velocity.x = 0;
            obj.velocity.y = 0;
        }
    } else if (keyCode === DELETE || keyCode === BACKSPACE) {
        clearAll();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function createInitialObjects() {
    // 初期状態で分かりやすいサンプルオブジェクトを配置
    
    // 大きめの動的な円オブジェクト（様々なサイズ）
    createObject(width * 0.2, height * 0.3, 'circle', {
        radius: 30, 
        type: 'dynamic'
    });
    
    createObject(width * 0.4, height * 0.2, 'circle', {
        radius: 25, 
        type: 'dynamic'
    });
    
    createObject(width * 0.6, height * 0.3, 'circle', {
        radius: 35, 
        type: 'dynamic'
    });
    
    createObject(width * 0.8, height * 0.25, 'circle', {
        radius: 20, 
        type: 'dynamic'
    });
    
    // 小さな円たち（ばらつきのあるサイズ）
    for (let i = 0; i < 6; i++) {
        createObject(
            width * 0.25 + i * 60, 
            height * 0.15, 
            'circle', 
            {
                radius: 15 + random(-5, 8), 
                type: 'dynamic'
            }
        );
    }
    
    // 静的な円（ピンで固定）
    let staticCircle = createObject(width * 0.5, height * 0.7, 'circle', {
        radius: 25, 
        type: 'static'
    });
    
    // 中央下部の大きな円
    createObject(width * 0.5, height * 0.5, 'circle', {
        radius: 40, 
        type: 'dynamic'
    });
}
