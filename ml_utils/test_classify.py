import pickle
import torch
from data import get_dataset
import matplotlib.pyplot as plt


model_file = 'MNIST_classifier_model.pkl'


# load model from pickle file
with open(model_file, 'rb') as file:  
    model = pickle.load(file)


def classify_canvas_image(image):
  
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
 
  
 # Annahme: Das Modell gibt eine Vorhersage für das Bild zurück
 with torch.no_grad():
     output = model(image)
  
 print("Model prediction:", output)
  
 # Konvertiere den Tensor in ein Numpy-Array
 image_np = image.squeeze(0).squeeze(0).numpy()
  
 # Anzeige des Originalbildes und der Vorhersage
 plt.figure(figsize=(8, 4))
  
 plt.subplot(1, 2, 1)
 plt.title(f"Original Image - Label: {label}")
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
 

test = get_dataset(test =True)
image, label = test[0]
classify_canvas_image(image)
