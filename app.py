import threading
import queue
import webbrowser

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import numpy as np
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD
from flask import Response,stream_with_context

from ml_utils.model import ConvolutionalNeuralNetwork
from ml_utils.trainingViz import training

app = Flask(__name__)
socketio = SocketIO(app)


config = {  "ActivationFunc": "",
            "LRate": 1,
            "BSize":1,
            "KSize":1,
            "NEpochs":1,
            "Stride":1,
            "NBlocks": 2}
# Initialize variables
seed = 42
acc = -1
q = queue.Queue()


def listener():
    global q, acc
    while True:
        acc = q.get()
        q.task_done()

@app.route("/", methods=["GET", "POST"])
def index():
    global seed, acc
    # render "index.html" as long as user is at "/"
    return render_template("index.html")

@app.route("/update_value", methods=["POST"])
def update_value():
    global config
    data= request.get_json()
    type= data.get("type")
    value= data.get("value")
    config.update({type: value})
    print(config)
    return jsonify("True")

lock= True#Lock()
training_active= False

training_stop_signal= False

training_data=[]


@app.route("/button_press", methods=["POST"])
def handleButton():
    data=request.get_json()
    type= data.get("type")

    # Do match case statement for every button (python 3.10 doesnt support match case)
    if type=="starttraining":         
        q.put(toggle_training())
        return jsonify(training_active)
    return jsonify(True)

def toggle_training():
    global training_active, training_stop_signal
    if training_active==False:
        training_active=True    
        manual_seed(seed)
        np.random.seed(seed)
        model = ConvolutionalNeuralNetwork()
        opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
        for i in config["NEpochs"]:
            q.put(training(
            model=model,
            optimizer=opt,
            cuda=False,     # change to True to run on nvidia gpu
            batch_size=256,
            learning_rate=0.01,
            momentum=0.9
            ))
            if training_stop_signal==True:
                training_active=False
                print(f"STOP TRAINING AFTER EPOCH {i}")
                break
        #TODO:UPDATE training_data with epch_data
    else:
        print("\n \n \n STOPPED TRAINING")
        training_stop_signal=False

@app.route("/get_training_state", methods=["GET"])
def get_training_state():
    return jsonify(training_active)

@app.route("/receive_data", methods=["POST"])
def receive_data():
    data= request.get_json()
    training_data.append({"progress": [data.get('batch_idx'), data.get('N_batch')],
                              'loss': data.get('loss'), 'acc': data.get('acc')})
    return jsonify("True")

"""
@app.route("/update_seed", methods=["POST"])
def update_seed():
    global seed
    seed = int(request.form["seed"])
    return jsonify({"seed": seed})


@app.route("/get_accuracy")
def get_accuracy():
    global acc
    return jsonify({"acc": acc})
"""

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 5000
    print("App started")
    threading.Thread(target=listener, daemon=True).start()
    webbrowser.open_new_tab(f"http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=True)
