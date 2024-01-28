kernel= document.getElementById("KernelGifSlider");
stride= document.getElementById("StrideGifSlider");
padding= document.getElementById("PaddingGifSlider");

kernel.addEventListener("input", () => {handleGifChange(kernel)})
stride.addEventListener("input", () => {handleGifChange(stride)})
padding.addEventListener("input", () => {handleGifChange(padding)})


function handleGifChange(slider) {
    const sliderValue = slider.value;
    const sliderName = slider.id.replace("Slider", "");
    var displayId = slider.id.replace("Slider", "Display");
    var display = document.getElementById(displayId);

    var kernelValue= kernel.value;
    var strideValue= stride.value;
    var paddingValue= padding.value;

    switch (kernelValue){
        case "1":
            kernelValue = "4";
            break;
        case "2":
            kernelValue = "6";
            break;
        case "3":
            kernelValue = "8";
            break;
    }
    if (sliderName=="KernelGif"){
        display.innerHTML = kernelValue
    }
    else if (sliderName=="StrideGif"){
        display.innerHTML = strideValue
    }
    else {
        display.innerHTML = paddingValue
    }

    console.log(kernelValue,strideValue, paddingValue)

    fetch('/get_gif', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "kernel": kernelValue,
            "stride": strideValue,
            "padding": paddingValue
        })
    })
    .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Select the image element and set its src to the new URL
        const imageElement = document.getElementById('cnn-gif');
        imageElement.src = url;
    
        // Optional: Clean up the URL after the image is loaded
        imageElement.onload = () => {
          window.URL.revokeObjectURL(url);
        };
      })
      .catch(e => console.error('Error fetching new image:', e));
}