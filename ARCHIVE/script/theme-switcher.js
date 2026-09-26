(() => {
    const selector = document.querySelector('#theme-selector');
    const storageKey = 'maploop-theme';
    const supportedThemes = new Set(['modern', 'chefs']);

    const applyTheme = (theme) => {
        const nextTheme = supportedThemes.has(theme) ? theme : 'modern';
        document.documentElement.dataset.theme = nextTheme === 'chefs' ? 'chefs' : 'modern';
        if (selector) selector.checked = nextTheme === 'chefs';
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            'content', nextTheme === 'chefs' ? '#0c1018' : '#0f0e13'
        );
    };

    let savedTheme = 'modern';
    try {
        savedTheme = localStorage.getItem(storageKey) || savedTheme;
    } catch {
        // Private browsing and blocked storage should not disable the picker.
    }

    applyTheme(savedTheme);

    selector?.addEventListener('change', () => {
        const nextTheme = selector.checked ? 'chefs' : 'modern';
        applyTheme(nextTheme);
        try {
            localStorage.setItem(storageKey, nextTheme);
        } catch {
            // The theme still applies for this page when storage is unavailable.
        }
    });
})();
