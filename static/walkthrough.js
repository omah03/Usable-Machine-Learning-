function skip_walkthrough(){
    console.log('skip walkthrough...');

    const pagePosition = 4 * window.innerHeight;

      // Scrollen Sie zur berechneten Position
      window.scrollTo({
        top: pagePosition,
        behavior: 'smooth' // Fügt eine sanfte Animation hinzu (optional)
      });

    console.log('scrolling abgeschlossen');
}

console.log('new');
document.getElementById('skip_tut').addEventListener('click',skip_walkthrough);

