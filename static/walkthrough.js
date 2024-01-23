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

function waitForDropdownSelection(dropdown_id,desiredValue) {
    console.log('waitForDropdownSelection');
    return new Promise(resolve => {
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

        dropdown.addEventListener('change', handleChange);
        console.log('EventListener added');
    });
}

async function walkthrough(){
    
    console.log('starting walkthrough...');
    /*
    //input
    changeText('Der MNIST-Datensatz besteht aus 60.000 Bildern von handgeschriebenen Ziffern. Diese werden später als Trainingsdaten für dein Model verwendet.');
    blurr_all_but('inputbox');
    

    await new Promise(resolve => {
        document.getElementById('next_button').addEventListener('click', resolve);
      });
    */
    blurr_all_but('rectanglelayer');
    changeText('Hier kannst du das Neuronale Netz bauen, welches lernen wird, handgeschriebene Ziffern zu klassifizieren. Wenn dich die Parameter genauer interessieren, klicke auf die Fragezeichen. Erstelle ein Modell mit hoher Kernel Complexity, ReLu als Aktivierungsfunktion und 3 Blöcken um fortzufahren.');

    await waitForDropdownSelection('act_dropdown','relu');


    console.log('continue');
    blurr_all_but('outputbox');
    changeText('testest');
    
    //output

    //modelbuilder-> activity

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

function next(){
    console.log('next walkthrough step...');
}

document.getElementById('next_button').addEventListener('click',next)

document.addEventListener('DOMContentLoaded', walkthrough);