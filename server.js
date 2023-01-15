// import dotenv in order to use environmetal variables
require('dotenv').config()

const express = require('express')

const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000', 'https://snmgarage.onrender.com/');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

mongoose.set("strictQuery", false)
mongoose.connect("mongodb+srv://shaked:Jr0karZjxP4veE0d@snm-garage.pjfjf0z.mongodb.net/SnM-Garage?retryWrites=true&w=majority", { useNewUrlParser: true });

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const treatmentsRouter = require('./routes/api')
app.use('/api', treatmentsRouter)                  //url: localhost:3000//treatments - anything that has this url or anythong after we go to our routes folder



console.clear();
app.listen(3232, () => console.log('Server Started'))