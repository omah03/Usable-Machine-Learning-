
//-----------------------------------------------------------------
//CHART

var epochs = [];
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
                label: 'Loss',
                borderColor: 'rgb(255, 99, 132)',
                data: losses,
            },
            {
                label: 'Accuracy',
                borderColor: 'rgb(54, 162, 235)',
                data: accuracies,
            },
        ],
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
            },
            y: {
                min: 0,
                max: 100,
            },
        },
    },
});

rectangle= document.getElementById("rectanglelayer")
inputbox= document.getElementById("inputbox")
outputbox= document.getElementById("outputbox")


//------------------------------------------------------------------
//CONTROLS

const buttonList = ["start", "reset"];

//TRAINING CONTROLS
startbutton = document.getElementById("starttraining");
startbutton.addEventListener("click", handleStartButton);
progressbar = document.getElementById("progressbar");
progress = document.getElementById("progress");
//for US only
var training = false;
var sleepSetTimeout_ctrl;

function sleep(ms) {
    clearInterval(sleepSetTimeout_ctrl);
    return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
}
//end for US only


async function handleStartButton() {
    //ACTUAL IMPLEMENTATION
    fetch('/button_press', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": "starttraining"
        })
    })
        .then(response => {return response.json()});

}

trainingdisplay=document.getElementById("trainingdisplay")

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



socket.on("training_data", (data) => handleTrainingData(data))
function handleTrainingData(training_config){
    if (training_config["training_active"]==true && training_config["training_stop_signal"]==true){
    progress.style.width=""+ training_config["EpochProgress"]+"%"
    startbutton.innerHTML="CONTINUE"
    trainingdisplay.innerHTML= `Waiting for Epoch ${training_config["Epochs_Trained"]} to finish...`
    }
    else if (training_config["training_active"]==true && training_config["training_stop_signal"]==false){
        progress.style.width=""+ training_config["EpochProgress"]+"%"
        startbutton.innerHTML="PAUSE"
        trainingdisplay.innerHTML= `Training Epoch ${training_config["Epochs_Trained"]}...`
        }
    else if (training_config["Epochs_Trained"]>0){
        progress.style.width="0%"
        startbutton.innerHTML="CONTINUE"
        trainingdisplay.innerHTML= `Trained ${training_config["Epochs_Trained"]} Epochs`
    }
    else{
        progress.style.width="0%"
        startbutton.innerHTML="START"
        trainingdisplay.innerHTML= ""
    }
    epochs=[]
    for (i=1; i<= training_config["Epochs_Trained"]; i++){
        epochs.push(i);
    }
    myChart.data.labels= epochs;
    myChart.data.datasets[0].data= training_config["acc"];
    myChart.data.datasets[1].data= training_config["loss"];
    myChart.update();
    console.log(training_config)
}


resetbutton = document.getElementById("resettraining");
resetbutton.addEventListener("click", () => {
    handleButton(resetbutton.id);
    progress.style.width="0%";
})

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