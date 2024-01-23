const walkthroughTargets = ['inputbox','rectanglelayer','outputbox','training_params','training_graph','testing_section'];

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

function blurr_section(target_id){
    console.log('blurr_section...');
    const target = document.getElementById(target_id);
    // Füge oder entferne die Klasse "blurred-section" basierend auf dem aktuellen Zustand
    if (!target.classList.contains('blurred-section')) {
        target.classList.add('blurred-section');
        console.log('blurred');
    } else{
        console.log('else');
    }

}

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

function walkthrough(){
    
    console.log('starting walkthrough...');
    //Der MNIST-Datensatz besteht aus 60.000 Bildern von handgeschriebenen Ziffern. Diese werden später als Trainingsdaten für dein Model verwendet. 
    //blurr_section('inputbox');
    blurr_section('rectanglelayer');

    //blurr_section('outputbox');

    //blurr_section('training_params');

    blurr_section('training_graph');

    blurr_section('testing_section');



}

walkthrough();