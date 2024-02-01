// assign labels to thier respective elements as attributes
var labels = document.getElementsByTagName('LABEL');
for (var i = 0; i < labels.length; i++) {
    if (labels[i].htmlFor != '') {
         var elem = document.getElementById(labels[i].htmlFor);
         if (elem)
            elem.label = labels[i];         
    }
}

DEFAULT_STRING = "Click anything with the i icon to get more information about it!"

var infoboxShown = false;
const infobox = document.getElementById("infobox");

vheight = window.innerHeight;
vwidth = window.innerWidth;
var infoheight = 0.3 * vheight;
var infowidth = 0.3 * vwidth;



const hide = document.getElementById("hide");
const show_more = document.getElementById("show_more")
var infotext = document.getElementById("infotext");

if (infobox && infotext) { infotext.innerHTML = DEFAULT_STRING; }
else { infotext.innerHTML = "infobox Loading failed"; }

current_infotext = "default";

if (hide) {
    hide.addEventListener("click", removeInfoboxOnAnyClick)
}

if (show_more) {
    show_more.addEventListener("click", () => {
        switch (current_infotext) {
            case "inputbox":
                window.open("https://de.wikipedia.org/wiki/MNIST-Datenbank")
            default:
                console.log("Nothing to show!")
        }
    })
}

const elementIDs = ["inputbox", "ConvInfo1", "ActFuncInfo1", "MaxPoolInfo1", 
                                "ConvInfo2", "ActFuncInfo2", "MaxPoolInfo2",
                                "ConvInfo3", "ActFuncInfo3", "MaxPoolInfo3",
"outputbox", "actFunc", "LRateSlider", "NEpochsSlider", "BSizeSlider", "KSizeSlider"]

for (const ID of elementIDs) {
    var element = document.getElementById(ID);
    if (element && element.label) {
        element.label.innerHTML = element.label.innerHTML + ` <button class = "info-small" id="infoIcon_${ID}">
                                        <img width = "100%"src="../static/include/Images/info.png" alt="Information Box">
                                    </button>`

        infoicon= document.getElementById(`infoIcon_${ID}`)
        infoicon.left = 0;
        infoicon.top = 0;
        infoicon.addEventListener("click", () => { changeInfoText(ID); })

    }

}

window.addEventListener("scroll", () => {
    if (infobox) {
        infobox.style.display = "none";
    }
})

function positionInfobox(elementID) {
    element= document.getElementById(elementID.replace("Slider", "Col"))
    element.parentNode.appendChild(infobox);

    ElementRect = element.getBoundingClientRect();

    //InfoboxRect = infobox.getBoundingClientRect();

    vheight = window.innerHeight;
    vwidth = window.innerWidth;
    infoheight = 0.3 * vheight;
    infowidth = 0.3 * vwidth;



    // if (infoheight==0 || !infoheight){
    // InfoboxRect = infobox.getBoundingClientRect()
    // var infoheight    = InfoboxRect.height;
    // var infowidth     = InfoboxRect.width;
    // }

    CanFitLeftBound = ElementRect.left + infowidth < vwidth * 0.9;

    CanFitBelow = ElementRect.bottom + infoheight < vheight * 0.9;

    infobox.style.position = "fixed";

    if (CanFitBelow && element.id != "actFunc") {
        infobox.style.top = ElementRect.bottom + "px";
    }
    else {
        infobox.style.top = ElementRect.top - infoheight + "px";
    }

    if (CanFitLeftBound) {
        infobox.style.left = ElementRect.left + "px";
    }
    else {
        infobox.style.left = ElementRect.right - infowidth + "px";
    }
    infobox.focus();
}

function changeInfoText(elementID) {
    infobox.style.display = "flex"
    if (infobox) {
        element = document.getElementById(elementID);
        if (!element) {
            console.log("ABORTING")
            return
        }
        positionInfobox(elementID);

        // Trigger the highlight animation and change the text
        infobox.classList.add('highlight');
        fetch('/infotext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "item":elementID.replace(/[0-9]/g, ''),

            })
        })
            .then(response => response.json())
            .then(data => {
                current_infotext = elementID;
                infotext.innerHTML = data;
            });
        infobox.style.display = "flex";
        infobox.focus();
        // Remove the highlight after some time
        setTimeout(function () {
            infoboxShown = true;
        }, 100);
        setTimeout(function () {
            infobox.classList.remove('highlight');
        }, 1000); // Duration should match the animation duration in CSS
    }
}

function removeInfoboxOnAnyClick(event) {
    isClickableElement = false
    for (const el of elementIDs){
        element= document.getElementById(el.replace("Slider", "Col"));
        if (element && element.contains(event.target)){
            isClickableElement=true;
    }}
    if (infoboxShown && !isClickableElement){
    if (!infobox.contains(event.target) || event.target.id == "hide" ) {
        infobox.style.display = "none";
        infoboxShown = false;
    }}
}

sections= document.getElementsByTagName("section")
for (const sec of sections){
    sec.addEventListener("click",removeInfoboxOnAnyClick);
}