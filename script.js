// Canvas und Kontext initialisieren
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const strokeWidthSlider = document.getElementById('strokeWidth');
const strokeValueDisplay = document.getElementById('strokeValue');

const strokeColorPicker = document.getElementById('strokeColor');
const canvasWidthInput = document.getElementById('canvasWidth');
const canvasHeightInput = document.getElementById('canvasHeight');
const resizeBtn = document.getElementById('resizeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Canvas-Eigenschaften
let isIdle = true;

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
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
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
function drawstart(event) {
    ctx.beginPath();
    ctx.moveTo(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
    isIdle = false;
}

function drawmove(event) {
    if (isIdle) return;
    ctx.lineTo(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
    ctx.stroke();
}

function drawend(event) {
    if (isIdle) return;
    drawmove(event);
    isIdle = true;
}

// Touch-Event-Funktionen
function touchstart(event) { 
    drawstart(event.touches[0]); 
}

function touchmove(event) { 
    drawmove(event.touches[0]); 
    event.preventDefault(); 
}

function touchend(event) { 
    drawend(event.changedTouches[0]); 
}

// Touch-Events für mobile Geräte
canvas.addEventListener('touchstart', touchstart, false);
canvas.addEventListener('touchmove', touchmove, false);
canvas.addEventListener('touchend', touchend, false);

// Mouse-Events
canvas.addEventListener('mousedown', drawstart, false);
canvas.addEventListener('mousemove', drawmove, false);
canvas.addEventListener('mouseup', drawend, false);

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