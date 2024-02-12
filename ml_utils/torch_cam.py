from torchcam.methods import SmoothGradCAMpp
from torchcam.utils import overlay_mask
import torchvision.transforms as transforms
import torchvision
from torchvision.transforms.functional import to_pil_image
import matplotlib.pyplot as plt
from model import ConvolutionalNeuralNetwork

model = ConvolutionalNeuralNetwork().eval()

transform = transforms.Compose([transforms.ToTensor()])
mnist_data = torchvision.datasets.MNIST(root='./data', train=True, download=True, transform=transform)

sample_image, _ = mnist_data[4]
# sample_image = sample_image.unsqueeze(0)
print(model)

with SmoothGradCAMpp(model,target_layer="conv1", input_shape=(1,28,28)) as cam_extractor: 
    out = model(sample_image.unsqueeze(0))
    activation_map = cam_extractor(out.squeeze(0).argmax().item(), out)



plt.imshow(activation_map[0].squeeze(0).numpy()); plt.axis('off'); plt.tight_layout(); plt.show()