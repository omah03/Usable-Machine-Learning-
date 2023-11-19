import config
import torch
import torch.nn as nn
import torchinfo 
"""
Create blocks for each type of layer: Maxpool, Convolution and Linear. 
Perhaps Maxpool and Conv can be stuck together since maxpool follows convolutional. 

Conv2d amd linear each come integrated with their activation function since it's the same everywhere
"""

"""
THE BLOCK:
        Conv2D layer
        Activation function
        MaxPool layer
        Can be passed conv and max_pool params as merged dict 
        Params = {**conv_params,**max_pool_params}
"""
class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size_conv, stride_conv, padding, activation_function,kernel_size_max_pool,stride_max_pool):
        super(ConvBlock, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)
        self.activation = activation_function
        self.maxpool = nn.MaxPool2d(kernel_size_max_pool,stride_max_pool)

    def forward(self, x):
        x = self.conv(x)
        x = self.activation(x)
        x = self.maxpool(x)

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

        #Change nn.Modulelist to nn.Sequential
        convOrdered = OrderedDict()
        in_channels = 1  #Grescale first, scaled up through channels latere
        w, h = input_size
        print(f'width:{w}, height:{w}')
        for layer, (conv_param, max_pool_param) in enumerate(zip(conv_params, max_pool_params)):

            conv_block = ConvBlock({**conv_param,**max_pool_params}) 
            convOrdered[f'conv_layer_{layer}'] = conv_block
            
            kernel_dim = conv_param.get('kernel_size')
            stride = conv_param.get('stride')  
            padding = conv_param.get('padding')
            w,h = self.calculate_output_dims(w, h, kernel_dim, stride, padding)

            kernel_dim = max_pool_param.get('kernel_size')
            stride = max_pool_param.get('stride')  
            padding = max_pool_param.get('padding')

        self.conv_layers = nn.Sequential(convOrdered)       
            
        linear_ordered = OrderedDict()
        for idx, params in enumerate(linear_params):
            linear_block = LinearBlock(**params)
            linear_ordered[f'linear_layer_{idx}'] = linear_block
        
        self.linear_layers = nn.Sequential(linear_ordered)
          

    def calculate_output_dims(self,width_input,height_input,kernel_dim,stride,padding):      
        #only works with square kernels for now
        width_output = (width_input + 2*padding - (kernel_dim-1)-1 // stride) + 1
        height_output = (height_input + 2*padding- (kernel_dim-1)-1 // stride) + 1
        return width_output,height_output
 
    def forward(self, x):
        for layer in self.conv_layers:
            x = layer(x)
        x = x.view(x.size(0), -1)
        for layer in self.linear_layers:
            x = layer(x)
        return x

model = ModelBuilder(conv_params=conv_params,linear_params=linear_params,max_pool_params=maxpool_params)
summary(model,input_size(1,1,28,28))


