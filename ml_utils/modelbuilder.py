import config
import torch
import torch.nn as nn
from collections import OrderedDict
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
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size_conv, stride_conv, padding)
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
        return self.activation(self.linear(x))

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
          

    def calculate_output_dims(self,width_input,height_input,kernel_size,stride,padding):      
        #only works with square kernels for now
        width_output = int((width_input - kernel_size + 2 * padding )/ stride + 1)
        height_output = int((height_input - kernel_size + 2 * padding) / stride + 1)
        return width_output,height_output
            
    def forward(self, x):
        x = self.conv_layers(x)
        x = x.view(x.size(0), -1)
        x = self.linear_layers(x)
        return x
    
    # Function to add conv blocks
    def add_conv_block(self, conv_params, max_pool_params):
        if len(self.conv_layers) >= 5:
            print("Can only add 5 blocks!")
            return

        # Handling the case where there are no existing conv layers
        if not self.conv_layers:
            in_channels = 1  # Gray Scale 
        else:
            in_channels = self.conv_layers[-1].conv.out_channels

        # Adding new Conv Block
        new_block = ConvBlock(in_channels, **conv_params, maxpool_params=max_pool_params)
        self.conv_layers.append(new_block)

        # Recalculate the dimensions after adding the new block
        self._recalculate_dimensions()

        # Update the first linear layer if any linear layers exist
        if self.linear_layers:
            flattened = self._calculate_flattened_size()
            self.linear_layers[0].linear = nn.Linear(flattened, self.linear_layers[0].linear.out_features)

    def _calculate_flattened_size(self):
        w, h = 28, 28  # Assuming initial image size, adjust if different
        for layer in self.conv_layers:
            conv_param = {'kernel_size': layer.conv.kernel_size[0],
                          'stride': layer.conv.stride[0],
                          'padding': layer.conv.padding[0]}
            w, h = self.calculate_output_dims(w, h, **conv_param)

            maxpool_param = {
                'kernel_size': layer.maxpool.kernel_size,
                'stride': layer.maxpool.stride,
                'padding': 0
            }
            w, h = self.calculate_output_dims(w, h, **maxpool_param)

        return w * h * self.conv_layers[-1].conv.out_channels if self.conv_layers else 0

    # Function to remove last block
    def remove_last_block(self):
        if len(self.conv_layers) > 0:
            self.conv_layers.pop()
            self._recalculate_dimensions()
        else:
            print("Cannot remove the block. There must be at least one block.")

    def _recalculate_dimensions(self):
        w, h = 28, 28
        in_channels = 1

        for layer in self.conv_layers:
            conv_param = {'kernel_size': layer.conv.kernel_size[0],
                          'stride': layer.conv.stride[0],
                          'padding': layer.conv.padding[0]}
            w, h = self.calculate_output_dims(w, h, **conv_param)

            maxpool_param = {
                'kernel_size': layer.maxpool.kernel_size,
                'stride': layer.maxpool.stride,
                'padding': 0
            }
            w,h = self.calculate_output_dims(w,h,**maxpool_param)
            in_channels = layer.conv.out_channels

        flattened = in_channels * w * h

        if self.linear_layers:
            self.linear_layers[0].linear.in_features = flattened


#model = ModelBuilder(conv_params=conv_params,linear_params=linear_params,max_pool_params=maxpool_params)
#summary(model,input_size(1,1,28,28))


