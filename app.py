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


app = Flask(__name__)
socketio = SocketIO(app)


config = {  "ActivationFunc": "",
            "LRate": 1,
            "BSize":1,
            "NEpochs":1,
            "NBlocks": 2}
# Initialize variables
seed = 42
acc = -1
q = queue.Queue()

@app.route('/third_page')
def third_page():
    # Display the third HTML structure
    return render_template('test_page.html')

def listener():
    global q, acc
    while True:
        acc = q.get()
        q.task_done()

@app.route("/", methods=["GET", "POST"])
def index():
    global seed, acc
    print("Die index() Funktion wird ausgeführt")
    # render "index.html" as long as user is at "/"
    return render_template("index.html")


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

lock= True#Lock()
training_active= False

training_stop_signal= False

training_data=[]


@app.route("/button_press", methods=["POST"])
def handleButton():
    print("Die handleButton() Funktion wird ausgeführt")
    data=request.get_json()
    type= data.get("type")

    # Do match case statement for every button (python 3.10 doesnt support match case)
    if type=="starttraining":         
        q.put(toggle_training())
        return jsonify(training_active)
    return jsonify(True)

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
