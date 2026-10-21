import { escapeHTML as esc, safeURL, number, chips, countLabel, text, heading } from './shared.js';

const icons = {
    github: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    external: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>'
};

export function renderProjects(data) {
    heading('projects', data.heading);
    text('projects-section-slug', `${data.labels.summary} · ${countLabel(data.items.length, data.labels)}`);
    document.getElementById('featured-projects').innerHTML = data.items.map((project, index) => `
        <div id="project-${project.id}" class="project project-lead${index % 2 === 0 ? ' is-flipped' : ''}"
            data-entrance="${index % 2 === 0 ? 'left' : 'right'}" style="--project-accent: ${project.accent || '#c09cff'}">
            <div class="project-content">
                <div class="project-image"><img src="${safeURL(project.image.src)}" alt="${esc(project.image.alt)}" loading="lazy"></div>
                <span class="project-index">${number(index + 1)} — ${esc(data.labels.featured)}</span>
                <div class="project-info">
                    <div class="project-label">${esc(project.label)}</div>
                    <h3 class="project-title">${esc(project.title)}</h3>
                    <span class="project-language">${esc(project.language)}</span>
                    <div class="project-description">${esc(project.description)}</div>
                    ${project.repo ? `<div class="project-metrics" data-repo-stats="${esc(project.repo)}" data-stat-fallback="hide" data-stat-slug="true"></div>` : ''}
                    <div class="project-tech">${chips(project.technologies)}</div>
                    <div class="project-links">${project.links.map(link => `<a href="${safeURL(link.url)}" class="project-link" target="_blank" rel="noopener noreferrer" title="${esc(link.label)}" aria-label="${esc(link.label)}">${icons[link.icon || 'external']}</a>`).join('')}</div>
                </div>
            </div>
        </div>`).join('') || `<p class="cards-loading">${esc(data.labels.empty)}</p>`;
}
