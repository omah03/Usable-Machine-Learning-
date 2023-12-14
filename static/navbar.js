function GoToModelPage() {
    if (!TrainingHappened()) {
        // Call the backend
        window.location.href = "model";
    }
    else if (true) {
        handlePopup("model");
    }
}
function GoToParamPage() {
    if (!TrainingHappened()) {
        // Call the backend
        window.location.href = "param";
    }
    else if (popup) {
        handlePopup("param");
    }
}

function GoToTrainPage() {
    window.location.href = "param";
}
function GoToTestPage() {
    if (!TrainingHappened()) {
        popuptext = document.getElementById("popup-text");
        if (popuptext) {
            popuptext.innerHTML = "Classification will be random if you do not train the model first."
        }
        if (popup && discard && cancel) {
            cancel.style.display = "none";
            discard.innerHTML = "Continue";
            popup.style.display = "flex";
            discard.addEventListener("click", () => {
                window.location.href = "param";
            })
        }

    }
    else if (popup) {
        handlePopup("param");
    }
}

function TrainingHappened() {
    return true
}

function handlePopup(destination) {
    popup.style.display = "flex";
    if (discard && cancel) {
        discard.addEventListener("click", () => {
            window.location.href = destination;
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

if (ModelButton
    && ParamButton
    && TrainButton
    && TestButton) {
    ModelButton.addEventListener("click", GoToModelPage);
    ParamButton.addEventListener("click", GoToParamPage);
    TrainButton.addEventListener("click", GoToTrainPage);
    TestButton.addEventListener("click", GoToTestPage);
}
else {
    console.log("ERROR: Navbar loading failed.")
}

