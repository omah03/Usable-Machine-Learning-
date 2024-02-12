
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




function printPrediction(predicted_digit) {
    var predictionText = document.getElementById('predictionText');
    var text = 'Die Vorhersage des Models: ' + predicted_digit;
    predictionText.innerText = text;
    predictionText.style.display = 'block';
}


function sendAndReceiveClassification(canvasData) {
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
            var heatmap = new Image();
            heatmap.src = 'data:image/jpeg;base64,' + btoa(String.fromCharCode.apply(null, new Uint8Array(data.heatmap)));
            //clearCanvas();
            ctx.drawImage(heatmap, 0, 0);
            
            //const str = "['6.35', '2.72', '11.79', '183.25']",
            console.log('sofmaxValues' + softmaxValues);
            console.log('permutaiton = ' + permutation);
            console.log('heatmap = ' + heatmap);

            resolve([softmaxValues, permutation]); // Ergebnis an die Aufrufer-Funktion übergeben
        });
    });
}



function classificationResult(softmaxValues, permutation) {
    const classifierClasses = document.querySelectorAll('.classifier_class');
    const highlightColor = '#FFFF00';
    const maxIndex = softmaxValues.indexOf(Math.max(...softmaxValues));

    console.log(typeof permutation);
    console.log(permutation);

    classifierClasses[maxIndex].style.backgroundColor = highlightColor;

    classifierClasses.forEach((element, index) => {
        let i = permutation[index];
        let intensity = softmaxValues[index];
        console.log('intensity = ' + intensity);
        let percentage = (intensity * 100).toFixed(2).toString();
        console.log('percentage = ' + percentage)
        let number = element.getElementsByClassName("percentage")[0];
        let num = element.querySelector('p[name="value"]');

        bar = element.getElementsByClassName('percentage-bar')[0]
        bar.style.width = percentage + "%";
        number.innerText = percentage + "%";//
        num.innerText = i;//
    })
}




async function classifyImage() {
    console.log('Classifying Image....')
    var predicted_digit = 5;
    const canvasData = canvas.toDataURL();
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => { container.style.backgroundColor = 'transparent'; });
    try {
        const [softmaxValues, permutation, heatmap] = await sendAndReceiveClassification(canvasData);
        console.log('test.js: Die Klassifizierung ergibt:', softmaxValues);
        //printPrediction(classification); not needed anymore as containers are colored
        classificationResult(softmaxValues, permutation);

    } catch (error) {
        console.error('Fehler bei der Klassifizierung:', error);
    }
}

const classifyButton = document.getElementById('classify');
classifyButton.addEventListener('click', function () {
    classifyImage();
    classifyButton.disabled = true;
});


const resetCanvasButton = document.getElementById('reset');
resetCanvasButton.addEventListener('click', function () {
    clearCanvas();
    classifyButton.disabled = false;
});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayText();
    //var predictionText = document.getElementById('predictionText');
    //predictionText.innerText = ''; // Leere den Text
    //predictionText.style.display = 'none'; // Verberge das Element
    const classes = document.querySelectorAll('.classifier_class'); // Die Container(Ziffern 0-9)
    classes.forEach(container => {
        container.style.backgroundColor = 'transparent';
        bar = container.getElementsByClassName("percentage-bar")[0]
        bar.style.width = 0 + "%";
        number = container.getElementsByClassName("percentage")[0]
        number.innerHTML = "";
    }
    );
}