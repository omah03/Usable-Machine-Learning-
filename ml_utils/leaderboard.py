from pathlib import Path
import json
from datetime import datetime

DEFAULTPATH = "data/models"

class Leaderboard():
    path= DEFAULTPATH
    def __init__(self, filepath= None):
        Leaderboard.path = filepath if filepath else DEFAULTPATH
        self.entries = []
        self._get_entries_from_folder()
        self._sort_entries_by_accuracy()
    
    def _get_entries_from_folder(self):
        path = Path(self.path)
        files = path.glob("*.json")
        for file in files:
            assert self.is_valid_entry(file)
            with open(file, "r") as fbuff:
                dict = json.load(fbuff)
                self.entries.append(dict)
            
    
    def _sort_entries_by_accuracy(self):
        self.entries= sorted(self.entries, key= lambda d: d["accuracy"], reverse=True)
        
    def get_topX(self, x : int = 5):    
        return self.entries[:x]
    
    @staticmethod
    def add_entry(config:dict, accs:list, loss:list, NextEpoch:int, sioRoom:str):
        res = {
            "Epochs": NextEpoch-1,
            "accuracy": accs[-1],
            "loss": loss[-1],
            "settings": config,
            "creator": sioRoom
        }
        name = Leaderboard.path + "/Model"+ (datetime.now().strftime("%Y%m%d%H%M%S%f")) +".json"
        with open(name, "w") as file:
            json.dump(res, file)
        #self.entries.append(res)
        # self._sort_entries_by_accuracy()
        
    @staticmethod
    def get_as_entry(dict):
        res = {
                    "Epochs": dict["Epochs_Trained"],
                    "accuracy": dict["accs"][-1],
                    "loss": dict["loss"][-1],
                    "settings": dict["settings"],
                    "creator": dict["sioRoom"]
                }
        return res
    
    @staticmethod
    def is_valid_entry(file):
        return True
    
if __name__=="__main__":
    # Generate some random entries
    L = Leaderboard()
    for _ in range(5):
        L.add_entry(
        {
            "Epochs_Trained": 1,
            "accs": [0,2,2,2,2],
            "loss": [0,2,2,2,2],
            "settings":{
                "KSize": 2,
                "NBlocks": 3,
                "ActFunc": "act_reluOption", 
            }
        })