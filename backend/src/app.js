const express = require('express');
const app = express();
const newsRouter = require('./routes/news');
const path = require('path');
const { createEngine } = require('express-react-views');
const route = require('./routes');
const db = require('./config/db');

db.connect();

const hostname = 'localhost';
const port = 9999;

app.set('view engine', 'jsx'); 
app.set('views', path.join(__dirname, 'views'));
app.engine('jsx', createEngine());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
route(app);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});