# Usable Machine Learning - Catastrophic CupCakes

## Features

The initial repository was for the 'Usable ML' software project course at FU Berlin, provided by Fraunhofer AISEC.
Students will develop a graphical user interface that allows creating machine learning models and manipulating them. Possible features include:

### **Training Interface**
  
- ***start training***
- ***interrupt training***
- ***continue training***
- ***adjust parameters*** (e.g., ***learning rate***, **loss function**, momentum, dropout-rate) (0.5 P)
  - ***before the training***
  - ***during the training***
- revert to an earlier epoch (1 P)
- freeze parts of the model (1 P)
  
### **Training Monitor**

- ***display accuracy and loss over time for training set***
- ***indicate point in training where a parameter was changed***
- display accuracy and loss over time for test set (0.5 P)
- display layer-specific information (e.g., gradients) (1 - 2 P)
- compare different runs (1 P)
- fork graph when parameters of earlier epochs are changed (1.5 P)

### Model Creator

- *create models using a GUI* (2 P)
- *change the composition of layers* (1 P)
- *change aspects of the layers (e.g., sizes)* (0.5 P)

### Model Evaluator

- select stored model to be evaluated (0.5 P)
- evaluate per-class accuracy on test set (or training set, or arbitrary dataset) (1 P)
- display special examples which (2 P)
  - are falsely predicted
  - are predicted with a small loss

Items in **bold** are expected as a minimum feature set.

Items in *cursiv* are implemented.

### Extra Features

- Machine Learning/CNN Explanations
- Interactive Visualization of Convolution
- Interactive Tutorial
- Input Drawn Number (with Heatmap & Softmax Results)

## Known Limitations

- Every client is assigned a room code. The assignment of this room code should be per a hash function
- Multithreading is supported and safe, but for multiprocess deployment, sticky session load balancing is required

## Structure

This is the structure used:

```file
project/
    app.py
    templates/
        *.html
    static/
        componentA/
            componentA.js
            componentA.css
            componentA.*
        componentB/
            componentB.js
            componentB.css
            componentB.*
        ...
        style.css
    ml_utils/
        backend_componentA.py   <-- To be Restructured
        backend_componentB.py

```

### Extending the structure - Frontend

For the frontend component, following requirements should be met:

- The script should be able to be included into any html page; without braking it. Meaning:
  - Any HTMLelement needs to be check for NULL before usage
  - if similar versions of one component exist, they should both be handled by the same .js
- The backend is our only "source of truth". Meaning:
  - Any data should immediatly sent in the backend <-- We might need to adjust this for optimization later
  - Any data should necessary data should be gotten from the backend on loading

## Installation

Python3.10 or newer is required

We provide two ways (conda and venv) of installation. With both options pytorch needs to be installed seperately.

### conda

1. Install the requirements into a conda environment
  ``` {bash}
  conda env create -f env.yml
  ```
2. Install PyTorch into your environment.
Follow official [instructions](https://pytorch.org/get-started/locally/) or just install via pip when enviroment is active

### venv

1. create venv enviroment

      python -m venv venv

1. Install PyTorch into your environment.
  
Follow official [instructions](https://pytorch.org/get-started/locally/) or just install via pip when enviroment is active

1. Install additional requirements

      source venv/bin/activate
      pip install -r requirements

1. Activate/Deactivate enviroment

      source venv/bin/activate
      source venv/bin/deactivate

## Usage
  
1. Activate enviroment (see above)

1. Run the app

``` {python}
python app.py
```

## License

This project is licensed under the GNU Affero General Public License v3.0.
