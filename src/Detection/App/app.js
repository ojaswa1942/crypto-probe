const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const handleScan = require('./scanHandler');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendStatus(200));
app.get('/scan/:id', handleScan);
app.post('/scan/:id', handleScan);

let port = 5000;
app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
