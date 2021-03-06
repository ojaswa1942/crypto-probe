const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const provideContext = require('./context');
const { db: dbConfig, port } = require('./utils/config');
const { withAuth, withPrivilege } = require('./utils/middlewares');
const { auth, signup, details, analyze } = require('./controllers');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

try {
	const client = new MongoClient(dbConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
		if(err) throw new Error(`Cannot connect to database: ${err}`);
      	
      	const db = client.db(dbConfig.database);
		
		app.use((...args) => provideContext(...args, db));

		app.get('/', (req, res) => res.sendStatus(200));
		app.post('/cryptoprobe/v1/auth', auth);

		app.use(withAuth);
		app.post('/cryptoprobe/v1/analyze', analyze);
		app.post('/cryptoprobe/v1/details', details);
		app.post('/cryptoprobe/v1/signup', withPrivilege, signup);
	});
}
catch(error) {
	logger({ type: `ERROR` }, `Unhandled Exeption@server.js`);
	logger({ type: `ERROR` }, error);
}

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
