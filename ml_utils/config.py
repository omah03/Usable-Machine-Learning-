import torch.nn as nn

# Define characteristics for all the layers as lists of dictionaries

activation_function = {
    "act_reluOption": nn.ReLU(),
    "act_tanhOption": nn.Tanh(),
    "act_sigmoidOption": nn.Sigmoid(),
    "none": None  # for no activation function
}

conv_params = {
    "small": [
        {"in_channels": 1, "out_channels": 16, "kernel_size_conv": 3, "stride_conv": 1, "padding": 1},
        {"in_channels": 16, "out_channels": 32, "kernel_size_conv": 3, "stride_conv": 1, "padding": 1},
        {"in_channels": 32, "out_channels": 64, "kernel_size_conv": 3, "stride_conv": 1, "padding": 1}
    ],
    "medium": [
        {"in_channels": 1, "out_channels": 16, "kernel_size_conv": 5, "stride_conv": 1, "padding": 2},
        {"in_channels": 16, "out_channels": 32, "kernel_size_conv": 5, "stride_conv": 1, "padding": 2},
        {"in_channels": 32, "out_channels": 64, "kernel_size_conv": 5, "stride_conv": 1, "padding": 2}
    ],
    "large": [
        {"in_channels": 1, "out_channels": 16, "kernel_size_conv": 7, "stride_conv": 1, "padding": 3},
        {"in_channels": 16, "out_channels": 32, "kernel_size_conv": 7, "stride_conv": 1, "padding": 3},
        {"in_channels": 32, "out_channels": 64, "kernel_size_conv": 7, "stride_conv": 1, "padding": 3}
    ]
}

    
    
max_pool_params = [
    {"kernel_size_max_pool": 2, "stride_max_pool": 1},
    {"kernel_size_max_pool": 2, "stride_max_pool": 1},
    {"kernel_size_max_pool": 2, "stride_max_pool": 1},
]

linear_params = [
    {"out_features": 128},
    {"out_features": 64},
    {"out_features": 10},
]