/* ==========================================================================
   /exp — 喰種化 engine
   The terminal boots human. Every case file opened for the first time raises
   the RC level, and everything downstream of --g reacts: the backdrop bleeds
   from Kaneki's grey into Rize's red, the kakugan opens, the kagune unfurls.
   ========================================================================== */
(function () {
    'use strict';

    var STAGES = 6;                 // 0 .. 5
    var level = 0;
    var opened = Object.create(null);
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var SCAN_WORD = ['clear', '微弱 / faint', '上昇 / rising', '警戒 / caution', '危険 / danger', '臨界 / critical'];

    var WHISPERS = [
        { who: 'Rize', jp: '一千から七を引いてごらん。', en: 'Take seven from a thousand.' },
        { who: 'Rize', jp: '違うのは、器の出来だけよ。', en: 'The only difference between us is the quality of the vessel.' },
        { who: 'Kaneki', jp: '間違っているのは世界じゃない。', en: "It's not the world that's wrong — it's us in it." },
        { who: 'Rize', jp: '変わるべきなのは、あなた。', en: 'The one who should change is you.' },
        { who: 'Kaneki', jp: '僕が主役の物語なら、きっと悲劇だ。', en: 'If I were the lead, this would be a tragedy.' }
    ];

    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }

    /* --- HUD ------------------------------------------------------------- */

    var top = el('div', 'hud top',
        '<span><span class="jp">東京喰種捜査官専用端末</span>' +
        '<span class="hide-sm"> &nbsp;<span class="dim">/</span>&nbsp; CCG</span></span>' +
        '<span class="hide-sm dim">20区 · ward 20 &nbsp;·&nbsp; 生体反応 <b>1</b></span>' +
        '<span class="rc"><span class="kakugan"></span> RC <span class="rc-bar"></span>' +
        '<span class="rc-val">0.0</span></span>');

    var bottom = el('div', 'hud bottom',
        '<span class="hide-sm">CCG-20-0714</span>' +
        '<span class="ticker"><span></span></span>' +
        '<span id="tg-clock" class="dim">--:--:--</span>');

    document.body.appendChild(top);
    document.body.appendChild(bottom);

    var rcVal = top.querySelector('.rc-val');
    var scanWord = document.querySelector('.rc-word');
    var ticker = bottom.querySelector('.ticker span');

    ticker.textContent =
        '喰種対策法に基づく捜査資料 · 取扱注意 ——— 対象: MAPLOOP ——— ' +
        'RC細胞値 監視中 ——— 20区 アンテイク周辺で目撃 ——— ' +
        'CLASSIFIED CCG CASE TERMINAL · DO NOT DISTRIBUTE ——— ' +
        'open a file from the index · drag windows by the header · right-click the desk ——— ';

    /* clock, 東京 time */
    var clock = document.getElementById('tg-clock');
    function tick() {
        clock.textContent = new Date().toLocaleTimeString('en-GB', {
            timeZone: 'Asia/Tokyo', hour12: false
        }) + ' JST';
    }
    tick();
    setInterval(tick, 1000);

    /* --- corruption furniture -------------------------------------------- */

    var surge = el('div', 'surge');
    var awaken = el('div', 'awaken', 'RC値 臨界 — 覚醒 · subject is no longer human');
    var whisper = el('div', 'whisper');
    var counting = el('div', 'counting');
    document.body.appendChild(surge);
    document.body.appendChild(awaken);
    document.body.appendChild(whisper);
    document.body.appendChild(counting);

    /* kagune — tendrils crawling in from the right edge */
    var TENDRILS = [
        'M620 40 C 470 120, 520 250, 360 300 C 250 335, 210 400, 250 470',
        'M620 200 C 500 240, 430 330, 300 340 C 190 350, 140 430, 170 520',
        'M620 380 C 480 400, 400 470, 330 560 C 280 625, 200 640, 140 700',
        'M620 560 C 520 570, 460 640, 420 720 C 390 780, 300 800, 250 860',
        'M620 720 C 540 740, 500 800, 480 880'
    ];
    var SPIKES = [
        'M360 300 l 46 -34 M300 340 l 40 -46 M330 560 l 52 -22 M420 720 l 44 -40 M250 470 l -46 -26'
    ];
    var NS = 'http://www.w3.org/2000/svg';
    var kagune = document.createElementNS(NS, 'svg');
    kagune.setAttribute('class', 'kagune');
    kagune.setAttribute('viewBox', '0 0 620 900');
    kagune.setAttribute('preserveAspectRatio', 'xMaxYMid slice');

    /* each tendril is three stacked strokes: haze, meat, highlight */
    function limb(d, delay, scale) {
        var g = document.createElementNS(NS, 'g');
        [['k-haze', 15 * scale], ['k-core', 6.5 * scale], ['k-hi', 1.6 * scale]].forEach(function (layer) {
            var p = document.createElementNS(NS, 'path');
            p.setAttribute('class', layer[0]);
            p.setAttribute('d', d);
            p.setAttribute('stroke-width', layer[1]);
            p.style.animationDelay = delay + 's';
            g.appendChild(p);
        });
        return g;
    }

    TENDRILS.forEach(function (d, i) { kagune.appendChild(limb(d, i * 0.16, 1)); });
    SPIKES.forEach(function (d, i) { kagune.appendChild(limb(d, 0.9 + i * 0.1, .42)); });
    document.body.appendChild(kagune);

    /* --- the counting ----------------------------------------------------- */

    var n = 1000;
    var countTimer = null;
    function count() {
        n -= 7;
        if (n < 7) n = 1000;
        var line = (n + 7) + ' - 7 = ' + n;
        counting.innerHTML = line + '<br>' + counting.innerHTML.split('<br>').slice(0, 3).join('<br>');
    }

    /* --- whispers --------------------------------------------------------- */

    var whisperIdx = 0;
    var whisperHide = null;
    function speak(force) {
        if (level < 2 && !force) return;
        var q = WHISPERS[whisperIdx++ % WHISPERS.length];
        whisper.innerHTML = '<span class="who">' + q.who + '</span>' + q.jp +
            '<br><span style="color:#c9ccd2; font-size:12px">' + q.en + '</span>';
        whisper.classList.add('show');
        clearTimeout(whisperHide);
        whisperHide = setTimeout(function () { whisper.classList.remove('show'); }, 6500);
    }

    /* --- level ------------------------------------------------------------ */

    function apply() {
        var g = level / (STAGES - 1);
        document.documentElement.style.setProperty('--g', g.toFixed(3));

        rcVal.textContent = (level === 0 ? '0.0' : (300 + level * 287.4).toFixed(1));
        if (scanWord) scanWord.textContent = SCAN_WORD[level];

        awaken.classList.toggle('show', level >= STAGES - 1);

        if (level >= 3 && !countTimer && !reduced) {
            count();
            countTimer = setInterval(count, 1400);
        }
    }

    function raise() {
        if (level >= STAGES - 1) return;
        level++;
        apply();

        if (!reduced) {
            surge.classList.remove('fire');
            void surge.offsetWidth;
            surge.classList.add('fire');
        }
        if (level >= 2) setTimeout(speak, 700);
    }

    document.addEventListener('file:open', function (e) {
        var id = e.detail && e.detail.id;
        if (!id || id === 'welcome' || opened[id]) return;
        opened[id] = true;
        raise();
    });

    /* right-click → "flag case" nudges it too */
    document.addEventListener('file:flag', function () { raise(); speak(true); });

    /* #rc=5 jumps straight to the awakening */
    var forced = /rc=(\d)/.exec(location.hash);
    if (forced) level = Math.min(STAGES - 1, parseInt(forced[1], 10));

    apply();
    if (level >= 2) setTimeout(speak, 900);
})();
