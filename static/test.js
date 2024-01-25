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


//code for the canvas
const canvas = document.getElementById('canvas');
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



function classificationResult(predicted_digit){
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    const resultClass = classes[predicted_digit];
    resultClass.style.backgroundColor = 'red';
}

async function classifyImage(){
    console.log('Classifying Image....')
    var predicted_digit = 5;
    const canvasData = canvas.toDataURL();
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => {container.style.backgroundColor = 'transparent';});
    try {
        const classification = await sendAndReceiveClassification(canvasData);
        console.log('Die Klassifizierung ergibt:', classification);
        //printPrediction(classification); not needed anymore as containers are colored
        classificationResult(classification);
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
