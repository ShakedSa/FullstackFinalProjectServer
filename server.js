// import dotenv in order to use environmetal variables
require('dotenv').config()

const express = require('express')


const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOrigin = require('./corsOptions');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (corsOrigin.origins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
        req.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Origin', origin);
    }
    next();
});

app.use(cors(corsOrigin));

mongoose.set("strictQuery", false)
mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const treatmentsRouter = require('./routes/api')
app.use('/api', treatmentsRouter)                  //url: localhost:3000//treatments - anything that has this url or anythong after we go to our routes folder



console.clear();
app.listen(3232, () => console.log('Server Started'))