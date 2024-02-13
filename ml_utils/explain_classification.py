
import sys
import pickle
import torch
from ml_utils.data import get_dataset
import matplotlib.pyplot as plt
import numpy as np
import base64
from PIL import Image
import io
import torchvision
from torchvision import transforms, models
import torch.nn.functional as F
from torchinfo import summary

from torchcam.methods import SmoothGradCAMpp
from torchcam.utils import overlay_mask
import torchvision.transforms as transforms
import torchvision
from torchvision.transforms.functional import to_pil_image
import matplotlib.pyplot as plt



print(sys.path)


def show_linear_filters(model, layer_index=0, num_filters=10):
    # Extrahiere die Gewichte der ersten linearen Schicht
    layer = model.linear_layers[layer_index].linear
    if isinstance(layer, torch.nn.Linear):
        weights = layer.weight.data.cpu().numpy()
        
        # Wähle eine bestimmte Anzahl von Filtern zum Anzeigen aus
        selected_filters = weights[:num_filters]

        # Zeige die ausgewählten Filter an
        fig, axs = plt.subplots(1, num_filters, figsize=(15, 3))

        for i in range(num_filters):
            axs[i].imshow(selected_filters[i].reshape(-1, 1), cmap='gray')
            axs[i].axis('off')

        plt.show()
    else:
        print("Die angegebene Schicht ist keine lineare Schicht.")


def showheatmap(heatmap):
    print("final heatmap", heatmap, type(heatmap), len(heatmap),len(heatmap[1]),len(heatmap[5]))
    plt.imshow(heatmap, cmap='jet')
    plt.show()


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
        image = image.split(",")[1]# Entferne das Präfix, um nur die eigentliche Base64-Daten zu behalten
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

def saveim(image,path):
    from PIL import Image
    import numpy as np

    # Ihr 28x28 Numpy-Bild (Beispiel)
    #np_image = np.random.randint(0, 256, (28, 28))  # Hier wird ein zufälliges Bild erzeugt
    if isinstance(image, torch.Tensor):
        image = image.numpy()
    elif isinstance(image, list):
        image = np.array(image)
    image = image.reshape(28, 28)  # Beispiel: Ändern Sie die Form auf (28, 28), falls nötig
    # Konvertieren Sie das Numpy-Bild in ein PIL-Image
    pil_image = Image.fromarray(image.astype('uint8'))

    # Speichern Sie das PIL-Image als JPG-Datei
    file_path = f'images/image{path}.jpg'
    pil_image.save(file_path)


def classify(model, image):

    #assert image.requires_grad == True, "image.requires_grad is False!"
    print(image.device)
    #print(model.device)
    model = model.to("cpu")
    output_tensor = model(image)
    output_class = torch.argmax(output_tensor).item()  # Annahme: Bestimmung der vorhergesagten Klasse

    return output_tensor, output_class

def get_heatmap(model, sample_image):

    print(model)

    with SmoothGradCAMpp(model,target_layer="conv_block_0", input_shape=(1,28,28)) as cam_extractor: 
        out = model(sample_image, usesoftmax= False)
        activation_map = cam_extractor(out.squeeze(0).argmax().item(), out)

    plt.imshow(activation_map[0].squeeze(0).numpy()); plt.axis('off'); plt.tight_layout(); plt.show()

    image_array = activation_map[0].squeeze(0).numpy()  # Assuming activation_map is a torch.Tensor
    image_array = (image_array * 255).astype(np.uint8)  # Ensure the pixel values are in the range [0, 255]
    # Convert grayscale image to RGB by duplicating intensity values across all channels
    image_array_rgb = np.stack((255-0*image_array, 255-image_array, 255-image_array), axis=-1)
    #plt.imshow(plt.imshow(image_array_rgb)); plt.axis('off'); plt.tight_layout(); plt.show()

    image = Image.fromarray(image_array_rgb)
    
    buffer = io.BytesIO()
    image = image.convert("RGB")
    plt.imshow(image); plt.axis('off'); plt.tight_layout(); plt.show()
    image.save(buffer, format='PNG')  # You can change 'JPEG' to your desired format
    buffer.seek(0)   
    #image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')   
    return buffer

def get_classification_and_heatmap(image, modelFile):
    """This function classifies the image and sends the heatmap (aka explanation) back to frontend"""
    model = loadmodel(modelFile)
    # summary(model, (1,1,28,28))
    image = preprocess_image(image)
    #print(image.shape)
    model.eval()
    
    heatmap = get_heatmap(model, image)
    
    output_tensor, output_class = classify(model, image)
    
    output_array = output_tensor.flatten().detach().numpy()
    output = [(e,i) for (e,i) in zip(output_array,list(range(len(output_array))))]
    output.sort(reverse = True)
    softmaxValues, permutation = zip(*output)

    softmaxValues = [float(e) for e in softmaxValues] #floats are converted to string to make them JSON seriealizable

    permutation = list(permutation)
    softmaxValues = list(softmaxValues)
    
    return softmaxValues, permutation, heatmap

