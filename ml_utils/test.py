import torch
from modelbuilder import model_builder
from data import get_dataset

test = get_dataset(test = True)
assert len(test) == 10000, "sth went wrong"
ima = test[0]
image, label = test[0] #image


#image = torch.reshape(image, (1,28,28,1))

image = torch.unsqueeze(image, 3)  # Hinzufügen einer Batch-Dimension
image = torch.unsqueeze(image,0)

print("reshaped")
print("image fetched! shape = ", image.shape, "\n")

model = model_builder
print("model created")

model.eval()
print("evaluation started")
print("print model prediction ...")

print(model(image))
