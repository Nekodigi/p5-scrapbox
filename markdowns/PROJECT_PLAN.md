# ArTube - p5.js インタラクティブギャラリー

## プロジェクト概要
YouTube風のインターフェースで、生成アルゴリズムの美しい可視化作品を展示するWebアプリケーション。各作品はサムネイルクリックで全画面表示され、インタラクティブに操作できる。

## 技術スタック
- p5.js (メイン描画ライブラリ)
- HTML/CSS/JavaScript
- ローカルストレージ (お気に入り機能)

## 作品カテゴリと実装予定作品

### 1. パーティクルシステム (5作品)
- **Gravity Wells**: 重力井戸に引き寄せられる粒子群
- **Fireworks Symphony**: 連続的な花火のシミュレーション
- **Magnetic Fields**: 磁場の可視化と粒子の動き
- **Swarm Intelligence**: 群知能アルゴリズムの可視化
- **Particle Flow Field**: Perlinノイズによる流れ場

### 2. フラクタル (5作品)
- **Mandelbrot Explorer**: インタラクティブなマンデルブロ集合
- **Julia Set Morphing**: ジュリア集合のリアルタイム変形
- **Dragon Curve**: ドラゴン曲線の段階的生成
- **Sierpinski Variations**: シェルピンスキー図形のバリエーション
- **L-System Garden**: L-Systemによる植物生成

### 3. 波形・音響可視化 (5作品)
- **Audio Spectrum**: マイク入力の周波数解析表示
- **Wave Interference**: 波の干渉パターン
- **Lissajous Curves**: リサージュ曲線のアニメーション
- **Cymatics Simulation**: 音波による模様生成
- **Fourier Series**: フーリエ級数の可視化

### 4. セルオートマトン (5作品)
- **Game of Life HD**: 高解像度ライフゲーム
- **Elementary CA**: 基本セルオートマトンのパターン
- **Langton's Ant**: ラングトンのアリの軌跡
- **Reaction Diffusion**: 反応拡散系のシミュレーション
- **Crystal Growth**: 結晶成長シミュレーション

### 5. 物理シミュレーション (5作品)
- **Cloth Simulation**: 布のリアルタイムシミュレーション
- **Fluid Dynamics**: 流体力学の可視化
- **Spring Network**: ばねネットワークの振動
- **Orbital Mechanics**: 惑星軌道シミュレーション
- **Pendulum Chaos**: 二重振り子のカオス運動

### 6. 生成アート (5作品)
- **Generative Landscapes**: 手続き的地形生成
- **Abstract Compositions**: 幾何学的抽象画生成
- **Voronoi Art**: ボロノイ図によるアート
- **Recursive Trees**: 再帰的な樹木生成
- **Noise Paintings**: Perlinノイズ絵画

### 7. 3D作品 (5作品)
- **3D Particle Cloud**: 3D空間の粒子群
- **Torus Knots**: トーラス結び目の回転
- **Terrain Generation**: 3D地形生成
- **Sphere Morphing**: 球体の変形アニメーション
- **3D Fractals**: 3次元フラクタル

### 8. インタラクティブゲーム (5作品)
- **Color Matching**: 色彩感覚ゲーム
- **Pattern Memory**: パターン記憶ゲーム
- **Rhythm Visualizer**: リズムゲーム風ビジュアライザ
- **Maze Generator**: 迷路生成と解法
- **Physics Sandbox**: 物理演算サンドボックス

## インタラクティブ要素
- マウス追従
- クリック・ドラッグ操作
- キーボード入力
- タッチ対応（モバイル）
- パラメータ調整スライダー
- リセット/一時停止ボタン

## UI/UX設計
- YouTube風グリッドレイアウト
- ダークテーマ
- サムネイル自動生成
- カテゴリフィルター
- 検索機能
- お気に入り機能
- 全画面表示モード
- 作品説明ポップアップ

## ディレクトリ構造
```
artube/
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   ├── gallery.js
│   └── sketches/
│       ├── particles/
│       ├── fractals/
│       ├── waves/
│       ├── cellular/
│       ├── physics/
│       ├── generative/
│       ├── 3d/
│       └── interactive/
└── assets/
    └── thumbnails/
```

## 開発フェーズ
1. 基本構造とギャラリーシステム構築
2. 各カテゴリの代表作品実装（各1作品）
3. 残りの作品を順次実装
4. UI改善とパフォーマンス最適化
5. モバイル対応とテスト