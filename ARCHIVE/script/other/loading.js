(() => {
    'use strict';

    const overlay = document.getElementById('page-loader');
    const content = document.getElementById('site-content');
    const progress = overlay.querySelector('.loader-hex-progress');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const contentReady = new Promise(resolve => {
        const settle = () => {
            document.removeEventListener('content:loaded', settle);
            document.removeEventListener('content:error', settle);
            resolve();
        };
        document.addEventListener('content:loaded', settle);
        // Reveal the existing error message if loading fails instead of trapping visitors.
        document.addEventListener('content:error', settle);
    });

    const minimumDuration = new Promise(resolve => {
        // Start at the first painted frame, so time spent downloading scripts
        // never shortens the visible one-second loading screen.
        requestAnimationFrame(() => {
            if (reducedMotion) {
                progress.style.strokeDashoffset = '0';
            } else {
                progress.animate(
                    [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }],
                    { duration: 1000, easing: 'linear', fill: 'forwards' }
                );
            }
            setTimeout(resolve, 1000);
        });
    });

    Promise.all([minimumDuration, contentReady]).then(async () => {
        // A slow locale leaves the completed hexagon in place until it is ready.
        await overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: reducedMotion ? 0 : 280,
            easing: 'ease-out',
            fill: 'forwards'
        }).finished;
        overlay.remove();
        content.inert = false;
        content.removeAttribute('aria-hidden');
        content.removeAttribute('aria-busy');
        document.documentElement.classList.remove('is-loading');
    });
})();
