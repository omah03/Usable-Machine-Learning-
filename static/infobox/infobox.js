DEFAULT_STRING= "Click anything with the i icon to get more information about it!"

const hide = document.getElementById("hide");
const show_more = document.getElementById("show_more")
const infobox = document.getElementById("infobox");
var infotext = document.getElementById("infotext");

if (infobox&&infotext){ infotext.innerHTML = DEFAULT_STRING;}
else { infotext.innerHTML = "infobox Loading failed";}

current_infotext= "default";

if (hide) {
    hide.addEventListener("click", () => {
        infobox.style.display = "none";
    })
}

if (show_more){
    show_more.addEventListener("click", () => {
        switch (current_infotext){
            case "inputbox":
                window.open("https://de.wikipedia.org/wiki/MNIST-Datenbank")
            default: 
                console.log("Nothing to show!")
        }
    })
}

const elementIDs= ["inputbox", "block1", "block2", "block3", "block4", "block5", "outputbox", "actFuncCol", "LRateCol","EpochsCol", "BSizeCol"]

for( const ID of elementIDs)
{
    var element= document.getElementById(ID);
    if (element){
        element.innerHTML= '<img class = "info-small" width= "25px" src="../static/include/Images/info.png" alt="Information Box">'
                            + element.innerHTML

        element.addEventListener("click", () => { changeInfoText(ID); })

    }
    
}

window.addEventListener("scroll", () => {
    if (infobox){
        infobox.style.display="none";
    }
})

function positionInfobox(element){
    element.parentNode.appendChild(infobox);
    
    ElementRect = element.getBoundingClientRect();

    InfoboxRect = infobox.getBoundingClientRect();

    vheight= window.innerHeight;
    vwidth= window.innerWidth;

    infoheight= InfoboxRect.height;
    infowidth= InfoboxRect.width;

    CanFitLeftBound = ElementRect.left + InfoboxRect.width < vwidth * 0.9;
    leftNUM = (CanFitLeftBound) ? ElementRect.left: ElementRect.right - InfoboxRect.width;

    CanFitBelow = ElementRect.bottom + InfoboxRect.height < vheight * 0.9;
    topNUM = (CanFitBelow) ? ElementRect.bottom : ElementRect.top - InfoboxRect.height
    
    // Special cases
    if (element.id == "actFuncCol"){
        topNUM = ElementRect.top - InfoboxRect.height;
    }

    infobox.style.position = "fixed";
    infobox.style.top = topNUM + "px";
    infobox.style.left= leftNUM +"px"; 
    infobox.focus();
}

function changeInfoText(elementID) {
    if (infobox) {
    element = document.getElementById(elementID);
    
    if (!element){
        console.log("ABORTING")
        return
    }
    positionInfobox(element);
    
    // Trigger the highlight animation and change the text
    infobox.classList.add('highlight');
    fetch('/infotext', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "item":elementID
        })
    })
        .then(response => response.json())
        .then(data => {
            current_infotext= elementID;
           infotext.innerHTML = data;
        });
    infobox.style.display="flex";
    infobox.focus();
    // Remove the highlight after some time
    setTimeout(function () {
        infobox.classList.remove('highlight');
    }, 1000); // Duration should match the animation duration in CSS
    }
}
