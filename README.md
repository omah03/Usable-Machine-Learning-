# Repository for the 'Usable ML' Software Project @ FU Berlin

## General
This repository is for the 'Usable ML' software project course at FU Berlin, provided by Fraunhofer AISEC.
Students will develop a graphical user interface that allows creating machine learning models and manipulating them. Possible features include:
- **Training Interface**
  - **start training**
  - **interrupt training**
  - **continue training**
  - **adjust parameters** (e.g., **learning rate**, **loss function**, momentum, dropout-rate) (0.5 P)
    - **before the training**
    - **during the training**
  - revert to an earlier epoch (1 P)
  - freeze parts of the model (1 P)
- **Training Monitor**
  - **display accuracy and loss over time for training set**
  - **indicate point in training where a parameter was changed**
  - display accuracy and loss over time for test set (0.5 P)
  - display layer-specific information (e.g., gradients) (1 - 2 P)
  - compare different runs (1 P)
  - fork graph when parameters of earlier epochs are changed (1.5 P)
- Model Creator
  - create models using a GUI (2 P)
  - change the composition of layers (1 P)
  - change aspects of the layers (e.g., sizes) (0.5 P)
- Model Evaluator
  - select stored model to be evaluated (0.5 P)
  - evaluate per-class accuracy on test set (or training set, or arbitrary dataset) (1 P)
  - display special examples which (2 P)
    - are falsely predicted
    - are predicted with a small loss

Items in **bold** are expected as a minimum feature set.

## Structure
This structure is required for Flask.
```
project/
    app.py
    templates/
        index.html
    static/
        script.js
        style.css
```

## Installation
1. Clone the environment and go into the folder.
```
git clone https://gitlab.cc-asp.fraunhofer.de/dar80083/usableml_students.git
cd usableml_students
```
2. Install the requirements into a conda environment
```
conda env create -f env.yml
```
3. Install PyTorch into your environment.
Refer to this page for specific instructions: https://pytorch.org/get-started/locally/

## Usage
Activate the environment
```
conda activate UsableML
````
Run the app
```
python3 app.py
```

## License
This project is licensed under the GNU Affero General Public License v3.0. 
