import config
import torch
import torch.nn as nn
import torch.nn.functional as F
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
        return x 

class LinearBlock(nn.Module):
    def __init__(self, in_features, out_features, activation_function):
        super(LinearBlock, self).__init__()
        self.linear = nn.Linear(in_features, out_features)
        self.activation = activation_function

    def forward(self, x):
        x = self.linear(x)
        if self.activation:
            x = self.activation(x)
        return x

class ModelBuilder(nn.Module):
    def __init__(self,num_blocks, linear_params, max_pool_params, global_activation_function, input_size=(28,28)):
        super(ModelBuilder, self).__init__()
        self._validate_parameters(num_blocks, linear_params)
        self.conv_layers = self._create_conv_layers(num_blocks,global_activation_function)
        self.linear_layers = self._create_linear_layers(linear_params)

        # Validation checks 
    def _validate_parameters(self,num_blocks,linear_params):
        if not isinstance(num_blocks,list) or not isinstance(num_blocks, list):
            raise ValueError("num_blocks must tbe a positive integer")
        if not isinstance(linear_params,list):
            raise ValueError("Linear_params must be a list")
    
    def _create_conv_layers(self, num_blocks, activation_function):
        layers = nn.Sequential()
        for i in range(num_blocks):
            try:
                conv_params = config.conv_params[i]
                max_pool_params = config.max_pool_params[i]
            except IndexError:
                raise ValueError(f"Configuration for block {i} not found in config.py")
            conv_block = ConvBlock(**conv_params, **max_pool_params, activation_function = activation_function)
            layers.add_module(f"conv_block_{i}", conv_block)
        return layers
    
    def _create_linear_layers(self, linear_params):
        flattened_size = self._calculate_flattened_size()
        if 'in_features' not in linear_params[0]:
            linear_params[0]['in_features'] = flattened_size
        return nn.Sequential(*[LinearBlock(**params) for params in linear_params])
    
    # Function to add conv blocks
    def add_conv_block(self, conv_params, max_pool_params):
        # Validation checks
        if len(self.conv_layers) >= 5:
            raise ValueError("Cannot add more than 5 convolutional blocks")

        conv_param = conv_params[self.current_block_index]
        max_pool_param = max_pool_params[self.current_block_index]

        # Adding new Conv Block
        conv_block = ConvBlock(**conv_param, **max_pool_param)
        self.conv_layers.add_module(f'conv_block_{self.current_block_index}', conv_block)

        self.current_block_index += 1

        # Recalculate the dimensions after adding the new block
        self._recalculate_dimensions()

        # Update the first linear layer if any linear layers exist
        if self.linear_layers:
            flattened = self._calculate_flattened_size()
            self.linear_layers[0].linear = nn.Linear(flattened, self.linear_layers[0].linear.out_features)

    # Function to remove last block
    def remove_last_block(self):

        last_block_key = f'conv_block_{self.current_block_index - 1}'
        del self.conv_layers._modules[last_block_key]

        self.current_block_index -= 1

        if len(self.conv_layers) > 0:
            self._recalculate_dimensions()
        else:
            raise ValueError("No blocks to remove")
    # Function to calculate the output dimensions of the previous layer
    def calculate_output_dims(self,width_input,height_input,kernel_size,stride,padding):  
        if any(not isinstance(x,int) or x<0 for x in [width_input,height_input,kernel_size,stride,padding]):
            raise ValueError("All dimensions and parameters must be non-negative integers")    
        #only works with square kernels for now
        width_output = int((width_input - kernel_size + 2 * padding )/ stride + 1)
        height_output = int((height_input - kernel_size + 2 * padding) / stride + 1)
        return width_output,height_output
    # Function to recalculate the dimensions
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
    # Function to calcualte the flattened size
    def _calculate_flattened_size(self):
        w, h = 28, 28 
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
    # Forward function
    def forward(self, x):
        if x.ndim != 4:
            raise ValueError("Input must be a 4D Tensor")
        x = self.conv_layers(x)
        x = x.view(x.size(0), -1)
        x = self.linear_layers(x)
        x = F.softmax(x,dim = 1)
        return x


#model = ModelBuilder(conv_params=conv_params,linear_params=linear_params,max_pool_params=maxpool_params)
#summary(model,input_size(1,1,28,28))


