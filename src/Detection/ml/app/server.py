import pandas as pd 
import json
from flask import Flask, jsonify, Response
from model import *

app = Flask(__name__)

@app.route('/<id>', methods = ['GET','POST'])
def get_temp(id):
    return Response(getPrediction(id).to_json(orient="records"), mimetype='application/json')

app.run(host = '127.0.0.1', port = 5000)