const walkthroughTargets = ['inputbox','rectanglelayer','outputbox','training_params','training_graph','testing_section'];




function scrollTo_page(page_nr){
    console.log('scrollTo_page...');
    const pagePosition = page_nr * window.innerHeight;

    

      // Scrollen Sie zur berechneten Position
      window.scrollTo({
        top: pagePosition,
        behavior: 'smooth' // Fügt eine sanfte Animation hinzu (optional)
      });
    

    console.log('scrolling abgeschlossen');
}



function highlight_section(target_id){
    console.log('highlight_section...' + target_id)
    const target = document.getElementById(target_id);

    if (target.classList.contains('blurred-section')){
        target.classList.remove('blurred-section');
        console.log('removed blurred');
    } else{
        console.log('target was not blurred');
    }
};

function blurr_all_but(nottarget_ids){
    console.log('blurr_all_but...');
    // Füge oder entferne die Klasse "blurred-section" basierend auf dem aktuellen Zustand
    
    walkthroughTargets.forEach(id => {
        if (nottarget_ids.includes(id)){
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

function waitForClick(button_id){
    showElement(button_id);
    console.log('wait for click...');
    return new Promise(resolve => {
        document.getElementById(button_id).addEventListener('click',resolve);
    });
}


function changeText(speech_bubble_id,new_text){
    console.log('changeText...');
    var speechBubble = document.getElementById(speech_bubble_id);
    //speechBubble.innerText = new_text;
    var textElement = speechBubble.querySelector('.walkthrough_text');
    textElement.innerText = new_text;
    //speechBubble.innerHTML = '<p class="walkthrough_text">' + new_text + '</p>';
    console.log('Text changed');
}

function removeElement(element_id){
    console.log('removeBubble...');
    const element = document.getElementById(element_id);
    if (element) {
        element.style.display = 'none';
    }

}

function showElement(element_id){
    console.log('showBubble...' + element_id);
    const element = document.getElementById(element_id);
    if (element) {
        element.style.display = 'block';
        highlight_section(element_id);
    }
}


function sliderCondition(slider_id,value){
    var slider = document.getElementById(slider_id);
    console.log('sldiercond');
    console.log('slider value = ' + slider.value);
    var condition = slider.value == value;
    return condition;
}



function conditions(keyword){
    var numBlocks_condition = block1.style.display == 'flex' && block2.style.display == 'none';
    var act_fun = document.getElementById('act_Label').innerText.slice(-6)=='(ReLU)';
    var sliderConditions = sliderCondition('KSizeSlider', '3');
    
    if(keyword == 'training'){
        var sliderConditions = sliderConditions && sliderCondition('LRateSlider','4') && sliderCondition('BSizeSlider','256') && sliderCondition('NEpochsSlider','1');

    }
    
    console.log(document.getElementById('act_Label').innerText.slice(-6)=='(ReLU)');
    console.log(numBlocks_condition + 'fun = ' + act_fun );
    return numBlocks_condition && act_fun && sliderConditions;
}




async function anyAction(keyword){



    return new Promise(resolve => {
        
        //THIS SECTION IS FOR TESTS
        function checkConditions(){
            console.log('successful');
        
            if(conditions(keyword)){
                console.log('resolving...');
                resolve();
            }
        }
        document.getElementById('act_reluOption').addEventListener('click',checkConditions);
        document.getElementById('KSizeSlider').addEventListener('input',checkConditions);
        document.getElementById('Minus_block2').addEventListener('click',checkConditions);
        document.getElementById('LRateSlider').addEventListener('click',checkConditions);
        document.getElementById('BSizeSlider').addEventListener('click',checkConditions);
        document.getElementById('NEpochsSlider').addEventListener('click',checkConditions);        
    })
}



async function bubbleRoutine(keyword){
    console.log('bubbleRoutine...' + keyword);
    var walkthrough = {
        /*key: [[targets],BubbleId,BubbleText,button_id,[slider_ids],[slider_values]] */
        'input':[['inputbox'],'modelbuilder_speech_bubble','Der MNIST-Datensatz besteht aus 60.000 Bildern von handgeschriebenen Ziffern. Diese werden später als Trainingsdaten für dein Model verwendet.','next_button'],
        'modelbuilder':[['rectanglelayer'],'modelbuilder_speech_bubble','Hier kannst du das Neuronale Netz bauen, welches lernen wird, handgeschriebene Ziffern zu klassifizieren. Wenn dich die Parameter genauer interessieren, klicke auf die Fragezeichen. Erstelle ein Modell mit hoher Kernel Complexity, ReLu als Aktivierungsfunktion und 3 Blöcken um fortzufahren.','next_button'],
        'output':[['outputbox'],'modelbuilder_speech_bubble','Die letzte Schicht des Modells wird jedes Eingabebild auf eine Ziffer abbilden können.','next_button'],
        'training':[['training_params'],'training_speech_bubble','Hier kannst du die Parameter für das Training anpassen. Wähle eine Lernrate von 0.01, eine Batchgröße von 256 und 1 Epoche aus und klicke zum Fortfahren auf Start.',"starttraining"],
        'graph':[['training_graph','training_params'],'training_graph_speech_bubble',"Dieser Graph zeigt dir, wie sich die Performance des Modells im Laufe des Trainings verändert. Sobald das Training abgeschlossen ist, klicke auf 'next'",'graph_next_button'],
        'testing':[['testing_section'],'testing_speech_bubble','Das Modell wurde fertig trainiert. Jetzt kannst du selber eine Ziffer zeichnen, um sie von deinem Modell klassifizieren zu lassen.','classify']
    }
    var target_ids = walkthrough[keyword][0];
    var bubble_id = walkthrough[keyword][1];
    var bubble_text = walkthrough[keyword][2];
    var button_id = walkthrough[keyword][3];
    var slider_ids = walkthrough[keyword[4]];
    var slider_values = walkthrough[keyword[5]];


    console.log(target_ids);
    console.log(bubble_id);
    console.log(bubble_text);
    console.log(slider_ids);
    console.log(slider_values);

    console.log('init successful.');
    
    //show Speechbubble
    showElement(bubble_id);
    console.log('show done');
    
    //show SpeechBubble Text
    changeText(bubble_id, bubble_text);
    console.log('change done');
    
    //blurr other sections
    blurr_all_but(target_ids);
    console.log('blurr done');

    //CheckConditions
    if(keyword == 'input' || keyword == 'output'){
        //show next button directly
        await waitForClick(button_id);
    }
    else if(keyword == 'modelbuilder'){
        //relu, kernelCompl,#blocks selection
        await anyAction(keyword);
        await waitForClick(button_id);

    }
    else if(keyword == 'training'){
        //lr, bs, e selection -> then show and wait for start button
        console.log('training');
        console.log('button_id = ' + button_id);
        var button = document.getElementById(button_id);
        if (button){
            console.log('yes');
        }else{
            console.log('no');

        }
        button.classList.add('avoid-clicks');
        console.log('avoid-clicks');
        await anyAction(keyword);
        button.classList.remove('avoid-clicks');
        console.log('ready for click');
        await waitForClick(button_id);
    }else if(keyword == 'graph'){
        //wait until training has finished -> then show and wait for next button
        await waitForClick(button_id);

    }else if(keyword == 'testing'){
        //wait for drawing -> then show and wait for classify button
        await waitForClick(button_id);
        //Special Case for last step only

        changeText(bubble_id,'Geschafft! Die Rotfärbung der Pixel gibt diejenigen Pixel an, die besonders ins Gewicht fallen. Probiere jetzt gerne noch weiter rum :)');
        showElement('testing_next_button');
        await waitForClick('testing_next_button');
        removeElement('testing_next_button');
    }else{
        throw new Error("An invalid keyword was given!");
    }

    //hide Speechbubble
    removeElement(bubble_id);
    console.log('remove done');

    console.log('bubbleRoutine end');
}

async function walkthrough(){
    console.log('starting walkthrough...');

    //input section
    await bubbleRoutine('input');
    

    console.log('bubble 1');
    
    //modelbuilder section
    removeElement('next_button');
    await bubbleRoutine('modelbuilder');

    console.log('bubble2');

    //output section
    showElement('next_button');
    await bubbleRoutine('output');

    //training params section
    scrollTo_page(5);
    await bubbleRoutine('training');

    //graph section
    await bubbleRoutine('graph');
    console.log('endddd');

    //testing section
    await bubbleRoutine('testing');

    walkthroughTargets.forEach(id => highlight_section(id));
    document.getElementById('skip_tut').innerText ='Start Tutorial';

}

async function skip_start_walkthrough(){
    console.log('skip/start walkthrough...');

    scrollTo_page(4);
    var skip_button_label = document.getElementById('skip_tut').innerText;
    if(skip_button_label =='Start Tutorial'){
        console.log('if');
        document.getElementById('skip_tut').innerText ='Skip Tutorial';
        await walkthrough();
    } else{
        console.log('else');
        console.log(skip_button_label);
        removeElement('modelbuilder_speech_bubble');
        walkthroughTargets.forEach(target => {
        highlight_section(target); 
        });
        const starttraining_button = document.getElementById('starttraining')
        if(starttraining_button.classList.contains('avoid-clicks')){
            starttraining_button.classList.remove('avoid-clicks');
        }
        document.getElementById('skip_tut').innerText ='Start Tutorial';
    }
    
}


document.getElementById('skip_tut').addEventListener('click', skip_start_walkthrough);
document.addEventListener('DOMContentLoaded', walkthrough);
