



// Serve static files from the React app

const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const mongoDB=require("./db")
mongoDB();

app.use(express.json())

app.use(express.static(path.join(__dirname, 'client/build')));

// Handle other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const multer = require('multer');
const { createWorker } = require('tesseract.js');
const bodyParser = require('body-parser');


app.use(bodyParser.json());

app.use('/api', require('./Routes/Auth'));

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})









