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
            case "Retified Linear Activation (ReLU)":
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


//------------------------------------------------------------------
//Sliders
const sliders = ["LRateSlider", "BSizeSlider", "NEpochsSlider", "KSizeSlider", "StrideSlider"];

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
        block.addEventListener("click", ()=> {
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

textOptions={"block": "This is a convolutional block. It consists of a convolutial Layer, a non-linear activation function and a MaxPoolLayer.",
            "block1": "Its input is a batch of $batch_size$ grayscale images of the dataset. These images are 28 x 28 pixels. <br> Its output depends on the Kernel Size and stride parameters. <br> Input: $batch_size$ x 1 x 28 x28 <br> Output: $block1_output$",   
            "block2": "Its input is the output of the previous block. <br> Its output depends on the Kernel Size and stride parameters. <br> Input: $block1_output$ <br> Output: $block2_output$" 
        };   

const infotext = document.getElementById("infotext");
const infobox= document.getElementById("infobox");

document.getElementById("hide").addEventListener("click", ()=>{
    infobox.style.display="none";
})

function changeInfoText(elementID){
    infobox.style.display="flex";
    element= document.getElementById(elementID);
    if (element && element.style.display=="flex"){
    if (elementID=="block1"){
        infotext.innerHTML=textOptions["block"]+textOptions["block1"];
    }
    else if (elementID=="inputbox")
    {

    }
    else {
        infotext.innerHTML=textOptions["block"]+textOptions["block2"];
    }
}
}



//------------------------------------------------------------------
//CONTROLS

const buttonList=["start","pause", "restart", "continue", "save", "load"];

//TRAINING CONTROLS
for (const button of buttonList){
    ButtonElement= document.getElementById(button+"training");
    ButtonElement.addEventListener("click", () => {
        handleButton(button+"training");
    });
}

//TESTING CONTROLS
for (const button of buttonList){
    ButtonElement= document.getElementById(button+"test");
    ButtonElement.addEventListener("click", () => {
        handleButton(button+"test");
    });
}


function handleButton(buttonName){
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




/*


// Function to disable slider and button when button is pressed
playButton.addEventListener('click', function () {
    startTraining();
    slider.disabled = true;
    playButton.disabled = true;
    print("TEST SUCCES")
});

// Function to update accuracy value on the page
function updateAccuracy() {
    fetch("/get_accuracy")
        .then(response => response.json())
        .then(data => {
            accuracyElement.textContent = data.acc;
        });
}

// Function to update slider value display
function updateSliderValue() {
    sliderValueElement.textContent = slider.value;
}

// Function to start training
function startTraining() {
    fetch("/start_training", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(response => response.json())
}

// Update accuracy every second
setInterval(function() {
    updateAccuracy();
}, 1000);

// Function to change seed value when slider is changed
slider.addEventListener("input", function() {
    updateSliderValue();
    fetch("/update_seed", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "seed=" + slider.value
    });
});
*/