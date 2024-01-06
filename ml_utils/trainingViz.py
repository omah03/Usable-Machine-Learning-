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


import pickle #for saving the model

MOMENTUM = 0.5

def convert_config_for_modelbuilder(config:dict):
    res = {}
    string =config["LRate"]
    string = "0."+string[6:]
    LRate = float(string)
    res.update({"LRate" : LRate})
    
    BSize = int(config["BSize"])
    res.update({"BSize": BSize})
    
    string = config["ActivationFunc"]
    res.update({"ActFunc": string})
    
    print(res)
    return res
    

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


def send_data_to_frontend(socketio,batch_data):
    socketio.emit("training_data", batch_data)


    


def training(model: Module, optimizer: Optimizer, cuda: bool, 
             config:dict,  queue: Queue = None, socketio= None):
    print("training")
    settings= convert_config_for_modelbuilder(config)
    
    train_loader, test_loader = get_data_loaders(batch_size=settings["BSize"])
    if cuda:
        model.cuda()
 
    opt = optimizer
    optimizer_state = opt.state_dict()

    try:
        optimizer_state['param_groups'][0]['lr'] = float(settings["LRate"])
        optimizer_state['param_groups'][0]['momentum'] = MOMENTUM
        optimizer.load_state_dict(optimizer_state)
    except ValueError:
        print('Accepts only numerical values.')

    for batch in train_loader:
        data, target = batch
        train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                    target=target)

        batch_data = {
            'type': "batch_data",
            'N_batch': len(train_loader),
        }
        print(batch_data)
        send_data_to_frontend(socketio, batch_data)

        if queue is not None:
            queue.put(test_acc)
    test_loss, test_acc = accuracy(model, test_loader, cuda)

    if cuda:
        empty_cache()        

    return test_loss, test_acc  

def main(seed):
    config= {}
    
    
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
    print("training finished")

    # save the classification model as a pickle file

    model_pkl_file = "MNIST_classifier_model.pkl"  

    with open(model_pkl_file, 'wb') as file:  
        pickle.dump(model, file) 
    print(f"model saved to {file}")    


if __name__ == "__main__":
    main(seed=0)


