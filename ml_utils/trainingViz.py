from queue import Queue
import sys
sys.path.append("ml_utils")

import numpy as np
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD

from data import get_data_loaders
from evaluate import accuracy

import requests

from modelbuilder import ModelBuilder
import config
from model import ConvolutionalNeuralNetwork

import pickle #for saving the model



def train_step(model: Module, optimizer: Optimizer, data: Tensor,
               target: Tensor, cuda: bool):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()
    print("data.shape = ", data.shape)
    #data = data.view((-1,28,28,1)) #doesnt work for CNN if this line is used
    
    #currently, the implementation doesn't work with the modelbuilder model -> cannot be trained
    print("data.shape = ", data.shape)
    prediction = model(data)
    print("prediction", prediction)
    loss = F.cross_entropy(prediction, target)
    loss.backward()
    
    optimizer.step()
    optimizer.zero_grad()


def send_data_to_flask(batch_data):
    url = 'http://localhost:5000/receive_data'
    try:
        response = requests.post(url, json=batch_data)
        if response.status_code == 200:
            print('Data sent successfully')
        else:
            print('Failed to send data')
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')


    


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

    for batch_idx, batch in enumerate(train_loader):
        data, target = batch
        train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                    target=target)

        test_loss, test_acc = accuracy(model, test_loader, cuda)
        batch_data = {
            'type': "batch_data",
            'batch_idx': batch_idx ,
            'N_batch': len(train_loader),
            'loss': test_loss,
            'acc': test_acc
        }
        print(batch_data)
        send_data_to_flask(batch_data)
        """
        ax1.set_data(epochs, losses)
        ax1.relim()  
        ax1.autoscale_view() 
        
        ax2.set_data(epochs, accuracies)
        ax2.relim()  
        ax2.autoscale_view() 
        
        plt.pause(1)"""
        if queue is not None:
            queue.put(test_acc)
        #print(f"epoch={epoch+1}, test accuracy={test_acc}, loss={test_loss}")
 #   plt.show() 
    if cuda:
        empty_cache()        

    return test_loss, test_acc  

def main(seed):
    print("init...")
    manual_seed(seed)
    np.random.seed(seed)
    #model = ConvolutionalNeuralNetwork()
    
    model = ModelBuilder(1, config.linear_params, "relu")



    """

    opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
    print("train...")
    training(
        model=model,
        optimizer=opt,
        cuda=False,     # change to True to run on nvidia gpu
        #n_epochs=10,
        batch_size=256,
        learning_rate=0.3,
        momentum=0.5
    )
    print("training finished")
    """
    # save the classification model as a pickle file

    model_pkl_file = "Untrained_modelbuilder_model.pkl"  

    with open(model_pkl_file, 'wb') as file:  
    	pickle.dump(model, file) 
    print(f"model saved to {file}")    


if __name__ == "__main__":
    main(seed=0)


