// Initialize canvas and context
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
const fullscreenCloseBtn = document.getElementById('fullscreenCloseBtn');

// Canvas properties
let isIdle = true;
let lastOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

// Configure canvas style
ctx.strokeStyle = '#000000';
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 3;

// Stroke width slider event
strokeWidthSlider.addEventListener('input', (e) => {
    ctx.lineWidth = e.target.value;
    strokeValueDisplay.textContent = e.target.value;
});

// Color picker event
strokeColorPicker.addEventListener('input', (e) => {
    ctx.strokeStyle = e.target.value;
});



// Canvas size change
resizeBtn.addEventListener('click', () => {
    const width = parseInt(canvasWidthInput.value);
    const height = parseInt(canvasHeightInput.value);
    
    // Save current content
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Change canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Dynamically adjust container
    const canvasContainer = document.querySelector('.canvas-container');
    canvasContainer.style.width = 'auto';
    canvasContainer.style.height = 'auto';
    
    // Restore style
    ctx.strokeStyle = strokeColorPicker.value;
    ctx.lineWidth = strokeWidthSlider.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Restore old content (if it fits the new size)
    ctx.putImageData(imageData, 0, 0);
    
    // Center canvas horizontally for large sizes
    if (width > window.innerWidth * 0.9) {
        canvasContainer.style.justifyContent = 'flex-start';
        canvasContainer.scrollLeft = (width - canvasContainer.clientWidth) / 2;
    } else {
        canvasContainer.style.justifyContent = 'center';
    }
});

// Drawing functions
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

function drawstart(event) {
    const coords = getCanvasCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    isIdle = false;
}

function drawmove(event) {
    if (isIdle) return;
    const coords = getCanvasCoordinates(event);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
}

function drawend(event) {
    if (isIdle) return;
    drawmove(event);
    isIdle = true;
}

// Touch event functions
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

// Touch events for mobile devices
canvas.addEventListener('touchstart', touchstart, false);
canvas.addEventListener('touchmove', touchmove, false);
canvas.addEventListener('touchend', touchend, false);

// Mouse events
canvas.addEventListener('mousedown', drawstart, false);
canvas.addEventListener('mousemove', drawmove, false);
canvas.addEventListener('mouseup', drawend, false);

// Clear button
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Download button
downloadBtn.addEventListener('click', () => {
    // Create temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Draw white background
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw signature on top
    tempCtx.drawImage(canvas, 0, 0);

    // Create download
    const link = document.createElement('a');
    link.download = 'signature_' + new Date().getTime() + '.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
});

// Prevent canvas from showing context menu
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Orientation change detection and auto-rotation
function getCurrentOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

function rotateCanvasContent90Degrees() {
    // Create image from current canvas
    const img = new Image();
    img.onload = function() {
        // Save original dimensions
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        
        // Swap canvas dimensions
        canvas.width = originalHeight;
        canvas.height = originalWidth;
        
        // Update input fields
        canvasWidthInput.value = canvas.width;
        canvasHeightInput.value = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Restore canvas style
        ctx.strokeStyle = strokeColorPicker.value;
        ctx.lineWidth = strokeWidthSlider.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Rotate and draw the image
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2); // 90 degrees clockwise
        ctx.drawImage(img, -originalWidth / 2, -originalHeight / 2);
        ctx.restore();
    };
    
    // Convert canvas to image
    img.src = canvas.toDataURL();
}

function handleOrientationChange() {
    const currentOrientation = getCurrentOrientation();
    
    // Check if we switched from landscape to portrait
    if (lastOrientation === 'landscape' && currentOrientation === 'portrait') {
        // Only rotate if there's actual content on the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let hasContent = false;
        
        // Check if canvas has any non-transparent pixels
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) {
                hasContent = true;
                break;
            }
        }
        
        if (hasContent) {
            setTimeout(() => {
                rotateCanvasContent90Degrees();
            }, 100); // Small delay to ensure orientation change is complete
        }
    }
    
    lastOrientation = currentOrientation;
}

// Listen for resize events to detect orientation changes
window.addEventListener('resize', () => {
    setTimeout(handleOrientationChange, 200);
});

// Fullscreen functionality
let isFullscreen = false;
let originalCanvasSize = { width: 800, height: 400 };

fullscreenBtn.addEventListener('click', () => {
    if (!isFullscreen) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
});

// Fullscreen close button event
fullscreenCloseBtn.addEventListener('click', () => {
    // Check if we should rotate (from landscape to portrait)
    const currentOrientation = getCurrentOrientation();
    if (currentOrientation === 'portrait') {
        // Check if canvas has content before rotating
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let hasContent = false;
        
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) {
                hasContent = true;
                break;
            }
        }
        
        if (hasContent) {
            rotateCanvasContent90Degrees();
        }
    }
    
    exitFullscreen();
});

function enterFullscreen() {
    const canvasContainer = document.querySelector('.canvas-container');
    
    // Save current canvas size
    originalCanvasSize.width = canvas.width;
    originalCanvasSize.height = canvas.height;
    
    // Activate fullscreen mode
    if (canvasContainer.requestFullscreen) {
        canvasContainer.requestFullscreen();
    } else if (canvasContainer.webkitRequestFullscreen) {
        canvasContainer.webkitRequestFullscreen();
    } else if (canvasContainer.mozRequestFullScreen) {
        canvasContainer.mozRequestFullScreen();
    } else if (canvasContainer.msRequestFullscreen) {
        canvasContainer.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Monitor fullscreen events
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    isFullscreen = !!(document.fullscreenElement || 
                     document.webkitFullscreenElement || 
                     document.mozFullScreenElement || 
                     document.msFullscreenElement);
    
    if (isFullscreen) {
        // In fullscreen: adjust canvas to screen size
        const maxWidth = window.screen.width - 40;
        const maxHeight = window.screen.height - 40;
        
        // Save current content
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Enlarge canvas
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        
        // Restore style
        ctx.strokeStyle = strokeColorPicker.value;
        ctx.lineWidth = strokeWidthSlider.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Restore old content
        ctx.putImageData(imageData, 0, 0);
        
        // Change button text
        fullscreenBtn.textContent = 'Exit Fullscreen';
        
        // Optimize canvas container for fullscreen
        const canvasContainer = document.querySelector('.canvas-container');
        canvasContainer.style.maxWidth = '100vw';
        canvasContainer.style.maxHeight = '100vh';
        canvasContainer.style.backgroundColor = '#333';
        
        // Show close button for mobile devices
        if (isMobileDevice()) {
            fullscreenCloseBtn.style.display = 'flex';
        }
        
    } else {
        // Exit fullscreen: restore original size
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        canvas.width = originalCanvasSize.width;
        canvas.height = originalCanvasSize.height;
        
        // Restore style
        ctx.strokeStyle = strokeColorPicker.value;
        ctx.lineWidth = strokeWidthSlider.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Restore old content (as much as possible)
        ctx.putImageData(imageData, 0, 0);
        
        // Reset button text
        fullscreenBtn.textContent = 'Fullscreen';
        
        // Reset canvas container
        const canvasContainer = document.querySelector('.canvas-container');
        canvasContainer.style.maxWidth = '95vw';
        canvasContainer.style.maxHeight = '';
        canvasContainer.style.backgroundColor = '';
        
        // Hide close button
        fullscreenCloseBtn.style.display = 'none';
        
        // Update input fields
        canvasWidthInput.value = originalCanvasSize.width;
        canvasHeightInput.value = originalCanvasSize.height;
    }
}

// Check if device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 1024 && 'ontouchstart' in window);
} 