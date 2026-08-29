const icons = {
    external: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    npm: '<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    video: '<svg viewBox="0 0 24 24"><polygon points="23 12 8 22 8 2 23 12"/></svg>',
    docker: '<svg viewBox="0 0 24 24"><path d="M13.5 11h-2v2h2v-2zm0-3h-2v2h2V8zm3 0h-2v2h2V8zm0 3h-2v2h2v-2zm0 3h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm0-3h-2v2h2v-2z"/></svg>'
};

const SORTERS = {
    'year-desc': (a, b) => (b.year - a.year) || a.title.localeCompare(b.title),
    'year-asc': (a, b) => (a.year - b.year) || a.title.localeCompare(b.title),
    'title-asc': (a, b) => a.title.localeCompare(b.title),
    'title-desc': (a, b) => b.title.localeCompare(a.title)
};

let allProjects = [];

function attr(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
}

function createTechStack(technologies) {
    return (technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');
}

function createLinks(links) {
    return Object.keys(links || {})
        .filter(linkType => icons[linkType] && links[linkType])
        .map(linkType => `
            <a href="${attr(links[linkType])}" class="link-icon" target="_blank" rel="noopener noreferrer"
               title="${linkType}" aria-label="${linkType}">
                ${icons[linkType]}
            </a>
        `)
        .join('');
}

function primaryLink(links) {
    return [links?.github, links?.external, links?.npm, links?.video, links?.docker]
        .find(link => link && link !== '#') || '';
}

const ARROW = '<svg class="index-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';

function indexRow(project, position) {
    const number = String(position + 1).padStart(2, '0');
    const primary = primaryLink(project.links);
    const heading = primary
        ? `<a href="${attr(primary)}" target="_blank" rel="noopener noreferrer">${project.title}${ARROW}</a>`
        : project.title;

    return `
        <article class="index-row">
            <span class="index-bar" aria-hidden="true"></span>
            <span class="index-num">${number}</span>
            <div class="index-name">
                <h2 class="index-title">${heading}</h2>
                ${project.description ? `<p class="index-desc">${project.description}</p>` : ''}
            </div>
            <span class="index-kind">${project.company || '—'}</span>
            <div class="index-tech">${createTechStack(project.technologies)}</div>
            <span class="index-release">${project.year || ''}</span>
            <div class="index-links">${createLinks(project.links)}</div>
        </article>
    `;
}

function searchBlob(project) {
    return [
        project.title,
        project.company,
        project.description,
        project.year,
        (project.technologies || []).join(' ')
    ].join(' ').toLowerCase();
}

function renderProjects() {
    const body = document.getElementById('portfolio-body');
    const query = (document.getElementById('archive-search')?.value || '').trim().toLowerCase();
    const sortKey = document.getElementById('archive-sort')?.value || 'year-desc';

    const projects = allProjects
        .filter(project => !query || searchBlob(project).includes(query))
        .sort(SORTERS[sortKey] || SORTERS['year-desc']);

    updateMeta(projects);

    if (!projects.length) {
        body.innerHTML = '<p class="index-note">No projects match that search.</p>';
        return;
    }

    body.innerHTML = projects.map(indexRow).join('');
    stageRows(body);
}

const rowObserver = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? null
    : new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            rowObserver.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function stageRows(body) {
    if (!rowObserver) return;

    Array.from(body.children).forEach((row, index) => {

        row.style.setProperty('--reveal-index', Math.min(index, 8));
        row.classList.add('reveal');
        rowObserver.observe(row);
    });
}

function updateMeta(visible) {
    const count = document.getElementById('project-count');
    const range = document.getElementById('project-range');

    if (count) count.textContent = visible.length;

    if (range) {
        if (!visible.length) {
            range.textContent = 'no results';
        } else {
            const years = visible.map(project => project.year).filter(Boolean);
            const min = Math.min(...years);
            const max = Math.max(...years);
            range.textContent = min === max ? `${min}` : `${min} – ${max}`;
        }
    }
}

async function loadProjectsFromFile(jsonFilePath = './projects_data.json') {
    const body = document.getElementById('portfolio-body');

    try {
        const response = await fetch(jsonFilePath);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allProjects = data.projects || [];

        if (!allProjects.length) {
            body.innerHTML = '<p class="index-note">No projects found.</p>';
            updateMeta([]);
            return;
        }

        renderProjects();

    } catch (error) {
        body.innerHTML = '<p class="index-note is-error">Error loading projects. Please try again later.</p>';
        console.error('Error loading projects:', error);
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProjectsFromFile('projects_data.json');

    document.getElementById('archive-search')?.addEventListener('input', renderProjects);
    document.getElementById('archive-sort')?.addEventListener('change', renderProjects);

    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            document.getElementById('archive-search')?.focus();
        }
    });

    const navbar = document.querySelector('.navbar');
    document.querySelector('.hamburger-menu')?.addEventListener('click', () => {
        navbar.classList.toggle('menu-open');
        document.body.style.overflow = navbar.classList.contains('menu-open') ? 'hidden' : '';
    });

    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        backToTop?.classList.toggle('visible', window.pageYOffset > 300);
    });
});
