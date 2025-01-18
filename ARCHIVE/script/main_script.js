let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const navButtons = document.querySelectorAll('.banner-nav-button');

refreshSlides();

function showSlide(n) {
    slides[currentSlide].classList.remove('active');
    navButtons[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    navButtons[currentSlide].classList.add('active');
    refreshSlides();
}

function goToSlide(n) {
    showSlide(n);
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
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollPastBanner() {
    const bannerHeight = document.querySelector('.banner-container').offsetHeight;
    window.scrollTo({
        top: bannerHeight,
        behavior: 'smooth'
    });
}