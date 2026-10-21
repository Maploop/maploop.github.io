import { escapeHTML as esc, chips, list, countLabel, text, heading } from './shared.js';

export function renderEvents(data) {
    heading('events', data.heading);
    text('events-section-slug', `${data.labels.summary} · ${countLabel(data.items.length, data.labels)}`);
    document.getElementById('events-list').innerHTML = data.items.map(event => `
        <article id="event-${event.id}" class="event-card">
            <div class="event-body" data-entrance="rise">
                <div class="event-head">
                    <div class="event-head-main">
                        <span class="job-eyebrow">${esc(event.organization)}</span>
                        <h3 class="job-title">${esc(event.title)}</h3>
                    </div>
                    <div class="job-date">${esc(event.date)}</div>
                </div>
                <ul class="job-description">${list(event.achievements)}</ul>
                <div class="event-tags">${chips(event.technologies)}</div>
            </div>
            ${event.result ? `<div class="event-result" data-entrance="stamp" style="--entrance-delay: 180ms">
                <span class="result-value">${esc(event.result.value)}</span>
                <span class="result-label">${esc(event.result.label)}</span>
            </div>` : ''}
        </article>`).join('') || `<p class="cards-loading">${esc(data.labels.empty)}</p>`;
}
