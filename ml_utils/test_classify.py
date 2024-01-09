import pickle
import torch
from data import get_dataset
import matplotlib.pyplot as plt
import numpy as np
import base64
from PIL import Image
import io
import torchvision
from torchvision import transforms, models
import torch.nn.functional as F


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
 

def showim(image):
    # Zeige das Bild mit Matplotlib an
    plt.imshow(image, cmap='gray')
    plt.axis('off')
    plt.show()


def classify_canvas_image(image,modelFile):
    if isinstance(image, str):
        print("removing prefix")
        image = image.split(",")[1]# Entferne das Präfix, um nur die eigentliche Base64-Daten zu behalten
        print("prefix removed")
        print("new image: ", image)
    if is_base64(image):
        

        # Base64 in Bytes konvertieren und dann in ein Bild umwandeln
        image_bytes = base64.b64decode(image)
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
        mean=[0.1307] #same as in data.py
        std=(0.3081)

        normalize = transforms.Normalize(mean=mean, std=std)

        # Führe dann die Normalisierung durch
        image = normalize(image)
        
    else:
        print("is not base64 but", type(image))

    model = loadmodel(modelFile)
    
    #Überprüfung, ob das Bild mehrere Kanäle hat und Auswahl eines Kanals, wenn nötig
    if image.shape[0] > 1:
        image = image[0, :, :]  # Auswahl des ersten Kanals
    
    # Hinzufügen einer Batch-Dimension und Ändern der Tensor-Dimensionen entsprechend den Modellanforderungen
    image = image.unsqueeze(0)  # Annahme: [Batch_Size, Channels, Height, Width]
    #
    model.eval()
    
    print("Classifying sample image...\n")
    
    
    #Show the image and check if the array representation works
    # Konvertiere den Tensor in ein Numpy-Array
    #image_np = image.squeeze(0).squeeze(0).numpy()
    image_np = image.squeeze(0).squeeze(0).detach().numpy()# diese version für explainable part

    showim(image_np)
    
    
    with torch.no_grad():
        output_tensor = model(image)
        output_class = torch.argmax(output_tensor)  # Annahme: Bestimmung der vorhergesagten Klasse

    output_array = output_tensor.flatten().numpy()
    output = output_array.tolist()
    print("output = , ", output)
    print("output_class:", output_class)

    return output


if __name__ == "__main__":
    print("testing....")
    test = get_dataset(test =True)
    image, label = test[0]

    image.requires_grad = True  # Setzen von requires_grad auf True (für explainable part)

    model_file = 'Trained_modelbuilder_model.pkl'#'MNIST_new_classifier_model.pkl'#
    print(classify_canvas_image(image,model_file))
