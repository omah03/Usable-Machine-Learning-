import threading
import queue
import webbrowser
import random
import configparser
from pathlib import Path

from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, join_room, leave_room
from flask import send_file

from ml_utils.explain_classification import get_classification_and_heatmap
from ml_utils.leaderboard import Leaderboard
from ml_utils.Trainer import Trainer

from static.infobox.infotexts import infotexts
import json
import torch
import string

app = Flask(__name__)
socketio = SocketIO(app)

# Initialize variables
seed = 42
acc = -1
q = queue.Queue()

def listener():
    global q
    while True:
        acc = q.get()
        acc()
        q.task_done()

def get_random_key():
    string_length = 15

    # Define characters to choose from (including letters, digits, and special symbols)
    characters = string.ascii_letters + string.digits #+ string.punctuation

    # Generate a random string
    random_string = ''.join(random.choices(characters, k=string_length))
    return random_string


trainers={}

# moved config to session["config"} to prepare for storing the data ina flask session variable (I hope thats possible)
# this would allow multiple users + fix some thread safety concerns
defaultconfig= {"ActivationFunc": "act_reluOption",  
                            "LRate": 2,
                            "BSize":32,
                            "NEpochs":4,
                            "NBlocks": 2,
                            "KSize": "2",
                            "training_active": False,
                            "training_stop_signal": False
}

@app.route('/', methods=['GET', 'POST'])
def index():
    global defaultconfig,trainers
    if not session.get("config"):
        session.update({"config":defaultconfig})
    session["room"]= get_random_key()
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
    conf = session.get("config")
    conf.update({type:value})
    session.update({"config":conf})
    print(session)
    return jsonify("True")

@app.route("/infotext", methods=["POST"])
def get_infotext():
    print("Updating Infotext")
    data=request.get_json()
    value= data.get("item")
    return jsonify(infotexts[value])

@app.route("/get_config", methods=["GET"])
def get_config():
    print("CONFIG IS BEING SENT TO CLIENT:  ")
    print(session)
    return jsonify(session["config"])


@app.route("/button_press", methods=["POST"])
def handleButton():
    print("Die handleButton() Funktion wird ausgeführt")
    data=request.get_json()
    type= data.get("type")

    # Do match case statement for every button (python 3.10 doesnt support match case)
    if type=="starttraining":         
        toggle_training()
        return jsonify(session.get("config")["training_active"])
    if type=="resettraining":
        print("RESET")
        session["config"].update({"training_active":False, "training_stop_signal":False, "Epochs_Trained":0 })
        trainer= trainers[session.get("room")]
        trainer.reset()
    else:
        print(type)
    return jsonify(True)

def toggle_training():
    global trainers,session, CUDA
    trainer = trainers[session.get("room")]
    if trainer.queue.empty():
        session["config"].update({"training_active":True, "training_stop_signal":False})
        for _ in range(int(session["config"]["NEpochs"])):
            trainer.queue.put((trainer.training, (session.get("config"), CUDA)))
        trainer.queue.put((trainer.training_end, (None,None)))
        q.put(trainer.work_queue_items)
    else:
        while not trainer.queue.empty():
            print("Removing Training Epoch")
            x= trainer.queue.get()
            trainer.queue.task_done()
        trainer.queue.put((trainer.training_end, (None,None)))
        session["config"]["training_active"]= True
        session["config"]["training_stop_signal"]= True
    socketio.emit("training_data", session["config"], room= session.get("room"))
    

@app.route("/get_gif", methods=["POST"])
def return_gif():
    gifpath = "static/include/cnngifs/"
    data=request.get_json()
    k = data.get("kernel")
    s = data.get("stride")
    p = data.get("padding")
    return send_file(gifpath+f'cnnK{k}S{s}P{p}.gif', mimetype='image/gif')

#Get Canvas Image & classify it
modelbuilder_model = 'data/models/Trained_modelbuilder_model'
#print(f"using {test_model}")
@app.route('/classify', methods=["POST"])
def classify():
    data = request.get_json()
    canvas_data = data['canvasData']
    softmaxValues, permutation, heatmap = get_classification_and_heatmap(canvas_data, f"{modelbuilder_model}{session.get('room')}.pkl")
    data = {
    "softmaxValues": softmaxValues,
    "permutation": permutation,
    }
    classification_result = json.dumps(data)
    socketio.emit('classification_result', classification_result, room= session.get("room"))
    return send_file(heatmap, mimetype="Image/png")


@app.route("/get_Leaderboard", methods=["GET"])
def return_leaderboard():
    l = Leaderboard()
    entries = l.get_topX(int(config["SERVER"]["leaderboardSize"]))
    #print(f"Sending Leaderboard entries {(entries)}")
    return jsonify(entries)
    

@app.route("/get_model_for_Leaderboard", methods=["GET"])
def return_model():
    print("return model for Leaderboard")
    conf = session["config"]
    trainer = trainers[session["room"]]
    settings=Trainer.convert_config_for_modelbuilder(conf)  
    conf.update({"settings": settings})
    conf.update({"Epochs_Trained": trainer.nextEpoch-1})
    conf.update({"accs":trainer.accs})
    conf.update({"loss":trainer.loss})
    conf.update({"sioRoom": session.get("room")})
    return jsonify(Leaderboard.get_as_entry(conf))
    
@app.route("/get_sio_key")
def return_room():
    return jsonify(session["room"])    

if __name__ == "__main__":
    # get config
    config= configparser.ConfigParser()
    if not Path("config.ini").exists():
        print("No config found, creating default config...")
        with open("default_config.ini", "r") as f:
            c = f.read()
        with open("config.ini", "w") as f:
            f.write(c)
        config.read("config.ini")
        config.set("SERVER", "secretKey", get_random_key()+get_random_key())
    else:
        config.read("config.ini")

    global CUDA
    CUDA = config["TRAINING"].getboolean("AllowCuda") and torch.cuda.is_available()

    app.secret_key=config["SERVER"]["secretKey"]


    print("App started")
    threading.Thread(target=listener, daemon=True).start()
    if config["OTHER"]["openBrowser"]:
        webbrowser.open_new_tab(f'http://{config["SERVER"]["host"]}:{config["SERVER"]["port"]}')
    socketio.run(app, host=config["SERVER"]["host"], port=config["SERVER"]["port"], debug=config["OTHER"].getboolean("debug"))
