import torch
import torch.nn as nn

#Define characteristics for all the layers as lists of dictionaries

activation_function = {
    "relu": nn.ReLU(),
    "tanh": nn.Tanh(),
    "sigmoid": nn.Sigmoid(),
    "none": None  # for no activation function
}


conv_params = [
    {"in_channels": 1, "out_channels": 16, "kernel_size": 8, "stride": 2, "padding": 2,}, # Block 1
    {"in_channels": 16, "out_channels": 32, "kernel_size": 4, "stride": 2, "padding": 1 }, # Block 2
    {"in_channels": 32, "out_channels": 64, "kernel_size": 3, "stride": 2, "padding": 1,}, # Block 3
    {"in_channels": 64, "out_channels": 128, "kernel_size": 3, "stride": 1, "padding": 1,}, # Block 4
    {"in_channels": 128, "out_channels": 256, "kernel_size": 2, "stride": 1, "padding": 0,} #Block 5
]
 

maxpool_params = [
    {"kernel_size": 2, "stride": 2},
    {"kernel_size": 2, "stride": 2},
    {"kernel_size": 2, "stride": 2},
    {"kernel_size": 2, "stride": 2},
    {"kernel_size": 2, "stride": 2},
]

linear_params = [
    { "out_features": 32},
    { "out_features": 10},
]