function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Animate percentage counter
function animatePercentage() {
    const percentageElement = document.getElementById('percentage');
    const loadingContainer = document.getElementById('loadingContainer');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const mainContent = document.getElementById('mainContent');
    let currentPercentage = 0;
    
    const interval = setInterval(() => {
        currentPercentage += Math.floor(Math.random() * 3) + 1;
        
        if (currentPercentage >= 100) {
            currentPercentage = 100;
            clearInterval(interval);
            
            // Start fade out sequence
            setTimeout(() => {
                // First fade out loading elements
                loadingContainer.classList.add('fade-out');
                
                // Then fade out the entire overlay
                setTimeout(() => {
                    loadingOverlay.style.opacity = '0';
                    
                    // Show main content
                    setTimeout(() => {
                        mainContent.classList.add('show');
                        
                        // Reset for demo purposes after 3 seconds
                        setTimeout(() => {
                            loadingOverlay.style.opacity = '1';
                            loadingContainer.classList.remove('fade-out');
                            mainContent.classList.remove('show');
                            currentPercentage = 0;
                            animatePercentage();
                        }, 3000);
                    }, 200);
                }, 500);
            }, 500);
        }
        
        percentageElement.textContent = currentPercentage + '%';
    }, 50);
}

// Initialize loading screen
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    animatePercentage();
});