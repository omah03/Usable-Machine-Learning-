async function GoToModelPage() {
    const config = {};
    fetch("/get_config")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Request failed.');
            }
        })
        .then(data => {
            // Access the number from the response JSON
            Object.assign(config, data); // Merge the received configuration into 'config'
            console.log(config);
            if (config["Epochs_Trained"] == 0) {
                window.location.href = "model";
            }
            else {
                handlePopup("model");
            }
        })
        .catch(error => {
            console.error(error);
        });
}

async function GoToParamPage() {
    const config = {};
    fetch("/get_config")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Request failed.');
            }
        })
        .then(data => {
            // Access the number from the response JSON
            Object.assign(config, data); // Merge the received configuration into 'config'
            console.log(config);
            if (config["Epochs_Trained"] == 0) {
                window.location.href = "param";
            }
            else {
                handlePopup("param");
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function GoToTrainPage() {
    window.location.href = "train";
}
async function GoToTestPage() {
    const config = {};
    fetch("/get_config")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Request failed.');
            }
        })
        .then(data => {
            // Access the number from the response JSON
            Object.assign(config, data); // Merge the received configuration into 'config'
            console.log(config);
            if (config["Epochs_Trained"] !== 0) {
                window.location.href = "test";
            }
            else {
                popuptext = document.getElementById("popup-text");
                if (popuptext) {
                    popuptext.innerHTML = "Classification will be random if you do not train the model first."
                }
                if (popup && discard && cancel) {
                    discard.innerHTML = "Continue";
                    popup.style.display = "flex";
                    discard.addEventListener("click", () => {
                        popuptext.innerHTML = "By Continuing you will loose your training progress. Are you sure?"
                        window.location.href = "test";
                    })
                    handlePopup("test")
                }
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function handlePopup(destination) {
    popup.style.display = "flex";
    if (discard && cancel) {
        discard.addEventListener("click", () => {
            window.location.href = destination;
            fetch('/button_press', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "type": "resettraining"
                })
            })
                .then(response => response.json());

            progress = document.getElementById("progress")
            if (progress) { progress.width = 0; }

        })

    }


}

ModelButton = document.getElementById("ModelPage");
ParamButton = document.getElementById("ParamPage");
TrainButton = document.getElementById("TrainPage");
TestButton = document.getElementById("TestPage");

popup = document.getElementById("popup-container")

discard = document.getElementById("discard");
cancel = document.getElementById("cancel");
if (cancel) {
    cancel.addEventListener("click", () => {
        popup.style.display = "none"
    })
}
var path = window.location.pathname;

color = "#D0F4FF"

switch (path){
    case "/model":
        ModelButton.style.background=color
        break;
    case "/param":
        ParamButton.style.background=color
        break;
    case "/train":
        TrainButton.style.background=color
        break;
    case "/test":
        TestButton.style.background=color
        break;
}
if (ModelButton
    && ParamButton
    && TrainButton
    && TestButton) {
    if (path!=="/model"){
    ModelButton.addEventListener("click", GoToModelPage);
}
    if (path!=="/param"){

    ParamButton.addEventListener("click", GoToParamPage);
}   if (path!=="/train"){

    TrainButton.addEventListener("click", GoToTrainPage);
}   if (path!=="/test"){

    TestButton.addEventListener("click", GoToTestPage);
}}
else {
    console.log("ERROR: Navbar loading failed.")
}

console.log( path );