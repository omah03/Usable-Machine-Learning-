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

const infotext = document.getElementById("infotext");
const infobox = document.getElementById("infobox");

document.getElementById("hide").addEventListener("click", () => {
    infobox.style.display = "none";
})

document.getElementById("inputbox").addEventListener("click", () => { changeInfoText("inputbox"); }
)

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

var mnist= document.getElementById("inputbox")
var rec_layer= document.getElementsByClassName("rectanglelayer")[0]
var classifier=  document.getElementById("outputbox")


new LeaderLine(mnist, rec_layer,{ color: 'black', size: 10 })

new LeaderLine(rec_layer,classifier,{ color: 'black', size: 10 })

//------------------------------------------------------------------
//Classifier arrows UGLY FUCKING SOLUTION I HATE THIS

inputs = (document.getElementsByClassName("classifier_input"));
classes = (document.getElementsByClassName("classifier_class"));

console.log(inputs.length);

for (let i = 0; i < inputs.length; i = i + 1) {

    for (let j = i%2; j < 10; j = j + 2) {
        new LeaderLine(
            inputs[i], classes[j],
            { color: 'black', size: 1 }
        );
    }

}