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
                data: [1, 100],
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

const rectangle = document.getElementById("rectanglelayer")
const inputbox = document.getElementById("inputbox")
const outputbox = document.getElementById("outputbox")


//------------------------------------------------------------------
//CONTROLS

const buttonList = ["start", "reset"];

//TRAINING CONTROLS
const startbutton = document.getElementById("starttraining");
startbutton.addEventListener("click", handleStartButton);
progressbar = document.getElementById("progressbar");
progress = document.getElementById("progress");

modelPopup = document.getElementById("modelPopup");
discardButton = document.getElementById("discardButton");
returnButton = document.getElementById("returnButton");

discardButton.addEventListener("click", resetTraining)
returnButton.addEventListener("click", () => {
    window.scrollBy(0, 100);
})

const discardbutton = document.getElementById("discardButton")
const resetbutton = document.getElementById("resettraining");
resetbutton.addEventListener("click", resetTraining);

async function handleStartButton() {
    resetbutton.disabled = true
    discardbutton.disabled = true
    modelPopup.style.display = "flex";

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
    if (data["accs"].length > 1) {
        toggleTestBlur(false);
    }
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
        toggleModelbuilderBlur(true);
        progress.style.width = "" + training_config["EpochProgress"] + "%"
        startbutton.innerHTML = "WEITER"
        startbutton.disabled = true;
        trainingdisplay.innerHTML = `Warten auf das Ende der Epoche...`
    }
    else if (training_config["training_active"] == true && training_config["training_stop_signal"] == false) {
        toggleModelbuilderBlur(true);
        progress.style.width = "" + training_config["EpochProgress"] + "%"
        startbutton.innerHTML = "PAUSE"
        trainingdisplay.innerHTML = `Training Epoche ${training_config["Epochs_Trained"]}...`
    }
    else if (training_config["Epochs_Trained"] > 0) {
        toggleTestBlur(false);
        progress.style.width = "0%"
        startbutton.innerHTML = "WEITER"
        startbutton.disabled = false;
        trainingdisplay.innerHTML = `Epochen trainiert: ${training_config["Epochs_Trained"]}`
        resetbutton.disabled = false
        discardbutton.disabled = false

    }
    else {
        startbutton.disabled = false;
        progress.style.width = "0%"
        startbutton.innerHTML = "START"
        trainingdisplay.innerHTML = ""
    }
}





function resetTraining() {
    modelPopup.style.display = "none";
    handleButton(resetbutton.id);
    progress.style.width = "0%";
    blockBatchData = true;

    toggleModelbuilderBlur(false);

    //reset Graph
    myChart.data.datasets[0].data = []
    myChart.data.datasets[1].data = []
    myChart.options.plugins.annotation.annotations = {}
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

function toggleTestBlur(turnOn) {
    drawcanvas = document.getElementById("canvas");
    controls = document.getElementsByClassName("resetButton");

    if (turnOn) {
        drawcanvas.classList.add('blurred-section');
        for (const el of controls) {
            el.disabled = true
        }
    }
    else {
        drawcanvas.classList.remove('blurred-section');
        for (const el of controls) {
            el.disabled = false
        }
    }
}


function toggleModelbuilderBlur(turnOn) {
    rectanglelayer = document.getElementById("rectanglelayer")

    if (turnOn) {
        rectanglelayer.classList.add('blurred-section');
    }
    else {
        rectanglelayer.classList.remove('blurred-section');

    }
}

socket.on("get_LRate", (callback) => {
    console.log("CALL RECEIVED");
    let slider = document.getElementById("LRateSlider");
    let value = slider.value;
    // Use the callback function to send the value back to the server
    callback(value);
});
