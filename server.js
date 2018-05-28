const express = require('express');
const mongoose = require('mongoose');

const app = express();

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World'));

// process.env.PORT for Heroku, port 8080 for local
const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server running on port ${port}`));