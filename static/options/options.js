// get html items
//------------------------------------------------------------------
// Activation Function Dropdown Menu
const actFuncOptions = document.getElementsByClassName("act_Option");
const actLabel = document.getElementById("act_Label")

for (const actOption of actFuncOptions) {
    actOption.addEventListener("click", (event) => { handleDropdownChange(actOption, "act") })
}

// LRate
const LRateSlider = document.getElementById("LRateSlider")

// BSize
const BSizeSlider = document.getElementById("BSizeSlider")

// Epochs
const EpochsSlider = document.getElementById("NEpochsSlider")

// Kernel
const KSizeSlider = document.getElementById("KSizeSlider");


fetch("/get_config")
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Request failed.');
        }
    })
    .then(data => {
        console.log(`Loaded Parameters: ${data}`)
        if (LRateSlider) {
            LRateSlider.value = data["LRate"]
            updateSliderValue(LRateSlider)
        }
        if (BSizeSlider) {
            BSizeSlider.value = data["BSize"]
            updateSliderValue(BSizeSlider)
        }
        if (EpochsSlider) {
            EpochsSlider.value = data["NEpochs"]
            updateSliderValue(EpochsSlider)
        }
        if (actFuncOptions) {
            for (const option of actFuncOptions) {
                // If the options id was selected; simulate a click on it to put the text on the label
                // pretty inefficient solution 
                if (option.id == data["ActivationFunc"]) {
                    handleDropdownChange(option, "act")
                }
            }
        }
    })
    .catch(error => {
        console.error(error);
    });

function handleDropdownChange(option, type) {
    labelHTML = "error";                            // if überflüssig, da LRate weg?
    if (type == "act") {
        labelHTML = "<br>"
        flask_type = "ActivationFunc"
    }
    var titleElement = document.getElementById(`${type}_Label`);
    console.log(titleElement.id)
    // Get the text of the selected option
    var selectedOptionText = option.textContent;

    if (labelHTML + selectedOptionText != titleElement.innerHTML) {
        titleElement.innerHTML = labelHTML + selectedOptionText;
        fetch('/update_value', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "type": flask_type,
                "value": option.id
            })
        })
            .then(response => response.json());
    }
}


// SLIDERS

if (LRateSlider) {
    LRateSlider.addEventListener("input", (event) => { updateSliderValue(event.target); });
    updateSliderValue(LRateSlider);
}
if (BSizeSlider) {
    BSizeSlider.addEventListener("input", (event) => { updateSliderValue(event.target); });
    updateSliderValue(BSizeSlider);
}

if (EpochsSlider) {
    EpochsSlider.addEventListener("input", (event) => { updateSliderValue(event.target); });
    updateSliderValue(EpochsSlider);
}

if (KSizeSlider) {
    KSizeSlider.addEventListener("input", (event) => { updateSliderValue(event.target) });
}

function updateSliderValue(slider) {
    const sliderValue = slider.value;
    const sliderName = slider.id.replace("Slider", "");
    var displayId = slider.id.replace("Slider", "Display");
    var display = document.getElementById(displayId);

    if (sliderName == "KSize") {
        switch (sliderValue) {
            case "1":
                display.innerHTML = "small"
                break
            case "2":
                display.innerHTML = "medium"
                break
            case "3":
                display.innerHTML = "large"
                break
        }
    }
    else if (sliderName == 'LRate') {
        switch (sliderValue) {
            case "1":
                display.innerHTML = "0.5"
                break
            case "2":
                display.innerHTML = "0.3"
                break
            case "3":
                display.innerHTML = "0.1"
                break
            case "4":
                display.innerHTML = "0.01"
                break
        }
    }
    else {
        display.innerHTML = ("0000" + sliderValue.toString()).slice(-3)
    }
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