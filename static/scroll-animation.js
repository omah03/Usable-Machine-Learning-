document.addEventListener('DOMContentLoaded', function() {
    var gifElement = document.querySelector('.gif-container img'); // Select the GIF
    var cnnSection = document.querySelector('.cnn-explanation');
    var gifSection = document.querySelector('.gif-explanation');
    var gifContainer = document.querySelector('.gif-container');

    window.addEventListener('scroll', function() {
        var containerRect = gifContainer.getBoundingClientRect();
        var cnnRect = cnnSection.getBoundingClientRect();
        var gifRect = gifSection.getBoundingClientRect();

        // Calculate the position to move the GIF
        var newPosition;

        if (window.scrollY + window.innerHeight > gifRect.top + window.scrollY) {
            // When the gif-explanation section starts entering the viewport
            newPosition = gifRect.top - containerRect.top;
        } else {
            // Default position (top of the cnn-explanation section)
            newPosition = cnnRect.top - containerRect.top;
        }

        // Set the new position of the GIF
        gifElement.style.top = newPosition + 'px';
    });
});
