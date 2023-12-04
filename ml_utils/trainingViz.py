from queue import Queue
import sys
sys.path.append("ml_utils")

import numpy as np
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD
from torch.utils.tensorboard import SummaryWriter

from data import get_data_loaders
from evaluate import accuracy
from model import ConvolutionalNeuralNetwork

import matplotlib.pyplot as plt 
from matplotlib.animation import FuncAnimation

def train_step(model: Module, optimizer: Optimizer, data: Tensor,
               target: Tensor, cuda: bool):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()
    prediction = model(data)
    loss = F.cross_entropy(prediction, target)
    loss.backward()
    
    optimizer.step()
    optimizer.zero_grad()


    


def training(model: Module, optimizer: Optimizer, cuda: bool, 
             batch_size: int,learning_rate, momentum,  queue: Queue = None):
    print("training")
    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    if cuda:
        model.cuda()
    
 
    opt = optimizer
    optimizer_state = opt.state_dict()



    try:
        optimizer_state['param_groups'][0]['lr'] = float(learning_rate)
        optimizer_state['param_groups'][0]['momentum'] = float(momentum)
        optimizer.load_state_dict(optimizer_state)
    except ValueError:
        print('Accepts only numerical values.')

    for batch in train_loader:
        data, target = batch
        train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                    target=target)

        test_loss, test_acc = accuracy(model, test_loader, cuda)


    return test_loss, test_acc  


def main(seed):
    print("init...")
    manual_seed(seed)
    np.random.seed(seed)
    model = ConvolutionalNeuralNetwork()
    opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
    print("train...")
    training(
        model=model,
        optimizer=opt,
        cuda=False,     # change to True to run on nvidia gpu
        n_epochs=10,
        batch_size=256
    )
   
    


if __name__ == "__main__":
    main(seed=0)


