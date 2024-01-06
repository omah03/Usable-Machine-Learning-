import pickle
import torch
from data import get_dataset
import matplotlib.pyplot as plt
import numpy as np
import base64
from PIL import Image
import io
import torchvision
from torchvision import transforms


#model_file = 'MNIST_classifier_model.pkl'
model_file = 'Trained_modelbuilder_model.pkl'

def is_base64(input_string): 
    #checks if (canvas) image is of type base64
    try:
        # Dekodiere die Eingabe als Base64
        decoded = base64.b64decode(input_string)
        
        # Wenn die Dekodierung erfolgreich war, war die Eingabe Base64
        return True
    except Exception as e:
        # Wenn ein Fehler aufgetreten ist, war die Eingabe kein Base64
        return False




def loadmodel(saved_model):
 
 # load model from pickle file
 with open(saved_model, 'rb') as file:  
     model = pickle.load(file)
 return model
 

def classify_canvas_image(image,modelFile):
    if isinstance(image, str):
        print("removing prefix")
        image = image.split(",")[1]# Entferne das Präfix, um nur die eigentliche Base64-Daten zu behalten
        print("prefix removed")
        print("new image: ", image_b64)
    if is_base64(image):
        

        # Base64 in Bytes konvertieren und dann in ein Bild umwandeln
        image_bytes = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_bytes))

        # Bild in eine Tensorform umwandeln
        preprocessing = torchvision.transforms.Compose([
        torchvision.transforms.Resize((28, 28)),  # Passende Größe für das Modell
        torchvision.transforms.ToTensor(),  # In einen Tensor umwandeln
        #torchvision.transforms.Normalize((0.5, ), (0.5,))  # Normalisierung
        ])        
        
        #print("zwischenstand = ", image.shape)

        #image = preprocessing(image).unsqueeze(0)  # Eine zusätzliche Dimension für die Batchgröße hinzufügen

        # Führe die Transformationen durch (ohne Normalisierung)
        image = preprocessing(image).unsqueeze(0)

        print("before mean shape ", image.shape)
        image = torch.mean(image, dim=1)  # Mittelwert über die RGB-Kanäle

        print("unnormalized image = ", image)
        print("shape normalized image = ", image.shape)
        # Funktion für die Normalisierung nach den anderen Transformationen

        # Normalisierungswerte für das gewünschte Modell
        mean = [0.5]  # Mittelwert für jeden Kanal
        std = [0.5]   # Standardabweichung für jeden Kanal

        mean=[0.1307] #same as in data.py
        std=(0.3081)


        normalize = transforms.Normalize(mean=mean, std=std)

        # Führe dann die Normalisierung durch
        image = normalize(image)


        print("image type (ready for classification?)", type(image))
        print("image is now ready for classification! normalized Image = ", image)
        print("image shape = ", image.shape)
        
        """
        image = image.squeeze(0)  # Entferne die Batch-Dimension
        image = image.squeeze(0)  # Entferne den Kanal, wenn nur ein Kanal vorhanden ist
        image = image[0]  # Wähle das erste Bild aus der Batch aus
        image = image.unsqueeze(0)  # Füge die Batch-Dimension wieder hinzu
        
        print("image new shape = ", image.shape)
        """
    else:
        print("is not base64 but", type(image))

    model = loadmodel(modelFile)
    print("Canvas Image = ", image)
    print("type of image = ", type(image))
    
    #Überprüfung, ob das Bild mehrere Kanäle hat und Auswahl eines Kanals, wenn nötig
    if image.shape[0] > 1:
        image = image[0, :, :]  # Auswahl des ersten Kanals
    
    # Hinzufügen einer Batch-Dimension und Ändern der Tensor-Dimensionen entsprechend den Modellanforderungen
    image = image.unsqueeze(0)  # Annahme: [Batch_Size, Channels, Height, Width]
    #
    print("resized to = ", image.shape)
    model.eval()
    print("image shape = ", image.shape)
    
    print("Classifying sample image...\n")
    
    
    #Show the image and check if the array representation works
    # Konvertiere den Tensor in ein Numpy-Array
    image_np = image.squeeze(0).squeeze(0).numpy()
    print("squeezed image = ", image_np, image_np.shape)
    """
    # Zeige das Bild mit Matplotlib an
    plt.imshow(image_np, cmap='gray')
    plt.axis('off')
    plt.show()
    print("shape after imshow = ", image.shape)
    """

    # Annahme: Das Modell gibt eine Vorhersage für das Bild zurück
    with torch.no_grad():
        output = model(image)
    print("Model prediction:", int(np.argmax(output)))
    
    
    
    print("output = , ", output)
    return int(np.argmax(output))

test = get_dataset(test =True)
image, label = test[0]

print("test Image = ", image)
print("test image shape = ", image.shape)
print("type of test image", type(image))
classify_canvas_image(image,model_file)


""" 
    ##################Plotting
    # Konvertiere den Tensor in ein Numpy-Array
    image_np = image.squeeze(0).squeeze(0).numpy()
    
    # Anzeige des Originalbildes und der Vorhersage
    plt.figure(figsize=(5, 5))
    
    #plt.subplot(1, 2, 1)
    #plt.title(f"Original Image - Label: {label}")
    plt.imshow(image_np, cmap='gray')
    plt.axis('off')
    
    plt.subplot(1, 2, 2)
    plt.title("Model Prediction")
    plt.bar(range(10), torch.softmax(output, dim=1).squeeze().tolist())
    plt.xticks(range(10))
    plt.xlabel("Class")
    plt.ylabel("Probability")
    
    plt.tight_layout()
    plt.show()
    """