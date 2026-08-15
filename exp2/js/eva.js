/* NERV chrome: HUD bars, corner brackets, scanlines, boot sequence.
   Shared by every page under /exp2 — the markup only has to set
   <body data-kanji="…" data-code="…">. */
(function () {
    'use strict';

    var body = document.body;
    var kanji = body.getAttribute('data-kanji') || '使徒';
    var code = body.getAttribute('data-code') || 'MAIN';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function el(tag, cls, html) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (html != null) node.innerHTML = html;
        return node;
    }

    /* --- background kanji + scanlines ------------------------------------ */

    body.appendChild(el('div', 'eva-kanji', kanji));
    body.appendChild(el('div', 'eva-scan'));

    ['tl', 'tr', 'bl', 'br'].forEach(function (corner) {
        body.appendChild(el('div', 'eva-corner ' + corner));
    });

    /* --- page still ------------------------------------------------------- */

    var art = body.getAttribute('data-art');
    var panel = document.getElementById('MainBodyRight');
    if (art && panel) {
        var plate = el('img', 'eva-art');
        plate.src = art;
        plate.alt = '';
        plate.setAttribute('aria-hidden', 'true');
        panel.appendChild(plate);
    }

    /* --- HUD bars --------------------------------------------------------- */

    var top = el('div', 'eva-bar top',
        '<span><span class="jp">特務機関ネルフ</span> &nbsp;/&nbsp; NERV</span>' +
        '<span class="hide-sm">MAGI: MELCHIOR · BALTHASAR · CASPER</span>' +
        '<span>SECTION <span class="green">' + code + '</span></span>');

    var bottom = el('div', 'eva-bar bottom',
        '<span>A.T. FIELD <span class="green">STABLE</span></span>' +
        '<span class="hide-sm">SYNC RATIO <span class="green">41.3%</span> &nbsp;·&nbsp; HARMONICS <span class="green">NORMAL</span></span>' +
        '<span class="red eva-blink">● REC</span> <span id="eva-clock">--:--:--</span>');

    body.appendChild(top);
    body.appendChild(bottom);

    /* --- clock ------------------------------------------------------------ */

    var clock = document.getElementById('eva-clock');

    function tick() {
        var now = new Date();
        clock.textContent = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()]
            .map(function (n) { return String(n).padStart(2, '0'); })
            .join(':') + ' UTC';
    }

    tick();
    setInterval(tick, 1000);

    /* --- status readout under the menu ------------------------------------ */

    var rail = document.getElementById('MainBodyLeft');
    if (rail) {
        rail.appendChild(el('div', 'eva-rail-panel',
            '<dl>' +
            '<dt>Status</dt><dd>NOMINAL</dd>' +
            '<dt>LCL</dt><dd>100%</dd>' +
            '<dt>Pattern</dt><dd>BLUE</dd>' +
            '<dt>Sector</dt><dd>' + code + '</dd>' +
            '</dl><div class="eva-meter"></div>'));
    }

    /* --- one-shot boot sequence ------------------------------------------- */

    if (reduced || sessionStorage.getItem('eva-booted')) return;
    sessionStorage.setItem('eva-booted', '1');

    var lines = [
        'NERV MAGI SYSTEM',
        '起動シーケンス開始',
        'LCL 濃度 — 正常',
        'A.T. FIELD 展開',
        '<span class="warn">WARNING</span>'
    ];

    var boot = el('div', 'eva-boot', lines.map(function (line, i) {
        return '<span style="animation-delay:' + (i * 0.16) + 's">' + line + '</span>';
    }).join(''));

    body.appendChild(boot);

    setTimeout(function () { boot.classList.add('done'); }, 1150);
    setTimeout(function () { boot.remove(); }, 1600);
})();
