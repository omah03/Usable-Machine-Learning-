// get html items
//------------------------------------------------------------------
// Activation Function Dropdown Menu
const actFuncOptions = document.getElementsByClassName("act_Option");
const actLabel= document.getElementById("act_Label")

for (const actOption of actFuncOptions){
    actOption.addEventListener("click", (event) => {handleDropdownChange(event, "act")})
}

// LRate
const LRateOptions = document.getElementsByClassName("LRate_Option");
const LRateLabel= document.getElementById("act_Label")

for (const LRateOption of LRateOptions){
    LRateOption.addEventListener("click", (event) => {handleDropdownChange(event, "LRate")})
}

// BSize
const BSizeSlider = document.getElementById("BSizeSlider")

// Epochs
const EpochsSlider = document.getElementById("NEpochsSlider")



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
})
.catch(error => {
    console.error(error);
});


function handleDropdownChange(event, type) {
    labelHTML= "error";
    if (type=="act"){
        labelHTML= "Activation Function: <br>"
    }
    else if (type == "LRate"){
        labelHTML= "Learning Rate: <br>"
    }
    var titleElement = document.getElementById(`${type}_Label`);
    console.log(titleElement.id)
    // Get the text of the selected option
    var selectedOptionText = event.target.textContent;

    if (labelHTML + selectedOptionText != titleElement.innerHTML) {
        titleElement.innerHTML = labelHTML + selectedOptionText;
        fetch('/update_value', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "type": type=='act' ? 'ActivationFunc' : type,
                "value": event.target.id
            })
        })
            .then(response => response.json());
    }
}


// SLIDERS