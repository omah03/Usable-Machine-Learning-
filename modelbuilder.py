import torch
import torch.nn as nn
from torchinfo import summary

#Define characteristics for all the layers as lists of dictionaries

activation_function = nn.Tanh
conv_params = [
    {"in_channels": 1,"out_channels": 16, "kernel_size": 8, "stride": 2, "padding": 2, "activation_function": activation_function},
    {"in_channels": 16, "out_channels": 32, "kernel_size": 4, "stride": 2, "padding": 0, "activation_function": activation_function},
]    

maxpool_params = [
    {"kernel_size":2,"stride":1},
    {"kernel_size":2,"stride":1}
]
    

linear_params = [
    {"in_features": 512, "out_features": 32, "activation_function": activation_function},
    {"in_features": 32, "out_features": 10, "activation_function": activation_function},
]

"""
Create blocks for each type of layer: Maxpool, Convolution and Linear. 
Perhaps Maxpool and Conv can be stuck together since maxpool follows convolutional. 

Conv2d amd linear each come integrated with their activation function since it's the same everywhere
"""

class Maxpool(nn.Module):
    def __init__(self, kernel_size,stride):
        super(Maxpool,self).__init__()
        self.maxpool = nn.MaxPool2d(kernel_size,stride)


class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, stride, padding, activation_function):
        super(ConvBlock, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)
        self.activation = activation_function

    def forward(self, x):
        return self.activation(self.conv(x))

class LinearBlock(nn.Module):
    def __init__(self, in_features, out_features, activation_function):
        super(LinearBlock, self).__init__()
        self.linear = nn.Linear(in_features, out_features)
        self.activation = activation_function

    def forward(self, x):
        return self.activation(self.conv(x))



class ModelBuilder(nn.Module):
    def __init__(self, conv_params, linear_params, max_pool_params, input_size=(28,28)):
        super(ModelBuilder, self).__init__()
        assert len(conv_params) == len(max_pool_params)

        self.conv_layers = nn.ModuleList()
        in_channels = 1  #Grescale first, scaled up through channels latere
        w, h = input_size
        print(f'width:{w}, height:{w}')
        for conv_param, max_pool_param in zip(conv_params, max_pool_params):

            self.conv_layers.append(ConvBlock(in_channels, **conv_param))
            kernel_dim = conv_param.get('kernel_size')
            stride = conv_param.get('stride')  
            padding = conv_param.get('padding')
            w,h = self.calculate_output_dims(w, h, kernel_dim, stride, padding)

            kernel_dim = max_pool_param.get('kernel_size')
            stride = max_pool_param.get('stride')  
            padding = max_pool_param.get('padding')

            self.conv_layers.append(Maxpool(**max_pool_param))
            self.calculate_output_dims(w, h, kernel_dim, stride, padding)

            in_channels = conv_param['out_channels']

        # Calculate flattened size based on the last values of w and h
        flattened = in_channels * w * h
        print(flattened)

        self.linear_layers = nn.ModuleList()
        in_features = flattened
        for params in linear_params:
            self.linear_layers.append(LinearBlock(in_features, **params))
          

    def calculate_output_dims(self,width_input,height_input,kernel_dim,stride,padding):
        
        #only works with square kernels for now

        width_output = (width_input + 2*padding - (kernel_dim-1)-1 // stride) + 1
        height_output = (height_input + 2*padding- (kernel_dim-1)-1 // stride) + 1
        return width_output,height_output


   

    
    def forward(self, x):
        x = self.convolutional_layers(x)
        x = x.view(x.size(0), -1)
        x = self.linear_layers(x)
        return x


model = ModelBuilder(conv_params=conv_params,linear_params=linear_params,max_pool_params=maxpool_params)
print(summary(model))

