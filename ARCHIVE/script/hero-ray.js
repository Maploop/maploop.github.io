(function () {
    'use strict';

    var host = document.querySelector('.hero-ray');
    if (!host) return;

    var canvas = host.querySelector('canvas');
    var label = host.querySelector('.hero-ray-label');
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b79cff';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var patterns = [
        { name: 'RAY', draw: ray },
        { name: 'ORBIT', draw: orbit },
        { name: 'WAVE', draw: wave },
        { name: 'MESH', draw: mesh }
    ];

    var current = 0;
    var t = 0;

    function size() {
        var ratio = window.devicePixelRatio || 1;
        var w = canvas.clientWidth || 340;
        var h = canvas.clientHeight || 270;
        canvas.width = w * ratio;
        canvas.height = h * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        return { w: w, h: h };
    }

    function ray(w, h, time) {
        var lines = 26;
        for (var i = 0; i < lines; i++) {
            var p = i / (lines - 1);
            var y = h * 0.5 + Math.sin(time * 0.6 + p * 4.2) * h * 0.28 * (0.35 + p * 0.65);
            ctx.globalAlpha = 0.18 + p * 0.5;
            ctx.beginPath();
            ctx.moveTo(0, h * 0.5);
            ctx.lineTo(w * (0.2 + p * 0.8), y);
            ctx.stroke();
        }
    }

    function wave(w, h, time) {
        var rows = 16;
        for (var r = 0; r < rows; r++) {
            var p = r / (rows - 1);
            ctx.globalAlpha = 0.15 + p * 0.45;
            ctx.beginPath();
            for (var x = 0; x <= w; x += 6) {
                var y = h * (0.16 + p * 0.68) +
                    Math.sin(x * 0.018 + time * 0.9 + p * 2.4) * 16 * (0.3 + p);
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    function orbit(w, h, time) {
        var rings = 12;
        var cx = w * 0.55;
        var cy = h * 0.5;
        for (var i = 0; i < rings; i++) {
            var p = i / (rings - 1);
            var rx = 14 + p * w * 0.36;
            var ry = rx * (0.28 + Math.abs(Math.sin(time * 0.35 + p * 1.6)) * 0.6);
            ctx.globalAlpha = 0.14 + (1 - p) * 0.5;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, time * 0.18 + p * 0.9, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function mesh(w, h, time) {
        var cols = 14;
        var rows = 10;
        for (var c = 0; c <= cols; c++) {
            ctx.globalAlpha = 0.1 + (c / cols) * 0.4;
            ctx.beginPath();
            for (var r = 0; r <= rows; r++) {
                var x = (w / cols) * c + Math.sin(time * 0.5 + r * 0.5) * 7;
                var y = (h / rows) * r;
                if (r === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        for (var r2 = 0; r2 <= rows; r2++) {
            ctx.globalAlpha = 0.08 + (r2 / rows) * 0.22;
            ctx.beginPath();
            for (var c2 = 0; c2 <= cols; c2++) {
                var x2 = (w / cols) * c2 + Math.sin(time * 0.5 + r2 * 0.5) * 7;
                var y2 = (h / rows) * r2;
                if (c2 === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
            }
            ctx.stroke();
        }
    }

    function frame() {
        var box = size();
        ctx.clearRect(0, 0, box.w, box.h);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        patterns[current].draw(box.w, box.h, t);
        ctx.globalAlpha = 1;

        if (!reduced) {
            t += 0.012;
            requestAnimationFrame(frame);
        }
    }

    function setLabel() {
        if (!label) return;
        label.textContent = patterns[current].name + ' 0' + (current + 1) + '/0' + patterns.length;
    }

    host.addEventListener('click', function () {
        current = (current + 1) % patterns.length;
        setLabel();
        if (reduced) frame();
    });

    window.addEventListener('resize', function () {
        if (reduced) frame();
    });

    setLabel();
    frame();
})();
