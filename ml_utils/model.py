import torch.nn as nn


class ConvolutionalNeuralNetwork(nn.Module):

    def __init__(self):
        super(ConvolutionalNeuralNetwork, self).__init__()
        self.convolutional_layers = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=8, stride=2, padding=2),
            nn.Tanh(),
            nn.MaxPool2d(kernel_size=2, stride=1),
            nn.Conv2d(16, 32, kernel_size=4, stride=2, padding=0),
            nn.Tanh(),
            nn.MaxPool2d(kernel_size=2, stride=1),
        )
        self.linear_layers = nn.Sequential(
            nn.Linear(512, 32),
            nn.Tanh(),
            nn.Linear(32, 10),
        )

    def forward(self, x):
        x = self.convolutional_layers(x)
        x = x.view(x.size(0), -1)
        x = self.linear_layers(x)
        return x
