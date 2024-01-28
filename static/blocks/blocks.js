
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



// Loop through blocks from 1 to 3 (hiding everything)
for (let i = 1; i <= 3; i++) {
    var block = document.getElementById(`block${i}`);
    Blocks[i] = block;
    var Add_block = document.getElementById(`Add_block${i}`);
    AddButtons[i] = Add_block;
    var Minus_block = document.getElementById(`Minus_block${i}`);
    MinusButtons[i] = Minus_block;

    if (block) {
        block.style.setProperty("display", "none");

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
    MinusButtons[i].style.display = "flex";

    if (i < 3) {
        AddButtons[i + 1].style.display = "flex";
    }

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
    if (i < 3) {
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

export var NumBLocks;

// Call the backend


fetch("/get_blocks")
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Request failed.');
        }
    })
    .then(data => {
        // Access the number from the response JSON
        const NumBlocks = data.number;
        console.log("NUMBER " + NumBlocks);
        for (i = 1; i <= NumBlocks; i++) {
            Blocks[i].style.display = "flex";
        }
        if (MinusButtons[NumBlocks] && (NumBlocks > 1)) {
            MinusButtons[NumBlocks].style.display = "flex"
        }
        if (NumBlocks < 3 && AddButtons[NumBlocks]) {
            AddButtons[NumBlocks + 1].style.display = "flex"
        }
    }
    )
    .catch(error => {
        console.error(error);
    });

console.log("Number of Blocks to display: " + NumBLocks)
