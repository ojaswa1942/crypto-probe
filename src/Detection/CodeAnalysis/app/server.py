from cryptoprobe import main as getAnalysis
import json
from flask import Flask, jsonify, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods = ['GET', 'POST'])
def getPing():
	return Response("It is working")

@app.route('/<id>', methods = ['GET','POST'])
def getAnalysisResponse(id):
	res = getAnalysis(id)
	return Response(res, mimetype='application/json')

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=5000)
