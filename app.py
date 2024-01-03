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

from ml_utils.test_classify import classify_canvas_image

from static.infotexts import infotexts

#FOR USER STUDY ONLY
import time

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template("model.html")
    
@app.route('/model')
def model_page():
    print("TEST")
    return render_template('model.html')

@app.route('/param')
def third_page():
    return render_template('param.html')

@app.route('/train')
def train_page():
    return render_template('train.html')

@app.route('/test')
def test_page():
    return render_template('test.html')

config = {  "ActivationFunc": "",
            "LRate": "",
            "BSize":1,
            "NEpochs":1,
            "NBlocks": 2,
            "Epochs_Trained": 0,
            "training_active": False,
            "training_stop_signal": False}
# Initialize variables
seed = 42
acc = -1
q = queue.Queue()



def listener():
    global q, acc
    while True:
        acc = q.get()
        q.task_done()

@app.route("/get_blocks")
def get_blocks():
    return jsonify({'number': config["NBlocks"]})

@app.route("/update_value", methods=["POST"])
def update_value():
    global config
    print("Die update_value() Funktion wird ausgeführt")
    data= request.get_json()
    type= data.get("type")
    value= data.get("value")
    config.update({type: value})
    print(config)
    return jsonify("True")

@app.route("/infotext", methods=["POST"])
def get_infotext():
    print("Updating Infotext")
    data=request.get_json()
    value= data.get("item")
    return jsonify(infotexts[value])

training_data=[]

@app.route("/get_config", methods=["GET"])
def get_config():
    global config
    print("CONFIG IS BEING SENT TO CLIENT:  ")
    print(config)
    return jsonify(config)


@app.route("/button_press", methods=["POST"])
def handleButton():
    global config
    print("Die handleButton() Funktion wird ausgeführt")
    data=request.get_json()
    type= data.get("type")

    # Do match case statement for every button (python 3.10 doesnt support match case)
    if type=="starttraining":         
        q.put(toggle_training_US())
        return jsonify(config["training_active"])
    if type=="resettraining":
        print("RESET")
        config.update({"training_active":False, "training_stop_signal":True, "Epochs_Trained":0, "acc":[], "loss":[] })
        socketio.emit("training_data", config)
    else:
        print(type)
    return jsonify(True)

def toggle_training_US():
    global config
    acc_values=[0.1, 0.08, 0.06, 0.04, 0.02, 0.04, 0.02, 0.04, 0.02]
    loss_values=[80, 85, 90, 95, 95.5, 96, 97.2, 96 ,94 ]
    if config["training_active"]==False: #start training
        config["training_active"]=True
        config["training_stop_signal"]=False
        for _ in range(int(config["NEpochs"])):
            config["Epochs_Trained"] = config["Epochs_Trained"]+1
            if config["training_stop_signal"]==True:
                break
            N_Batches=60000 // int(config["BSize"])
            for i in range(0, N_Batches+1, 10):
                time.sleep(0.01)
                config.update({"EpochProgress": 100*(i/N_Batches) })
                socketio.emit("training_data", config)
            config.update({"acc": acc_values[:config["Epochs_Trained"]], "loss":loss_values[:config["Epochs_Trained"]]})
            socketio.emit("training_data", config)
        config["training_active"]=False
    elif config["training_active"]==True and config["training_stop_signal"]==False:
        config["training_stop_signal"]=True
    
    socketio.emit("training_data", config)
    

def toggle_training():
    global training_active, training_stop_signal
    print("Die toggle_training() Funktion wird ausgeührt")
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
    print("Die get_training_state() Funktion wird ausgeführt")
    return jsonify(training_active)

@app.route("/receive_data", methods=["POST"])
def receive_data():
    print("Die receive_data() Funktion wird ausgeführt")
    data= request.get_json()
    training_data.append({"progress": [data.get('batch_idx'), data.get('N_batch')],
                              'loss': data.get('loss'), 'acc': data.get('acc')})
    return jsonify("True")




#Get Canvas Image & classify it
test_model = 'ml_utils/MNIST_classifier_model.pkl'
@socketio.on('classify')
def classify(data):
    print("Die classify(data) Funktion wird ausgeführt")
    print("Empfangene Daten:", data)
    canvas_data = data['canvasData']
    print("Canvas data: ", canvas_data)
    classification_result = classify_canvas_image(canvas_data, test_model)
    print("classification result = ", classification_result)
    socketio.emit('classification_result', classification_result)




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
