import torch.nn as nn

class Modelbuilder(nn.Module):

    def __init__(self,numConvLayers,convChannels,kernel_size,stride,
                 padding,activationFunction,learning_rate, 
                 numEpochs,batch_size,inputsize=(28,28)):
        super(Modelbuilder, self).__init__()

        self.numConvLayers = numConvLayers 
        self.convChannels = convChannels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.activationFunction = activationFunction
        self.activationFunctions = [nn.Tanh,nn.ReLU,nn.Sigmoid]
        self.learning_rate = learning_rate
        self.numEpochs = numEpochs
        self.batch_size = batch_size 

        self.block1 = nn.Sequential(
            nn.Conv2d(1,convChannels, kernel_size=kernel_size, stride=stride, padding=padding),
            self.activationFunctions[self.activationFunctions.index(activationFunction)](),
            nn.MaxPool2d(kernel_size=kernel_size,stride=stride,padding=padding)    
        )
     


        self.convolutional_layers = nn.Sequential(
                nn.Conv2d(1, convChannels, kernel_size=kernel_size, stride=stride, padding=padding),
                nn.Tanh(),
                nn.MaxPool2d(kernel_size=kernel_size, stride=stride),
                nn.Conv2d(convChannels, 32, kernel_size=4, stride=2, padding=0),
                nn.Tanh(),
                nn.MaxPool2d(kernel_size=2, stride=1),
            )
        self.linear_layers = nn.Sequential(
            nn.Linear(512, 32),
            nn.Tanh(),
            nn.Linear(32, 10),
        )

    def calculateOutputDims(self,widthInput,heightInput,kernelDim,stride,padding):
        #only works with square kernels
        widthOutput = (widthInput + 2*padding - (kernelDim-1)-1 // stride) + 1
        heightOutput = (heightInput + 2*padding- (kernelDim-1)-1 // stride) + 1
        return widthOutput,heightOutput

   
    def forward(self, x):
        x = self.convolutional_layers(x)
        x = x.view(x.size(0), -1)
        x = self.linear_layers(x)
        return x





