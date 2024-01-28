
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision
import torchvision.transforms as transforms
from matplotlib import pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np
from model import ConvolutionalNeuralNetwork

cnn = ConvolutionalNeuralNetwork()


# Load a sample image from the MNIST dataset
transform = transforms.Compose([transforms.ToTensor()])
mnist_data = torchvision.datasets.MNIST(root='./data', train=True, download=True, transform=transform)
sample_image, _ = mnist_data[1]
sample_image = sample_image.unsqueeze(0)  # Add batch dimension

# Extract the first kernel from the first convolutional layer
first_kernel = cnn.convolutional_layers[0].weight.data[0]
print(list(cnn.convolutional_layers[0].weight.data[0][1:3]))

def visualize_adjustable_kernel_convolution(image, kernel, kernel_size=3, stride=1, padding=1):
    # Apply padding to the image
    padded_image = F.pad(image, (padding, padding, padding, padding), mode='constant', value=0)
    padded_image = padded_image.squeeze().numpy()

    # Prepare for animation
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))

    # Calculate the size of the feature map
    height, width = padded_image.shape
    feature_map_height = (height - kernel_size + 2 * padding) // stride + 1
    feature_map_width = (width - kernel_size + 2 * padding) // stride + 1
    feature_map = np.zeros((feature_map_height, feature_map_width))

    # Function to update the frames
    def update(i, j):
        for ax in axes:
            ax.clear()

        # Display the original image with highlighted region
        axes[0].imshow(padded_image, cmap='gray')
        axes[0].add_patch(plt.Rectangle((j, i), kernel_size, kernel_size, edgecolor='red', facecolor='none'))
        axes[0].set_title("Originalbild")

        # Display the current window (kernel region)
        window = padded_image[i:i+kernel_size, j:j+kernel_size]
        axes[1].imshow(window, cmap='gray')
        axes[1].set_title("Ausschnitt")

        # Show the resulting feature map (condensed to actual size)
        acc=0
        for w in window.flatten():
            for k in kernel.flatten():
                acc+= w*k   

        result = acc#(window * kernel.numpy()).sum()
        fm_i, fm_j = i // stride, j // stride
        feature_map[fm_i, fm_j] = result
        axes[2].imshow(feature_map, cmap='gray')
        axes[2].set_title("Merkmalskarte")

        plt.tight_layout()

    # Create animation frames
    frames = []
    for i in range(0, height - kernel_size + 1, stride):
        for j in range(0, width - kernel_size + 1, stride):
            frames.append((i, j))

    # Create animation
    ani = FuncAnimation(fig, lambda x: update(*x), frames=frames, interval=50, repeat=False)
    
    print(f'Saving: cnnK{kernel_size}S{stride}P{padding}.gif')
    ani.save(f'cnnK{kernel_size}S{stride}P{padding}.gif', writer='pillow', fps=10)

    #plt.show(block=True)  # Display the animation
    #plt.pause(10)
    #plt.close()

kernels =   [4, 6, 8]
strides =   [1, 2, 3]
paddings =  [0, 1, 2]

for kernel in kernels:
    for stride in strides:
        for padding in paddings:
            visualize_adjustable_kernel_convolution(sample_image, first_kernel, kernel_size=kernel, stride=stride, padding=padding)
