
//alert('Das ist ein Test');
console.log('Das ist ein Test');

// Verbindung zum WebSocket-Server herstellen
const socket = io.connect('http://' + location.host);//const socket = io('127.0.0.1:5000');    //Muss in html eingebunden sein!

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
    const text = 'Zeichne hier\n deine Ziffer'; // Mit \n wird ein Zeilenumbruch erzeugt
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
        fetch("/classify", {
            method: 'POST', // Use POST method to send data
            headers: {
              'Content-Type': 'application/json', // Specify the content type as JSON
            },
            body: JSON.stringify({ canvasData }) // Convert the canvasData object to a JSON string
          })
            socket.on('classification_result', data => {
            var result = JSON.parse(data);
            var softmaxValues = result.softmaxValues;
            var permutation = result.permutation;
            var heatmap = result.heatmap;

            //const str = "['6.35', '2.72', '11.79', '183.25']",
            console.log('sofmaxValues' + softmaxValues);
            console.log('permutaiton = ' + permutation);
            console.log('heatmap = ' + heatmap);   

            resolve([softmaxValues, permutation,heatmap]); // Ergebnis an die Aufrufer-Funktion übergeben
        });
    });
}

// Funktion, um Farbwerte entsprechend der Intensität zu generieren
function mapIntensityToColor(intensity) {
    //const colorIntensity = Math.floor(245 * intensity); // Skalierung auf den Wertebereich von 0 bis 255
    //const Intensity = colorIntensity + 10;
    console.log('mapIntensity ausgeführt');

    return `rgba(0, 255, 0, ${intensity})`;//${Intensity})`;
}


function classificationResult(softmaxValues, permutation){
    const classifierClasses = document.querySelectorAll('.classifier_class');
    const highlightColor = '#FFFF00';
    const maxIndex = softmaxValues.indexOf(Math.max(...softmaxValues));

    console.log(typeof permutation);
    console.log(permutation);

    classifierClasses[maxIndex].style.backgroundColor = highlightColor;

    classifierClasses.forEach((element,index) => {
        let i = permutation[index];
        let intensity = softmaxValues[index];
        console.log('intensity = ' +  intensity);
        let percentage = (intensity*10).toFixed(2).toString();
        console.log('percentage = ' + percentage)
        let number = element.getElementsByClassName("percentage")[0];
        let num = element.querySelector('p[name="value"]');

        bar = element.getElementsByClassName('percentage-bar')[0]
        bar.style.width = percentage + "%";
        number.innerText= percentage + "%";//
        num.innerText = i;//
    })
    }

var percentColors = [
    { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ];

var getColorForPercentage = function(pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgba(' + [color.r, color.g, color.b].join(',') + ', 0.8)';
    // or output as hex if preferred
};



function calculateColor(value) {
    // Hier kannst du die Logik implementieren, um die Farbe basierend auf dem Wert zu berechnen
    // Zum Beispiel könntest du eine Farbpalette erstellen und die Farbe entsprechend des Werts auswählen.
    // Dies hängt von der Art der Heatmap ab, die du erstellt hast.
    // Hier ist ein einfaches Beispiel:
    //const intensity = Math.floor(value * 255);
    return `rgba(255, 0, 0, ${value})`; // Rote Farbtöne, je nach Intensität
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
                color = getColorForPercentage(1-value/255); // Funktion, um die Farbe basierend auf dem Wert zu berechnen
            }else{
                color = getColorForPercentage(1);
            }
                context.fillStyle = color;
                context.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
            

            
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
        const [softmaxValues, permutation, heatmap] = await sendAndReceiveClassification(canvasData);
        console.log('test.js: Die Klassifizierung ergibt:', softmaxValues);
        //printPrediction(classification); not needed anymore as containers are colored
        classificationResult(softmaxValues, permutation);
        showHeatmap(heatmap);
        
    } catch(error) {
        console.error('Fehler bei der Klassifizierung:', error);
    }
}

const classifyButton = document.getElementById('classify');
classifyButton.addEventListener('click', function() {
    classifyImage();
    classifyButton.disabled = true;
});


const resetCanvasButton = document.getElementById('reset');
resetCanvasButton.addEventListener('click', function() {
    clearCanvas();
    classifyButton.disabled = false;
});

function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayText();
    //var predictionText = document.getElementById('predictionText');
    //predictionText.innerText = ''; // Leere den Text
    //predictionText.style.display = 'none'; // Verberge das Element
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => 
        {
            container.style.backgroundColor = 'transparent';
            bar= container.getElementsByClassName("percentage-bar")[0]
            bar.style.width= 0 + "%";
            number = container.getElementsByClassName("percentage")[0]
            number.innerHTML="";        
        }
        );
}