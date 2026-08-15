let isDragging = false;
let currentWindow = null;
let dragOffset = { x: 0, y: 0 };
let spawnOffset = { x: 0, y: 0 };
let windowZIndex = 1;
const contextMenu = document.getElementById('contextMenu');

function openWindow(windowId) {
    const win = document.getElementById(windowId + '-window');
    if (!win) return;

    win.classList.add('active');
    win.style.zIndex = ++windowZIndex;

    // Center the file on the desk, cascading each new one down-right
    const rect = win.getBoundingClientRect();
    const x = (document.documentElement.clientWidth - rect.width) / 2 + 60 + spawnOffset.x;
    const y = (document.documentElement.clientHeight - rect.height) / 2 + spawnOffset.y;
    spawnOffset.x += 34;
    spawnOffset.y += 30;
    if (spawnOffset.y > 150) { spawnOffset.x = 0; spawnOffset.y = 0; }
    win.style.left = x + 'px';
    win.style.top = y + 'px';

    constrainWindow(win);

    if (!win.dataset.wired) {
        win.dataset.wired = '1';
        win.addEventListener('mousedown', () => focusWindow(windowId));
        win.addEventListener('touchstart', () => focusWindow(windowId));
    }

    const tab = document.querySelector('.nav-item[data-win="' + windowId + '"]');
    if (tab) tab.classList.add('is-open');

    // ghoul.js listens for this to raise the RC level
    document.dispatchEvent(new CustomEvent('file:open', { detail: { id: windowId } }));
}

function focusWindow(windowId) {
    const win = document.getElementById(windowId + '-window');
    if (win) win.style.zIndex = ++windowZIndex;
}

function closeWindow(windowId) {
    const win = document.getElementById(windowId + '-window');
    if (win) win.classList.remove('active');

    const tab = document.querySelector('.nav-item[data-win="' + windowId + '"]');
    if (tab) tab.classList.remove('is-open');
}

function constrainWindow(win) {
    const rect = win.getBoundingClientRect();
    const bar = 34;
    const maxX = document.documentElement.clientWidth - rect.width;
    const maxY = document.documentElement.clientHeight - rect.height - bar;

    let x = parseInt(win.style.left) || 0;
    let y = parseInt(win.style.top) || 0;

    x = Math.max(0, Math.min(Math.max(0, maxX), x));
    y = Math.max(bar, Math.min(Math.max(bar, maxY), y));

    win.style.left = x + 'px';
    win.style.top = y + 'px';
}

// Window dragging functionality
document.addEventListener('mousedown', function (e) {
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

document.addEventListener('mousemove', function (e) {
    if (isDragging && currentWindow) {
        currentWindow.style.left = (e.clientX - dragOffset.x) + 'px';
        currentWindow.style.top = (e.clientY - dragOffset.y) + 'px';

        constrainWindow(currentWindow);
        e.preventDefault();
    }
});

document.addEventListener('mouseup', function () {
    isDragging = false;
    currentWindow = null;
});

// Touch events for mobile
document.addEventListener('touchstart', function (e) {
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

document.addEventListener('touchmove', function (e) {
    if (isDragging && currentWindow) {
        const touch = e.touches[0];
        currentWindow.style.left = (touch.clientX - dragOffset.x) + 'px';
        currentWindow.style.top = (touch.clientY - dragOffset.y) + 'px';

        constrainWindow(currentWindow);
        e.preventDefault();
    }
});

document.addEventListener('touchend', function () {
    isDragging = false;
    currentWindow = null;
});

// Prevent context menu on right click
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.style.display = 'block';
});

contextMenu.addEventListener('click', function (e) {
    e.stopPropagation();
});

function handleRefresh() {
    window.location.reload();
    contextMenu.style.display = 'none';
}

function handleShare() {
    contextMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent('file:flag'));
}

window.onload = (e) => {
    openWindow('welcome');
}
