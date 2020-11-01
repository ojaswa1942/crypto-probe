import pandas as pd 
import json
from flask import Flask, jsonify, Response
from model import *
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods = ['GET', 'POST'])
def getPing():
	return Response("It is working")

@app.route('/<id>', methods = ['GET','POST'])
def getModelResponse(id):
	modelResponse = getPrediction(id).to_json(orient="records")
	return Response(modelResponse, mimetype='application/json')

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=5000)