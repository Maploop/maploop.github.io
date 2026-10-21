// Data fields are text by default. Only page.html accepts repository-owned markup.
export function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

export function safeURL(value) {
    const url = new URL(value, 'https://maploop.github.io');
    if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) {
        throw new Error(`Unsupported URL: ${value}`);
    }
    return escapeHTML(value);
}

export const number = value => String(value).padStart(2, '0');
export const chips = values => values.map(value => `<span class="tech-item">${escapeHTML(value)}</span>`).join('');
export const list = values => values.map(value => `<li>${escapeHTML(value)}</li>`).join('');
export const countLabel = (count, labels) => `${number(count)} ${count === 1 ? labels.entry : labels.entries}`;

export function text(id, value) {
    const target = document.getElementById(id);
    if (target) target.textContent = value;
}

export function heading(section, data) {
    text(`${section}-section-label`, data.label);
    document.getElementById(`${section}-section-title`).innerHTML =
        `<span class="section-num">${escapeHTML(data.number)}.</span> ${escapeHTML(data.title)}`;
}
