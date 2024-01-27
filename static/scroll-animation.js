// NavScrolling


document.addEventListener('DOMContentLoaded', function () {
    var gifElement = document.querySelector('.gif-container img');
    var cnnSection = document.querySelector('.cnn-explanation');
    var gifSection = document.querySelector('.gif-explanation');
    var gifContainer = document.querySelector('.gif-container');

    window.addEventListener('scroll', function () {
        var containerRect = gifContainer.getBoundingClientRect();
        var cnnRect = cnnSection.getBoundingClientRect();
        var gifRect = gifSection.getBoundingClientRect();

        var newPosition;

        if (window.scrollY + window.innerHeight > gifRect.top + window.scrollY) {
            newPosition = gifRect.top - containerRect.top;
            gifElement.style.marginTop = "30vh"
        } else {
            newPosition = cnnRect.top - containerRect.top;
            gifElement.style.marginTop = "60vh"

        }
        gifElement.style.top = newPosition + 'px';
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const indicatorContainer = document.getElementById('section-indicators');

    sections.forEach((section, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('section-indicator');
        indicator.dataset.sectionIndex = index;

        const sectionName = document.createElement('span');
        sectionName.classList.add('section-name');
        sectionName.textContent = section.id || `Section ${index + 1}`;
        indicator.appendChild(sectionName);

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

        document.querySelectorAll('.section-indicator').forEach((indicator, index) => {
            if (index === currentSectionIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    });
});


