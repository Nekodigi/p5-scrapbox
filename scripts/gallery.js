class ArTubeGallery {
    constructor() {
        this.works = [];
        this.currentSketch = null;
        this.currentSketchId = null;
        this.favorites = JSON.parse(localStorage.getItem('artube-favorites') || '[]');
        this.isPlaying = true;
        
        this.initializeWorks();
        this.bindEvents();
        this.renderGallery();
        this.updateStats();
        this.restoreScrollPosition();
    }

    initializeWorks() {
        this.works = [
            // パーティクルシステム (5作品)
            {
                id: 'gravity-wells',
                title: 'Gravity Wells',
                category: 'particles',
                description: '重力井戸に引き寄せられる粒子群の美しい軌跡を観察できます。',
                file: 'particles/gravity-wells.js',
                controls: []
            },
            {
                id: 'fireworks-symphony',
                title: 'Fireworks Symphony',
                category: 'particles',
                description: '連続的な花火のシミュレーション。色とりどりの光の軌跡が夜空を彩ります。',
                file: 'particles/fireworks-symphony.js',
                controls: []
            },
            {
                id: 'magnetic-fields',
                title: 'Magnetic Fields',
                category: 'particles',
                description: '磁場の可視化と粒子の動き。物理の美しさを体感できます。',
                file: 'particles/magnetic-fields.js',
                controls: []
            },
            {
                id: 'swarm-intelligence',
                title: 'Swarm Intelligence',
                category: 'particles',
                description: '群知能アルゴリズムの可視化。鳥の群れのような美しい動きを生成。',
                file: 'particles/swarm-intelligence.js',
                controls: []
            },
            {
                id: 'particle-flow-field',
                title: 'Particle Flow Field',
                category: 'particles',
                description: 'Perlinノイズによる流れ場で動く粒子の幻想的な動きを表現。',
                file: 'particles/particle-flow-field.js',
                controls: []
            },

            // フラクタル (5作品)
            {
                id: 'mandelbrot-explorer',
                title: 'Mandelbrot Explorer',
                category: 'fractals',
                description: 'インタラクティブなマンデルブロ集合。ズームして無限の美しさを探索。',
                file: 'fractals/mandelbrot-explorer.js',
                controls: []
            },
            {
                id: 'julia-set-morphing',
                title: 'Julia Set Morphing',
                category: 'fractals',
                description: 'ジュリア集合のリアルタイム変形。数学の芸術性を実感できます。',
                file: 'fractals/julia-set-morphing.js',
                controls: []
            },
            {
                id: 'dragon-curve',
                title: 'Dragon Curve',
                category: 'fractals',
                description: 'ドラゴン曲線の段階的生成。再帰の美しさを視覚化。',
                file: 'fractals/dragon-curve.js',
                controls: []
            },
            {
                id: 'sierpinski-variations',
                title: 'Sierpinski Variations',
                category: 'fractals',
                description: 'シェルピンスキー図形のバリエーション。自己相似の不思議を体験。',
                file: 'fractals/sierpinski-variations.js',
                controls: []
            },
            {
                id: 'l-system-garden',
                title: 'L-System Garden',
                category: 'fractals',
                description: 'L-Systemによる植物生成。数学的ルールから生まれる自然の美。',
                file: 'fractals/l-system-garden.js',
                controls: []
            },

            // 波形・音響可視化 (5作品)
            {
                id: 'wave-interference',
                title: 'Wave Interference',
                category: 'waves',
                description: '波の干渉パターン。複数の波源から生成される美しい干渉縞を観察。',
                file: 'waves/wave-interference.js',
                controls: []
            },
            {
                id: 'lissajous-curves',
                title: 'Lissajous Curves',
                category: 'waves',
                description: 'リサージュ曲線のアニメーション。異なる周波数比で美しい軌跡を描画。',
                file: 'waves/lissajous-curves.js',
                controls: []
            },
            {
                id: 'cymatics-simulation',
                title: 'Cymatics Simulation',
                category: 'waves',
                description: '音波による模様生成。音の振動が作り出す神秘的なパターン。',
                file: 'waves/cymatics-simulation.js',
                controls: []
            },
            {
                id: 'fourier-series',
                title: 'Fourier Series',
                category: 'waves',
                description: 'フーリエ級数の可視化。複数の正弦波の合成で複雑な波形を生成。',
                file: 'waves/fourier-series.js',
                controls: []
            },

            // セルオートマトン (5作品)
            {
                id: 'game-of-life',
                title: 'Game of Life HD',
                category: 'cellular',
                description: '高解像度ライフゲーム。セルの生死が織りなす複雑なパターンを観察。',
                file: 'cellular/game-of-life.js',
                controls: []
            },
            {
                id: 'elementary-ca',
                title: 'Elementary CA Rule 90',
                category: 'cellular',
                description: 'ルール90セルオートマトン。XOR演算でシェルピンスキー三角形を生成。',
                file: 'cellular/elementary-ca.js',
                controls: []
            },
            {
                id: 'langtons-ant',
                title: "Langton's Ant",
                category: 'cellular',
                description: 'ラングトンのアリの軌跡。単純なルールから生まれる複雑な振る舞い。',
                file: 'cellular/langtons-ant.js',
                controls: []
            },
            {
                id: 'reaction-diffusion',
                title: 'Reaction Diffusion',
                category: 'cellular',
                description: '反応拡散系のシミュレーション。自然界に見られる複雑なパターンを生成。',
                file: 'cellular/reaction-diffusion.js',
                controls: []
            },
            {
                id: 'particle-lenia',
                title: 'Particle Lenia',
                category: 'cellular',
                description: '連続的細胞オートマトンの3D表現。HDR環境マッピングで未知の生命体のような質感を演出。',
                file: 'cellular/particle-lenia.js',
                controls: []
            },

            // 物理シミュレーション (5作品)
            {
                id: 'cloth-simulation',
                title: 'Cloth Simulation',
                category: 'physics',
                description: '布のリアルタイムシミュレーション。物理エンジンの美しさを体験。',
                file: 'physics/cloth-simulation.js',
                controls: []
            },
            {
                id: 'fluid-dynamics',
                title: 'Fluid Dynamics',
                category: 'physics',
                description: '流体力学の可視化。液体の流れる様子をリアルに再現。',
                file: 'physics/fluid-dynamics.js',
                controls: []
            },
            {
                id: 'spring-network',
                title: 'Spring Network',
                category: 'physics',
                description: 'ばねネットワークの振動。力学の基本原理を美しく表現。',
                file: 'physics/spring-network.js',
                controls: []
            },
            {
                id: 'orbital-mechanics',
                title: 'Orbital Mechanics',
                category: 'physics',
                description: '惑星軌道シミュレーション。天体の動きを正確に再現。',
                file: 'physics/orbital-mechanics.js',
                controls: []
            },
            {
                id: 'pendulum-chaos',
                title: 'Pendulum Chaos',
                category: 'physics',
                description: '二重振り子のカオス運動。予測不可能な美しい軌跡を描画。',
                file: 'physics/pendulum-chaos.js',
                controls: []
            },

            // 生成アート (5作品)
            {
                id: 'generative-landscapes',
                title: 'Generative Landscapes',
                category: 'generative',
                description: '手続き的地形生成。アルゴリズムが作り出す幻想的な風景。',
                file: 'generative/generative-landscapes.js',
                controls: []
            },
            {
                id: 'abstract-compositions',
                title: 'Abstract Compositions',
                category: 'generative',
                description: '幾何学的抽象画生成。数学的美しさを抽象アートで表現。',
                file: 'generative/abstract-compositions.js',
                controls: []
            },
            {
                id: 'voronoi-art',
                title: 'Voronoi Art',
                category: 'generative',
                description: 'ボロノイ図によるアート。自然界にも見られる美しいパターン。',
                file: 'generative/voronoi-art.js',
                controls: []
            },
            {
                id: 'recursive-trees',
                title: 'Recursive Trees',
                category: 'generative',
                description: '再帰的な樹木生成。フラクタル構造の美しさを樹木で表現。',
                file: 'generative/recursive-trees.js',
                controls: []
            },
            {
                id: 'noise-paintings',
                title: 'Noise Paintings',
                category: 'generative',
                description: 'Perlinノイズ絵画。ランダムネスから生まれる有機的な美しさ。',
                file: 'generative/noise-paintings.js',
                controls: []
            },

            // 3D作品 (5作品)
            {
                id: '3d-particle-cloud',
                title: '3D Particle Cloud',
                category: '3d',
                description: '3D空間の粒子群。立体的な美しさを堪能できます。',
                file: '3d/3d-particle-cloud.js',
                controls: []
            },
            {
                id: 'torus-knots',
                title: 'Torus Knots',
                category: '3d',
                description: 'トーラス結び目の回転。数学的な3D形状の美しさを表現。',
                file: '3d/torus-knots.js',
                controls: []
            },
            {
                id: 'terrain-generation',
                title: 'Terrain Generation',
                category: '3d',
                description: '3D地形生成。リアルタイムで生成される立体的な風景。',
                file: '3d/terrain-generation.js',
                controls: []
            },
            {
                id: 'sphere-morphing',
                title: 'Sphere Morphing',
                category: '3d',
                description: '球体の変形アニメーション。滑らかな3D変形を楽しめます。',
                file: '3d/sphere-morphing.js',
                controls: []
            },
            {
                id: '3d-fractals',
                title: '3D Fractals',
                category: '3d',
                description: '3次元フラクタル。立体的なフラクタル構造の神秘性を体験。',
                file: '3d/3d-fractals.js',
                controls: []
            },

            // インタラクティブゲーム (5作品)
            {
                id: 'color-matching',
                title: 'Color Matching',
                category: 'interactive',
                description: '色彩感覚ゲーム。あなたの色彩感覚をテストしてみましょう。',
                file: 'interactive/color-matching.js',
                controls: []
            },
            {
                id: 'pattern-memory',
                title: 'Pattern Memory',
                category: 'interactive',
                description: 'パターン記憶ゲーム。視覚的記憶力を鍛える楽しいゲーム。',
                file: 'interactive/pattern-memory.js',
                controls: []
            },
            {
                id: 'maze-generator',
                title: 'Maze Generator',
                category: 'interactive',
                description: '迷路生成と解法。アルゴリズムによる迷路作成と自動解法を体験。',
                file: 'interactive/maze-generator.js',
                controls: []
            },
            {
                id: 'physics-sandbox',
                title: 'Physics Sandbox',
                category: 'interactive',
                description: '物理演算サンドボックス。自由に物理オブジェクトを操作できます。',
                file: 'interactive/physics-sandbox.js',
                controls: []
            },

            // アルゴリズム可視化 (新カテゴリ)
            {
                id: 'shortest-path',
                title: 'Shortest Path Algorithms',
                category: 'algorithms',
                description: '最短経路探索アルゴリズムの可視化。A*、ダイクストラ、BFS、DFS、Greedyを比較。',
                file: 'algorithms/shortest-path.js',
                controls: []
            }
        ];
    }

    bindEvents() {
        // 検索機能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterWorks(e.target.value);
        });

        // カテゴリフィルター
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterByCategory(e.target.value);
        });

        // お気に入りトグル
        document.getElementById('favoriteToggle').addEventListener('click', () => {
            this.toggleFavoriteView();
        });

        // モーダルコントロール
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSketch();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('favoriteBtn').addEventListener('click', () => {
            this.toggleFavorite();
        });

        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // ページが表示されたときにスクロール位置を復元
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                this.restoreScrollPosition();
            }
        });
    }

    renderGallery() {
        const gallery = document.getElementById('galleryGrid');
        if (!gallery) return;
        
        gallery.innerHTML = '';

        this.works.forEach((work, index) => {
            const card = this.createWorkCard(work, index);
            gallery.appendChild(card);
        });
    }

    createWorkCard(work, index) {
        const card = document.createElement('article');
        card.className = 'work-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // 直接作品ページにリンク
        card.onclick = () => this.openWorkPage(work);

        const isFavorite = this.favorites.includes(work.id);
        
        card.innerHTML = `
            <div class="work-image">
                <canvas id="thumb-${work.id}" width="350" height="200"></canvas>
                <div class="work-overlay">
                    <button class="play-btn">▶</button>
                </div>
            </div>
            <div class="work-info">
                <h3 class="work-title">${work.title}</h3>
                <span class="work-category category-${work.category}">${this.getCategoryName(work.category)}</span>
                <p class="work-description">${work.description}</p>
                <div class="work-meta">
                    <span class="interactive-badge">Interactive</span>
                    <a href="https://github.com/Nekodigi/p5-scrapbox/blob/main/scripts/sketches/${work.file}" 
                       class="source-code-btn" target="_blank" title="View Source Code"
                       onclick="event.stopPropagation();">
                        📋
                    </a>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); window.gallery.toggleFavoriteCard('${work.id}')">
                        ${isFavorite ? '♥' : '♡'}
                    </button>
                </div>
            </div>
        `;

        // サムネイル生成
        setTimeout(() => this.generateThumbnail(work), 100 + index * 50);

        return card;
    }

    openWorkPage(work) {
        // 作品専用ページに遷移する前に現在の位置を保存
        const currentScrollY = window.scrollY;
        const currentWorkId = work.id;
        
        // SessionStorageに保存（タブが閉じられるまで保持）
        sessionStorage.setItem('artube-last-position', JSON.stringify({
            scrollY: currentScrollY,
            workId: currentWorkId,
            timestamp: Date.now()
        }));
        
        window.location.href = `works/${work.id}.html`;
    }
    
    restoreScrollPosition() {
        // SessionStorageから最後の位置を取得
        const lastPositionStr = sessionStorage.getItem('artube-last-position');
        if (!lastPositionStr) return;
        
        try {
            const lastPosition = JSON.parse(lastPositionStr);
            
            // 5分以内のデータのみ有効とする
            const fiveMinutes = 5 * 60 * 1000;
            if (Date.now() - lastPosition.timestamp < fiveMinutes) {
                // スクロール位置を復元
                setTimeout(() => {
                    window.scrollTo({
                        top: lastPosition.scrollY,
                        behavior: 'instant'
                    });
                    
                    // 作品カードにフォーカスを当てる
                    const workCard = document.querySelector(`[onclick*="${lastPosition.workId}"]`);
                    if (workCard) {
                        workCard.classList.add('highlight');
                        setTimeout(() => {
                            workCard.classList.remove('highlight');
                        }, 2000);
                    }
                }, 100);
            }
            
            // 使用後はクリア
            sessionStorage.removeItem('artube-last-position');
        } catch (error) {
            console.error('Failed to restore scroll position:', error);
        }
    }

    generateThumbnail(work) {
        const canvas = document.getElementById(`thumb-${work.id}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // 背景を黒に設定
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // 作品ごとの専用サムネイル生成
        switch (work.id) {
            // パーティクルシステム
            case 'gravity-wells':
                this.drawGravityWellsThumbnail(ctx, width, height);
                break;
            case 'fireworks-symphony':
                this.drawFireworksThumbnail(ctx, width, height);
                break;
            case 'magnetic-fields':
                this.drawMagneticFieldsThumbnail(ctx, width, height);
                break;
            case 'swarm-intelligence':
                this.drawSwarmThumbnail(ctx, width, height);
                break;
            case 'particle-flow-field':
                this.drawFlowFieldThumbnail(ctx, width, height);
                break;

            // フラクタル
            case 'mandelbrot-explorer':
                this.drawMandelbrotThumbnail(ctx, width, height);
                break;
            case 'julia-set-morphing':
                this.drawJuliaSetThumbnail(ctx, width, height);
                break;
            case 'dragon-curve':
                this.drawDragonCurveThumbnail(ctx, width, height);
                break;
            case 'sierpinski-variations':
                this.drawSierpinskiThumbnail(ctx, width, height);
                break;
            case 'l-system-garden':
                this.drawLSystemThumbnail(ctx, width, height);
                break;

            // 波形・音響
            case 'wave-interference':
                this.drawWaveInterferenceThumbnail(ctx, width, height);
                break;
            case 'lissajous-curves':
                this.drawLissajousThumbnail(ctx, width, height);
                break;
            case 'cymatics-simulation':
                this.drawCymaticsThumbnail(ctx, width, height);
                break;
            case 'fourier-series':
                this.drawFourierThumbnail(ctx, width, height);
                break;

            // セルオートマトン
            case 'game-of-life':
                this.drawGameOfLifeThumbnail(ctx, width, height);
                break;
            case 'elementary-ca':
                this.drawElementaryCAThumbnail(ctx, width, height);
                break;
            case 'langtons-ant':
                this.drawLangtonsAntThumbnail(ctx, width, height);
                break;
            case 'reaction-diffusion':
                this.drawReactionDiffusionThumbnail(ctx, width, height);
                break;
            case 'particle-lenia':
                this.drawParticleLeniaThumbnail(ctx, width, height);
                break;

            // 物理シミュレーション
            case 'cloth-simulation':
                this.drawClothThumbnail(ctx, width, height);
                break;
            case 'fluid-dynamics':
                this.drawFluidThumbnail(ctx, width, height);
                break;
            case 'spring-network':
                this.drawSpringNetworkThumbnail(ctx, width, height);
                break;
            case 'orbital-mechanics':
                this.drawOrbitalThumbnail(ctx, width, height);
                break;
            case 'pendulum-chaos':
                this.drawPendulumChaosThumbnail(ctx, width, height);
                break;

            // 生成アート
            case 'generative-landscapes':
                this.drawLandscapesThumbnail(ctx, width, height);
                break;
            case 'abstract-compositions':
                this.drawAbstractThumbnail(ctx, width, height);
                break;
            case 'voronoi-art':
                this.drawVoronoiThumbnail(ctx, width, height);
                break;
            case 'recursive-trees':
                this.drawRecursiveTreesThumbnail(ctx, width, height);
                break;
            case 'noise-paintings':
                this.drawNoisePaintingsThumbnail(ctx, width, height);
                break;

            // 3D作品
            case '3d-particle-cloud':
                this.draw3DParticlesThumbnail(ctx, width, height);
                break;
            case 'torus-knots':
                this.drawTorusKnotsThumbnail(ctx, width, height);
                break;
            case 'terrain-generation':
                this.drawTerrainThumbnail(ctx, width, height);
                break;
            case 'sphere-morphing':
                this.drawSphereMorphingThumbnail(ctx, width, height);
                break;
            case '3d-fractals':
                this.draw3DFractalsThumbnail(ctx, width, height);
                break;
            case 'geometric-sculptures':
                this.drawGeometricSculpturesThumbnail(ctx, width, height);
                break;

            // インタラクティブゲーム
            case 'color-matching':
                this.drawColorMatchingThumbnail(ctx, width, height);
                break;
            case 'pattern-memory':
                this.drawPatternMemoryThumbnail(ctx, width, height);
                break;
            case 'maze-generator':
                this.drawMazeGeneratorThumbnail(ctx, width, height);
                break;
            case 'physics-sandbox':
                this.drawPhysicsSandboxThumbnail(ctx, width, height);
                break;

            // アルゴリズム
            case 'shortest-path':
                this.drawShortestPathThumbnail(ctx, width, height);
                break;

            default:
                this.drawDefaultThumbnail(ctx, width, height);
        }
    }

    // パーティクルシステム サムネイル群
    drawGravityWellsThumbnail(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 重力井戸
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#000');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // 軌道を描く粒子
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const radius = 50 + Math.sin(i * 0.5) * 20;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.fillStyle = `hsl(${200 + i * 5}, 70%, 60%)`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFireworksThumbnail(ctx, width, height) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'];
        
        // 花火の爆発パターン
        for (let explosion = 0; explosion < 3; explosion++) {
            const centerX = width * (0.3 + explosion * 0.2);
            const centerY = height * (0.3 + explosion * 0.15);
            
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const radius = 20 + Math.random() * 30;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                ctx.strokeStyle = colors[explosion % colors.length];
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                ctx.fillStyle = colors[explosion % colors.length];
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawMagneticFieldsThumbnail(ctx, width, height) {
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 1;
        
        // 磁力線を描画
        for (let x = 0; x < width; x += 15) {
            for (let y = 0; y < height; y += 15) {
                const angle = Math.atan2(y - height/2, x - width/2) * 2;
                const length = 10;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
                ctx.stroke();
            }
        }
        
        // 磁極
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(width * 0.3, height * 0.5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#45b7d1';
        ctx.beginPath();
        ctx.arc(width * 0.7, height * 0.5, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSwarmThumbnail(ctx, width, height) {
        const boids = [];
        for (let i = 0; i < 25; i++) {
            boids.push({
                x: Math.random() * width,
                y: Math.random() * height,
                angle: Math.random() * Math.PI * 2
            });
        }
        
        ctx.fillStyle = '#feca57';
        boids.forEach(boid => {
            ctx.save();
            ctx.translate(boid.x, boid.y);
            ctx.rotate(boid.angle);
            ctx.beginPath();
            ctx.moveTo(4, 0);
            ctx.lineTo(-2, -2);
            ctx.lineTo(-2, 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    drawFlowFieldThumbnail(ctx, width, height) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        
        // 流れ場の可視化
        for (let i = 0; i < 100; i++) {
            let x = Math.random() * width;
            let y = Math.random() * height;
            
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            // 流線を描画
            for (let j = 0; j < 20; j++) {
                const noise = Math.sin(x * 0.01) * Math.cos(y * 0.01);
                const angle = noise * Math.PI * 2;
                x += Math.cos(angle) * 2;
                y += Math.sin(angle) * 2;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    // フラクタル サムネイル群
    drawMandelbrotThumbnail(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const a = (x / width) * 3 - 2;
                const b = (y / height) * 3 - 1.5;
                
                let ca = a, cb = b;
                let n = 0;
                while (n < 50) {
                    const aa = ca * ca - cb * cb;
                    const bb = 2 * ca * cb;
                    ca = aa + a;
                    cb = bb + b;
                    if (ca * ca + cb * cb > 4) break;
                    n++;
                }
                
                const index = (y * width + x) * 4;
                const color = n === 50 ? 0 : (n * 5) % 256;
                data[index] = color;
                data[index + 1] = color * 0.7;
                data[index + 2] = color * 1.5;
                data[index + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    drawJuliaSetThumbnail(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        const cReal = -0.4, cImag = 0.6;
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let zReal = (x / width) * 3 - 1.5;
                let zImag = (y / height) * 3 - 1.5;
                
                let n = 0;
                const maxIterations = 100;
                while (n < maxIterations) {
                    const newReal = zReal * zReal - zImag * zImag + cReal;
                    const newImag = 2 * zReal * zImag + cImag;
                    zReal = newReal;
                    zImag = newImag;
                    if (zReal * zReal + zImag * zImag > 4) break;
                    n++;
                }
                
                const index = (y * width + x) * 4;
                if (n === maxIterations) {
                    // 集合内の点は黒
                    data[index] = 0;
                    data[index + 1] = 0;
                    data[index + 2] = 0;
                } else {
                    // 集合外の点は色付き
                    const intensity = n / maxIterations;
                    const hue = (n * 3) % 360;
                    
                    // HSLからRGBへの簡易変換
                    const saturation = 0.8;
                    const lightness = 0.5;
                    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
                    const h = hue / 60;
                    const x = c * (1 - Math.abs(h % 2 - 1));
                    const m = lightness - c / 2;
                    
                    let r, g, b;
                    if (h < 1) { r = c; g = x; b = 0; }
                    else if (h < 2) { r = x; g = c; b = 0; }
                    else if (h < 3) { r = 0; g = c; b = x; }
                    else if (h < 4) { r = 0; g = x; b = c; }
                    else if (h < 5) { r = x; g = 0; b = c; }
                    else { r = c; g = 0; b = x; }
                    
                    data[index] = Math.floor((r + m) * 255);
                    data[index + 1] = Math.floor((g + m) * 255);
                    data[index + 2] = Math.floor((b + m) * 255);
                }
                data[index + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    drawDragonCurveThumbnail(ctx, width, height) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        
        let x = width * 0.3, y = height * 0.5;
        let angle = 0;
        const step = 3;
        
        const sequence = "1101100111001001";
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        for (let i = 0; i < sequence.length; i++) {
            x += Math.cos(angle) * step;
            y += Math.sin(angle) * step;
            ctx.lineTo(x, y);
            
            if (sequence[i] === '1') {
                angle += Math.PI / 2;
            } else {
                angle -= Math.PI / 2;
            }
        }
        ctx.stroke();
    }

    drawSierpinskiThumbnail(ctx, width, height) {
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 1;
        
        const drawSierpinski = (x1, y1, x2, y2, x3, y3, depth) => {
            if (depth === 0) {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y3);
                ctx.closePath();
                ctx.stroke();
            } else {
                const mx1 = (x1 + x2) / 2;
                const my1 = (y1 + y2) / 2;
                const mx2 = (x2 + x3) / 2;
                const my2 = (y2 + y3) / 2;
                const mx3 = (x3 + x1) / 2;
                const my3 = (y3 + y1) / 2;
                
                drawSierpinski(x1, y1, mx1, my1, mx3, my3, depth - 1);
                drawSierpinski(mx1, my1, x2, y2, mx2, my2, depth - 1);
                drawSierpinski(mx3, my3, mx2, my2, x3, y3, depth - 1);
            }
        };
        
        drawSierpinski(width/2, 20, 20, height-20, width-20, height-20, 4);
    }

    drawLSystemThumbnail(ctx, width, height) {
        ctx.strokeStyle = '#96ceb4';
        ctx.lineWidth = 2;
        
        let x = width / 2, y = height - 20;
        let angle = -Math.PI / 2;
        const step = 8;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // 簡単なL-System樹木
        const drawBranch = (x, y, angle, length, depth) => {
            if (depth === 0) return;
            
            const newX = x + Math.cos(angle) * length;
            const newY = y + Math.sin(angle) * length;
            
            ctx.moveTo(x, y);
            ctx.lineTo(newX, newY);
            
            drawBranch(newX, newY, angle - 0.5, length * 0.7, depth - 1);
            drawBranch(newX, newY, angle + 0.5, length * 0.7, depth - 1);
        };
        
        drawBranch(x, y, angle, 40, 5);
        ctx.stroke();
    }

    // 波形・音響 サムネイル群
    drawAudioSpectrumThumbnail(ctx, width, height) {
        const bars = 20;
        const barWidth = width / bars;
        
        for (let i = 0; i < bars; i++) {
            const barHeight = Math.random() * height * 0.8 + 10;
            const hue = (i / bars) * 360;
            ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
        }
    }

    drawWaveInterferenceThumbnail(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        const source1X = width * 0.3, source1Y = height * 0.5;
        const source2X = width * 0.7, source2Y = height * 0.5;
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const dist1 = Math.sqrt((x - source1X) ** 2 + (y - source1Y) ** 2);
                const dist2 = Math.sqrt((x - source2X) ** 2 + (y - source2Y) ** 2);
                
                const wave1 = Math.sin(dist1 * 0.1);
                const wave2 = Math.sin(dist2 * 0.1);
                const interference = (wave1 + wave2) / 2;
                
                const index = (y * width + x) * 4;
                const color = ((interference + 1) / 2) * 255;
                data[index] = color * 0.5;
                data[index + 1] = color * 0.8;
                data[index + 2] = color;
                data[index + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    drawLissajousThumbnail(ctx, width, height) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        
        const centerX = width / 2;
        const centerY = height / 2;
        const a = 3, b = 2;
        
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
            const x = centerX + Math.sin(a * t) * 60;
            const y = centerY + Math.sin(b * t) * 60;
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    drawCymaticsThumbnail(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let r = 10; r < 100; r += 8) {
            ctx.strokeStyle = `hsl(${r * 3}, 70%, 60%)`;
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const radius = r + Math.sin(angle * 6) * 5;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (angle === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    drawFourierThumbnail(ctx, width, height) {
        ctx.strokeStyle = '#45b7d1';
        ctx.lineWidth = 2;
        
        const centerX = width * 0.3;
        const centerY = height / 2;
        
        // 回転する円
        for (let i = 0; i < 3; i++) {
            const radius = 20 - i * 5;
            ctx.strokeStyle = `hsl(${200 + i * 30}, 70%, 60%)`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 波形
        ctx.strokeStyle = '#96ceb4';
        ctx.beginPath();
        for (let x = width * 0.5; x < width; x += 2) {
            const y = centerY + Math.sin((x - width * 0.5) * 0.1) * 30;
            if (x === width * 0.5) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    drawWaveThumbnail(ctx, width, height) {
        ctx.strokeStyle = '#45b7d1';
        ctx.lineWidth = 2;
        
        for (let wave = 0; wave < 3; wave++) {
            ctx.beginPath();
            for (let x = 0; x < width; x += 2) {
                const y = height/2 + Math.sin((x + wave * 50) * 0.02) * (20 + wave * 10);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    // セルオートマトン サムネイル群
    drawGameOfLifeThumbnail(ctx, width, height) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const cellSize = 6;
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);
        
        // ライフゲームの典型的なパターンを描画
        const patterns = [
            // グライダー
            [{x: 5, y: 5}, {x: 6, y: 6}, {x: 6, y: 7}, {x: 5, y: 7}, {x: 4, y: 7}],
            // ビーハイブ
            [{x: 15, y: 8}, {x: 16, y: 7}, {x: 17, y: 7}, {x: 18, y: 8}, {x: 17, y: 9}, {x: 16, y: 9}],
            // ブリンカー
            [{x: 10, y: 15}, {x: 11, y: 15}, {x: 12, y: 15}]
        ];
        
        ctx.fillStyle = '#2ecc71';
        patterns.forEach(pattern => {
            pattern.forEach(cell => {
                if (cell.x < cols && cell.y < rows) {
                    ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize - 1, cellSize - 1);
                }
            });
        });
        
        // ランダムな生きているセル
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
        }
    }

    drawElementaryCAThumbnail(ctx, width, height) {
        // Swarm Intelligenceスタイルの背景（黒）
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
        
        // セルオートマトンのセルを矢印として表現
        const cells = [];
        const cellSize = 4;
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);
        
        // ルール90でセルオートマトンパターンを生成
        let currentRow = new Array(cols).fill(0);
        currentRow[Math.floor(cols / 2)] = 1; // 中央に種
        
        // 各行のセルを矢印として保存
        for (let row = 0; row < rows && row < 20; row++) {
            for (let col = 0; col < cols; col++) {
                if (currentRow[col] === 1) {
                    cells.push({
                        x: col * cellSize + cellSize / 2,
                        y: row * cellSize + cellSize / 2,
                        angle: (row * 0.3 + col * 0.2) % (Math.PI * 2) // セルの位置に基づく角度
                    });
                }
            }
            
            // 次の行を計算（ルール90：XOR）
            const nextRow = new Array(cols).fill(0);
            for (let col = 0; col < cols; col++) {
                const left = col > 0 ? currentRow[col - 1] : 0;
                const right = col < cols - 1 ? currentRow[col + 1] : 0;
                nextRow[col] = left ^ right;
            }
            currentRow = nextRow;
        }
        
        // Swarm Intelligenceと同じスタイルで矢印を描画
        ctx.fillStyle = '#feca57';
        cells.forEach(cell => {
            ctx.save();
            ctx.translate(cell.x, cell.y);
            ctx.rotate(cell.angle);
            ctx.beginPath();
            ctx.moveTo(4, 0);
            ctx.lineTo(-2, -2);
            ctx.lineTo(-2, 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    drawLangtonsAntThumbnail(ctx, width, height) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const cellSize = 4;
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);
        const grid = new Array(rows).fill().map(() => new Array(cols).fill(0));
        
        // アリの初期位置と向き
        let antX = Math.floor(cols / 2);
        let antY = Math.floor(rows / 2);
        let direction = 0; // 0:up, 1:right, 2:down, 3:left
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        
        // アリの軌跡をシミュレート
        for (let step = 0; step < 500; step++) {
            if (antX >= 0 && antX < cols && antY >= 0 && antY < rows) {
                if (grid[antY][antX] === 0) {
                    grid[antY][antX] = 1;
                    direction = (direction + 1) % 4; // 右回転
                } else {
                    grid[antY][antX] = 0;
                    direction = (direction + 3) % 4; // 左回転
                }
                
                antX += directions[direction][0];
                antY += directions[direction][1];
            } else {
                break;
            }
        }
        
        // グリッドを描画
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (grid[y][x] === 1) {
                    ctx.fillStyle = '#f39c12';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // アリを描画
        if (antX >= 0 && antX < cols && antY >= 0 && antY < rows) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(antX * cellSize, antY * cellSize, cellSize, cellSize);
        }
    }

    drawReactionDiffusionThumbnail(ctx, width, height) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        // 反応拡散系の典型的なパターンを生成
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                // 複数の波の干渉で斑点パターンを作成
                const centerX = width / 2;
                const centerY = height / 2;
                const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                
                const wave1 = Math.sin(dist * 0.2);
                const wave2 = Math.cos(x * 0.1) * Math.sin(y * 0.1);
                const pattern = (wave1 + wave2) / 2;
                
                // ツーリングパターン風の色分け
                if (pattern > 0.3) {
                    data[index] = 255; // R
                    data[index + 1] = 100; // G  
                    data[index + 2] = 150; // B
                } else if (pattern > -0.1) {
                    data[index] = 100;
                    data[index + 1] = 255;
                    data[index + 2] = 100;
                } else {
                    data[index] = 50;
                    data[index + 1] = 50;
                    data[index + 2] = 255;
                }
                data[index + 3] = 255; // A
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    drawParticleLeniaThumbnail(ctx, width, height) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        // レニアパターンの生成（3Dっぽい見た目）
        for (let i = 0; i < 5; i++) {
            const offsetX = (i - 2) * 30;
            const offsetY = (i - 2) * 20;
            const size = 40 - i * 5;
            
            // グラデーションで深みを表現
            const gradient = ctx.createRadialGradient(
                centerX + offsetX, 
                centerY + offsetY, 
                0,
                centerX + offsetX, 
                centerY + offsetY, 
                size
            );
            
            // 虹色っぽいグラデーション（HDR反射を想起させる）
            gradient.addColorStop(0, `hsla(${180 + i * 30}, 80%, 70%, 0.9)`);
            gradient.addColorStop(0.5, `hsla(${220 + i * 40}, 70%, 60%, 0.7)`);
            gradient.addColorStop(1, `hsla(${260 + i * 50}, 60%, 30%, 0.3)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // 有機的な形状
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const r = size * (0.8 + Math.sin(angle * 3 + i) * 0.2);
                const x = centerX + offsetX + Math.cos(angle) * r;
                const y = centerY + offsetY + Math.sin(angle) * r;
                
                if (angle === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
            
            // 光沢のハイライト
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - i * 0.05})`;
            ctx.beginPath();
            ctx.arc(
                centerX + offsetX - size * 0.3, 
                centerY + offsetY - size * 0.3, 
                size * 0.2, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // 微細な粒子を追加
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        for (let i = 0; i < 20; i++) {
            const x = centerX + (Math.random() - 0.5) * width * 0.8;
            const y = centerY + (Math.random() - 0.5) * height * 0.8;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }


    drawCellularThumbnail(ctx, width, height) {
        const cellSize = 10;
        const colors = ['#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                if (Math.random() > 0.6) {
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                }
            }
        }
    }

    drawShortestPathThumbnail(ctx, width, height) {
        // グリッド背景
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        const cellSize = 10;
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);
        
        // グリッド線
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, height);
            ctx.stroke();
        }
        for (let j = 0; j <= rows; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * cellSize);
            ctx.lineTo(width, j * cellSize);
            ctx.stroke();
        }
        
        // 壁
        ctx.fillStyle = '#333';
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * cols) * cellSize;
            const y = Math.floor(Math.random() * rows) * cellSize;
            ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
        }
        
        // スタート地点
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(cellSize * 2, Math.floor(rows/2) * cellSize, cellSize - 1, cellSize - 1);
        
        // ゴール地点
        ctx.fillStyle = '#ff0000';
        ctx.fillRect((cols - 3) * cellSize, Math.floor(rows/2) * cellSize, cellSize - 1, cellSize - 1);
        
        // 探索済みエリア（薄い青）
        ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
        for (let i = 3; i < cols/2; i++) {
            for (let j = rows/2 - 3; j < rows/2 + 3; j++) {
                if (Math.random() > 0.3) {
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
                }
            }
        }
        
        // パス（黄色）
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(2.5 * cellSize, (rows/2 + 0.5) * cellSize);
        
        // 曲がりくねったパスを描画
        const pathPoints = [
            {x: 5, y: rows/2},
            {x: 8, y: rows/2 - 2},
            {x: 12, y: rows/2 - 2},
            {x: 15, y: rows/2 + 1},
            {x: cols - 3, y: rows/2}
        ];
        
        pathPoints.forEach(point => {
            ctx.lineTo((point.x + 0.5) * cellSize, (point.y + 0.5) * cellSize);
        });
        ctx.stroke();
    }

    drawDefaultThumbnail(ctx, width, height) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#333');
        gradient.addColorStop(1, '#666');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    getCategoryName(category) {
        const names = {
            particles: 'パーティクル',
            fractals: 'フラクタル',
            waves: '波形・音響',
            cellular: 'セルオートマトン',
            physics: '物理シミュレーション',
            generative: '生成アート',
            '3d': '3D',
            interactive: 'インタラクティブ',
            algorithms: 'アルゴリズム'
        };
        return names[category] || category;
    }

    filterWorks(searchTerm) {
        const cards = document.querySelectorAll('.work-card');
        cards.forEach(card => {
            const title = card.querySelector('.work-title').textContent.toLowerCase();
            const description = card.querySelector('.work-description').textContent.toLowerCase();
            const isVisible = title.includes(searchTerm.toLowerCase()) || 
                            description.includes(searchTerm.toLowerCase());
            card.style.display = isVisible ? 'block' : 'none';
        });
    }

    filterByCategory(category) {
        const cards = document.querySelectorAll('.work-card');
        cards.forEach(card => {
            if (category === 'all') {
                card.style.display = 'block';
            } else {
                const workCategory = card.querySelector('.work-category').classList;
                const isVisible = workCategory.contains(`category-${category}`);
                card.style.display = isVisible ? 'block' : 'none';
            }
        });
    }

    toggleFavoriteView() {
        const button = document.getElementById('favoriteToggle');
        const isShowingFavorites = button.textContent.includes('全て');
        
        if (isShowingFavorites) {
            button.textContent = '⭐ お気に入り';
            this.renderGallery();
        } else {
            button.textContent = '📁 全て表示';
            this.showFavoritesOnly();
        }
    }

    showFavoritesOnly() {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        
        const favoriteWorks = this.works.filter(work => this.favorites.includes(work.id));
        favoriteWorks.forEach(work => {
            const card = this.createWorkCard(work);
            gallery.appendChild(card);
        });
        
        if (favoriteWorks.length === 0) {
            gallery.innerHTML = '<div style="text-align: center; color: #888; padding: 2rem;">お気に入りの作品がありません</div>';
        }
    }

    toggleFavoriteCard(workId) {
        const index = this.favorites.indexOf(workId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(workId);
        }
        
        localStorage.setItem('artube-favorites', JSON.stringify(this.favorites));
        this.updateStats();
        this.renderGallery();
    }

    openWork(work) {
        this.currentSketchId = work.id;
        document.getElementById('modalTitle').textContent = work.title;
        document.getElementById('sketchDescription').textContent = work.description;
        
        // お気に入りボタン更新
        const favoriteBtn = document.getElementById('favoriteBtn');
        const isFavorite = this.favorites.includes(work.id);
        favoriteBtn.textContent = isFavorite ? '♥' : '♡';
        favoriteBtn.style.color = isFavorite ? '#ff6b6b' : '#888';
        
        // スケッチをロード
        this.loadSketch(work);
        
        document.getElementById('fullscreenModal').classList.remove('hidden');
    }

    async loadSketch(work) {
        const container = document.getElementById('sketchContainer');
        container.innerHTML = '';
        
        // 既存のp5インスタンスを削除
        if (window.currentP5Instance) {
            window.currentP5Instance.remove();
            window.currentP5Instance = null;
        }
        
        // グローバル変数をクリーンアップ
        this.cleanupGlobalVariables();
        
        try {
            // 既存のスクリプトタグを削除
            const existingScript = document.getElementById('current-sketch');
            if (existingScript) {
                existingScript.remove();
            }
            
            // 少し待ってからスクリプトをロード
            setTimeout(() => {
                const script = document.createElement('script');
                script.id = 'current-sketch';
                script.src = `scripts/sketches/${work.file}?t=${Date.now()}`;
                script.onload = () => {
                    console.log('スケッチが読み込まれました:', work.title);
                };
                script.onerror = () => {
                    console.error('スケッチの読み込みに失敗:', work.file);
                    container.innerHTML = '<div style="color: #fff; text-align: center; padding: 2rem;">スケッチの読み込みに失敗しました</div>';
                };
                
                document.head.appendChild(script);
            }, 100);
            
        } catch (error) {
            console.error('スケッチの読み込みに失敗:', error);
            container.innerHTML = '<div style="color: #fff; text-align: center; padding: 2rem;">スケッチの読み込みに失敗しました</div>';
        }
    }

    cleanupGlobalVariables() {
        // p5.js関連の変数をクリーンアップ
        const varsToClean = [
            'time', 'grid', 'next', 'particles', 'wells', 'fireworks', 'explosions',
            'freqRatioX', 'freqRatioY', 'phaseShift', 'trailPoints', 'maxTrailLength',
            'cols', 'rows', 'cellSize', 'dA', 'dB', 'feed', 'kill', 'generation',
            'boids', 'predators', 'sources', 'waveSpeed', 'waveLength', 'harmonics',
            'waveType', 'wave', 'maxWaveLength', 'ants', 'steps', 'speed'
        ];
        
        varsToClean.forEach(varName => {
            try {
                if (window[varName] !== undefined) {
                    delete window[varName];
                }
            } catch (e) {
                // ignore errors
            }
        });
    }

    closeModal() {
        document.getElementById('fullscreenModal').classList.add('hidden');
        
        // p5.jsスケッチを停止
        if (window.currentP5Instance) {
            window.currentP5Instance.remove();
            window.currentP5Instance = null;
        }
        
        // スクリプトタグを削除
        const existingScript = document.getElementById('current-sketch');
        if (existingScript) {
            existingScript.remove();
        }
        
        this.currentSketchId = null;
        this.isPlaying = true;
        document.getElementById('pauseBtn').textContent = '⏸️';
    }

    resetSketch() {
        if (this.currentSketchId) {
            const work = this.works.find(w => w.id === this.currentSketchId);
            if (work) {
                this.loadSketch(work);
            }
        }
    }

    togglePause() {
        this.isPlaying = !this.isPlaying;
        document.getElementById('pauseBtn').textContent = this.isPlaying ? '⏸️' : '▶️';
        
        if (window.currentP5Instance) {
            if (this.isPlaying) {
                window.currentP5Instance.loop();
            } else {
                window.currentP5Instance.noLoop();
            }
        }
    }

    toggleFavorite() {
        if (this.currentSketchId) {
            const index = this.favorites.indexOf(this.currentSketchId);
            const favoriteBtn = document.getElementById('favoriteBtn');
            
            if (index > -1) {
                this.favorites.splice(index, 1);
                favoriteBtn.textContent = '♡';
                favoriteBtn.style.color = '#888';
            } else {
                this.favorites.push(this.currentSketchId);
                favoriteBtn.textContent = '♥';
                favoriteBtn.style.color = '#ff6b6b';
            }
            
            localStorage.setItem('artube-favorites', JSON.stringify(this.favorites));
            this.updateStats();
        }
    }

    updateStats() {
        document.getElementById('totalWorks').textContent = this.works.length;
        document.getElementById('favoriteCount').textContent = this.favorites.length;
    }

    // 新しく追加したサムネイル関数群

    // 生成アートのサムネイル
    drawLandscapesThumbnail(ctx, width, height) {
        // 3D地形のサムネイル
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, width, height);
        
        // 地形の山々
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
            const y = height * 0.7 + Math.sin(x * 0.02) * 30 + Math.cos(x * 0.05) * 20;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        
        // 前景の丘
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        for (let x = 0; x < width; x += 8) {
            const y = height * 0.8 + Math.sin(x * 0.03 + 1) * 25;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
    }

    drawAbstractThumbnail(ctx, width, height) {
        // 抽象的なコンポジション
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const shapes = [
            {color: '#e74c3c', type: 'circle'},
            {color: '#3498db', type: 'triangle'},
            {color: '#f39c12', type: 'square'},
            {color: '#9b59b6', type: 'hexagon'}
        ];
        
        shapes.forEach((shape, i) => {
            ctx.save();
            const x = (i * width / 4) + width / 8;
            const y = height / 2 + Math.sin(Date.now() * 0.002 + i) * 30;
            const size = 20 + Math.cos(Date.now() * 0.003 + i) * 10;
            
            ctx.translate(x, y);
            ctx.rotate(Date.now() * 0.001 + i);
            ctx.fillStyle = shape.color;
            
            switch (shape.type) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(0, -size);
                    ctx.lineTo(-size, size);
                    ctx.lineTo(size, size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(-size/2, -size/2, size, size);
                    break;
                case 'hexagon':
                    ctx.beginPath();
                    for (let j = 0; j < 6; j++) {
                        const angle = (j / 6) * Math.PI * 2;
                        const px = Math.cos(angle) * size;
                        const py = Math.sin(angle) * size;
                        if (j === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
            ctx.restore();
        });
    }

    drawVoronoiThumbnail(ctx, width, height) {
        // ボロノイ図のサムネイル
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        const sites = [
            {x: width * 0.3, y: height * 0.3, color: '#e74c3c'},
            {x: width * 0.7, y: height * 0.4, color: '#3498db'},
            {x: width * 0.5, y: height * 0.7, color: '#2ecc71'},
            {x: width * 0.2, y: height * 0.8, color: '#f39c12'}
        ];
        
        // 簡易ボロノイセル
        for (let x = 0; x < width; x += 4) {
            for (let y = 0; y < height; y += 4) {
                let closestSite = sites[0];
                let minDist = Infinity;
                
                sites.forEach(site => {
                    const dist = Math.sqrt((x - site.x)**2 + (y - site.y)**2);
                    if (dist < minDist) {
                        minDist = dist;
                        closestSite = site;
                    }
                });
                
                ctx.fillStyle = closestSite.color + '40';
                ctx.fillRect(x, y, 4, 4);
            }
        }
        
        // サイト点
        sites.forEach(site => {
            ctx.fillStyle = site.color;
            ctx.beginPath();
            ctx.arc(site.x, site.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawRecursiveTreesThumbnail(ctx, width, height) {
        // 再帰的な木のサムネイル
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 3;
        
        const drawBranch = (x, y, angle, length, depth) => {
            if (depth === 0 || length < 2) return;
            
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            if (depth > 1) {
                ctx.lineWidth = depth;
                drawBranch(endX, endY, angle - 0.5, length * 0.7, depth - 1);
                drawBranch(endX, endY, angle + 0.5, length * 0.7, depth - 1);
            } else {
                // 葉っぱ
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.arc(endX, endY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        
        drawBranch(width / 2, height * 0.9, -Math.PI / 2, 40, 6);
    }

    drawNoisePaintingsThumbnail(ctx, width, height) {
        // ノイズペインティングのサムネイル
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                // 複数のノイズレイヤー
                let noise1 = Math.sin(x * 0.02) * Math.cos(y * 0.02);
                let noise2 = Math.sin(x * 0.05 + y * 0.03) * 0.5;
                let noise3 = Math.sin((x + y) * 0.01) * 0.3;
                
                let value = (noise1 + noise2 + noise3 + 3) / 6;
                
                // 水彩風の色
                data[index] = Math.floor(value * 255 * (0.8 + Math.sin(x * 0.01) * 0.2)); // R
                data[index + 1] = Math.floor(value * 255 * (0.6 + Math.cos(y * 0.01) * 0.4)); // G
                data[index + 2] = Math.floor(value * 255 * (0.9 + Math.sin((x+y) * 0.01) * 0.1)); // B
                data[index + 3] = Math.floor(value * 255 * 0.8); // A
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    // 3D作品のサムネイル
    drawGeometricSculpturesThumbnail(ctx, width, height) {
        // 幾何学彫刻のサムネイル
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const sculptures = [
            {x: width * 0.3, y: height * 0.4, color: '#e74c3c', type: 'cube'},
            {x: width * 0.7, y: height * 0.5, color: '#3498db', type: 'sphere'},
            {x: width * 0.5, y: height * 0.6, color: '#2ecc71', type: 'pyramid'}
        ];
        
        sculptures.forEach((sculpture, i) => {
            ctx.save();
            ctx.translate(sculpture.x, sculpture.y);
            ctx.rotate(Date.now() * 0.001 + i);
            
            const gradient = ctx.createLinearGradient(-20, -20, 20, 20);
            gradient.addColorStop(0, sculpture.color);
            gradient.addColorStop(1, sculpture.color + '60');
            ctx.fillStyle = gradient;
            
            switch (sculpture.type) {
                case 'cube':
                    // 3D立方体風
                    ctx.fillRect(-15, -15, 30, 30);
                    ctx.fillStyle = sculpture.color + '80';
                    ctx.fillRect(-10, -20, 30, 30);
                    break;
                case 'sphere':
                    ctx.beginPath();
                    ctx.arc(0, 0, 20, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'pyramid':
                    ctx.beginPath();
                    ctx.moveTo(0, -20);
                    ctx.lineTo(-15, 15);
                    ctx.lineTo(15, 15);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
            ctx.restore();
        });
    }

    // パーティクルシステムの改良版サムネイル
    drawFlowFieldThumbnail(ctx, width, height) {
        // パーティクルフローフィールド
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, width, height);
        
        // フローフィールドの線
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < width; x += 20) {
            for (let y = 0; y < height; y += 20) {
                const angle = Math.atan2(y - height/2, x - width/2) * 2 + Date.now() * 0.001;
                const length = 8;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
                ctx.stroke();
            }
        }
        
        // 流れるパーティクル
        for (let i = 0; i < 15; i++) {
            const x = (i * width / 15 + Date.now() * 0.05) % width;
            const y = height / 2 + Math.sin(x * 0.01 + i) * 30;
            
            ctx.fillStyle = `hsl(${180 + i * 10}, 70%, 60%)`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // 物理シミュレーションのサムネイル改善
    drawClothThumbnail(ctx, width, height) {
        // 布シミュレーション
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        const gridSize = 8;
        const cols = Math.floor(width / gridSize);
        const rows = Math.floor(height / gridSize);
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1;
        
        // 布の格子を描画
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const px = x * gridSize + Math.sin(x * 0.2 + y * 0.1) * 3;
                const py = y * gridSize + Math.cos(x * 0.1 + y * 0.2) * 2;
                
                if (x < cols - 1) {
                    const px2 = (x + 1) * gridSize + Math.sin((x + 1) * 0.2 + y * 0.1) * 3;
                    const py2 = y * gridSize + Math.cos((x + 1) * 0.1 + y * 0.2) * 2;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px2, py2);
                    ctx.stroke();
                }
                
                if (y < rows - 1) {
                    const px2 = x * gridSize + Math.sin(x * 0.2 + (y + 1) * 0.1) * 3;
                    const py2 = (y + 1) * gridSize + Math.cos(x * 0.1 + (y + 1) * 0.2) * 2;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px2, py2);
                    ctx.stroke();
                }
            }
        }
    }

    drawFluidThumbnail(ctx, width, height) {
        // 流体シミュレーション
        ctx.fillStyle = '#0a1a2a';
        ctx.fillRect(0, 0, width, height);
        
        // 流体の密度場を表現
        for (let x = 0; x < width; x += 4) {
            for (let y = 0; y < height; y += 4) {
                const density = Math.sin(x * 0.02) * Math.cos(y * 0.02);
                const value = (density + 1) / 2;
                
                ctx.fillStyle = `rgba(0, ${Math.floor(150 * value)}, ${Math.floor(255 * value)}, 0.8)`;
                ctx.fillRect(x, y, 4, 4);
            }
        }
        
        // 流れの矢印
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 2;
        for (let x = 20; x < width; x += 30) {
            for (let y = 20; y < height; y += 30) {
                const angle = Math.atan2(y - height/2, x - width/2);
                const length = 8;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
                ctx.stroke();
            }
        }
    }

    drawSpringNetworkThumbnail(ctx, width, height) {
        // ばねネットワーク
        ctx.fillStyle = '#1a0a2a';
        ctx.fillRect(0, 0, width, height);
        
        const nodes = [];
        const nodeCount = 8;
        
        // ノードを配置
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = Math.min(width, height) * 0.3;
            nodes.push({
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius
            });
        }
        
        // ばねを描画
        ctx.strokeStyle = '#feca57';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const node1 = nodes[i];
                const node2 = nodes[j];
                const distance = Math.sqrt((node1.x - node2.x)**2 + (node1.y - node2.y)**2);
                
                if (distance < 120) {
                    ctx.beginPath();
                    ctx.moveTo(node1.x, node1.y);
                    ctx.lineTo(node2.x, node2.y);
                    ctx.stroke();
                }
            }
        }
        
        // ノードを描画
        ctx.fillStyle = '#ff6b6b';
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawOrbitalThumbnail(ctx, width, height) {
        // 軌道力学
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 中心の星
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        gradient.addColorStop(0, '#feca57');
        gradient.addColorStop(1, '#ff6b6b');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // 軌道と惑星
        const orbits = [
            {radius: 40, size: 4, color: '#3498db'},
            {radius: 60, size: 6, color: '#2ecc71'},
            {radius: 85, size: 5, color: '#e74c3c'}
        ];
        
        orbits.forEach((orbit, i) => {
            // 軌道線
            ctx.strokeStyle = orbit.color + '40';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, orbit.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 惑星
            const angle = i * Math.PI / 2;
            const planetX = centerX + Math.cos(angle) * orbit.radius;
            const planetY = centerY + Math.sin(angle) * orbit.radius;
            
            ctx.fillStyle = orbit.color;
            ctx.beginPath();
            ctx.arc(planetX, planetY, orbit.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawPendulumChaosThumbnail(ctx, width, height) {
        // カオス振り子
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const topY = height * 0.2;
        
        // 振り子の軌跡
        ctx.strokeStyle = '#ff6b6b40';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let i = 0; i < 50; i++) {
            const t = i * 0.1;
            const angle1 = Math.sin(t * 1.2) * 0.8;
            const angle2 = Math.sin(t * 1.7 + 1) * 0.6;
            
            const x1 = centerX + Math.sin(angle1) * 40;
            const y1 = topY + Math.cos(angle1) * 40;
            const x2 = x1 + Math.sin(angle2) * 30;
            const y2 = y1 + Math.cos(angle2) * 30;
            
            if (i === 0) ctx.moveTo(x2, y2);
            else ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        
        // 現在の振り子
        const angle1 = 0.6;
        const angle2 = 0.8;
        
        const x1 = centerX + Math.sin(angle1) * 40;
        const y1 = topY + Math.cos(angle1) * 40;
        const x2 = x1 + Math.sin(angle2) * 30;
        const y2 = y1 + Math.cos(angle2) * 30;
        
        // 振り子の棒
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // 振り子の重り
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(x1, y1, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(x2, y2, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    // 新しい作品のサムネイル関数

    draw3DParticlesThumbnail(ctx, width, height) {
        // 3D粒子雲のサムネイル
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        // 3D空間の粒子を2D投影で表現
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 4;
            const radius = 30 + Math.sin(i * 0.3) * 20;
            const z = Math.cos(i * 0.2) * 20;
            
            const scale = 1 + z * 0.02; // 疑似3D効果
            const x = width/2 + Math.cos(angle) * radius * scale;
            const y = height/2 + Math.sin(angle) * radius * scale;
            
            const alpha = (z + 20) / 40;
            const hue = (i * 7 + z) % 360;
            
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawTorusKnotsThumbnail(ctx, width, height) {
        // トーラス結び目のサムネイル
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 0.8;
        
        for (let t = 0; t < Math.PI * 4; t += 0.1) {
            const p = 2, q = 3; // 結び目のパラメータ
            const x = scale * Math.cos(p * t) * (3 + Math.cos(q * t));
            const y = scale * Math.sin(p * t) * (3 + Math.cos(q * t));
            
            if (t === 0) {
                ctx.moveTo(centerX + x * 10, centerY + y * 10);
            } else {
                ctx.lineTo(centerX + x * 10, centerY + y * 10);
            }
        }
        ctx.stroke();
    }

    drawTerrainThumbnail(ctx, width, height) {
        // 3D地形のサムネイル
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, width, height);
        
        // 地形をワイヤーフレームで表現
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 1;
        
        const rows = 8;
        const cols = 10;
        
        for (let i = 0; i < rows; i++) {
            ctx.beginPath();
            for (let j = 0; j < cols; j++) {
                const x = (j / (cols - 1)) * width;
                const y = height * 0.3 + i * 10 + Math.sin(j * 0.5 + i * 0.3) * 15;
                
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        for (let j = 0; j < cols; j++) {
            ctx.beginPath();
            for (let i = 0; i < rows; i++) {
                const x = (j / (cols - 1)) * width;
                const y = height * 0.3 + i * 10 + Math.sin(j * 0.5 + i * 0.3) * 15;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    drawSphereMorphingThumbnail(ctx, width, height) {
        // 球体変形のサムネイル
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = 40;
        
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        
        // 変形する球体を円で近似
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const morph = Math.sin(angle * 3) * 0.3 + 1;
            const radius = baseRadius * morph;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 中心の球体
        ctx.fillStyle = '#9b59b660';
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    draw3DFractalsThumbnail(ctx, width, height) {
        // 3Dフラクタルのサムネイル
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        // マンデルブルブ風の表現
        ctx.fillStyle = '#f39c12';
        
        const drawCube = (x, y, size) => {
            ctx.fillRect(x - size/2, y - size/2, size, size);
            // 3D効果
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(x - size/2 + 2, y - size/2 - 2, size, size);
            ctx.fillStyle = '#f39c12';
        };
        
        // フラクタル構造を模倣
        drawCube(centerX, centerY, 20);
        drawCube(centerX - 25, centerY - 15, 12);
        drawCube(centerX + 25, centerY - 15, 12);
        drawCube(centerX - 15, centerY + 25, 12);
        drawCube(centerX + 15, centerY + 25, 12);
        
        // 小さなキューブ
        drawCube(centerX - 35, centerY - 25, 6);
        drawCube(centerX + 35, centerY - 25, 6);
        drawCube(centerX - 25, centerY + 35, 6);
        drawCube(centerX + 25, centerY + 35, 6);
    }

    drawColorMatchingThumbnail(ctx, width, height) {
        // カラーマッチングゲームのサムネイル
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
        const size = 15;
        
        // カラーパレット表示
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {
                const x = 20 + i * (size + 5);
                const y = 20 + j * (size + 5);
                
                ctx.fillStyle = colors[(i + j) % colors.length];
                ctx.fillRect(x, y, size, size);
            }
        }
        
        // ターゲット色
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MATCH', width/2, height - 10);
    }

    drawPatternMemoryThumbnail(ctx, width, height) {
        // パターン記憶ゲームのサムネイル
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        
        const gridSize = 3;
        const cellSize = 20;
        const startX = (width - gridSize * cellSize) / 2;
        const startY = (height - gridSize * cellSize) / 2;
        
        const pattern = [0, 1, 2, 4, 7, 8]; // 点灯パターン例
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const index = i * gridSize + j;
                const x = startX + j * cellSize;
                const y = startY + i * cellSize;
                
                if (pattern.includes(index)) {
                    ctx.fillStyle = '#2ecc71';
                } else {
                    ctx.fillStyle = '#34495e';
                }
                
                ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
            }
        }
    }

    drawRhythmVisualizerThumbnail(ctx, width, height) {
        // リズムビジュアライザーのサムネイル
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
        
        // 音響波形風の表現
        const bars = 20;
        const barWidth = width / bars;
        
        for (let i = 0; i < bars; i++) {
            const barHeight = Math.random() * height * 0.8 + 10;
            const hue = (i / bars) * 360;
            
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
        
        // 中央の円形ビジュアライザー
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 20 + Math.random() * 15;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            ctx.stroke();
        }
    }

    drawMazeGeneratorThumbnail(ctx, width, height) {
        // 迷路生成器のサムネイル
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        const cellSize = 8;
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);
        
        // 簡単な迷路パターン
        const maze = [];
        for (let i = 0; i < rows; i++) {
            maze[i] = [];
            for (let j = 0; j < cols; j++) {
                maze[i][j] = (i % 2 === 0 || j % 2 === 0) ? 1 : 0;
            }
        }
        
        // ランダムな穴を開ける
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);
            maze[y][x] = 0;
        }
        
        // 迷路を描画
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (maze[i] && maze[i][j]) {
                    ctx.fillStyle = '#ecf0f1';
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);
                }
            }
        }
        
        // スタートとエンド
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, 0, cellSize, cellSize);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(width - cellSize, height - cellSize, cellSize, cellSize);
    }

    drawPhysicsSandboxThumbnail(ctx, width, height) {
        // 物理サンドボックスのサムネイル
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
        
        // 物理オブジェクトを描画
        const objects = [
            {x: width * 0.3, y: height * 0.4, type: 'circle', color: '#e74c3c'},
            {x: width * 0.7, y: height * 0.3, type: 'box', color: '#3498db'},
            {x: width * 0.5, y: height * 0.6, type: 'circle', color: '#2ecc71'}
        ];
        
        // 制約線
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(objects[0].x, objects[0].y);
        ctx.lineTo(objects[2].x, objects[2].y);
        ctx.moveTo(objects[1].x, objects[1].y);
        ctx.lineTo(objects[2].x, objects[2].y);
        ctx.stroke();
        
        // オブジェクト描画
        objects.forEach(obj => {
            ctx.fillStyle = obj.color;
            if (obj.type === 'circle') {
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 12, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(obj.x - 10, obj.y - 10, 20, 20);
            }
        });
        
        // 重力矢印
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width - 20, 20);
        ctx.lineTo(width - 20, 40);
        ctx.lineTo(width - 25, 35);
        ctx.moveTo(width - 20, 40);
        ctx.lineTo(width - 15, 35);
        ctx.stroke();
    }
}

// ページ読み込み時にギャラリーを初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Gallery initializing...');
    window.gallery = new ArTubeGallery();
    console.log('Gallery initialized successfully');
});