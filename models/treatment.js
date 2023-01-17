//import dateFormat from "dateformat";
const mongoose = require('mongoose')


const treatmentSchema = {

    treatmentNumber: {
        type: String,
        required: true
    },
    treatmentInformation: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: (new Date()).toLocaleDateString('en-US')//dateFormat(new Date())
    },
    workerEmail: {
        type: String,
        required: true
    },
    carNumber: {
        type: String,
        required: true
    }
}


const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    isLoggedIn: {
        type: Boolean,
        required: true
    }
})


const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    concern: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    }

})

const Treatment = mongoose.model('Treatment', treatmentSchema)
const User = mongoose.model('User', userSchema)
const Contact = mongoose.model('Contact', contactSchema)
module.exports = { Treatment, User, Contact }