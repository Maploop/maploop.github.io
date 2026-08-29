(function () {
    'use strict';

    var API = 'https://api.github.com/repos/';
    var CACHE_KEY = 'maploop.repo-stats.v1';
    var TTL_OK = 6 * 60 * 60 * 1000;
    var TTL_FAIL = 30 * 60 * 1000;

    var TECH_COLORS = {
        'java': '#e08a5a',
        'kotlin': '#a97bff',
        'c++': '#8f9dff',
        'c': '#7b91d6',
        'csharp': '#a877e0',
        'javascript': '#e0c25c',
        'typescript': '#5aa4ee',
        'python': '#5cb0dd',
        'redis': '#e0685c',
        'mongodb': '#5cc48a',
        'spring': '#78c258',
        'minecraft': '#71bd75',
        'spigot': '#d6a04c',
        'paper': '#c6cbdd',
        'nms': '#c98f6c',
        'minestom': '#b79cff',
        'velocity': '#5ec2d8',
        'vulkan': '#d1554b',
        'opengl': '#8f6ad8',
        'glsl': '#a86ad8',
        'physx': '#84c04c',
        'express': '#9aa4b8',
        'prisma': '#6f8cff',
        'jquery': '#4f83c4',
        'node': '#6cc24a',
        'npm': '#e05a5a',
        'docker': '#5292e0',
        'cloudflare': '#e8913c',
        'git': '#e06a42',
        'gradle': '#5fb5c9',
        'sqlite': '#5aa9d6',
        'tailwind': '#4ec0c0',
        'react': '#61dafb',
        'javacord': '#6d8cf0',
        '2fa': '#e0c25c',
        'html': '#e07a4a',
        'css': '#5a8fe0',
        'shell': '#8fbf5a',
        'lua': '#5a7fe0',
        'rust': '#d18a5a',
        'go': '#5ac1d6'
    };

    var TECH_ALIASES = {
        'paper software': 'paper',
        'papermc': 'paper',
        'express.js': 'express',
        'expressjs': 'express',
        'node.js': 'node',
        'nodejs': 'node',
        'mongo': 'mongodb',
        'google 2fa': '2fa',
        'tailwind css': 'tailwind',
        'tailwindcss': 'tailwind',
        'c#': 'csharp',
        'objective-c': 'c',
        'shellscript': 'shell'
    };

    var ICONS = {
        star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/></svg>',
        fork: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="5" r="2.2"/><circle cx="18" cy="5" r="2.2"/><circle cx="12" cy="19" r="2.2"/><path d="M6 7.2v2.3a2.5 2.5 0 0 0 2.5 2.5h7A2.5 2.5 0 0 0 18 9.5V7.2M12 12v4.8"/></svg>',
        issue: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5M12 16h.01"/></svg>',
        clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/></svg>'
    };

    var inflight = {};

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function techKey(name) {
        var key = String(name || '').toLowerCase().trim();
        key = key.replace(/\s+\d+(\.\d+)*$/, '');
        return TECH_ALIASES[key] || key;
    }

    function techColor(name) {
        var key = techKey(name);
        if (TECH_COLORS[key]) return TECH_COLORS[key];

        var hash = 0;
        for (var i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) % 997;
        }
        return 'hsl(' + (224 + (hash % 76)) + ' 58% 68%)';
    }

    function techChip(name) {
        return '<span class="tech-chip" style="--chip: ' + techColor(name) + '">'
            + '<i class="chip-dot"></i>' + esc(name) + '</span>';
    }

    function techChips(list, limit) {
        var items = (list || []).filter(Boolean);
        var shown = limit ? items.slice(0, limit) : items;
        var html = shown.map(techChip).join('');

        if (limit && items.length > shown.length) {
            html += '<span class="tech-chip" style="--chip: var(--faint)">+'
                + (items.length - shown.length) + '</span>';
        }
        return html;
    }

    function compact(value) {
        var n = Number(value) || 0;
        if (n < 1000) return String(n);

        var units = [['m', 1e6], ['k', 1e3]];
        for (var i = 0; i < units.length; i++) {
            if (n >= units[i][1]) {
                var scaled = n / units[i][1];
                return (scaled >= 10 ? Math.round(scaled) : scaled.toFixed(1).replace(/\.0$/, ''))
                    + units[i][0];
            }
        }
        return String(n);
    }

    function monthYear(iso) {
        var date = new Date(iso);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    function parseRepo(url) {
        var value = String(url || '').trim();
        if (!value || value === '#') return null;

        var match = /^(?:https?:)?\/\//i.test(value) || /github\.com/i.test(value)
            ? /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[/?#].*)?$/i.exec(value)
            : /^([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?$/.exec(value);

        if (!match) return null;

        var owner = match[1];
        var repo = match[2];
        if (!owner || !repo || repo === '.' || repo === '..') return null;

        return owner + '/' + repo;
    }

    function readCache() {
        try {
            return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
        } catch (err) {
            return {};
        }
    }

    function writeCache(slug, data, ttl) {
        try {
            var store = readCache();
            store[slug] = { expires: Date.now() + ttl, data: data };
            localStorage.setItem(CACHE_KEY, JSON.stringify(store));
        } catch (err) {

        }
    }

    function fetchStats(slug) {
        if (!slug) return Promise.resolve(null);

        var cached = readCache()[slug];
        if (cached && cached.expires > Date.now()) {
            return Promise.resolve(cached.data);
        }

        if (inflight[slug]) return inflight[slug];

        inflight[slug] = fetch(API + slug, {
            headers: { Accept: 'application/vnd.github+json' }
        }).then(function (response) {
            if (!response.ok) throw new Error('github responded ' + response.status);
            return response.json();
        }).then(function (json) {
            var data = {
                slug: slug,
                stars: json.stargazers_count || 0,
                forks: json.forks_count || 0,
                issues: json.open_issues_count || 0,
                language: json.language || '',
                updated: json.pushed_at || json.updated_at || ''
            };
            writeCache(slug, data, TTL_OK);
            return data;
        }).catch(function (err) {
            console.warn('repo-stats: ' + slug + ' — ' + err.message);
            writeCache(slug, null, TTL_FAIL);
            return null;
        });

        return inflight[slug];
    }

    function statsMarkup(data, options) {
        var opts = options || {};
        var parts = [];

        parts.push('<span class="repo-stat is-stars" title="Stars">'
            + ICONS.star + compact(data.stars) + '</span>');
        parts.push('<span class="repo-stat" title="Forks">'
            + ICONS.fork + compact(data.forks) + '</span>');

        if (data.issues && !opts.compact) {
            parts.push('<span class="repo-stat" title="Open issues">'
                + ICONS.issue + compact(data.issues) + '</span>');
        }

        if (data.language) {
            parts.push('<span class="repo-stat is-lang" style="--chip: ' + techColor(data.language) + '">'
                + '<i class="chip-dot"></i>' + esc(data.language) + '</span>');
        }

        var updated = monthYear(data.updated);
        if (updated && !opts.compact) {
            parts.push('<span class="repo-stat is-quiet" title="Last push">'
                + ICONS.clock + updated + '</span>');
        }

        if (opts.slug) {
            parts.push('<span class="repo-stat is-quiet is-slug">' + esc(data.slug) + '</span>');
        }

        return '<div class="repo-stats">' + parts.join('') + '</div>';
    }

    function skeletonMarkup() {
        return '<div class="repo-skeleton"><span></span><span></span><span></span></div>';
    }

    function fallbackMarkup(el) {
        var mode = el.getAttribute('data-stat-fallback') || 'hide';
        if (mode !== 'stack') return '';

        var tech = (el.getAttribute('data-stat-tech') || '')
            .split(',')
            .map(function (item) { return item.trim(); })
            .filter(Boolean);

        if (!tech.length) return '';

        el.classList.add('is-stack');
        return '<span class="stack-label">Built with</span>'
            + '<div class="tech-chips">' + techChips(tech) + '</div>';
    }

    function render(el) {
        if (el.dataset.statMounted === 'true') return;
        el.dataset.statMounted = 'true';

        var slug = parseRepo(el.getAttribute('data-repo-stats'));

        if (!slug) {
            el.innerHTML = fallbackMarkup(el);
            return;
        }

        el.innerHTML = skeletonMarkup();

        fetchStats(slug).then(function (data) {
            if (!data) {
                el.innerHTML = fallbackMarkup(el);
                return;
            }
            el.classList.add('is-stats');
            el.innerHTML = statsMarkup(data, {
                slug: el.getAttribute('data-stat-slug') === 'true',
                compact: el.getAttribute('data-stat-compact') === 'true'
            });
        });
    }

    function mount(root) {
        var scope = root || document;
        var nodes = scope.querySelectorAll('[data-repo-stats]');
        Array.prototype.forEach.call(nodes, render);
    }

    function colorizeTech(root) {
        var scope = root || document;
        var nodes = scope.querySelectorAll('.tech-item:not(.tech-chip)');

        Array.prototype.forEach.call(nodes, function (el) {
            var name = (el.textContent || '').trim();
            if (!name) return;
            el.classList.add('tech-chip');
            el.style.setProperty('--chip', techColor(name));
            el.innerHTML = '<i class="chip-dot"></i>' + esc(name);
        });
    }

    window.RepoStats = {
        mount: mount,
        colorizeTech: colorizeTech,
        parseRepo: parseRepo,
        fetchStats: fetchStats,
        techChip: techChip,
        techChips: techChips,
        techColor: techColor,
        compact: compact
    };

    document.addEventListener('DOMContentLoaded', function () {
        mount();
        colorizeTech();
    });

    document.addEventListener('content:loaded', function () {
        mount();
        colorizeTech();
    });
})();
