from queue import Queue

if __name__=="__main__":
    import sys
    sys.path.append("../")

import numpy as np
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD

from ml_utils.data import get_data_loaders
from ml_utils.evaluate import accuracy
from ml_utils.modelbuilder import ModelBuilder

import pickle #for saving the model

MOMENTUM = 0.5

class Trainer():
    def __init__(self, socketio) -> None:
        self.sio= socketio
        self.model=None
        self.optimizer=None
        self.train_loader=None
        self.test_loader=None
        self.nextEpoch=1
        self.accs= []
        self.loss= []
        self.config={}
        self.changes=set()

    def add_model_and_config(self, config):
        settings= self.convert_config_for_modelbuilder(config)
        block_n = settings["NBlocks"]
        self.model= ModelBuilder( k_size=settings["KSize"],num_blocks=block_n, activation_fn_choice=config["ActivationFunc"],)
        self.config["NBlocks"]=block_n

        self.optimizer= SGD(self.model.parameters(), lr=float(settings["LRate"]), momentum=MOMENTUM)
        self.config= settings

        self.train_loader, self.test_loader= get_data_loaders(settings["BSize"])

    def update_config(self, config)->bool:
        settings= self.convert_config_for_modelbuilder(config)
        
        opt_state= self.optimizer.state_dict()
        if opt_state['param_groups'][0]['lr'] != settings["LRate"]:
            self.changes.add(self.nextEpoch-1)
            opt_state['param_groups'][0]['lr'] = settings["LRate"]
            self.optimizer.load_state_dict(opt_state)

        if settings["BSize"]!= self.config["BSize"]:
            self.train_loader, self.test_loader = get_data_loaders(settings["BSize"])
            self.changes.add(self.nextEpoch-1)

        self.config.update(settings)

    def training(self, flask_config, cuda):
        if self.model==None:
            self.add_model_and_config(flask_config)
        else:
            self.update_config(flask_config)
        self.send_results_to_frontend()


        if cuda:
            self.model.cuda()

        N_batch= len(self.train_loader)
        I_batch=1
        for batch in self.train_loader:
            data, target = batch
            self.train_step(cuda=cuda, data=data, target=target)

            batch_data = {
                'type': "batch_data",
                'batch': I_batch,
                'N_batch': N_batch,
            }
            self.send_data_to_frontend(self.sio, batch_data)

            I_batch+=1
        test_loss, test_acc = accuracy(self.model, self.test_loader, cuda)
        if cuda:
            empty_cache()    

        self.nextEpoch+=1
        self.accs.append(test_acc)
        self.loss.append(test_loss)  
        self.send_results_to_frontend()
        
        model_pkl_file = "ml_utils/Trained_modelbuilder_model.pkl"  

        with open(model_pkl_file, 'wb') as file:  
            pickle.dump(self.model, file) 
        print(f"model saved to {file}") 

    def reset(self):
        self.model=None
        self.optimizer=None
        self.train_loader=None
        self.test_loader=None
        self.nextEpoch=1
        self.accs= []
        self.loss= []
        self.config={}
        self.changes=set()


    @staticmethod
    def convert_config_for_modelbuilder(config:dict):
        res = {}
        string =config["LRate"]
        LRate = float(string)
        res.update({"LRate" : LRate})
        
        BSize = int(config["BSize"])
        res.update({"BSize": BSize})
        
        string = config["ActivationFunc"]
        res.update({"ActFunc": string})
        
        string= config["NBlocks"]
        res.update({"NBlocks": int(string)})
        
        options=["small", "medium", "large"]
        i = int(config["KSize"])
        
        res.update(
            {"KSize": options[i-1]})
        



        return res
        

    def train_step(self, data: Tensor,
                target: Tensor, cuda: bool):
        self.model.train()
        if cuda:
            data, target = data.cuda(), target.cuda()
        prediction = self.model(data)
        loss = F.cross_entropy(prediction, target)
        loss.backward()
        
        self.optimizer.step()
        self.optimizer.zero_grad()

    @staticmethod
    def send_data_to_frontend(socketio,batch_data):
        socketio.emit("batch_data", batch_data)

    def send_results_to_frontend(self):
        data= {
            "accs": self.accs,
            "epochs": list(range(1, self.nextEpoch)),
            "losses": self.loss,
            "changes": list(self.changes)
        }
        print(data)
        self.sio.emit("chart_data", data)

def main(seed):
    config= {}
    
    
    print("init...")
    manual_seed(seed)
    np.random.seed(seed)
    t = Trainer()
    config= {}
    
    print("train...")

    print("training finished")
    """
    # save the classification model as a pickle file

    model_pkl_file = "Untrained_modelbuilder_model.pkl"  

    with open(model_pkl_file, 'wb') as file:  
        pickle.dump(model, file) 
    print(f"model saved to {file}")  
    """

if __name__ == "__main__":
    main(seed=0)


