
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
        socket.on('classification_result', (result,heatmap) => {
            console.log('Klassifizierungsergebnis', result);
            resolve([result,heatmap]); // Ergebnis an die Aufrufer-Funktion übergeben
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


function calculateColor(value) {
    // Hier kannst du die Logik implementieren, um die Farbe basierend auf dem Wert zu berechnen
    // Zum Beispiel könntest du eine Farbpalette erstellen und die Farbe entsprechend des Werts auswählen.
    // Dies hängt von der Art der Heatmap ab, die du erstellt hast.
    // Hier ist ein einfaches Beispiel:
    //const intensity = Math.floor(value * 255);
    return `rgb(${value}, 0, 0)`; // Rote Farbtöne, je nach Intensität
}

//This function reeceives the heatmap from python and shows it on the canvas
function showHeatmap(heatmap){
    console.log('showHeatmap...');
    //clearCanvas();
    const canvas = document.getElementById('canvas'); // Ersetze 'meinCanvas' durch die tatsächliche ID deines Canvas-Elements
    const context = canvas.getContext('2d');

    const rows = heatmap.length;
    const columns = heatmap[0].length;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const cellWidth = canvasWidth / columns;
    const cellHeight = canvasHeight / rows;

   

    for (let i = 0; i < heatmap.length; i++) {
        for (let j = 0; j < heatmap[i].length; j++) {
            const value = heatmap[i][j];
            if (value > 0.0){
                const color = calculateColor(value); // Funktion, um die Farbe basierend auf dem Wert zu berechnen
                context.fillStyle = color;
                context.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
            }

            
        }
    }
    console.log('heatmap on canvas')
}

async function classifyImage(){
    console.log('Classifying Image....')
    var predicted_digit = 5;
    const canvasData = canvas.toDataURL();
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => {container.style.backgroundColor = 'transparent';});
    try {
        const [resultArray, heatmap] = await sendAndReceiveClassification(canvasData);
        console.log('Die Klassifizierung ergibt:', resultArray);
        //printPrediction(classification); not needed anymore as containers are colored
        classificationResult(resultArray);
        showHeatmap(heatmap);
        
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