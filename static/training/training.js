// const socket = io('http://127.0.0.1:5000');
//-----------------------------------------------------------------
//CHART
Chart.defaults.font.size = 20; // Sets the global font size
Chart.defaults.color = '#000000'

var epochs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var losses = [];
var accuracies = [];

// Get the canvas element
const ctxs = document.getElementById('myChart').getContext('2d');

// Create the chart
const myChart = new Chart(ctxs, {
    type: 'line',
    data: {
        labels: epochs,
        datasets: [
            {
                label: 'Accuracy',
                borderColor: 'rgb(54, 162, 235)',
                data: accuracies,
                borderWidth: 5,
            },
            {
                label: 'Loss',
                borderColor: 'rgb(255, 99, 132)',
                data: losses,
                borderWidth: 5,
            },
            {
                label: 'Parameters changed',
                color: 'rgba(0,0,0,1)',
                borderColor: 'rgb(0, 0, 0)',
                data: [],
                borderWidth: 5,
            },
            {
                label: "",
                color: 'rgba(0,0,0,0)',
                borderColor: 'rgba(0, 0, 0,0)',
                backgroundColor: 'rgba(0,0,0,0)',
                data: [1,100],
                borderWidth: 5,
            },
        ],
    },
    options: {
        scales: {
            x: {
                type: 'category',
                position: 'bottom',
                labels: epochs,
            },
            y: {
                min: 0,
                max: 100,
                drawborder: true,
                ticks: {
                    // Callback to format tick labels as percentages
                    callback: function (value) {
                        return value + '%';
                    },
                }
            },
        },
        font: {
            size: 20,
        },
        plugins: {
            annotation: {
                annotations: {
                },
            },
        },
    },
});

rectangle = document.getElementById("rectanglelayer")
inputbox = document.getElementById("inputbox")
outputbox = document.getElementById("outputbox")


//------------------------------------------------------------------
//CONTROLS

const buttonList = ["start", "reset"];

//TRAINING CONTROLS
startbutton = document.getElementById("starttraining");
startbutton.addEventListener("click", handleStartButton);
progressbar = document.getElementById("progressbar");
progress = document.getElementById("progress");

modelPopup = document.getElementById("modelPopup");
discardButton = document.getElementById("discardButton");
returnButton = document.getElementById("returnButton");

discardButton.addEventListener("click", resetTraining)
returnButton.addEventListener("click", () => {
    window.scrollBy(0,100);
})

resetbutton = document.getElementById("resettraining");
resetbutton.addEventListener("click", resetTraining);

async function handleStartButton() {
    resetbutton.disabled=true
    modelPopup.style.display= "flex";

    fetch('/button_press', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": "starttraining"
        })
    })
        .then(response => { return response.json() });

}

trainingdisplay = document.getElementById("trainingdisplay")

fetch("/get_config")
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Request failed.');
        }
    })
    .then(data => {
        handleTrainingData(data);
    })
    .catch(error => {
        console.error(error);
    });

socket.on("chart_data", (data) => handleChartUpdate(data))
function handleChartUpdate(data) {
    myChart.data.labels = data["epochs"];
    myChart.data.datasets[0].data = data["accs"];
    myChart.data.datasets[1].data = data["losses"];
    for (const i of data["changes"]) {
        idx = 0 + i
        myChart.options.plugins.annotation.annotations[idx] = {
            type: 'line',
            xMin: idx,
            xMax: idx, // Same as xMin for a vertical line
            borderColor: 'black',
            borderWidth: 4,
        }
    }
    myChart.update();
}

socket.on("batch_data", (data) => handleBatchData(data))
function handleBatchData(data) {
    progress.style.display = "flex"
    console.log(data)
    console.log(data["batch"] / data["N_batch"]) * 100
    progress.style.width = "" + (data["batch"] / data["N_batch"] * 100) + "%";
}

socket.on("training_data", (data) => handleTrainingData(data))
function handleTrainingData(training_config) {
    if (training_config["training_active"] == true && training_config["training_stop_signal"] == true) {
        progress.style.width = "" + training_config["EpochProgress"] + "%"
        startbutton.innerHTML = "CONTINUE"
        trainingdisplay.innerHTML = `Waiting for Epoch ${training_config["Epochs_Trained"]} to finish...`
    }
    else if (training_config["training_active"] == true && training_config["training_stop_signal"] == false) {
        progress.style.width = "" + training_config["EpochProgress"] + "%"
        startbutton.innerHTML = "PAUSE"
        trainingdisplay.innerHTML = `Training Epoch ${training_config["Epochs_Trained"]}...`
    }
    else if (training_config["Epochs_Trained"] > 0) {
        progress.style.width = "0%"
        startbutton.innerHTML = "CONTINUE"
        trainingdisplay.innerHTML = `Trained ${training_config["Epochs_Trained"]} Epochs`
        resetbutton.disabled=false
    }
    else {
        progress.style.width = "0%"
        startbutton.innerHTML = "START"
        trainingdisplay.innerHTML = ""
    }
    epochs = []
    for (i = 1; i <= training_config["Epochs_Trained"]; i++) {
        epochs.push(i);
    }

}





function resetTraining(){
    modelPopup.style.display="none";
    handleButton(resetbutton.id);
    progress.style.width = "0%";
    blockBatchData = true;
    
    //reset Graph
    myChart.data.datasets[0].data=[]
    myChart.data.datasets[1].data=[]
    myChart.options.plugins.annotation.annotations={}
    myChart.update()
}

function handleButton(buttonName) {
    // Call the backend
    console.log(buttonName)
    fetch('/button_press', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": buttonName
        })
    })
        .then(response => response.json());
}

