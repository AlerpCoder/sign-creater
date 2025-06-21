// Canvas und Kontext initialisieren
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const strokeWidthSlider = document.getElementById('strokeWidth');
const strokeValueDisplay = document.getElementById('strokeValue');
const brushTypeSelect = document.getElementById('brushType');
const strokeColorPicker = document.getElementById('strokeColor');
const canvasWidthInput = document.getElementById('canvasWidth');
const canvasHeightInput = document.getElementById('canvasHeight');
const resizeBtn = document.getElementById('resizeBtn');

// Canvas-Eigenschaften
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Canvas-Stil konfigurieren
ctx.strokeStyle = '#000000';
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 3;

// Strichstärke-Slider Event
strokeWidthSlider.addEventListener('input', (e) => {
    ctx.lineWidth = e.target.value;
    strokeValueDisplay.textContent = e.target.value;
});

// Farb-Picker Event
strokeColorPicker.addEventListener('input', (e) => {
    ctx.strokeStyle = e.target.value;
});

// Pinsel-Art Event
brushTypeSelect.addEventListener('change', (e) => {
    switch(e.target.value) {
        case 'round':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            break;
        case 'square':
            ctx.lineCap = 'square';
            ctx.lineJoin = 'miter';
            break;
        case 'pen':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            break;
        case 'ballpoint':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            break;
        case 'marker':
            ctx.lineCap = 'square';
            ctx.lineJoin = 'round';
            break;
        case 'brush':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            break;
        case 'calligraphy':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            break;
        case 'pencil':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            break;
    }
});

// Canvas-Größe ändern
resizeBtn.addEventListener('click', () => {
    const width = parseInt(canvasWidthInput.value);
    const height = parseInt(canvasHeightInput.value);
    
    // Aktuellen Inhalt speichern
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Canvas-Größe ändern
    canvas.width = width;
    canvas.height = height;
    
    // Container dynamisch anpassen
    const canvasContainer = document.querySelector('.canvas-container');
    canvasContainer.style.width = 'auto';
    canvasContainer.style.height = 'auto';
    
    // Stil wiederherstellen
    ctx.strokeStyle = strokeColorPicker.value;
    ctx.lineWidth = strokeWidthSlider.value;
    brushTypeSelect.dispatchEvent(new Event('change'));
    
    // Alten Inhalt wiederherstellen (falls er in die neue Größe passt)
    ctx.putImageData(imageData, 0, 0);
    
    // Canvas horizontal zentrieren bei großen Größen
    if (width > window.innerWidth * 0.9) {
        canvasContainer.style.justifyContent = 'flex-start';
        canvasContainer.scrollLeft = (width - canvasContainer.clientWidth) / 2;
    } else {
        canvasContainer.style.justifyContent = 'center';
    }
});

// Zeichnen-Funktionen
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Verschiedene Pinsel-Effekte
    const brushType = brushTypeSelect.value;
    
    if (brushType === 'brush') {
        // Kalligrafie-Effekt: Strichstärke basierend auf Geschwindigkeit
        const distance = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));
        const speed = distance;
        ctx.lineWidth = Math.max(1, parseInt(strokeWidthSlider.value) - speed * 0.5);
    } else if (brushType === 'ballpoint') {
        // Kugelschreiber-Effekt: Konsistente, dünne Linie mit leichter Variation
        const baseWidth = parseInt(strokeWidthSlider.value);
        const variation = Math.random() * 0.3 - 0.15; // Kleine zufällige Variation
        ctx.lineWidth = Math.max(1, baseWidth + variation);
        
        // Kugelschreiber haben typischerweise eine höhere Opazität
        ctx.globalAlpha = 0.9;
    } else if (brushType === 'calligraphy') {
        // Kalligrafie-Effekt: Strichstärke basierend auf Geschwindigkeit
        const distance = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));
        const speed = distance;
        ctx.lineWidth = Math.max(1, parseInt(strokeWidthSlider.value) - speed * 0.5);
    } else {
        // Standard-Pinsel: Konstante Linienstärke
        ctx.lineWidth = parseInt(strokeWidthSlider.value);
        ctx.globalAlpha = 1.0;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    isDrawing = false;
}

// Mouse-Events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch-Events für mobile Geräte
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

// Löschen-Button
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Download-Button
downloadBtn.addEventListener('click', () => {
    // Temporäres Canvas mit weißem Hintergrund erstellen
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Weißen Hintergrund zeichnen
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Unterschrift darüber zeichnen
    tempCtx.drawImage(canvas, 0, 0);

    // Download erstellen
    const link = document.createElement('a');
    link.download = 'unterschrift_' + new Date().getTime() + '.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
});

// Verhindern, dass das Canvas das Kontextmenü anzeigt
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
}); 