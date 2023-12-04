"""
TEST FILE :(
"""

import torch
from modelbuilder import ModelBuilder
import config

def test_model_initialization(num_blocks):
    model = ModelBuilder(num_blocks, config.linear_params, "relu")
    assert len(model.conv_layers) == num_blocks, "Incorrect number of convolutional blocks in the model"

def test_add_conv_block():
    model = ModelBuilder(3, config.linear_params, "relu")
    model.add_conv_block()
    assert len(model.conv_layers) == 4, "Convolutional block not added correctly"

def test_remove_conv_block():
    model = ModelBuilder(3, config.linear_params, "relu")
    model.remove_last_block()
    assert len(model.conv_layers) == 2, "Convolutional block not removed correctly"

def test_forward_pass_correct_input():
    model = ModelBuilder(3, config.linear_params, "relu")
    input_tensor = torch.randn(1, 1, 28, 28)  # Batch size = 1, Channels = 1, Height = 28, Width = 28
    try:
        output = model(input_tensor)
        assert output is not None, "Forward pass failed with correct input"
    except Exception as e:
        assert False, f"Unexpected error during forward pass: {e}"

def test_recalculation_of_linear_layers():
    model = ModelBuilder(3, config.linear_params, "relu")
    initial_out_features = model.linear_layers[0].linear.out_features
    model.add_conv_block()
    assert model.linear_layers[0].linear.out_features == initial_out_features, "Linear layers not recalculated correctly after adding a block"
    model.remove_last_block()
    assert model.linear_layers[0].linear.out_features == initial_out_features, "Linear layers not recalculated correctly after removing a block"

def test_forward_pass_incorrect_input():
    model = ModelBuilder(3, config.linear_params, "relu")
    input_tensor = torch.randn(1, 1, 10, 10)
    try:
        model(input_tensor)
        assert False, "Model did not raise error with incorrect input shape"
    except ValueError:
        pass  # This is expected



# Run tests
test_model_initialization(3)
test_add_conv_block()
test_remove_conv_block()
test_recalculation_of_linear_layers()
test_forward_pass_incorrect_input()