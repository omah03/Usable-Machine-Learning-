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


//------------------------------------------------------------------
//MODEL CREATOR


//------------------------------------------------------------------
//MODEL CREATOR -- Blocks

//INIT STATE: Hide all but BLOCK 1 & 2
//To hide Block, set block.style.display = "none"
//To display set block.className = "block"


var Blocks = [];
//get input block
Blocks[0] = document.getElementById("inputbox");

var MinusButtons = [""]; //leave first empty so index matches
var AddButtons = [""];


// Loop through blocks from 1 to 5 (hiding everything)
for (let i = 1; i <= 5; i++) {
    var block = document.getElementById(`block${i}`);
    Blocks[i] = block;
    var Add_block = document.getElementById(`Add_block${i}`);
    AddButtons[i] = Add_block;
    var Minus_block = document.getElementById(`Minus_block${i}`);
    MinusButtons[i] = Minus_block;

    if (block) {
        block.style.setProperty("display", "none");
        block.addEventListener("click", () => {
            changeInfoText(Blocks[i].id);
        });
    }

    if (Add_block) {
        Add_block.style.setProperty("display", "none");
        Add_block.addEventListener("click", () => { addBlock(i) });
    }

    if (Minus_block) {
        Minus_block.style.setProperty("display", "none");
        Minus_block.addEventListener("click", () => { removeBlock(i) });
    }
}

function addBlock(i) {

    Blocks[i].style.display = "flex";
    AddButtons[i].style.display = "none";
    if (i < 5) {
        AddButtons[i + 1].style.display = "flex";
    }

    MinusButtons[i].style.display = "flex";
    if (i > 1) {
        MinusButtons[i - 1].style.display = "none";
    }
    // Call the backend
    fetch('/update_value', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": "NBlocks",
            "value": i
        })
    })
        .then(response => response.json());

}

function removeBlock(i) {
    Blocks[i].style.display = "none";
    AddButtons[i].style.display = "flex";
    if (i < 5) {
        AddButtons[i + 1].style.display = "none";
    }

    MinusButtons[i].style.display = "none";
    if (i > 1) {
        MinusButtons[i - 1].style.display = "flex";
    }
    // Call the backend
    fetch('/update_value', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": "NBlocks",
            "value": i - 1
        })
    })
        .then(response => response.json());

}


Blocks[1].style.display = "flex";

Blocks[2].style.display = "flex";

MinusButtons[2].style.display = "flex";

AddButtons[3].style.display = "flex";

const infotext = document.getElementById("infotext");
const infobox = document.getElementById("infobox");

document.getElementById("hide").addEventListener("click", () => {
    infobox.style.display = "none";
})

document.getElementById("inputbox").addEventListener("click", () => { changeInfoText("inputbox"); }
)

function changeInfoText(elementID) {
    infobox.style.display = "flex";
    var element = document.getElementById(elementID);
    if (element && element.style.display != "none") {
        for (const infoelement of document.getElementsByClassName("infotext")) {
            if (infoelement.id == `infotext_${elementID}`) {
                infoelement.style.display = "flex"
            }
            else {
                infoelement.style.display = "none"
            }
        }
    }
}

//----------------------------------
// Append changeInfoText event listeners

listofEls=["actFunc", "LRate", "BSizeSlider", "NEpochsSlider", "outputbox"]

for (const element of listofEls){
    actFuncMenu= document.getElementById(element);
    actFuncMenu.addEventListener("click", ()=> {changeInfoText(element)});
}

//------------------------------------------------------------------
//Classifier arrows UGLY FUCKING SOLUTION I HATE THIS

inputs = (document.getElementsByClassName("classifier_input"));
classes = (document.getElementsByClassName("classifier_class"));

console.log(inputs.length);

for (let i = 0; i < inputs.length; i = i + 1) {

    for (let j = i%2; j < 10; j = j + 2) {
        new LeaderLine(
            inputs[i], classes[j],
            { color: 'black', size: 1 }
        );
    }

}


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
    //FAKE FOR USER STUDY
    if (training == false) {
        training = true;
        startbutton.innerHTML = "PAUSE";
        for (const epoch of SampleEpochs) {
            if (training == false) { break; }
            progressbar.style.display = "flex";
            progress.style.width = "0%";
            for (var i = 0; i < 256; i++) {
                await sleep(100);
                progress.style.width = ((i + 1) * 100 / 256).toFixed(0) + "%";
            }
            accuracies.push(SampleAccuracies[epoch - 1]);
            losses.push(SampleLosses[epoch - 1]);
            epochs.push(epoch);
            myChart.update();
        }
        progressbar.style.display = "None";
        training = false;
        startbutton.innerHTML = "continue";
    }
    else {
        training = false;
        startbutton.innerHTML = "CONTINUE";
    }
    //ACTUAL IMPLEMENTATION
    /*
    fetch('/button_press', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": "starttraining"
        })
    })
        .then(response => {return response.json()})
        .then((data)=> {
            if (data==true){
                startbutton.innerHTML="Pause";
            }
            else {
                startbutton.innerHTML="Continue";
            }
        });
    //toggleProgressBar();*/
}


resetbutton = document.getElementById("resettraining");
resetbutton.addEventListener("click", () => {
    handleButton(resetbutton);
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



//const softmaxValues = [0.1, 0.5, 0.8, 0.3, 0.6, 0.9, 0.2, 0.4, 0.7, 0.55]; // Beispielwerte




function printPrediction(predicted_digit){
    var predictionText = document.getElementById('predictionText');
    var text = 'Die Vorhersage des Models: ' + predicted_digit;
    predictionText.innerText = text;
    predictionText.style.display = 'block';
}


function sendAndReceiveClassification(canvasData){
    return new Promise((resolve, reject) => {
        socket.emit('classify', { canvasData });
        socket.on('classification_result', (result) => {
            console.log('Klassifizierungsergebnis', result);
            resolve(result); // Ergebnis an die Aufrufer-Funktion übergeben
        });
    });
}

// Funktion, um Farbwerte entsprechend der Intensität zu generieren
function mapIntensityToColor(intensity) {
    const colorIntensity = Math.floor(245 * intensity); // Skalierung auf den Wertebereich von 0 bis 255
    const Intensity = colorIntensity + 10;
    console.log('mapIntensity ausgeführt');

    return `rgb(0, ${Intensity}, 0)`;
}


function classificationResult(softmaxValues){
    //const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    //const resultClass = classes[predicted_digit];
    //resultClass.style.backgroundColor = 'red';
    const classifierClasses = document.querySelectorAll('.classifier_class');

    classifierClasses.forEach((element, index) => {
        const intensity = softmaxValues[index];
        console.log(`Intensität für Klasse ${index}:`, intensity); // Überprüfen der Intensität für jede Klasse
        const color = mapIntensityToColor(intensity);
        console.log(`Farbe für Klasse ${index}:`, color); // Überprüfen der generierten Farbe
        element.style.backgroundColor = color;
    });
    console.log('classificationResult ausgeführt');
}

async function classifyImage(){
    console.log('Classifying Image....')
    var predicted_digit = 5;
    const canvasData = canvas.toDataURL();
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => {container.style.backgroundColor = 'transparent';});
    try {
        const resultArray = await sendAndReceiveClassification(canvasData);
        console.log('Die Klassifizierung ergibt:', resultArray);
        //printPrediction(classification); not needed anymore as containers are colored
        classificationResult(resultArray);
        
    } catch(error) {
        console.error('Fehler bei der Klassifizierung:', error);
    }
}

const classifyButton = document.getElementById('classify');
classifyButton.addEventListener('click',classifyImage);


function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayText();
    var predictionText = document.getElementById('predictionText');
    predictionText.innerText = ''; // Leere den Text
    predictionText.style.display = 'none'; // Verberge das Element
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => {container.style.backgroundColor = 'transparent';});
}

//Reset Button for Canvas
document.getElementById('reset').addEventListener('click', clearCanvas);




//
//-------------------------------------------------------



// Sample data (replace with your actual data)
const SampleEpochs = [1, 2, 3, 4, 5];
const SampleLosses = [0.1, 0.08, 0.06, 0.04, 0.02];
const SampleAccuracies = [80, 85, 90, 95, 98];

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
