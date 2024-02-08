function format_Leaderboard_Entry(entry, rank) {
    actFunc = ""
    switch (entry["settings"]["ActFunc"]) {
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
    p1 = `<p> ${entry["accuracy"].toFixed(3)}% / ${entry["loss"].toFixed(3)}% </p>`
    p2 = `<p> ${entry["settings"]["KSize"]}</p> <p>${entry["settings"]["NBlocks"]}</p> <p>${actFunc}</p> <p> ${entry["Epochs"]}</p>`
    return header + p1 + p2
}

// Function to fetch leaderboard data and update HTML containers
function fetchAndDisplayLeaderboard() {
    fetch('/get_sio_key')
        .then(response => response.json())
        .then(roomKey => {
            console.log('Room Key:', roomKey);
            fetch('/get_Leaderboard')
                .then(response => response.json())
                .then(entries => {
                    console.log('Leaderboard Entries:', entries);
                    // Do something with roomKey and entries
                    const leaderboard = document.getElementById("leaderboard");
                    leaderboard.innerHTML = "";
                    entries.forEach((entry, index) => {
                        // Assuming 'format_Leaderboard_Entry' is a function to format each entry, adjust accordingly
                        const formattedEntry = format_Leaderboard_Entry(entry, index+1);
                        
                        // Create a new <p> element for each entry
                        const newEntryElement = document.createElement('p');
                        newEntryElement.className = "leaderboard-entry";
                        if (entry["creator"]==roomKey){
                            newEntryElement.classList.add("own-leaderboard-entry");
                        }
                        newEntryElement.innerHTML = formattedEntry;
                        
                        // Append the new <p> element to the leaderboard container
                        leaderboard.appendChild(newEntryElement);
                    });
                })
                .catch(error => console.error('Error fetching leaderboard:', error));
        })
        .catch(error => console.error('Error fetching room key:', error));
}

// Call the function to fetch and display the leaderboard data when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayLeaderboard);
document.addEventListener('DOMContentLoaded', fetchAndDisplayOwnModel);

socket.on("chart_data", () => { fetchAndDisplayOwnModel() })
function fetchAndDisplayOwnModel() {
    fetch('/get_model_for_Leaderboard', {
        method: 'GET', // Specifying the method
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json()) // Parsing the JSON response
        .then(data => {
            var yourModel = document.getElementsByClassName("current-entry")[0]
            yourModel.innerHTML = format_Leaderboard_Entry(data, "Your Model")
            setTimeout(fetchAndDisplayLeaderboard, 500)
        })
}