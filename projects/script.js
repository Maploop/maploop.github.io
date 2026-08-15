// Icon SVGs
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

function createTechStack(technologies) {
    const tags = (technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');
    return `<div class="tech-cell">${tags}</div>`;
}

function createLinks(links) {
    const linkElements = Object.keys(links || {})
        .filter(linkType => icons[linkType] && links[linkType])
        .map(linkType => `
            <a href="${links[linkType]}" class="link-icon" target="_blank" rel="noopener noreferrer"
               title="${linkType}" aria-label="${linkType}">
                ${icons[linkType]}
            </a>
        `);

    return `<div class="links-cell">${linkElements.join('')}</div>`;
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
    const tbody = document.getElementById('portfolio-body');
    const query = (document.getElementById('archive-search')?.value || '').trim().toLowerCase();
    const sortKey = document.getElementById('archive-sort')?.value || 'year-desc';

    const projects = allProjects
        .filter(project => !query || searchBlob(project).includes(query))
        .sort(SORTERS[sortKey] || SORTERS['year-desc']);

    updateMeta(projects);

    if (!projects.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No projects match that search.</td></tr>';
        return;
    }

    tbody.innerHTML = projects.map(project => `
        <tr>
            <td class="year">${project.year}</td>
            <td class="title">${project.title}</td>
            <td class="company">${project.company || '—'}</td>
            <td class="tech-stack">${createTechStack(project.technologies)}</td>
            <td class="links">${createLinks(project.links)}</td>
        </tr>
    `).join('');
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
    const tbody = document.getElementById('portfolio-body');

    try {
        const response = await fetch(jsonFilePath);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allProjects = data.projects || [];

        if (!allProjects.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No projects found.</td></tr>';
            updateMeta([]);
            return;
        }

        renderProjects();

    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="error">Error loading projects. Please try again later.</td></tr>';
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

    // Ctrl/Cmd + K focuses the search field
    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            document.getElementById('archive-search')?.focus();
        }
    });

    // Mobile navigation
    const navbar = document.querySelector('.navbar');
    document.querySelector('.hamburger-menu')?.addEventListener('click', () => {
        navbar.classList.toggle('menu-open');
        document.body.style.overflow = navbar.classList.contains('menu-open') ? 'hidden' : '';
    });

    // Back to top button visibility
    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        backToTop?.classList.toggle('visible', window.pageYOffset > 300);
    });
});
