document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const indicatorContainer = document.getElementById('section-indicators');
    
    sections.forEach((section, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('section-indicator');
        indicator.dataset.sectionIndex = index;
        indicatorContainer.appendChild(indicator);
    });

    window.addEventListener('scroll', () => {
        let currentSectionIndex = -1;
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionIndex = index;
            }
        });

        document.querySelectorAll('.section-indicator').forEach((indicator, index) => {
            if (index === currentSectionIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    });
});
