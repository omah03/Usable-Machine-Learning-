from queue import Queue

if __name__=="__main__":
    import sys
    sys.path.append("../")

import numpy as np
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD
import torch

from ml_utils.leaderboard import Leaderboard
from ml_utils.data import get_data_loaders
from ml_utils.evaluate import accuracy
from ml_utils.modelbuilder import ModelBuilder
import queue

torch.autograd.set_detect_anomaly(True)

import pickle #for saving the model

MOMENTUM = 0.5
acc= -1
class Trainer():
    def __init__(self, socketio, socketioRoom) -> None:
        self.sio= socketio
        self.sioRoom = socketioRoom
        self.model=None
        self.optimizer=None
        self.train_loader=None
        self.test_loader=None
        self.nextEpoch=1
        self.accs= [0]
        self.loss= [0]
        self.config={}
        self.changes=set()
        self.queue= queue.Queue()


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
        print("CALLING")
        LRateValue = self.sio.call("get_LRate", room = self.sioRoom)
        print("CALL DONE")
        flask_config["LRate"]= LRateValue
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
            # change l rate dynamically on batch
            opt_state= self.optimizer.state_dict()
            options = [0.01, 0.1, 0.3, 0.5]
            LRateValue = self.sio.call("get_LRate", room = self.sioRoom)
            LRateValue = options[int(LRateValue)-1]
            if opt_state['param_groups'][0]['lr'] != LRateValue:
                self.changes.add((self.nextEpoch-1) + I_batch/N_batch)
                opt_state['param_groups'][0]['lr'] = LRateValue
                self.optimizer.load_state_dict(opt_state)

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
        
        model_pkl_file = "data/models/Trained_modelbuilder_model"  

        with open(f"{model_pkl_file}{self.sioRoom}.pkl", 'wb') as file:  
            pickle.dump(self.model, file) 
        print(f"model saved to {file}") 

        Leaderboard.add_entry(self.config, self.accs, self.loss, self.nextEpoch, self.sioRoom)

    def reset(self):
        self.model=None
        self.optimizer=None
        self.train_loader=None
        self.test_loader=None
        self.nextEpoch=1
        self.accs= [0]
        self.loss= [0]
        self.config={}
        self.changes=set()

    def add_to_saved_models(self):
        print(self.config.values())

    def save_stats(self):
        print("SAVING")

    @staticmethod
    def convert_config_for_modelbuilder(config:dict):
        res = {}

        options = [0.01, 0.1, 0.3, 0.5]
        string =config["LRate"]
        LRate = int(string)
        res.update({"LRate" : options[LRate-1]})
        
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

        print(res)
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

    def send_data_to_frontend(self,socketio, batch_data):
        socketio.emit("batch_data", batch_data, room= self.sioRoom)

    def send_results_to_frontend(self):
        data= {
            "accs": self.accs,
            "epochs": list(range(1, self.nextEpoch)),
            "losses": self.loss,
            "changes": list(self.changes)
        }
        print(data)
        self.sio.emit("chart_data", data, room=self.sioRoom)

    def training_end(self,x,y):
        print("EXEC TRAINING END")
        self.sio.emit("training_data", {"training_active": False, "training_stop_signal": False, "Epochs_Trained": self.nextEpoch-1}, room= self.sioRoom)

    def work_queue_items(self):
        while not self.queue.empty():
            func, args= self.queue.get()
            self.sio.emit("training_data", {"training_active": True, "training_stop_signal": False, "Epochs_Trained": self.nextEpoch}, room= self.sioRoom)
            
            func(*args)
            try:pass
            except Exception:
                print("ERROR\nERROR    There has been an error with Training. Maybe user has reset the model during Training \nERROR")
            self.queue.task_done()
        #self.sio.emit("training_data", {"training_active": False, "training_stop_signal": False, "Epochs_Trained": self.nextEpoch-1}, room= self.sioRoom)

        
        
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


