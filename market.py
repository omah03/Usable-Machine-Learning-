from flask import Flask, render_template# Importing Flask instance from flask package
from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__) # Initalizing instance of flask with argument __name__ ( Built in variable to call from any python file and refering to local python file)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqLite:///market.db'
db = SQLAlchemy(app)

class Item(db.Model):
    id = db.Column(db.Integer(),primary_key = True)
    name = db.Column(db.String(length=30), nullalbe = False, unique = True)
    price = db.Column(db.Integer(), nullable = False)
    barcode = db.Column(db.String(length=12), nullable = False, unique = True)
    description = db.Column(db.String(length = 1024), nullable = False, unique = True)
                            
@app.route('/') # Decorator  #app - what url im going to navigate to
@app.route('/home')
def home_page():
    return render_template('home.html')

@app.route('/market')
def market_page():
    items = [
        {'id': 1, 'name': 'Phone', 'barcode': '893212299897', 'price': 500},
        {'id': 2, 'name': 'Laptop', 'barcode': '123985473165', 'price': 900},
        {'id': 3, 'name': 'Keyboard', 'barcode': '231985128446', 'price': 150}
    ]
    return render_template('market.html', items=items)

