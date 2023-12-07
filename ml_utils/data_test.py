import torch
from data import get_dataset
from nn_test import network as model
test = get_dataset(test = True)
assert len(test) == 10000, "sth went wrong"
ima = test[0]
image, label = test[0] #image


#image = torch.reshape(image, (1,28,28,1))

image = torch.unsqueeze(image, 3)  # Hinzufügen einer Batch-Dimension
#image = torch.unsqueeze(image,0)

print(image)
print(image.shape)
print(model(image))
