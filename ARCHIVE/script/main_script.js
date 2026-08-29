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
        if (child.classList.contains('reveal')) return;
        child.style.setProperty('--reveal-index', index);
        child.classList.add('reveal');
        revealObserver.observe(child);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.scroll-reveal').forEach(element => {
        revealObserver.observe(element);
    });

    document.querySelectorAll('[data-reveal-group]').forEach(stageRevealGroup);

    initSectionStack();
    initHeroArtMotion();
    initCareerRuler();

    const backToTopBtn = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
});

function initSectionStack() {
    const panels = Array.from(document.querySelectorAll('.scroll-panel'));
    if (!panels.length) return;

    const motionAllowed = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const headerHeight = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) * 16 || 56;

    function update() {
        const available = window.innerHeight - headerHeight;

        panels.forEach(panel => {
            panel.classList.remove('is-stackable', 'is-short');
            panel.style.removeProperty('--stack-top');
            if (!motionAllowed.matches) return;

            const overflow = panel.offsetHeight - available;

            panel.classList.add('is-stackable');
            panel.classList.toggle('is-short', overflow <= 0);
            panel.style.setProperty('--stack-top',
                `${Math.round(headerHeight - Math.max(overflow, 0))}px`);
        });
    }

    if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => {

            requestAnimationFrame(update);
        });
        panels.forEach(panel => {
            const content = panel.querySelector(':scope > .shell');
            if (content) observer.observe(content);
        });
    }

    motionAllowed.addEventListener('change', update);
    window.addEventListener('resize', update, { passive: true });
    document.fonts?.ready.then(update);

    document.addEventListener('content:loaded', update);
    window.addEventListener('load', () => setTimeout(update, 200));

    update();
}

function initHeroArtMotion() {
    const art = document.querySelector('.hero-art');
    if (!art || prefersReducedMotion) return;

    const lamellae = art.querySelector('.art-lamellae');

    function updateScrollShift() {
        const progress = Math.min(window.scrollY / Math.max(art.offsetHeight, 1), 1);
        art.style.setProperty('--art-shift', `${(progress * 16).toFixed(2)}px`);
        lamellae?.style.setProperty('--art-lamellae-y', `${(-progress * 11).toFixed(2)}px`);
    }

    let pointerFrame = null;
    let pointer = { x: 0, y: 0 };

    function queuePointerMotion(x, y) {
        pointer = { x, y };
        if (pointerFrame !== null) return;

        pointerFrame = requestAnimationFrame(() => {
            art.style.setProperty('--art-pointer-x', `${(pointer.x * 12).toFixed(2)}px`);
            art.style.setProperty('--art-pointer-y', `${(pointer.y * 9).toFixed(2)}px`);
            art.style.setProperty('--art-signal-x', `${(pointer.x * 3).toFixed(2)}px`);
            art.style.setProperty('--art-signal-y', `${(pointer.y * 4).toFixed(2)}px`);
            lamellae?.style.setProperty('--art-lamellae-x', `${(pointer.x * -9).toFixed(2)}px`);
            pointerFrame = null;
        });
    }

    art.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch') return;

        const bounds = art.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
        const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
        queuePointerMotion(x, y);
    }, { passive: true });

    art.addEventListener('pointerleave', () => queuePointerMotion(0, 0));
    art.addEventListener('pointercancel', () => queuePointerMotion(0, 0));

    window.addEventListener('scroll', updateScrollShift, { passive: true });
    updateScrollShift();
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
                window.scrollTo({
                    top: targetElement.offsetTop - navbar.offsetHeight,
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
            if (scrollTop >= section.offsetTop - navbar.offsetHeight - 100) {
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
        });
    });
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

const cardAccents = ['#b79cff', '#9f8bff', '#c9a7ff', '#8f9dff', '#cf9ce0', '#a2b6ff'];

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

function projectCardMarkup(project, index) {
    const links = project.links || {};
    const tech = (project.technologies || []).filter(Boolean);
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
                 data-stat-fallback="stack"
                 data-stat-compact="true"
                 data-stat-tech="${attr(tech.join(', '))}"></div>

            <div class="card-foot">
                <div class="tech-chips is-compact card-foot-tech">
                    ${window.RepoStats?.techChips(tech, 3) || ''}
                </div>
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
