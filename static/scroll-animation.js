document.addEventListener('DOMContentLoaded', function() {
    var gifElement = document.querySelector('.gif-container img'); // Select the GIF
    var cnnSection = document.querySelector('.cnn-explanation');
    var gifSection = document.querySelector('.gif-explanation');
    var gifContainer = document.querySelector('.gif-container');

    window.addEventListener('scroll', function() {
        var containerRect = gifContainer.getBoundingClientRect();
        var cnnRect = cnnSection.getBoundingClientRect();
        var gifRect = gifSection.getBoundingClientRect();

        var newPosition;

        if (window.scrollY + window.innerHeight > gifRect.top + window.scrollY) {
            newPosition = gifRect.top - containerRect.top;
        } else {
            newPosition = cnnRect.top - containerRect.top;
        }
        gifElement.style.top = newPosition + 'px';
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const indicatorContainer = document.getElementById('section-indicators');
    
    // Create an indicator for each section
    sections.forEach((section, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('section-indicator');
        indicator.dataset.sectionIndex = index;

        // Create and append the section name element
        const sectionName = document.createElement('span');
        sectionName.classList.add('section-name');
        sectionName.textContent = section.id || `Section ${index + 1}`; // Use section ID or a default name
        indicator.appendChild(sectionName);

        // Add click event to scroll to the section
        indicator.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });

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

        // Update indicators
        document.querySelectorAll('.section-indicator').forEach((indicator, index) => {
            if (index === currentSectionIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    });
});
