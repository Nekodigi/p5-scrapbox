// Node.js script to generate PNG favicon using canvas
// Run: node generate-favicon.js

const { createCanvas } = require('canvas');
const fs = require('fs');

function generateFavicon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#4ecdc4');
    gradient.addColorStop(1, '#45b7d1');
    
    // Background circle
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
    ctx.fill();
    
    // White border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // p5 text
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${size/4}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('p5', size/2, size * 0.35);
    
    // Horizontal line
    ctx.fillStyle = '#fff';
    const lineWidth = size * 0.6;
    const lineHeight = size * 0.06;
    ctx.fillRect((size - lineWidth)/2, size * 0.47, lineWidth, lineHeight);
    
    // Three dots
    const dotRadius = size * 0.06;
    const dotY = size * 0.7;
    
    ctx.beginPath();
    ctx.arc(size * 0.25, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(size * 0.5, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(size * 0.75, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
}

// Generate different sizes
const sizes = [16, 32, 192, 512];

sizes.forEach(size => {
    const canvas = generateFavicon(size);
    const buffer = canvas.toBuffer('image/png');
    
    const filename = size <= 32 ? `favicon-${size}.png` : `assets/icon-${size}.png`;
    fs.writeFileSync(filename, buffer);
    console.log(`Generated ${filename}`);
});

console.log('All favicons generated successfully!');