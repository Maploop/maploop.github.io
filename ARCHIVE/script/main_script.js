let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const navButtons = document.querySelectorAll('.banner-nav-button');

const icons = {
    external: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    npm: '<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    video: '<svg viewBox="0 0 24 24"><polygon points="23 12 8 22 8 2 23 12"/></svg>',
    docker: '<svg viewBox="0 0 24 24"><path d="M13.5 11h-2v2h2v-2zm0-3h-2v2h2V8zm3 0h-2v2h2V8zm0 3h-2v2h2v-2zm0 3h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm0-3h-2v2h2v-2z"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
};

function showSlide(n) {
currentSlide = n;
refreshSlides();
}

function goToSlide(n) {
showSlide(n);

}

function goto(link) {
window.location.href = link;
}

function refreshSlides() {
    for (var i = 0; i < 3; i++) {
        var element = document.getElementById('slide-' + i);
        if (i == currentSlide) {
            element.style.display = 'block';
            continue;
        }
        element.style.display = 'none';
        element.classList.remove('active');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initBackgroundSplatter() {
    if (document.querySelector('.background-splatter')) return;

    // Keep a 480p backing surface while sampling the terrain at an even lower
    // grid resolution. CSS enlarges this canvas to the viewport.
    const width = 854;
    const height = 480;
    const gridWidth = 320;
    const gridHeight = 180;
    const canvas = document.createElement('canvas');
    canvas.className = 'background-splatter';
    canvas.width = width;
    canvas.height = height;
    canvas.setAttribute('aria-hidden', 'true');
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const values = new Float32Array((gridWidth + 1) * (gridHeight + 1));
    const levels = [.29, .37, .45, .53, .61, .69, .77];
    const sources = [
        { x: .13, y: .17, rx: .21, ry: .29, power: .25, phase: .2, speed: .038, drift: [.055, .028] },
        { x: .43, y: .11, rx: .27, ry: .22, power: -.2, phase: 2.1, speed: .031, drift: [.065, .036] },
        { x: .76, y: .17, rx: .22, ry: .28, power: .23, phase: 4.4, speed: .026, drift: [.05, .032] },
        { x: .27, y: .49, rx: .3, ry: .2, power: -.24, phase: 1.2, speed: .034, drift: [.04, .065] },
        { x: .59, y: .46, rx: .24, ry: .3, power: .26, phase: 3.3, speed: .029, drift: [.065, .042] },
        { x: .9, y: .48, rx: .23, ry: .24, power: -.2, phase: 5.1, speed: .036, drift: [.038, .055] },
        { x: .14, y: .82, rx: .24, ry: .26, power: .2, phase: 2.5, speed: .025, drift: [.06, .035] },
        { x: .48, y: .83, rx: .3, ry: .2, power: -.23, phase: 4.7, speed: .032, drift: [.055, .045] },
        { x: .78, y: .82, rx: .24, ry: .25, power: .22, phase: 1.8, speed: .028, drift: [.045, .05] }
    ];

    const clamp = (number, minimum, maximum) => Math.max(minimum, Math.min(maximum, number));
    const valueAt = (x, y, time, movingSources) => {
        // Broad, slow waves provide the base elevation. Moving elliptical
        // sources then bend the contours into connected topographic islands.
        let value = .5
            + .13 * Math.sin(x * 8.4 + Math.sin(y * 5.3 + time * .035) * .7 + time * .045)
            + .1 * Math.cos(y * 10.2 - x * 3.6 - time * .032)
            + .065 * Math.sin((x + y) * 17.5 + time * .025);

        for (let index = 0; index < movingSources.length; index += 1) {
            const source = movingSources[index];
            const sourceX = source.x;
            const sourceY = source.y;
            const dx = (x - sourceX) / source.rx;
            const dy = (y - sourceY) / source.ry;
            value += source.power * Math.exp(-(dx * dx + dy * dy) * 1.35);
        }
        return clamp(value, 0, 1);
    };

    const interpolate = (a, b, level) => {
        const difference = b - a;
        return difference === 0 ? .5 : clamp((level - a) / difference, 0, 1);
    };

    const edgePoint = (edge, x, y, topLeft, topRight, bottomRight, bottomLeft, level) => {
        if (edge === 0) {
            const amount = interpolate(topLeft, topRight, level);
            return [x + amount, y];
        }
        if (edge === 1) {
            const amount = interpolate(topRight, bottomRight, level);
            return [x + 1, y + amount];
        }
        if (edge === 2) {
            const amount = interpolate(bottomLeft, bottomRight, level);
            return [x + amount, y + 1];
        }
        const amount = interpolate(topLeft, bottomLeft, level);
        return [x, y + amount];
    };

    // Marching-squares keeps every contour continuous while avoiding the cost
    // of a full-resolution noise texture or a WebGL pipeline.
    const segments = [
        [], [[3, 0]], [[0, 1]], [[3, 1]], [[1, 2]],
        [[3, 2], [0, 1]], [[0, 2]], [[3, 2]], [[2, 3]],
        [[0, 2]], [[0, 1], [2, 3]], [[1, 2]], [[1, 3]],
        [[0, 1]], [[3, 0]], []
    ];

    let lastFrame = 0;
    let animationFrame = 0;
    let fluidSectionVisible = false;
    const frameInterval = 1000 / 10;
    const animateField = !prefersReducedMotion;
    const schedule = () => {
        if (animationFrame === 0 && !document.hidden) animationFrame = requestAnimationFrame(render);
    };
    const render = (timestamp) => {
        animationFrame = 0;
        if (!fluidSectionVisible) return;
        if (animateField && timestamp - lastFrame < frameInterval) {
            schedule();
            return;
        }
        lastFrame = timestamp;
        const time = timestamp * .001;
        const movingSources = sources.map(source => ({
            ...source,
            x: source.x + Math.sin(time * source.speed + source.phase) * source.drift[0],
            y: source.y + Math.cos(time * source.speed * .81 + source.phase) * source.drift[1]
        }));

        for (let y = 0; y <= gridHeight; y += 1) {
            for (let x = 0; x <= gridWidth; x += 1) {
                values[y * (gridWidth + 1) + x] = valueAt(x / gridWidth, y / gridHeight, time, movingSources);
            }
        }

        context.clearRect(0, 0, width, height);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        const scaleX = width / gridWidth;
        const scaleY = height / gridHeight;
        levels.forEach((level, levelIndex) => {
            context.beginPath();
            for (let y = 0; y < gridHeight; y += 1) {
                for (let x = 0; x < gridWidth; x += 1) {
                    const row = gridWidth + 1;
                    const topLeft = values[y * row + x];
                    const topRight = values[y * row + x + 1];
                    const bottomRight = values[(y + 1) * row + x + 1];
                    const bottomLeft = values[(y + 1) * row + x];
                    const mask = (topLeft >= level ? 1 : 0)
                        | (topRight >= level ? 2 : 0)
                        | (bottomRight >= level ? 4 : 0)
                        | (bottomLeft >= level ? 8 : 0);
                    const cellSegments = segments[mask];
                    cellSegments.forEach(([firstEdge, secondEdge]) => {
                        const first = edgePoint(firstEdge, x, y, topLeft, topRight, bottomRight, bottomLeft, level);
                        const second = edgePoint(secondEdge, x, y, topLeft, topRight, bottomRight, bottomLeft, level);
                        context.moveTo(first[0] * scaleX, first[1] * scaleY);
                        context.lineTo(second[0] * scaleX, second[1] * scaleY);
                    });
                }
            }
            context.strokeStyle = `rgba(185, 154, 255, ${levelIndex === 3 ? .16 : .095})`;
            context.lineWidth = levelIndex === 3 ? .78 : .42;
            context.stroke();
        });

        if (animateField && !document.hidden) schedule();
    };

    document.body.prepend(canvas);
    const animatedSections = [
        document.getElementById('slide-0'),
        document.getElementById('slide-2'),
        document.getElementById('contact')
    ]
        .filter(Boolean);
    const visibility = new Map(animatedSections.map(section => [section, false]));
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting));
        fluidSectionVisible = Array.from(visibility.values()).some(Boolean);
        canvas.classList.toggle('is-active', fluidSectionVisible);
        if (fluidSectionVisible) {
            lastFrame = 0;
            if (animateField) schedule();
            else render(0);
        }
    }, { threshold: 0.02 });
    animatedSections.forEach(section => sectionObserver.observe(section));

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && fluidSectionVisible) {
            lastFrame = 0;
            if (animateField) schedule();
            else render(0);
        }
    }, { passive: true });
}
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        target.classList.add(target.classList.contains('scroll-reveal') ? 'active' : 'is-revealed');

        const title = target.querySelector('.section-title');
        if (title) title.classList.add('active');

        revealObserver.unobserve(target);
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function stageRevealGroup(container) {
    if (!container || prefersReducedMotion) return;

    Array.from(container.children).forEach((child, index) => {
        if (container.dataset.revealEffect) {
            child.dataset.entrance = container.dataset.revealEffect;
            child.style.setProperty('--entrance-delay', `${(index % 3) * 90}ms`);
            stageEntrance(child);
            return;
        }
        if (child.classList.contains('reveal')) return;
        child.style.setProperty('--reveal-index', index);
        child.classList.add('reveal');
        revealObserver.observe(child);
    });
}

const entranceElements = new Set();
const entranceReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let entranceFrame = null;

function requestEntranceUpdate() {
    if (entranceFrame !== null) return;
    entranceFrame = requestAnimationFrame(updateEntrances);
}

function updateEntrances() {
    entranceFrame = null;
    const shellBounds = new Map();
    const states = [];

    entranceElements.forEach(element => {
        const shell = element.closest('.shell');
        if (!shell) return;
        if (!shellBounds.has(shell)) {
            const rect = shell.getBoundingClientRect();
            shellBounds.set(shell, {
                top: rect.top,
                scale: shell.offsetHeight ? rect.height / shell.offsetHeight : 1
            });
        }

        // offsetTop measures the resting layout, ignoring the element's slide,
        // scale and clip-path. Measuring the animated box creates a deadlock:
        // an offscreen project can never intersect and start its own entrance.
        let top = 0;
        for (let node = element; node && node !== shell; node = node.offsetParent) {
            top += node.offsetTop;
        }
        const bounds = shellBounds.get(shell);
        top = bounds.top + top * bounds.scale;
        const bottom = top + element.offsetHeight * bounds.scale;
        const visible = entranceReducedMotion.matches || element.contains(document.activeElement) ||
            (top < window.innerHeight - 32 && bottom > 0);
        states.push({ element, visible });
    });

    // Batch reads above, then writes so the animation cannot affect its trigger.
    states.forEach(({ element, visible }) => {
        element.classList.toggle('entrance-visible', visible);
        element.classList.toggle('entrance-pending', !visible);
    });
}

function stageEntrance(element) {
    entranceElements.add(element);
    requestEntranceUpdate();
}

function initSectionEntrances() {
    document.querySelectorAll('[data-entrance]').forEach(stageEntrance);

    window.addEventListener('scroll', requestEntranceUpdate, { passive: true });
    window.addEventListener('resize', requestEntranceUpdate, { passive: true });
    window.addEventListener('load', requestEntranceUpdate);
    document.addEventListener('content:loaded', requestEntranceUpdate);
    entranceReducedMotion.addEventListener('change', requestEntranceUpdate);
    document.fonts?.ready.then(requestEntranceUpdate);
    if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(requestEntranceUpdate);
        document.querySelectorAll('.scroll-panel > .shell').forEach(shell => observer.observe(shell));
    }

    // A keyboard jump into an animating piece should land on settled content.
    document.addEventListener('focusin', event => {
        event.target.closest('[data-entrance]')?.classList.add('entrance-focused');
        requestEntranceUpdate();
    });
    document.addEventListener('focusout', event => {
        event.target.closest('[data-entrance]')?.classList.remove('entrance-focused');
        requestEntranceUpdate();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initBackgroundSplatter();

    document.querySelectorAll('.scroll-reveal').forEach(element => {
        revealObserver.observe(element);
    });

    document.querySelectorAll('[data-reveal-group]').forEach(stageRevealGroup);

    initSectionEntrances();

    initCareerRuler();
    initScrollProgress();

    const backToTopBtn = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
});

function initScrollProgress() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let frame = null;

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    function update() {
        frame = null;
        const viewport = window.innerHeight;
        const documentHeight = Math.max(document.documentElement.scrollHeight - viewport, 1);
        const pageProgress = clamp(window.scrollY / documentHeight);

        navbar.style.setProperty('--scroll-progress', pageProgress.toFixed(4));
    }

    function requestUpdate() {
        if (frame !== null) return;
        frame = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    document.addEventListener('content:loaded', requestUpdate);
    update();
}

function initCareerRuler() {
    const scale = document.querySelector('.path-scale');
    const needle = scale?.querySelector('.path-scale-needle');
    if (!scale || !needle) return;

    const settle = () => needle.classList.add('is-settled');

    if (prefersReducedMotion) {
        settle();
    } else {
        needle.addEventListener('animationend', event => {
            if (event.animationName === 'path-needle-travel') settle();
        }, { once: true });
    }

    const park = () => scale.style.removeProperty('--path-position');

    document.querySelectorAll('.company-tab[data-path-pos]').forEach(tab => {
        const point = () => scale.style.setProperty('--path-position',
            `calc(${tab.dataset.pathPos}% - 1px)`);

        tab.addEventListener('pointerenter', point);
        tab.addEventListener('focus', point);
        tab.addEventListener('pointerleave', park);
        tab.addEventListener('blur', park);
    });
}

function scrollToTop() {
window.scrollTo({
    top: 0,
    behavior: 'smooth'
});
}

document.addEventListener('DOMContentLoaded', () => {
    loadProjectCards();
    loadWorkplaces();
    initHeroPillMotion();
    initWorkBubbles();
    initCompanyMarker();
    const navbar = document.querySelector('.navbar');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navItems = document.querySelectorAll('.nav-item');
    const quickNavItems = document.querySelectorAll('.quick-nav-link');

    navItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });

    hamburgerMenu?.addEventListener('click', () => {
        navbar.classList.toggle('menu-open');
        document.body.style.overflow = navbar.classList.contains('menu-open') ? 'hidden' : '';
    });

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            navbar.classList.remove('menu-open');
            document.body.style.overflow = '';

            const targetId = item.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const targetTop = targetElement.getBoundingClientRect().top + window.scrollY -
                    navbar.offsetHeight - 16;
                window.scrollTo({
                    top: Math.max(0, targetTop),
                    behavior: 'smooth'
                });
            }
        });
    });

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        const sections = document.querySelectorAll('.scroll-reveal');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top + scrollTop;
            if (scrollTop >= sectionTop - navbar.offsetHeight - 100) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === current) {
                item.classList.add('active');
            }
        });

        quickNavItems.forEach(item => {
            item.classList.toggle('is-active', item.getAttribute('data-target') === current);
        });
    });
});

function initHeroPillMotion() {
    const field = document.querySelector('#slide-0.hero');
    const rail = field?.querySelector('.hero-pills');
    const pills = Array.from(rail?.querySelectorAll('.hero-pill') || []);

    if (!field || !rail || !pills.length) return;

    const state = { pointer: null, frame: null };

    const resetMotion = () => {
        state.pointer = null;
        pills.forEach(pill => {
            pill.style.setProperty('--pill-tx', '0px');
            pill.style.setProperty('--pill-ty', '0px');
        });
    };

    const updateMotion = () => {
        state.frame = null;
        if (!state.pointer) {
            resetMotion();
            return;
        }

        const reach = Math.min(360, Math.max(240, rail.clientWidth * .42));

        pills.forEach(pill => {
            const baseX = pill.offsetLeft + pill.offsetWidth / 2;
            const baseY = pill.offsetTop + pill.offsetHeight / 2;
            const dx = state.pointer.x - baseX;
            const dy = state.pointer.y - baseY;
            const distance = Math.hypot(dx, dy);
            const influence = Math.max(0, 1 - distance / reach);
            const offset = Math.min(30, influence * 24);
            const length = distance || 1;

            pill.style.setProperty('--pill-tx', `${((dx / length) * offset).toFixed(1)}px`);
            pill.style.setProperty('--pill-ty', `${((dy / length) * offset).toFixed(1)}px`);
        });
    };

    const requestMotion = () => {
        if (state.frame !== null) return;
        state.frame = requestAnimationFrame(updateMotion);
    };

    const updatePointer = event => {
        if (event.pointerType === 'touch') return;
        const rect = rail.getBoundingClientRect();
        state.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        requestMotion();
    };

    field.addEventListener('pointerenter', updatePointer);
    field.addEventListener('pointermove', updatePointer, { passive: true });
    field.addEventListener('pointerleave', resetMotion);
}

function loadWorkplaces() {
    const tabs = document.querySelectorAll('.company-tab');
    const jobDetails = document.querySelectorAll('.job-details');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {

            tabs.forEach(t => t.classList.remove('active'));

            tab.classList.add('active');

            jobDetails.forEach(detail => detail.style.display = 'none');

            const company = tab.dataset.company;
            const targetJob = document.querySelector(`[data-job="${company}"]`);

            if (targetJob) {
                targetJob.style.display = 'flex';
            }

            tabs.forEach(t => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));

            moveCompanyMarker();
            openWorkModal(tab);
        });
    });
}

let workBubbleState = null;

function initWorkBubbles() {
    const field = document.querySelector('.company-tabs');
    const modal = document.querySelector('#work-detail-modal');
    const container = document.querySelector('#slide-2 .work-container');
    const tabs = Array.from(document.querySelectorAll('.company-tab'));
    const closeButton = modal?.querySelector('.work-modal-close');

    if (!field || !modal || !container || !tabs.length) return;

    const state = {
        field,
        modal,
        container,
        tabs,
        pointer: null,
        activeTab: null,
        modalOpen: false,
        closing: false,
        closeTimer: null,
        frame: null
    };
    workBubbleState = state;

    tabs.forEach(tab => {
        tab.style.left = `${Number(tab.dataset.bubbleX || 50)}%`;
        tab.style.top = `${Number(tab.dataset.bubbleY || 50)}%`;
        tab.setAttribute('aria-haspopup', 'dialog');
    });

    const resetMotion = () => {
        state.pointer = null;
        tabs.forEach(tab => {
            tab.style.setProperty('--bubble-tx', '0px');
            tab.style.setProperty('--bubble-ty', '0px');
            tab.style.setProperty('--bubble-rotate', '0deg');
        });
    };

    const updateMotion = () => {
        state.frame = null;
        if (!state.pointer || state.modalOpen || state.closing) {
            resetMotion();
            return;
        }

        const rect = field.getBoundingClientRect();
        const reach = Math.min(300, Math.max(220, rect.width * .34));

        tabs.forEach(tab => {
            const baseX = rect.width * (Number(tab.dataset.bubbleX || 50) / 100);
            const baseY = rect.height * (Number(tab.dataset.bubbleY || 50) / 100);
            const dx = state.pointer.x - baseX;
            const dy = state.pointer.y - baseY;
            const distance = Math.hypot(dx, dy);
            const influence = Math.max(0, 1 - distance / reach);
            const offset = Math.min(52, influence * 42);
            const length = distance || 1;

            tab.style.setProperty('--bubble-tx', `${((dx / length) * offset).toFixed(1)}px`);
            tab.style.setProperty('--bubble-ty', `${((dy / length) * offset).toFixed(1)}px`);
            tab.style.setProperty('--bubble-rotate', `${((dx / length) * influence * 3).toFixed(2)}deg`);
        });
    };

    const requestMotion = () => {
        if (state.frame !== null) return;
        state.frame = requestAnimationFrame(updateMotion);
    };

    field.addEventListener('pointerenter', event => {
        if (state.modalOpen || state.closing || event.pointerType === 'touch') return;
        const rect = field.getBoundingClientRect();
        state.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        requestMotion();
    });

    field.addEventListener('pointermove', event => {
        if (state.modalOpen || state.closing || event.pointerType === 'touch') return;
        const rect = field.getBoundingClientRect();
        state.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        requestMotion();
    }, { passive: true });

    field.addEventListener('pointerleave', () => {
        resetMotion();
    });

    closeButton?.addEventListener('click', closeWorkModal);
    document.addEventListener('pointerdown', event => {
        if (!state.modalOpen) return;
        if (modal.contains(event.target) || event.target.closest('.company-tab')) return;
        closeWorkModal();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && state.modalOpen) closeWorkModal();
    });
}

function openWorkModal(tab) {
    const state = workBubbleState;
    if (!state) return;

    if (state.closeTimer) {
        clearTimeout(state.closeTimer);
        state.closeTimer = null;
    }

    const target = state.modal.querySelector(`[data-job="${tab.dataset.company}"]`);
    if (!target) return;

    state.tabs.forEach(item => {
        const job = state.modal.querySelector(`[data-job="${item.dataset.company}"]`);
        if (job) job.style.display = item === tab ? 'flex' : 'none';
    });

    state.activeTab = tab;
    state.modalOpen = true;
    state.closing = false;
    state.field.classList.add('is-paused');
    state.tabs.forEach(item => {
        item.style.removeProperty('transition');
        item.classList.toggle('modal-source', item === tab);
    });
    const companyName = tab.querySelector('.tab-name')?.textContent.trim() || tab.dataset.company;
    const companyRole = tab.querySelector('.tab-role')?.textContent.trim() || 'Work details';
    state.modal.querySelector('.work-modal-company').textContent = companyName;
    state.modal.querySelector('.work-modal-role').textContent = companyRole;
    const bubbleColor = getComputedStyle(tab).getPropertyValue('--bubble-color').trim();
    state.modal.style.setProperty('--modal-color', bubbleColor || 'var(--accent)');
    state.modal.classList.remove('is-closing');
    state.modal.classList.remove('is-open');
    void state.modal.offsetWidth;
    state.modal.classList.add('is-open');
    state.modal.setAttribute('aria-modal', 'true');
    state.pointer = null;
    positionWorkModal(tab);
    state.modal.querySelector('.work-modal-close')?.focus({ preventScroll: true });
}

function positionWorkModal(tab) {
    const state = workBubbleState;
    if (!state || !state.modalOpen) return;

    const containerRect = state.container.getBoundingClientRect();
    const bubbleRect = tab.getBoundingClientRect();
    const modalWidth = state.modal.offsetWidth;
    const modalHeight = state.modal.offsetHeight;
    const bubbleX = bubbleRect.left - containerRect.left;
    const bubbleY = bubbleRect.top - containerRect.top;
    const maxX = Math.max(8, containerRect.width - modalWidth - 8);
    const maxY = Math.max(8, containerRect.height - modalHeight - 8);
    const bubbleCenterX = bubbleX + bubbleRect.width / 2;
    const bubbleCenterY = bubbleY + bubbleRect.height / 2;
    const left = Math.min(maxX, Math.max(8, bubbleCenterX - modalWidth / 2));
    const top = Math.min(maxY, Math.max(8, bubbleCenterY - modalHeight / 2));
    const startScale = Math.min(
        bubbleRect.width / modalWidth,
        bubbleRect.height / modalHeight
    );
    const startX = bubbleCenterX - left - (modalWidth * startScale) / 2;
    const startY = bubbleCenterY - top - (modalHeight * startScale) / 2;

    state.modal.style.left = `${left}px`;
    state.modal.style.top = `${top}px`;
    state.modal.style.setProperty('--modal-start-x', `${startX}px`);
    state.modal.style.setProperty('--modal-start-y', `${startY}px`);
    state.modal.style.setProperty('--modal-start-scale', startScale.toFixed(4));
    state.modal.style.setProperty('--modal-bubble-size', `${bubbleRect.width}px`);
    state.modal.style.setProperty('--modal-bubble-radius', `${bubbleRect.width / 2}px`);
    state.modal.style.setProperty('--modal-cap-start-top', `${(modalHeight - bubbleRect.width) / 2}px`);
    state.modal.style.setProperty('--modal-cap-top', `${-bubbleRect.width / 2}px`);
    state.modal.style.setProperty('--modal-cap-start-scale', (1 / startScale).toFixed(4));
}

function closeWorkModal() {
    const state = workBubbleState;
    if (!state || (!state.modalOpen && !state.modal.classList.contains('is-open'))) return;

    state.modalOpen = false;
    state.closing = false;
    state.modal.classList.remove('is-open', 'is-closing');
    state.modal.setAttribute('aria-modal', 'false');
    state.activeTab = null;
    state.closeTimer = null;
    state.field.classList.remove('is-paused');
    state.modal.style.removeProperty('left');
    state.modal.style.removeProperty('top');
    state.modal.style.removeProperty('--modal-start-x');
    state.modal.style.removeProperty('--modal-start-y');
    state.modal.style.removeProperty('--modal-start-scale');
    state.modal.style.removeProperty('--modal-bubble-size');
    state.modal.style.removeProperty('--modal-bubble-radius');
    state.modal.style.removeProperty('--modal-cap-start-top');
    state.modal.style.removeProperty('--modal-cap-top');
    state.modal.style.removeProperty('--modal-cap-start-scale');
    state.modal.style.removeProperty('--modal-color');
    state.tabs.forEach(item => {
        item.style.setProperty('transition', 'none');
        item.classList.remove('modal-source');
        item.style.setProperty('--bubble-tx', '0px');
        item.style.setProperty('--bubble-ty', '0px');
        item.style.setProperty('--bubble-rotate', '0deg');
    });
    state.pointer = null;
    requestAnimationFrame(() => state.tabs.forEach(item => item.style.removeProperty('transition')));
}

let moveCompanyMarker = () => {};

function initCompanyMarker() {
    const rail = document.querySelector('.company-tabs');
    const marker = rail?.querySelector('.tab-marker');
    if (!rail || !marker) return;

    moveCompanyMarker = () => {
        const active = rail.querySelector('.company-tab.active');
        if (!active) return;

        marker.style.width = `${active.offsetWidth}px`;
        marker.style.height = `${active.offsetHeight}px`;
        marker.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
        marker.classList.add('is-ready');
    };

    moveCompanyMarker();

    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(() => moveCompanyMarker()).observe(rail);
    }
    window.addEventListener('resize', moveCompanyMarker);
    document.fonts?.ready.then(moveCompanyMarker);
}

function decorateWorkplaces() {
    document.querySelectorAll('.job-date').forEach(date => {
        date.classList.toggle('is-current', /present/i.test(date.textContent));
    });

    document.querySelectorAll('.job-description').forEach(list => {
        if (!list.querySelector('li')) {
            list.innerHTML = '<li class="job-placeholder">Write-up in progress.</li>';
        }
    });

    moveCompanyMarker();
}

document.addEventListener('content:loaded', decorateWorkplaces);

const cardAccents = ['#b99aff', '#71e3f2', '#ff9c9c', '#88e4bd', '#f4c76d', '#c09cff'];

function cardMark(title) {
    const words = String(title || '?').trim().split(/\s+/);
    const letters = words.length > 1
        ? words[0][0] + words[1][0]
        : words[0].slice(0, 2);
    return letters.toUpperCase();
}

function attr(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function createCardLinks(links) {
    const linkElements = [];

    Object.keys(links).forEach(linkType => {
        if (icons[linkType] && links[linkType]) {
            linkElements.push(`
                <a href="${links[linkType]}" class="card-link" target="_blank" rel="noopener noreferrer">
                    ${icons[linkType]}
                </a>
            `);
        }
    });

    return linkElements.join('');
}

function dominantLanguage(technologies) {
    const stack = technologies.map(item => String(item || '').toLowerCase());
    if (stack.some(item => item.includes('typescript'))) return 'TypeScript';
    if (stack.some(item => item === 'c++' || item.includes('opengl') || item.includes('vulkan'))) return 'C++';
    if (stack.some(item => item === 'c')) return 'C';
    if (stack.some(item => item.includes('java') || item.includes('spring') || item.includes('minecraft') || item.includes('spigot') || item.includes('nms'))) return 'Java';
    if (stack.some(item => item.includes('python'))) return 'Python';
    if (stack.some(item => item.includes('javascript') || item.includes('express') || item.includes('node'))) return 'JavaScript';
    return technologies.find(Boolean) || 'Software';
}

function projectCardMarkup(project, index) {
    const links = project.links || {};
    const tech = (project.technologies || []).filter(Boolean);
    const language = dominantLanguage(tech);
    const slug = window.RepoStats?.parseRepo(links.github) || '';

    const primary = [links.github, links.external].find(link => link && link !== '#') || '';
    const heading = primary
        ? `<a href="${attr(primary)}" target="_blank" rel="noopener noreferrer">${project.title}</a>`
        : project.title;

    return `
        <article class="project-card" style="--card-accent: ${cardAccents[index % cardAccents.length]}">
            <div class="card-top">
                <span class="card-mark" aria-hidden="true">${cardMark(project.title)}</span>
                <div class="card-heading">
                    <h3 class="card-title">${heading}</h3>
                    ${project.company ? `<span class="card-company">${project.company}</span>` : ''}
                </div>
                <span class="card-year">${project.year || ''}</span>
            </div>

            <p class="card-description">${project.description || 'No description available.'}</p>

            <div class="card-metrics"
                 data-repo-stats="${attr(slug)}"
                 data-stat-fallback="hide"
                 data-stat-compact="true"
                 data-stat-tech="${attr(tech.join(', '))}"></div>

            <div class="card-foot">
                <span class="card-language">${attr(language)}</span>
                <div class="card-links">${createCardLinks(links)}</div>
            </div>
        </article>
    `;
}

async function loadProjectCards() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    try {
        const response = await fetch('/projects/projects_data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const projects = data.projects;

        if (!projects || projects.length === 0) {
            grid.innerHTML = '<div class="cards-error">No projects found.</div>';
            return;
        }

        grid.innerHTML = projects.slice(0, 6).map(projectCardMarkup).join('');

        window.RepoStats?.mount(grid);

        stageRevealGroup(grid);

    } catch (error) {
        grid.innerHTML = '<div class="cards-error">Error loading projects. Please try again later.</div>';
        console.error('Error loading project cards:', error);
    }
}
