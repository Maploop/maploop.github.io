let isDragging = false;
let currentWindow = null;
let dragOffset = { x: 0, y: 0 };
let spawnOffset = { x: 0, y: 0 };
let windowZIndex = 1;
const contextMenu = document.getElementById('contextMenu');

function openWindow(windowId) {
    const window = document.getElementById(windowId + '-window');
    if (window) {
        window.classList.add('active');
        window.style.zIndex = ++windowZIndex;

        // Center the window
        const rect = window.getBoundingClientRect();
        const x = (document.documentElement.clientWidth - 200) / 2 + spawnOffset.x;
        const y = (document.documentElement.clientHeight - 500) / 2 + spawnOffset.y;
        spawnOffset.x += 50;
        spawnOffset.y += 50;
        window.style.left = x + 'px';
        window.style.top = y + 'px';
        
        // Ensure window stays within bounds
        constrainWindow(window);

        window.addEventListener('mousedown', (e) => {
            focusWindow(windowId);
        });
        window.addEventListener('touchstart', (e) => {
            focusWindow(windowId);
        });
    }
}

function focusWindow(windowId) {
    const window = document.getElementById(windowId + '-window');
    window.style.zIndex = ++windowZIndex;
}

function closeWindow(windowId) {
    const window = document.getElementById(windowId + '-window');
    if (window) {
        window.classList.remove('active');
    }
}

function constrainWindow(window) {
    const rect = window.getBoundingClientRect();
    const maxX = document.documentElement.clientWidth - rect.width;
    const maxY = document.documentElement.clientHeight - rect.height;
    
    let x = parseInt(window.style.left) || 0;
    let y = parseInt(window.style.top) || 0;
    
    x = Math.max(0, Math.min(maxX, x));
    y = Math.max(0, Math.min(maxY, y));
    
    window.style.left = x + 'px';
    window.style.top = y + 'px';
}

// Window dragging functionality
document.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('window-header') || e.target.closest('.window-header')) {
        isDragging = true;
        currentWindow = e.target.closest('.window');
        
        const rect = currentWindow.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        
        e.preventDefault();
    }
    contextMenu.style.display = 'none';
});

document.addEventListener('mousemove', function(e) {
    if (isDragging && currentWindow) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        currentWindow.style.left = newX + 'px';
        currentWindow.style.top = newY + 'px';
        
        constrainWindow(currentWindow);
        e.preventDefault();
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    currentWindow = null;
});

// Touch events for mobile
document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('window-header') || e.target.closest('.window-header')) {
        isDragging = true;
        currentWindow = e.target.closest('.window');
        
        const rect = currentWindow.getBoundingClientRect();
        const touch = e.touches[0];
        dragOffset.x = touch.clientX - rect.left;
        dragOffset.y = touch.clientY - rect.top;
        
        e.preventDefault();
    }
    contextMenu.style.display = 'none';
});

document.addEventListener('touchmove', function(e) {
    if (isDragging && currentWindow) {
        const touch = e.touches[0];
        const newX = touch.clientX - dragOffset.x;
        const newY = touch.clientY - dragOffset.y;
        
        currentWindow.style.left = newX + 'px';
        currentWindow.style.top = newY + 'px';
        
        constrainWindow(currentWindow);
        e.preventDefault();
    }
    contextMenu.style.display = 'none';
});

document.addEventListener('touchend', function() {
    isDragging = false;
    currentWindow = null;
});

// Prevent context menu on right click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    contextMenu.style.left = e.offsetX + 'px';
    contextMenu.style.top = e.offsetY + 'px';
    contextMenu.style.display = 'block';
});

contextMenu.addEventListener('click', function(e) {
    e.stopPropagation();
});

function handleRefresh() {
    window.location.reload();
    contextMenu.style.display = 'none';
}

function handleShare() {
    contextMenu.style.display = 'none';
}

window.onload = (e) => {
    openWindow('welcome');
}