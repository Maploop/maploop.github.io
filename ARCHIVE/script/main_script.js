let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const navButtons = document.querySelectorAll('.banner-nav-button');

const icons = {
    external: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    npm: '<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    video: '<svg viewBox="0 0 24 24"><polygon points="23 12 8 22 8 2 23 12"/></svg>',
    docker: '<svg viewBox="0 0 24 24"><path d="M13.5 11h-2v2h2v-2zm0-3h-2v2h2V8zm3 0h-2v2h2V8zm0 3h-2v2h2v-2zm0 3h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm0-3h-2v2h2v-2z"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
};

// refreshSlides();

function showSlide(n) {
currentSlide = n;
refreshSlides();
}

function goToSlide(n) {
showSlide(n);

// scrollPastBanner();
}

function goto(link) {
window.location.href = link;
}

function refreshSlides() {
    for (var i = 0; i < 3; i++) {
        var element = document.getElementById('slide-' + i);
        if (i == currentSlide) {
            element.style.display = 'block';
            continue;
        }
        element.style.display = 'none';
        element.classList.remove('active');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                const title = entry.target.querySelector('.section-title');
                if (title) title.classList.add('active');
                
                const items = entry.target.querySelectorAll('.scroll-item');
                items.forEach((item, index) => {
                    item.style.setProperty('--item-index', index);
                    setTimeout(() => {
                        item.classList.add('active');
                    }, 100 * index);
                });
            }
        });
}, { threshold: 0.2 });

document.querySelectorAll('.scroll-reveal').forEach(element => {
    observer.observe(element);
});

const backToTopBtn = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});
});

function scrollToTop() {
window.scrollTo({
    top: 0,
    behavior: 'smooth'
});
}

document.addEventListener('DOMContentLoaded', () => {
    loadProjectCards();
    loadWorkplaces();
    const navbar = document.querySelector('.navbar');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Set item index for staggered animation
    navItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });
    
    // Toggle mobile menu
    hamburgerMenu?.addEventListener('click', () => {
        navbar.classList.toggle('menu-open');
        document.body.style.overflow = navbar.classList.contains('menu-open') ? 'hidden' : '';
    });
    
    // Smooth scroll and highlight active section
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close menu if open on mobile
            navbar.classList.remove('menu-open');
            document.body.style.overflow = '';
            
            // Get target section and scroll to it
            const targetId = item.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - navbar.offsetHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll behavior
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow and darker background when scrolled
        if (scrollTop > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide navbar when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop && scrollTop > navbar.offsetHeight) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
        
        // Highlight active section in navbar
        const sections = document.querySelectorAll('.scroll-reveal');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbar.offsetHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === current) {
                item.classList.add('active');
            }
        });
    });
});

function loadWorkplaces() {
    const tabs = document.querySelectorAll('.company-tab');
    const jobDetails = document.querySelectorAll('.job-details');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all job details
            jobDetails.forEach(detail => detail.style.display = 'none');
            
            // Show corresponding job details
            const company = tab.dataset.company;
            const targetJob = document.querySelector(`[data-job="${company}"]`);
            if (targetJob) {
                targetJob.style.display = 'block';
            }
        });
    });
}

function createCardLinks(links) {
    const linkElements = [];
    
    Object.keys(links).forEach(linkType => {
        if (icons[linkType] && links[linkType]) {
            linkElements.push(`
                <a href="${links[linkType]}" class="card-link" target="_blank" rel="noopener noreferrer">
                    ${icons[linkType]}
                </a>
            `);
        }
    });
    
    return linkElements.join('');
}

async function loadProjectCards() {
    const grid = document.getElementById('projects-grid');
    
    try {
        setTimeout(async () => {
            const response = await fetch("/projects/projects_data.json");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(data);
            const projects = data.projects;
            
            if (!projects || projects.length === 0) {
                grid.innerHTML = '<div class="cards-error">No projects found.</div>';
                return;
            }

            const cardProjects = projects.slice(0, 6);

            grid.innerHTML = cardProjects.map(project => `
                <div class="project-card">
                    <div class="card-header">
                        <div class="card-folder">
                            ${icons.folder}
                        </div>
                        <div class="card-links">
                            ${createCardLinks(project.links)}
                        </div>
                    </div>
                    
                    <h3 class="card-title">${project.title}</h3>
                    
                    <p class="card-description">
                        ${project.description || 'No description available.'}
                    </p>
                    
                    <div class="card-tech">
                        ${project.technologies.map(tech => `<span class="card-tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        }, 700);
        
    } catch (error) {
        grid.innerHTML = '<div class="cards-error">Error loading projects. Please try again later.</div>';
        console.error('Error loading project cards:', error);
    }
}