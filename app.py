import threading
import queue
import webbrowser

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import numpy as np

from ml_utils.config import conv_params, maxpool_params, ConfigHandler

app = Flask(__name__)
socketio = SocketIO(app)
config={}


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
    if type.startswith("Setting_"): # UGLY SOLUTION 
        NBlock=data.get("block")
        ConfigHandler.set_from_frontend(type.replace("Setting_", ""), NBlock, value)
    else:
        config.update({type: value})
        print(config)
    return jsonify("True")


@app.route("/button_press", methods=["POST"])
def handleButton():
    data=request.get_json()
    type= data.get("type")

    # Do match case statement for every button (python 3.10 doesnt support match case)
    if type=="starttraining":         
        print(" TRAINING STARTING ")
    return jsonify("True")

@app.route("/get_block_config", methods=["GET"])
def get_block_config():
    i = request.args.get('block', default=0, type=int)
    # Format config for frontend
    # TODO Put this in configHandler class method in config.py
    return_config= {
        "conv_KSize": conv_params[i-1]["kernel_size"],
        "conv_Stride": conv_params[i-1]["stride"],
        "conv_Padding": conv_params[i-1]["padding"],
        "pool_KSize": maxpool_params[i-1]["kernel_size"],
        "pool_Stride": maxpool_params[i-1]["stride"],
    }

    return jsonify(return_config)

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 5000
    print("App started")
    threading.Thread(target=listener, daemon=True).start()
    webbrowser.open_new_tab(f"http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=True)
