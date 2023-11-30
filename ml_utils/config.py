import torch
import torch.nn as nn

#Define characteristics for all the layers as lists of dictionaries
class ConfigHandler():
    def __init__(self):
        pass

    def set_from_frontend(param: str, block:int, value):
        if param== "conv_KSize":
            conv_params[block-1]["kernel_size"]= value
        elif param== "conv_Stride":
            conv_params[block-1]["stride"]= value
        elif param== "conv_Padding":
            conv_params[block-1]["padding"]= value
        elif param== "pool_KSize":
            maxpool_params[block-1]["kernel_size"]= value
        elif param== "pool_Stride":
            maxpool_params[block-1]["stride"]= value
        else:
            raise Exception(param, block, value)
        print(conv_params[block-1], maxpool_params[block-1])

activation_function = nn.Tanh

conv_params = [
    {"in_channels": 1, "out_channels": 16, "kernel_size": 8, "stride": 2, "padding": 2 },
    {"in_channels": 16, "out_channels": 32, "kernel_size": 4, "stride": 2, "padding": 1 },
    {"in_channels": 32, "out_channels": 64, "kernel_size": 5, "stride": 2, "padding": 1 },
    {"in_channels": 64, "out_channels": 128, "kernel_size": 3, "stride": 1, "padding": 1 },
    {"in_channels": 128, "out_channels": 256, "kernel_size": 2, "stride": 1, "padding": 0}
]
 

maxpool_params = [
    {"kernel_size": 2, "stride": 2},
    {"kernel_size": 2, "stride": 2},
    {"kernel_size": 2, "stride": 2},
    {"kernel_size": 2, "stride": 2},
    {"kernel_size": 2, "stride": 2}
]

linear_params = [
    {"in_features": 512, "out_features": 32, "activation_function": activation_function},
    {"in_features": 32, "out_features": 10, "activation_function": activation_function},
]