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
    titleElement.innerHTML = "Activation Function: <br>" +selectedOptionText;

// Call a function or perform an action based on the selected option
switch (selectedOptionText) {
    case "Retified Linear Activation (ReLU)":
        // Call a function for ReLU activation
        // Example: performReLUActivation();
        break;
    case "Logistics (Sigmoid)":
        // Call a function for Sigmoid activation
        // Example: performSigmoidActivation();
        break;
    case "Hyperbolic Tangent (tanh)":
        // Call a function for tanh activation
        // Example: performTanhActivation();
        break;
    default:
        // Handle any other cases or do nothing
        break;
}}

// Add a "click" event listener to the dropdown options
act_reluOption.addEventListener("click", handleActivationFunctionChange);
act_sigmoidOption.addEventListener("click", handleActivationFunctionChange);
act_tanhOption.addEventListener("click", handleActivationFunctionChange);


//------------------------------------------------------------------
//Sliders
const sliders= ["LRateSlider", "BSizeSlider", "NEpochsSlider", "KSizeSlider", "StrideSlider"];

for (const slider of sliders) {
    SliderElement= document.getElementById(slider);
    SliderElement.addEventListener("input", (event)=> {updateSliderValue(event.target);});
    updateSliderValue(SliderElement);
}


function updateSliderValue(slider) {
    const sliderValue= slider.value;
    const sliderName = slider.id.replace("Slider", "");
    var  displayId = slider.id.replace("Slider", "Display");
    var display = document.getElementById(displayId);

    display.innerHTML=("0000"+sliderValue.toString()).slice(-3)
    
    // Call the backend
    fetch('/update_value', {
        method:'POST',
        headers :{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"type": sliderName,
                "value": sliderValue})
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


var Blocks=[];
//get input block
Blocks[0]= document.getElementById("inputbox");

var MinusButtons=[""]; //leave first empty so index matches
var AddButtons=[""];


// Loop through blocks from 1 to 5 (hiding everything)
for (let i = 1; i <= 5; i++) {
    var block = document.getElementById(`block${i}`);
    Blocks[i]=block;
    var Add_block = document.getElementById(`Add_block${i}`);
    AddButtons[i]=Add_block;
    var Minus_block = document.getElementById(`Minus_block${i}`);
    MinusButtons[i]=Minus_block;
    
    if (block) {
      block.style.setProperty("display", "none");
    }
  
    if (Add_block) {
      Add_block.style.setProperty("display", "none");
      Add_block.addEventListener("click", () => {
        Blocks[i].style.display="flex";
        AddButtons[i].style.display="none";
        if (i<5){
        AddButtons[i+1].style.display="flex";}
        
        MinusButtons[i].style.display="flex";
        if (i>1){
        MinusButtons[i-1].style.display="none";}

        }
    );
    }
    
    if (Minus_block) {
      Minus_block.style.setProperty("display", "none");
      Minus_block.addEventListener("click", () => {
        Blocks[i].style.display="none";
        AddButtons[i].style.display="flex";
        if (i<5){
        AddButtons[i+1].style.display="none";}
        
        MinusButtons[i].style.display="none";
        if (i>1){
        MinusButtons[i-1].style.display="flex";}

            }
        );
    }
  }


Blocks[1].style.display="flex";

Blocks[2].style.display="flex";

MinusButtons[2].style.display="flex";

AddButtons[3].style.display="flex";




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