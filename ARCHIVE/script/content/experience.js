import { escapeHTML as esc, safeURL, number, chips, list, countLabel, text, heading } from './shared.js';

const colors = ['#b99aff', '#9b76e8', '#c9a9ff', '#8059ce', '#71e3f2', '#88e4bd'];
const monthIndex = month => Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;

export function careerRange(companies, now = new Date()) {
    if (!companies.length) return null;
    const start = Math.min(...companies.map(company => monthIndex(company.start)));
    const current = now.getFullYear() * 12 + now.getMonth();
    const end = Math.max(start + 1, ...companies.map(company => company.end ? monthIndex(company.end) : Math.max(current, monthIndex(company.start))));
    return { start, end, position: month => 1 + 98 * (monthIndex(month) - start) / (end - start) };
}

function dateLabel(company, labels, locale) {
    const format = value => new Date(`${value}-01T00:00:00Z`).toLocaleDateString(locale, {
        month: 'long', year: 'numeric', timeZone: 'UTC'
    });
    return company.date || `${format(company.start)} - ${company.end ? format(company.end) : labels.present}`;
}

export function renderExperience(data, locale) {
    const { companies, labels } = data;
    const range = careerRange(companies);
    heading('experience', data.heading);
    text('company-count', number(companies.length));
    text('companies-label', labels.companies);
    text('companies-since-label', labels.since);
    text('companies-since', range ? Math.floor(range.start / 12) : '—');
    text('timeline-label', labels.timeline);
    text('timeline-now', companies.some(company => company.end === null) ? labels.now : (range ? Math.floor(range.end / 12) : ''));
    const period = range ? `${Math.floor(range.start / 12)} — ${companies.some(company => company.end === null) ? labels.present : Math.floor(range.end / 12)} · ` : '';
    text('experience-section-slug', period + countLabel(companies.length, labels));

    const tabs = document.querySelector('.company-tabs');
    tabs.setAttribute('aria-label', labels.companies);
    tabs.innerHTML = companies.map((company, index) => `
        <button id="tab-${company.id}" type="button" class="company-tab${index === 0 ? ' active' : ''}"
            data-company="${company.id}" data-path-pos="${range.position(company.start)}"
            style="--bubble-color: ${colors[index % colors.length]}"
            aria-controls="job-${company.id}" aria-haspopup="dialog" aria-expanded="false">
            <span class="tab-name">${esc(company.name)}</span>
            <span class="tab-role">${esc(company.role)}</span>
            <span class="tab-year">${esc(company.start.slice(0, 4))}</span>
        </button>`).join('') || `<p class="cards-loading">${esc(labels.empty)}</p>`;

    const modal = document.getElementById('work-detail-modal');
    modal.setAttribute('aria-label', labels.details);
    modal.querySelector('.work-modal-close').setAttribute('aria-label', labels.close);
    document.getElementById('company-details').innerHTML = companies.map((company, index) => `
        <div id="job-${company.id}" class="job-details" data-job="${company.id}" aria-labelledby="job-${company.id}-title"${index ? ' style="display: none"' : ''}>
            <div class="job-head">
                <div class="job-head-main">
                    <span class="job-eyebrow">${esc(company.meta)}</span>
                    <h3 id="job-${company.id}-title" class="job-title">${esc(company.role)} @ <a href="${safeURL(company.url)}" class="pretty-a">${esc(company.company)}</a></h3>
                </div>
                <div class="job-date${company.end === null ? ' is-current' : ''}">${esc(dateLabel(company, labels, locale))}</div>
            </div>
            <ul class="job-description">${list(company.achievements.length ? company.achievements : [labels.placeholder])}</ul>
            <div class="job-stack">${chips(company.technologies)}</div>
        </div>`).join('');

    const scale = document.querySelector('.path-scale');
    scale.hidden = !range;
    scale.querySelector('.path-scale-track').innerHTML = companies.map(company => `
        <span class="timeline-marker" style="--marker-pos: ${range.position(company.start)}%"
            data-company-label="${esc(company.name)}" tabindex="0" role="img" aria-label="${esc(company.name)}"></span>`).join('') + '<span class="path-scale-needle" aria-hidden="true"></span>';
    const years = range ? [...new Set(Array.from({ length: 4 }, (_, i) => Math.floor((range.start + (range.end - range.start) * i / 3) / 12)))] : [];
    scale.querySelector('.path-scale-labels').innerHTML = years.map(year => `<span>${year}</span>`).join('');
}
