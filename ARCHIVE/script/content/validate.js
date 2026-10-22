// Validate the whole locale before changing the DOM, so errors identify the file/field.
function check(condition, path, expected) {
    if (!condition) throw new Error(`${path}: expected ${expected}`);
}
function string(value, path) {
    check(typeof value === 'string', path, 'a string');
}
function object(value, path) {
    check(value && typeof value === 'object' && !Array.isArray(value), path, 'an object');
}
function strings(value, path) {
    check(Array.isArray(value), path, 'an array of strings');
    value.forEach((item, i) => string(item, `${path}[${i}]`));
}
function fields(value, names, path) {
    object(value, path);
    names.forEach(name => string(value[name], `${path}.${name}`));
}
function url(value, path) {
    string(value, path);
    let parsed;
    try { parsed = new URL(value, 'https://maploop.github.io'); } catch { /* handled below */ }
    check(value.length > 0 && parsed && ['http:', 'https:', 'mailto:'].includes(parsed.protocol), path, 'an HTTP(S), mailto, or relative URL');
}
function entries(value, path, validate) {
    check(Array.isArray(value), path, 'an array');
    const ids = new Set();
    value.forEach((item, i) => {
        const key = `${path}[${i}]`;
        object(item, key);
        check(typeof item.id === 'string' && /^[a-z][a-z0-9-]*$/.test(item.id), `${key}.id`, 'a lowercase slug');
        check(!ids.has(item.id), `${key}.id`, 'a unique ID');
        ids.add(item.id);
        validate(item, key);
    });
}
function month(value, path) {
    check(typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value), path, 'YYYY-MM');
}

export function validateContent(data) {
    object(data, 'content');
    object(data.page, 'page');
    for (const type of ['text', 'html']) {
        object(data.page[type], `page.${type}`);
        Object.entries(data.page[type]).forEach(([id, value]) => string(value, `page.${type}.${id}`));
    }
    object(data.page.attributes, 'page.attributes');
    Object.entries(data.page.attributes).forEach(([id, attributes]) => {
        object(attributes, `page.attributes.${id}`);
        Object.entries(attributes).forEach(([name, value]) => {
            check(['placeholder', 'title', 'aria-label', 'alt'].includes(name), `page.attributes.${id}.${name}`, 'a text attribute');
            string(value, `page.attributes.${id}.${name}`);
        });
    });
    for (const section of ['experience', 'projects', 'events']) {
        object(data[section], section);
        fields(data[section].heading, ['number', 'label', 'title'], `${section}.heading`);
        fields(data[section].labels, ['entry', 'entries', 'empty'], `${section}.labels`);
    }
    fields(data.experience.labels, ['companies', 'since', 'timeline', 'present', 'now', 'placeholder', 'details', 'close'], 'experience.labels');
    entries(data.experience.companies, 'experience.companies', (item, path) => {
        fields(item, ['name', 'company', 'role', 'meta'], path);
        url(item.url, `${path}.url`);
        month(item.start, `${path}.start`);
        if (item.end !== null) {
            month(item.end, `${path}.end`);
            check(item.end >= item.start, `${path}.end`, 'a month on or after start');
        }
        if (item.date !== undefined) string(item.date, `${path}.date`);
        strings(item.achievements, `${path}.achievements`);
        strings(item.technologies, `${path}.technologies`);
    });
    fields(data.projects.labels, ['summary', 'featured'], 'projects.labels');
    entries(data.projects.items, 'projects.items', (item, path) => {
        fields(item, ['label', 'title', 'description', 'language'], path);
        fields(item.image, ['src', 'alt'], `${path}.image`);
        if (item.image.caption !== undefined) string(item.image.caption, `${path}.image.caption`);
        if (item.facts !== undefined) {
            check(Array.isArray(item.facts), `${path}.facts`, 'an array');
            item.facts.forEach((fact, i) => fields(fact, ['label', 'value'], `${path}.facts[${i}]`));
        }
        url(item.image.src, `${path}.image.src`);
        if (item.repo !== undefined) string(item.repo, `${path}.repo`);
        if (item.accent !== undefined) check(/^#[0-9a-f]{6}$/i.test(item.accent), `${path}.accent`, 'a six-digit hex color');
        strings(item.technologies, `${path}.technologies`);
        check(Array.isArray(item.links), `${path}.links`, 'an array');
        item.links.forEach((link, i) => {
            fields(link, ['label'], `${path}.links[${i}]`);
            url(link.url, `${path}.links[${i}].url`);
            if (link.icon !== undefined) check(['github', 'external'].includes(link.icon), `${path}.links[${i}].icon`, 'github or external');
        });
    });
    fields(data.events.labels, ['summary'], 'events.labels');
    entries(data.events.items, 'events.items', (item, path) => {
        fields(item, ['organization', 'title', 'date'], path);
        strings(item.achievements, `${path}.achievements`);
        strings(item.technologies, `${path}.technologies`);
        if (item.result) fields(item.result, ['value', 'label'], `${path}.result`);
    });
    return data;
}
