
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


def gradCAM(model, image):

    assert image.requires_grad == True, "image.requires_grad is False!"
    output_tensor = model(image)
    output_class = torch.argmax(output_tensor).item()  # Annahme: Bestimmung der vorhergesagten Klasse

    print("model: ", model)

    """better code:"""
    #1 forward pass with input image
    c = output_class
    c_tensor = output_tensor[0,c]
    #2 set gradients to 0 for all classes except for output class (which is set to 1)
    """im not sure here"""
    """
    #3 backprop until last conv
    c_tensor.backward()

    #3.2 calculate 'importance' of the kth feature map by computing gradients wrt fmap activations
    i = 0
    last_conv = model.conv_layers[-1].conv
    in_channels = last_conv.in_channels
    print("outs", in_channels)
    image = image.expand(-1, in_channels, -1, -1)
    print("new dim = ", image.shape)
    print("last_conv = ",last_conv, type(last_conv))
    grads = last_conv.weight.grad
    print("shape grads = ", grads.shape)
    i = 0

    for fmap in grads:
        i += 1 
        print(f"{i}. featuremap = ", fmap)
        print("type = ", type(fmap), fmap.shape)
#        print("grad k = ", gradients_k, k.shape)
        alpha_kc = fmap.mean()
        print("alpha = ", alpha_kc, alpha_kc.shape)

    activations = last_conv(image).detach()
    print("activations", activations, activations.shape, len(activations), activations.size(1))
    """
    #3.3 average over all k feature maps and apply Relu because only positive impacts are interesting to us.
    #for k in model.conv_layers[-1].

    #4 compute heatmap
   
    #raise ValueError("stop")


    """end of section"""



    print("start explaining...")

    model.zero_grad()

    #show_linear_filters(model,layer_index=1,num_filters=10) #this is just for fun

    #print(model.conv_layers[-1].conv)
    #print(model.conv_layers[-1].conv.weight)

    assert output_tensor.requires_grad == True, "output_tensor.requires_grad is False!"
    assert isinstance(output_class,int), "output_class is not of type int"



    output_tensor[0, output_class].backward()
    
    # Feature Maps der letzten Convolutional Layer und Gradienten erhalten
    gradients = model.conv_layers[0].conv.weight.grad #this is the kernel for each convolution





    print("gradients.shape= ",gradients.shape)

    #print("gradients",gradients, gradients.shape, len(gradients))    

    #assert (gradients.shape == torch.Size([16, 1, 3, 3])),"sth went wrong"
    print("gradients = ", gradients)
    pooled_gradients = torch.mean(gradients, dim=[1, 2, 3])
    
    activations = model.conv_layers[0].conv(image).detach()
    #assert (model.conv_layers[0] == model.conv_layers[-1]), "Which one is the 'last conv layer'?" 
    """A number of previous works have asserted that deeper repre-
    sentations in a CNN capture higher-level visual constructs [6,
    41]. Furthermore, convolutional layers naturally retain spatial
    information which is lost in fully-connected layers, so we
    can expect the last convolutional layers to have the best com-
    promise between high-level semantics and detailed spatial
    information. [Selvaraju et al.]"""
    



    print("activations", activations, activations.shape, len(activations), activations.size(1))

    print("pooled_gradients", pooled_gradients, pooled_gradients.shape, len(pooled_gradients))

    for i in range(activations.size(1)):
        """I'm not sure whether this is correct. we should use the kernel not the average"""
        print("pooled_gradients = ", pooled_gradients[i])
        activations[:, i, :, :] *= pooled_gradients[i]

    # Heatmap generieren
    heatmap = torch.mean(activations, dim=1).squeeze()
    heatmap = np.maximum(heatmap, 0) #avoiding negative values
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
    
    return output_tensor, output_class, heatmap




def classify_canvas_image(image,modelFile):
    
    
    """This function classifies the image and sends the heatmap (aka explanation) back to frontend"""
    model = loadmodel(modelFile)
    summary(model, (1,1,28,28))
    image = preprocess_image(image)
    print(image.shape)

    

    if __name__ != "__main__":
        image.requires_grad = True

    model.eval()
    
    print("Classifying sample image...\n")
    
    
    #Show the image and check if the array representation works
    # Konvertiere den Tensor in ein Numpy-Array
    #image_np = image.squeeze(0).squeeze(0).numpy()
    #print("the shape is ", image.shape, type(image), image[0:10])
    image_np = image.squeeze(0).squeeze(0).detach().numpy()# diese version für explainable part
    #print("the shape is now", image_np.shape, type(image_np), image_np[0:10])
    #showim(image_np)
    #saveim(image_np,'9')

    #assert image.requires_grad == True, "image.requires_grad is not True"
    # Annahme: Das Modell gibt eine Vorhersage für das Bild zurück
    #showim(image_np)

    output_tensor, output_class, heatmap = gradCAM(model,image) #gradCAM is used for the explanation



    #plt.imshow(heatmap, alpha = 0.5, cmap='jet')
    #plt.show()

    output_array = output_tensor.flatten().detach().numpy()
    output = [(e,i) for (e,i) in zip(output_array,list(range(len(output_array))))]
    output.sort(reverse = True)
    softmaxValues, permutation = zip(*output)

    softmaxValues = [float(e) for e in softmaxValues] #floats are converted to string to make them JSON seriealizable

    permutation = list(permutation)
    softmaxValues = list(softmaxValues)

    return softmaxValues, permutation, heatmap


if __name__ == "__main__":
    print("testing....")
    test = get_dataset(test =True)
    for i in range(10,20):
        image, label = test[i]

        #saveim(image)
        
        image.requires_grad = True  # Setzen von requires_grad auf True (für explainable part)
    
        model_file = 'ml_utils/models/Trained_modelbuilder_model.pkl'#'ml_utils/models/MNIST_new_classifier_model.pkl'#
        _ , _ , heatmap = classify_canvas_image(image,model_file)

        #showheatmap(heatmap)
        #saveim(heatmap, f"heatmap{i}")


