const express = require('express');
const knex = require('knex');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const provideContext = require('./context');
const { pgConfig, port } = require('./utils/config');
require('dotenv').config();

const db = knex({
  client: `pg`,
  connection: pgConfig,
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((...args) => provideContext(...args, db));

app.get('/', (req, res) => res.sendStatus(200));
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
