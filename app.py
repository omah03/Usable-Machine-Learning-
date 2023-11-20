import threading
import queue
import webbrowser

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import numpy as np
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD

from ml_utils.model import ConvolutionalNeuralNetwork
from ml_utils.training import training


app = Flask(__name__)
socketio = SocketIO(app)


config = {"LRate": 1,
            "BSize":1,
            "KSize":1,
            "NEpochs":1,
            "Stride":1}
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


@app.route("/start_training", methods=["POST"])
def start_training():
    # ensure that these variables are the same as those outside this method
    global q
    # determine pseudo-random number generation
    manual_seed(seed)
    np.random.seed(seed)
    # initialize training
    model = ConvolutionalNeuralNetwork()
    opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
    # execute training
    training(model=model,
             optimizer=opt,
             cuda=True,
             n_epochs=10,
             batch_size=256,
             queue=q)
    return jsonify({"success": True})

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
