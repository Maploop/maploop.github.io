let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const navButtons = document.querySelectorAll('.banner-nav-button');

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

document.addEventListener('mousemove', function(e) {
const trail = document.createElement('div');
trail.className = 'cursor-trail';

const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
const scrollY = window.pageYOffset || document.documentElement.scrollTop;

// Position accurately with scroll offsets
trail.style.cssText = `
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--signature-purple);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.7;
    top: ${e.clientY + scrollY}px;
    left: ${e.clientX + scrollX}px;
`;

document.body.appendChild(trail);

setTimeout(() => {
    trail.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    trail.style.opacity = '0';
    trail.style.transform = 'scale(0.5)';
    
    setTimeout(() => {
        if (trail.parentNode) {
            document.body.removeChild(trail);
        }
    }, 500);
}, 10);
});



document.addEventListener('DOMContentLoaded', () => {
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