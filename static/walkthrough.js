const walkthroughTargets = ['inputbox','rectanglelayer','outputbox','training_params','training_graph','testing_section'];

function changeText(new_text){
    const textElement = document.querySelector('.walkthrough_text');
    textElement.innerText = new_text;
}

function skip_walkthrough(){
    console.log('skip walkthrough...');
    const pagePosition = 4 * window.innerHeight;

    

      // Scrollen Sie zur berechneten Position
      window.scrollTo({
        top: pagePosition,
        behavior: 'smooth' // Fügt eine sanfte Animation hinzu (optional)
      });
    walkthroughTargets.forEach(target => {
        highlight_section(target);
    });
    

    console.log('scrolling abgeschlossen');
}

console.log('new');
document.getElementById('skip_tut').addEventListener('click',skip_walkthrough);


function highlight_section(target_id){
    console.log('highlight_section...')
    const target = document.getElementById(target_id);

    if (target.classList.contains('blurred-section')){
        target.classList.remove('blurred-section');
        console.log('removed blurred');
    } else{
        console.log('target was not blurred');
    }
};

function blurr_all_but(nottarget_id){
    console.log('blurr_all_but...');
    // Füge oder entferne die Klasse "blurred-section" basierend auf dem aktuellen Zustand
    
    walkthroughTargets.forEach(id => {
        if (id == nottarget_id){
            highlight_section(id);
        }else{
            const target = document.getElementById(id);
            if (!target.classList.contains('blurred-section')) {
                target.classList.add('blurred-section');
                console.log('blurred');
            } else{
                console.log('else');
            }
        }
    });
}

function waitForDropdownSelection(desiredOption_id) {
    console.log('waitForDropdownSelection');
    return new Promise(resolve => {
        /*might reuse this if dropdown is actual dropdown and not buttons anymore
        const dropdown = document.getElementById(dropdown_id);
        console.log('const...')
        function handleChange() {
            console.log('handleChange');
            if (dropdown.value === desiredValue) {
                resolve();
                dropdown.removeEventListener('change', handleChange);
            }else{
                console.log('else');
            }
        }             
        */
        document.getElementById(desiredOption_id).addEventListener('click',resolve);
        //dropdown.addEventListener('change', handleChange);
        console.log('EventListener added');
    });
}

function waitForNextButton(){
    return new Promise(resolve => {
        document.getElementById('next_button').addEventListener('click',resolve);

    });
}

async function delay(seconds) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}

async function walkthrough(){
    
    console.log('starting walkthrough...');
    
    //input
    changeText('Der MNIST-Datensatz besteht aus 60.000 Bildern von handgeschriebenen Ziffern. Diese werden später als Trainingsdaten für dein Model verwendet.');
    blurr_all_but('inputbox');
    await waitForNextButton();

    
    
    //modelbuilder
    blurr_all_but('rectanglelayer');
    changeText('Hier kannst du das Neuronale Netz bauen, welches lernen wird, handgeschriebene Ziffern zu klassifizieren. Wenn dich die Parameter genauer interessieren, klicke auf die Fragezeichen. Erstelle ein Modell mit hoher Kernel Complexity, ReLu als Aktivierungsfunktion und 3 Blöcken um fortzufahren.');

    await waitForDropdownSelection('act_reluOption');
    await delay(2);


    //output

    blurr_all_but('outputbox');
    changeText('Die letzte Schicht des Modells wird jedes Eingabebild auf eine Ziffer abbilden können.');
    await waitForNextButton();
    

    //trainingparams -> activity

    //trainingViz -> next

    //testing -> activity


    //blurr_section('inputbox');
    //blurr_all_but('rectanglelayer');

    //blurr_section('outputbox');

    //blurr_section('training_params');

    //blurr_section('training_graph');

    //blurr_section('testing_section');
}



document.addEventListener('DOMContentLoaded', walkthrough);