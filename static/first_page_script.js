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
