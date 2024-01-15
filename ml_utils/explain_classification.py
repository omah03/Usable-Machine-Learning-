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
from torchinfo import summary


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


def preprocess_image(image):
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

        image = torch.mean(image, dim=1)  # Mittelwert über die RGB-Kanäle

        # Funktion für die Normalisierung nach den anderen Transformationen

        # Normalisierungswerte für das gewünschte Modell
        mean=[0.1307] #same as in data.py
        std=(0.3081)

        normalize = transforms.Normalize(mean=mean, std=std)

        # Führe dann die Normalisierung durch
        image = normalize(image)

    else:
        print("is not base64 but", type(image))
    #Überprüfung, ob das Bild mehrere Kanäle hat und Auswahl eines Kanals, wenn nötig
    if image.shape[0] > 1:
        image = image[0, :, :]  # Auswahl des ersten Kanals
    
    # Hinzufügen einer Batch-Dimension und Ändern der Tensor-Dimensionen entsprechend den Modellanforderungen
    image = image.unsqueeze(0)  # Annahme: [Batch_Size, Channels, Height, Width]
    
    return image

def showim(image):
    # Zeige das Bild mit Matplotlib an
    
    plt.imshow(image, cmap='gray')
    plt.axis('off')
    plt.show()

def saveim(image):
    from PIL import Image
    import numpy as np

    # Ihr 28x28 Numpy-Bild (Beispiel)
    #np_image = np.random.randint(0, 256, (28, 28))  # Hier wird ein zufälliges Bild erzeugt
    if isinstance(image, torch.Tensor):
        image = image.numpy()
    image = image.reshape(28, 28)  # Beispiel: Ändern Sie die Form auf (28, 28), falls nötig
    # Konvertieren Sie das Numpy-Bild in ein PIL-Image
    pil_image = Image.fromarray(image.astype('uint8'))

    # Speichern Sie das PIL-Image als JPG-Datei
    file_path = 'mein_bild.jpg'
    pil_image.save(file_path)



def classify_canvas_image(image,modelFile):
    
    
    """This function classifies the image and sends the heatmap (aka explanation) back to frontend"""
    model = loadmodel(modelFile)
    image = preprocess_image(image)
    print(type(image))
    print(image.requires_grad)
    if __name__ != "__main__":
        image.requires_grad = True

    model.eval()
    
    print("Classifying sample image...\n")
    
    
    #Show the image and check if the array representation works
    # Konvertiere den Tensor in ein Numpy-Array
    #image_np = image.squeeze(0).squeeze(0).numpy()
    image_np = image.squeeze(0).squeeze(0).detach().numpy()# diese version für explainable part
    showim(image_np)


    #assert image.requires_grad == True, "image.requires_grad is not True"
    # Annahme: Das Modell gibt eine Vorhersage für das Bild zurück
    #showim(image_np)

    assert image.requires_grad == True, "image.requires_grad is False!"
    
    #with torch.no_grad():
    output_tensor = model(image)
    output_class = torch.argmax(output_tensor).item()  # Annahme: Bestimmung der vorhergesagten Klasse


    """the following section is for 'explaining' the canvas classification"""
    print("start explaining...")
    model.zero_grad()
    summary(model,input_size= (1,1,28,28))
    print(model.conv_layers[-1].conv)
    print(model.conv_layers[-1].conv.weight)
    #output_tensor.requires_grad == True
    assert output_tensor.requires_grad == True, "output_tensor.requires_grad is False!"
    assert isinstance(output_class,int), "output_class is not of type int"
    output_tensor[0, output_class].backward()
    
    # Feature Maps der letzten Convolutional Layer und Gradienten erhalten
    gradients = model.conv_layers[-1].conv.weight.grad
    print("gradients",gradients, gradients.shape, len(gradients))    

    pooled_gradients = torch.mean(gradients, dim=[1, 2, 3])
    activations = model.conv_layers[-1].conv(image).detach()
    print("activations", activations, activations.shape, len(activations))
    print(activations[:,1,:,:])
    print("pooled_gradients", pooled_gradients, pooled_gradients.shape, len(pooled_gradients))

    for i in range(activations.size(1)):
        activations[:, i, :, :] *= pooled_gradients[i]

    # Heatmap generieren
    heatmap = torch.mean(activations, dim=1).squeeze()
    heatmap = np.maximum(heatmap, 0)
    heatmap /= torch.max(heatmap)

    # Heatmap auf Originalbild überlagern
    heatmap = heatmap.numpy()

    #img = image.detach().numpy().convert('RGB')

    #img = Image.open('mein_bild.jpg').convert('RGB')
    #img = img.resize((28, 28))
    heatmap = np.uint8(255 * heatmap)
    heatmap = Image.fromarray(heatmap, 'L')
    heatmap = heatmap.resize((image.size(2), image.size(3)), Image.BILINEAR)
    heatmap = np.array(heatmap).tolist()

    """end of section"""


    plt.imshow(heatmap, alpha = 0.5, cmap='jet')
    plt.show()

    output_array = output_tensor.flatten().detach().numpy()
    output = output_array.tolist()

    print("explaining is done.")

    
    print("output_class:", int(np.argmax(output)))
    print("output = , ", output)
    print("updated heatmap version")
    return output, heatmap


if __name__ == "__main__":
    print("testing....")
    test = get_dataset(test =True)
    for i in range(10,11):
        image, label = test[i]

        saveim(image)
        
        image.requires_grad = True  # Setzen von requires_grad auf True (für explainable part)
    
        model_file = 'Trained_modelbuilder_model.pkl'#'MNIST_new_classifier_model.pkl'#
        _ , heatmap = classify_canvas_image(image,model_file)

        print("final heatmap", heatmap, type(heatmap), len(heatmap),len(heatmap[1]),len(heatmap[5]))
        plt.imshow(heatmap, cmap='jet')
        plt.show()

