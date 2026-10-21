import { validateContent } from './content/validate.js';
import { renderExperience } from './content/experience.js';
import { renderProjects } from './content/projects.js';
import { renderEvents } from './content/events.js';
import { text } from './content/shared.js';

const manifestURL = new URL('../langs/manifest.json', import.meta.url);
const modules = ['page', 'experience', 'projects', 'events'];

async function readJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    try {
        return await response.json();
    } catch (error) {
        throw new Error(`${url}: invalid JSON (${error.message})`);
    }
}

async function loadLocale(manifest, locale) {
    const config = manifest.locales[locale];
    if (!config?.modules || !['ltr', 'rtl'].includes(config.dir)) {
        throw new Error(`Invalid locale configuration: ${locale}`);
    }
    const parts = await Promise.all(modules.map(async name => {
        if (typeof config.modules[name] !== 'string') throw new Error(`${locale}: missing ${name} module`);
        return [name, await readJSON(new URL(config.modules[name], manifestURL))];
    }));
    return validateContent(Object.fromEntries(parts));
}

function render(data, locale, config) {
    Object.entries(data.page.text).forEach(([id, value]) => text(id, value));
    Object.entries(data.page.html).forEach(([id, value]) => {
        const target = document.getElementById(id);
        if (target) target.innerHTML = value;
    });
    Object.entries(data.page.attributes).forEach(([id, attributes]) => {
        const target = document.getElementById(id);
        if (target) Object.entries(attributes).forEach(([name, value]) => target.setAttribute(name, value));
    });
    renderExperience(data.experience, locale);
    renderProjects(data.projects);
    renderEvents(data.events);
    document.documentElement.lang = locale;
    document.documentElement.dir = config.dir;
    document.dispatchEvent(new CustomEvent('content:loaded', { detail: { locale } }));
}

async function start() {
    const status = document.getElementById('content-status');
    try {
        const manifest = await readJSON(manifestURL);
        if (!manifest.locales || !Object.hasOwn(manifest.locales, manifest.default)) {
            throw new Error('Language manifest must declare an existing default locale');
        }
        const requested = new URLSearchParams(location.search).get('lang') || document.documentElement.lang;
        let locale = Object.hasOwn(manifest.locales, requested) ? requested : manifest.default;
        let data;
        try {
            data = await loadLocale(manifest, locale);
        } catch (error) {
            if (locale === manifest.default) throw error;
            console.warn(`content-loader: ${locale} failed; using ${manifest.default}`, error);
            locale = manifest.default;
            data = await loadLocale(manifest, locale);
        }
        render(data, locale, manifest.locales[locale]);
        status.hidden = true;
    } catch (error) {
        console.error('content-loader:', error);
        status.textContent = 'Content could not be loaded. Please reload the page to try again.';
        status.setAttribute('role', 'alert');
        document.dispatchEvent(new CustomEvent('content:error', { detail: { message: error.message } }));
    }
}

// Modules are deferred; all the existing behavior listeners are registered by now.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
