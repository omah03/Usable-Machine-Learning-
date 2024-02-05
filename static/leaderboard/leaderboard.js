function format_Leaderboard_Entry(entry, rank){
    actFunc = ""
    switch (entry["settings"]["ActFunc"]){
        case "act_reluOption":
            actFunc = "ReLU"
            break;
        case "act_sigmoidOption":
            actFunc = "Sigmoid"
            break;
        case "act_tanhOption":
            actFunc = "tanh"
            break;
    }
    header = `<h2>${rank}</h2>`
    p1 = `<p> Accuracy: ${entry["accuracy"].toFixed(3)}% <br> Loss: ${entry["loss"].toFixed(3)}% </p>`
    p2 = `<p> Kernel:${entry["settings"]["KSize"]}; Blocks:${entry["settings"]["NBlocks"]};<br> AF: ${actFunc}; Trained: ${entry["Epochs"]} Epochs; </p>`
    return header + p1 + p2
}

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
                leaderboardEntries[index].innerHTML = format_Leaderboard_Entry(entry, index+1);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching leaderboard:', error);
    });
}

// Call the function to fetch and display the leaderboard data when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayLeaderboard);
document.addEventListener('DOMContentLoaded', fetchAndDisplayOwnModel);

socket.on("chart_data", ()=>{fetchAndDisplayOwnModel()})
function fetchAndDisplayOwnModel(){
    fetch('/get_model_for_Leaderboard', {
        method: 'GET', // Specifying the method
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json()) // Parsing the JSON response
    .then(data => {
        var yourModel = document.getElementsByClassName("current-entry")[0]
        yourModel.innerHTML= format_Leaderboard_Entry(data, "Your Model")
        setTimeout(fetchAndDisplayLeaderboard, 500)
    })
}