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
    print("prediction", prediction)
    loss = F.cross_entropy(prediction, target)
    loss.backward()
    
    optimizer.step()
    optimizer.zero_grad()


def training(model: Module, optimizer: Optimizer, cuda: bool, n_epochs: int,
             batch_size: int, queue: Queue = None):

    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    if cuda:
        model.cuda()
    
    fig, (ax1,ax2) = plt.subplots(2,1,figsize=(10,8))
    losses,epochs,accuracies = [],[],[]
    line1, = ax1.plot(epochs, losses, 'r-', label='Test Loss')
    ax1.set_xlabel('Epochs')
    ax1.set_ylabel('Loss')
    ax1.set_xlim(0, n_epochs)
    ax1.set_ylim(0, 1.0) 
    ax1.legend()

    
    line2, = ax2.plot(epochs, accuracies, 'b-', label='Test Accuracy')
    ax2.set_xlabel('Epochs')
    ax2.set_ylabel('Accuracy')
    ax2.set_xlim(1, n_epochs)
    ax2.set_ylim(5, 100)
    ax2.legend()

    for epoch in range(n_epochs):
        for batch in train_loader:
            data, target = batch
            train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                       target=target)
        test_loss, test_acc = accuracy(model, test_loader, cuda)
        losses.append(test_loss)
        epochs.append(epoch)
        accuracies.append(test_acc)

        line1.set_data(epochs, losses)
        ax1.relim()  
        ax1.autoscale_view() 
        
        line2.set_data(epochs, accuracies)
        ax2.relim()  
        ax2.autoscale_view() 
        
        plt.pause(1)
        if queue is not None:
            queue.put(test_acc)
        print(f"epoch={epoch+1}, test accuracy={test_acc}, loss={test_loss}")
    plt.show() 
    if cuda:
        empty_cache()           


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


