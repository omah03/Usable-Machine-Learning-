import threading
import queue
import webbrowser
import random

from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, join_room, leave_room
from flask import send_file

from ml_utils.explain_classification import classify_canvas_image

from ml_utils.trainingViz import Trainer

from static.infobox.infotexts import infotexts

app = Flask(__name__)
socketio = SocketIO(app)


trainers={}
app.secret_key="TESTSECRET"

# moved config to session["config"} to prepare for storing the data ina flask session variable (I hope thats possible)
# this would allow multiple users + fix some thread safety concerns
defaultconfig= {"ActivationFunc": "act_reluOption",  
                            "LRate": 2,
                            "BSize":1,
                            "NEpochs":1,
                            "NBlocks": 2,
                            "KSize": "2",
                            "Epochs_Trained": 0,
                            "training_active": False,
                            "training_stop_signal": False}

@app.route('/', methods=['GET', 'POST'])
def index():
    global defaultconfig,trainers
    if not session.get("config"):
        session["config"]= defaultconfig
    session["room"]= str(random.randint(0,10000))
    trainers[session.get("room")]= Trainer(socketio, session.get("room"))
    
    return render_template("index.html")
    

@socketio.on('connect')
def on_connect():
    room = session.get('room')  # Define how you assign rooms
    join_room(room)

@socketio.on('disconnect')
def on_disconnect():
    room = session.get('room')
    leave_room(room)
    
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
    print(session["config"])
    return jsonify({'number': session.get("config")["NBlocks"]})

@app.route("/update_value", methods=["POST"])
def update_value():
    print("Die update_value() Funktion wird ausgeführt")
    data= request.get_json()
    type= data.get("type")
    value= data.get("value")
    session["config"].update({type: value})
    print(session["config"])
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
    print("CONFIG IS BEING SENT TO CLIENT:  ")
    print(session["config"])
    return jsonify(session["config"])


@app.route("/button_press", methods=["POST"])
def handleButton():
    print("Die handleButton() Funktion wird ausgeführt")
    data=request.get_json()
    type= data.get("type")

    # Do match case statement for every button (python 3.10 doesnt support match case)
    if type=="starttraining":         
        q.put(toggle_training_US())
        return jsonify(session["config"]["training_active"])
    if type=="resettraining":
        print("RESET")
        session["config"].update({"training_active":False, "training_stop_signal":True, "Epochs_Trained":0, "acc":[], "loss":[] })
        socketio.emit("training_data", session["config"], room = session.get("room"))       
        trainer= trainers[session.get("room")]
        trainer.reset()
    else:
        print(type)
    return jsonify(True)

def toggle_training_US():
    trainer = trainers[session.get("room")]
    if session["config"]["training_active"]==False: #start training
        session["config"]["training_active"]=True
        session["config"]["training_stop_signal"]=False
        for _ in range(int(session["config"]["NEpochs"])):
            if session["config"]["training_stop_signal"]==True:
                break
            session["config"]["Epochs_Trained"] += 1
            socketio.emit("training_data",session["config"], room= session.get("room"))
            trainer.training(session["config"], cuda=False)
        session["config"]["training_active"]=False
    elif session["config"]["training_active"]==True and session["config"]["training_stop_signal"]==False:
        session["config"]["training_stop_signal"]=True
    
    socketio.emit("training_data", session["config"])
    

@app.route("/get_gif", methods=["POST"])
def return_gif():
    gifpath = "static/include/cnngifs/"
    data=request.get_json()
    k = data.get("kernel")
    s = data.get("stride")
    p = data.get("padding")
    return send_file(gifpath+f'cnnK{k}S{s}P{p}.gif', mimetype='image/gif')


#Get Canvas Image & classify it
modelbuilder_model = 'ml_utils/Trained_modelbuilder_model.pkl'
#print(f"using {test_model}")
@socketio.on('classify')
def classify(data):
    print("Die classify(data) Funktion wird ausgeführt")
    print("Empfangene Daten:", data)
    canvas_data = data['canvasData']
    print("Canvas data: ", canvas_data)
    classification_result = classify_canvas_image(canvas_data, modelbuilder_model)
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
