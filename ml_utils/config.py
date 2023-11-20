import torch
import torch.nn as nn

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