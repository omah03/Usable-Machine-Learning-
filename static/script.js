
//alert('Das ist ein Test');
console.log('Das ist ein Test');

// Verbindung zum WebSocket-Server herstellen
const socket = io('http://127.0.0.1:5000');    //Muss in html eingebunden sein!
//const socket = io('127.0.0.1:5000');    //Muss in html eingebunden sein!

// Event bei erfolgreicher Verbindung zu Socket.io
socket.on('connect', () => {
    console.log('Erfolgreich mit dem Socket.io-Server verbunden');
});

// Event bei Verbindungsabbruch zu Socket.io
socket.on('disconnect', () => {
    console.log('Verbindung zum Socket.io-Server unterbrochen');
});


//------------------------------------------------------------------
// Activation Function Dropdown Menu
const act_reluOption = document.getElementById("act_reluOption")
const act_sigmoidOption = document.getElementById("act_sigmoidOption")
const act_tanhOption = document.getElementById("act_tanhOption")



function handleActivationFunctionChange(event) {
    // Get the text of the selected option
    var selectedOptionText = event.target.textContent;

    // Update the title text with the selected option
    var titleElement = document.getElementById("selectedOption");
    if ("Activation Function: <br>" + selectedOptionText != titleElement.innerHTML) {
        titleElement.innerHTML = "Activation Function: <br>" + selectedOptionText;

        // Call a function or perform an action based on the selected option
        switch (selectedOptionText) {
            case "0.1":
                // Call a function for ReLU activation
                func = "1";

                break;
            case "0.01":
                // Call a function for Sigmoid activation
                func = "01";
                break;
            case "0.001":
                // Call a function for tanh activation

                func = "001";
                break;
            case "0.0001":
                // Call a function for tanh activation

                func = "0001";
                break;
            default:
                // Handle any other cases or do nothing
                func = "";
                break;
        }
        fetch('/update_value', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "type": "ActivationFunc",
                "value": func
            })
        })
            .then(response => response.json());
    }
}
// Add a "click" event listener to the dropdown options
act_reluOption.addEventListener("click", handleActivationFunctionChange);
act_sigmoidOption.addEventListener("click", handleActivationFunctionChange);
act_tanhOption.addEventListener("click", handleActivationFunctionChange);

function handle_LRate_Change(event) {
    // Get the text of the selected option
    var LRateOptionText = event.target.textContent;

    // Update the title text with the selected option
    var titleElement = document.getElementById("LRateOption");
    if ("Learning Rate: <br>" + LRateOptionText != titleElement.innerHTML) {
        titleElement.innerHTML = "Learning Rate: <br>" + LRateOptionText;

        // Call a function or perform an action based on the selected option
        switch (LRateOptionText) {
            case "Rectified Linear Activation (ReLU)":
                // Call a function for ReLU activation
                func = "ReLU";

                break;
            case "Logistics (Sigmoid)":
                // Call a function for Sigmoid activation
                func = "Sigm";
                break;
            case "Hyperbolic Tangent (tanh)":
                // Call a function for tanh activation

                func = "tanh";
                break;
            default:
                // Handle any other cases or do nothing
                func = "";
                break;
        }
        fetch('/update_value', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "type": "LRate",
                "value": func
            })
        })
            .then(response => response.json());
    }
}
// Add a "click" event listener to the dropdown options
act_1.addEventListener("click", handle_LRate_Change);
act_01.addEventListener("click", handle_LRate_Change);
act_001.addEventListener("click", handle_LRate_Change);
act_0001.addEventListener("click", handle_LRate_Change);

//------------------------------------------------------------------
//Sliders
const sliders = ["BSizeSlider", "NEpochsSlider"];


for (const slider of sliders) {
    SliderElement = document.getElementById(slider);
    SliderElement.addEventListener("input", (event) => { updateSliderValue(event.target); });
    updateSliderValue(SliderElement);
}


function updateSliderValue(slider) {
    const sliderValue = slider.value;
    const sliderName = slider.id.replace("Slider", "");
    var displayId = slider.id.replace("Slider", "Display");
    var display = document.getElementById(displayId);

    display.innerHTML = ("0000" + sliderValue.toString()).slice(-3)

    // Call the backend
    fetch('/update_value', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": sliderName,
            "value": sliderValue
        })
    })
        .then(response => response.json());
}

//----------------------------------
// Append changeInfoText event listeners

listofEls = ["actFunc", "LRate", "BSizeSlider", "NEpochsSlider", "outputbox"]

for (const element of listofEls) {
    actFuncMenu = document.getElementById(element);
    actFuncMenu.addEventListener("click", () => { changeInfoText(element) });
}

//------------------------------------------------------------------
//Classifier arrows UGLY FUCKING SOLUTION I HATE THIS

inputs = (document.getElementsByClassName("classifier_input"));
classes = (document.getElementsByClassName("classifier_class"));

console.log(inputs.length);

for (let i = 0; i < inputs.length; i = i + 1) {

    for (let j = i % 2; j < 10; j = j + 2) {
        new LeaderLine(
            inputs[i], classes[j],
            { color: 'black', size: 1 }
        );
    }

}


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

/*
//code for the canvas
const canvas = document.getElementById('inputbox');
const ctx = canvas.getContext('2d');
let isDrawing = false;

function displayText() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';
    const text = 'Draw a digit\n to be classified,\n here'; // Mit \n wird ein Zeilenumbruch erzeugt
    const lineHeight = 25; // Zeilenhöhe festlegen

    const lines = text.split('\n'); // Text in einzelne Zeilen aufteilen
    // Textzeilen nacheinander auf dem Canvas zeichnen
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 50, 50 + i * lineHeight); // Hier kannst du die Position des Textes anpassen
    }
    isTextDisplayed = true;
}

function clearText() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (isTextDisplayed == true) {
        clearText();
        isTextDisplayed = false;
    }
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getMousePos(canvas, e);

    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

displayText();

*/


//----------------------------------------------------------
//Canvas Prediction
/*
function sendToModel(canvasData) {
//diese Funktion benutzt keine Websockets 

        // Erstelle ein Objekt mit den Daten, die du an den Server senden möchtest
        const data = {
          canvasData: canvasData // Die Bilddaten aus dem Canvas
    };

        // Sende eine POST-Anfrage an deinen Server mit den Bilddaten
        fetch('/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
      },
          body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(result => {
          // Hier erhältst du das Ergebnis von der Serverantwort
          console.log('Klassifiziertes Ergebnis:', result);
          // Führe hier weitere Aktionen basierend auf dem Ergebnis aus
    })
        .catch(error => {
          console.error('Fehler beim Senden der Daten:', error);
    });
  }

*/

/*
function printPrediction(predicted_digit) {
    var predictionText = document.getElementById('predictionText');
    var text = 'Die Vorhersage des Models: ' + predicted_digit;
    predictionText.innerText = text;
    predictionText.style.display = 'block';
}


function sendAndReceiveClassification(canvasData) {
    return new Promise((resolve, reject) => {
        socket.emit('classify', { canvasData });
        socket.on('classification_result', (result) => {
            console.log('Klassifizierungsergebnis', result);
            resolve(result); // Ergebnis an die Aufrufer-Funktion übergeben
        });
    });
}



function classificationResult(predicted_digit) {
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    const resultClass = classes[predicted_digit];
    resultClass.style.backgroundColor = 'red';
}

async function classifyImage() {
    console.log('Classifying Image....')
    var predicted_digit = 5;
    const canvasData = canvas.toDataURL();
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => { container.style.backgroundColor = 'transparent'; });
    try {
        const classification = await sendAndReceiveClassification(canvasData);
        console.log('Die Klassifizierung ergibt:', classification);
        //printPrediction(classification); not needed anymore as containers are colored
        classificationResult(classification);
    } catch (error) {
        console.error('Fehler bei der Klassifizierung:', error);
    }
}

const classifyButton = document.getElementById('classify');
classifyButton.addEventListener('click', classifyImage);


function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayText();
    var predictionText = document.getElementById('predictionText');
    predictionText.innerText = ''; // Leere den Text
    predictionText.style.display = 'none'; // Verberge das Element
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => { container.style.backgroundColor = 'transparent'; });
}

//Reset Button for Canvas
document.getElementById('reset').addEventListener('click', clearCanvas);


*/

//
//-------------------------------------------------------



new LeaderLine(inputbox, rectanglelayer,     { color: 'black', size: 5 }
)
new LeaderLine(rectanglelayer, outputbox,     { color: 'black', size: 5 }
)
