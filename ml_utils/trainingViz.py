from queue import Queue
import sys
sys.path.append("ml_utils")

import numpy as np
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD

from ml_utils.data import get_data_loaders
from ml_utils.evaluate import accuracy

import requests

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

    return test_loss, test_acc  


