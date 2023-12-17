

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

const infotext = document.getElementById("infotext");
const infobox = document.getElementById("infobox");

document.getElementById("hide").addEventListener("click", () => {
    infobox.style.display = "none";
})


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

listofEls=["actFunc", "LRate", "BSizeSlider", "NEpochsSlider"]

for (const element of listofEls){
    actFuncMenu= document.getElementById(element);
    actFuncMenu.addEventListener("click", ()=> {changeInfoText(element)});
}
