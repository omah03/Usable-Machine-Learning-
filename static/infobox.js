
const infobox = document.getElementById("infobox");

hide = document.getElementById("hide")
inputbox = document.getElementById("inputbox")


if (inputbox && hide) {
    hide.addEventListener("click", () => {
        infobox.style.display = "none";
    })

    inputbox.addEventListener("click", () => { changeInfoText("inputbox"); }
    )
}


function changeInfoText(elementID) {
    if (infobox) {
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
}
