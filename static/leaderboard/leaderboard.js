// Function to fetch leaderboard data and update HTML containers
function fetchAndDisplayLeaderboard() {
    // Replace '/get_Leaderboard' with the actual path to your Flask route if it's different
    fetch('/get_Leaderboard', {
        method: 'GET', // Specifying the method
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json()) // Parsing the JSON response
    .then(data => {
        // Getting all HTML containers with the class 'leaderboard-entry'
        const leaderboardEntries = document.querySelectorAll('.leaderboard-entry');
        
        // Looping through each container to update its content
        data.forEach((entry, index) => {
            if (index < leaderboardEntries.length) {
                // Assuming 'entry' has properties you want to display, adjust accordingly
                leaderboardEntries[index].innerHTML = `<h2>${index+1}.</h2> Config:${entry["settings"]["KSize"]};${entry["settings"]["NBlocks"]}${entry["settings"]["ActFunc"]} - Trained: ${entry["Epochs"]} Epochs - Accuracy: ${entry["accuracy"]}%`;
            }
        });
    })
    .catch(error => {
        console.error('Error fetching leaderboard:', error);
    });
}

// Call the function to fetch and display the leaderboard data when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayLeaderboard);
