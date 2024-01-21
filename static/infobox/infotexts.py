# we should probably be using some kind of framework but at least this way we have multiline strings

infotexts={
    "inputbox":r""" 
                        The input of the datamodel is the MNIST dataset. 
                        This dataset is already preprocessed and consists of 28x28 images of handdrawn images.
                        <div class= "container-grayscale">
                            <p class= "grayscale-text"> Die Bilder des MNIST Datensatzes werden durch eine Matrix mit 
                                Zahlen von 0 (weiß) bis 1 (schwarz) dargestellt </p>
                            <img class= "grayscale-image" src="../static/include/grayscale_number.png">
                        </div>
               
               """,
    "block1": r""" 
                        This is a convolutional block. It consists of a convolutial layer, a non-linear activation function and a MaxPoolLayer.
                        Its input is a batch of grayscale images of the dataset. These images are 28 x 28 pixels. 
                        <br> Its output depends on the kernel size and stride parameters. 
            """,
    "block2": r""" 
        This is a convolutional block. It consists of a convolutial Layer, a non-linear activation function and a MaxPoolLayer.
        Its input is the output of the previous block. 
        <br> Its output depends on the kernel size and stride parameters.
    """,
    "block3": r"""
        This is a convolutional block. It consists of a convolutial Layer, a non-linear activation function and a MaxPoolLayer.
        Its input is the output of the previous block. 
        <br> Its output depends on the kernel size and stride parameters.
    """,
    "block4": r"""
        This is a convolutional block. It consists of a convolutial Layer, a non-linear activation function and a MaxPoolLayer.
        Its input is the output of the previous block. 
        <br> Its output depends on the kernel size and stride parameters.
    """,
    "block5":r"""
        This is a convolutional block. It consists of a convolutial Layer, a non-linear activation function and a MaxPoolLayer.
        Its input is the output of the previous block. 
        <br> Its output depends on the kernel size and stride parameters.
    """,
    "outputbox":r"""
        Linear layers make up the final layers in neural networks for classification. As input, they take a vector which in a CNN is a flattened matrix from the previous layer. While data passes through the network, the linear layers perform a linear transformation by multiplying each input neuron by a weight and adding a bias. Several of these layers can be connected sequentially to reduce the number of inputs. Finally, the output consists of a neuron for each class and a corresponding probability determining how likely the input belongs to each class.  
    """,
    "actFuncCol":r"""
        Activations functions play a critical in neural networks as they add nonlinearity to the models hidden layers. This is necessary as it allows for more complex functions inside the model that can also capture nonlinear relationships. Typically, the same activation function is chosen for the entire network.
    """,
    "EpochsCol":r"""
        How often the learning algorithm works through the entire training dataset.
    """,
    "LRateCol":r"""
        By how much to adjust the internal parameters of a neural network during training. Choosing a learning rate that’s too large will lead to over- or undershooting the true optimum while a learning rate that’s too small will increase the time to see improvements dramatically.
    """,
    "BSizeCol":r"""
        How many samples to run through before updating the model parameters. Done both to preserve memory (large datasets can be split into several batches) and improve optimization (individual samples can be noisy, regularizes over a batch of samples).                
    """
}