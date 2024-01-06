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
    def __init__(self,num_blocks, activation_fn_choice , input_size=(28,28)):
        super(ModelBuilder, self).__init__()
        linear_params= config.linear_params
        self.input_size = input_size
        self._validate_parameters(num_blocks, linear_params)
        if activation_fn_choice not in config.activation_function:
            raise ValueError(f"Invalid activation function choice: {activation_fn_choice}")
        self.global_activation_fn = config.activation_function[activation_fn_choice]
        self.conv_layers = self._create_conv_layers(num_blocks,self.global_activation_fn)
        self.linear_layers = self._create_linear_layers(linear_params)

        # Validation checks 
    def _validate_parameters(self,num_blocks,linear_params):
        if not isinstance(num_blocks,int) or not (1 <= num_blocks <= 5):
            raise ValueError("num_blocks must tbe a positive integer between 1 and 5")
        if not isinstance(linear_params,list):
            raise ValueError("Linear_params must be a list")
        
    #Function to create conv layer
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
    
    #Function to create linear layer
    def _create_linear_layers(self, linear_params):
        flattened_size = self._calculate_flattened_size()
        updated_linear_params = []
        in_features = flattened_size
        for params in linear_params:
            params = params.copy()
            params['in_features'] = in_features
            in_features = params['out_features']
            params['activation_function'] = config.activation_function
            updated_linear_params.append(params)
        return nn.Sequential(*[LinearBlock(**params) for params in updated_linear_params])
    
    # Function to add conv blocks
    def add_conv_block(self):
        block_index = len(self.conv_layers)
        if block_index >= len(config.conv_params):
            raise ValueError("Maximum number of convolutional blocks reached")
        
        conv_params = config.conv_params[block_index]
        max_pool_params = config.max_pool_params[block_index]
        conv_block = ConvBlock(**conv_params, **max_pool_params,activation_function = self.global_activation_fn)
        self.conv_layers.add_module(f'conv_block_{len(self.conv_layers)}', conv_block)

        self._recalculate_linear_layers()

    # Function to remove last block
    def remove_last_block(self):
        if len(self.conv_layers) == 0:
            raise ValueError("No blocks to remove")
        del self.conv_layers[len(self.conv_layers)-1]
        self._recalculate_linear_layers()
        
    # Function to recalculate the dimensions
    def _recalculate_linear_layers(self):
        flattened_size = self._calculate_flattened_size()
        first_linear_layer = self.linear_layers[0]
        out_features = first_linear_layer.linear.out_features
        self.linear_layers[0].linear = nn.Linear(flattened_size,out_features)

        for i in range(1, len(self.linear_layers)):
            in_features = self.linear_layers[i-1].linear.out_features
            out_features = self.linear_layers[i].linear.out_features
            self.linear_layers[i].linear = nn.Linear(in_features, out_features)
    # Function to calcualte the flattened size
    def _calculate_flattened_size(self):
        with torch.no_grad():
            dummy_input = torch.zeros(1, *self.input_size)
            output = self.conv_layers(dummy_input)
            flattened_size = output.numel() // output.size(0)
        return flattened_size
            
    # Forward function
    def forward(self, x):
        if x.ndim != 4 or x.shape[1:3] != self.input_size:
            raise ValueError(f"Input must be a 4D Tensor with shape (N, {self.input_size[0]}, {self.input_size[1]}, C)")
        x = self.conv_layers(x)
        x = x.view(x.size(0), -1)
        x = self.linear_layers(x)
        x = F.softmax(x,dim = 1)
        return x
    