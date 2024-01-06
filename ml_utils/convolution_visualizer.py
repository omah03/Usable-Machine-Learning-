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
sample_image, _ = mnist_data[0]
sample_image = sample_image.unsqueeze(0)  # Add batch dimension

# Extract the first kernel from the first convolutional layer
first_kernel = cnn.convolutional_layers[0].weight.data[0]


def visualize_adjustable_kernel_convolution(image, kernel, kernel_size=8, stride=2, padding=2):
    # Apply padding to the image
    padded_image = F.pad(image, (padding, padding, padding, padding), mode='constant', value=0)
    padded_image = padded_image.squeeze().numpy()

    # Prepare for animation
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))

    # Calculate the size of the feature map
    height, width = padded_image.shape
    feature_map_height = (height - kernel_size) // stride + 1
    feature_map_width = (width - kernel_size) // stride + 1
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
        result = (window * kernel.numpy().squeeze()).sum()
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
    ani = FuncAnimation(fig, lambda x: update(*x), frames=frames, interval=200, repeat=False)

    plt.show()  # Display the animation
    plt.pause(10)
    plt.close()


