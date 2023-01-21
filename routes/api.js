const express = require('express')
const router = express.Router()
const { Treatment, User, Contact } = require('../models/treatment')
var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bestgarageinbraude@gmail.com',
        pass: 'mrsyjhsejdemtdcp'
    },
    secure: false
})



// Request to login 
router.post('/login', async (req, res) => {
    var user;
    try {
        const all_users = await User.find();
        user = all_users.find((x) => x.email === req.body.email);
        if (user === null || user === undefined) {
            return res.json({ message: 'Email doesn`t exists.' });
        }
        if (user.password !== req.body.password) {
            return res.json({ message: 'Password doesn`t match.' });
        }
        if (user.isLoggedIn) {
            return res.json({ message: 'User already logged in, in a different device. Please logout before trying to log in.' });
        }

        const session = (Math.random() + 1).toString(36).substring(7);

        var myquery = { email: user.email };
        var newvalues = { $set: { sessionId: session, isLoggedIn: true } };
        const options = { upsert: true };
        await User.updateOne(myquery, newvalues, options);
        return res.json({ sessionId: session });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})

router.post('/login-session', async (req, res) => {
    const { sessionId } = req.body;
    const users = await User.find();
    const user = users.find(user => user.sessionId === sessionId);
    if (user === null || user === undefined) {
        return res.json({ message: 'Session expired, please login again.' });
    }
    return res.json({ sessionId: sessionId });
})

router.post('/logout', async (req, res) => {
    try {
        const allUsers = await User.find();
        const user = allUsers.find((user) => user.sessionId === req.body.sessionId);
        if (user === null || user === undefined) {
            return res.status(500).json({ message: "User doesn't exists. You found a bug!" });
        }
        var myquery = { email: user.email };
        var newvalues = { $set: { isLoggedIn: false } };
        const options = { upsert: true };
        await User.updateOne(myquery, newvalues, options);
        return res.status(200).json({ message: "True" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})


// Request for creating a new account 
router.post('/signup', async (req, res) => {
    var user;
    const new_user = new User({
        email: req.body.email,
        password: req.body.password,
        sessionId: "-1",
        isLoggedIn: false
    });

    try {
        const all_users = await User.find();
        user = all_users.find(x => x.email === req.body.email);
        if (user === null || user === undefined) {
            var mailOptions = {
                from: 'BestGarageInBraude@gmail.com',
                to: user.email,
                subject: 'Your account has been created successfully',
                text: 'Dear ' + req.body.email.split('@')[0] +
                    ',\n\nWe are so glad to have you on board!\n You are now one of the exclusive clients of the world famous BestGarage.' +
                    '\n\nThank you and drive safe,\n BestGarageInBraude'
            };

            transporter.sendMail(mailOptions, async function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    await new_user.save();
                    res.json({ message: 'True' });
                }
            });

        }
        else {
            res.json({ message: 'False' });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})



// request to begin Forget password process
router.post('/forgetpassword', async (req, res) => {
    var user;

    try {
        const all_users = await User.find();
        user = all_users.find(x => x.email == req.body.email);
        if (user === null || user === undefined) {
            return res.json({ message: 'False' });
        }

        var mailOptions = {
            from: 'BestGarageInBraude@gmail.com',
            to: user.email,
            subject: 'Recent changes to your BestGarage account',
            text: 'Dear ' + req.body.email.split('@')[0] + ',\n\nAs requested your password is: ' + user[0].password + '\n\nThank you and drive safe,\n BestGarageInBraude'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.json({ message: error.message });
            } else {
                res.json({ message: 'True', response: info.response });
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})


// request for new cotact us summision
router.post('/contact-us', async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const concern = req.body.concern;
        const subject = req.body.subject;

        // send mail to user
        var mailOptions = {
            from: 'BestGarageInBraude@gmail.com',
            to: email,
            subject: 'BestGarage - Contact us conformation',
            text: 'Dear ' + name + ',\n\nThank you for contacting us.\nWe have received your approch regarding: ' + concern +
                '.\nWith the following message:\n' + subject +
                '\n\nWe will do our absolute best to get back to you within the next 24 hours.\n\nThank you and drive safe,\n BestGarageInBraude'
        };

        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                res.json({ mesage: error.message })
            } else {
                console.log('Email sent: ' + info.response);
                const contact = new Contact({
                    name: req.body.name,
                    email: req.body.email,
                    concern: req.body.concern,
                    subject: req.body.subject
                })
                await contact.save();
                res.status(200).json({ message: 'True' });
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.mesage });
    }
})

router.post('/contact-email', async (req, res) => {
    const { sessionId } = req.body;
    const users = await User.find();
    const user = users.find(user => user.sessionId === sessionId)
    if (user === null || user === undefined) {
        return res.json("Invalid session id");
    }

    var mailOptions = {
        from: 'BestGarageInBraude@gmail.com',
        to: user.email,
        subject: 'BestGarage - Contact us conformation',
        text: 'Thank you for contacting us.\nWe have received your information and we will get back to regarding your issue.' +
            '\n\nThank you and drive safe,\n BestGarageInBraude'
    };
    transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            res.json({ mesage: error.message })
        } else {
            res.status(200).json({ message: 'True' });
        }
    });
})


// request to get all user treatments
router.get('/dashboard/gettotal/:sessionId', async (req, res) => {
    var user_treatments;

    try {
        const users = await User.find();
        const user = users.find((x) => x.sessionId === req.params.sessionId);
        const treatments = await Treatment.find();
        if (user.email === "admin@admin.com") {
            return res.json(treatments.length);
        }
        user_treatments = treatments.filter(x => x.workerEmail === user.email);
        res.json(user_treatments.length);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})

router.get('/dashboard/:sessionId', async (req, res) => {
    const users = await User.find();
    const user = users.find(x => x.sessionId == req.params.sessionId);
    if (user === null || user === undefined) {
        res.json({ message: "Invalid session id. Please login again." });
        return;
    }
    const treatments = await Treatment.find();
    let userTreatments;
    if (user.email === "admin@admin.com") {
        userTreatments = treatments;
    } else {
        userTreatments = treatments.filter((treatment) => treatment.workerEmail === user.email);
    }

    let tempData;
    const searchQuery = req.query.search?.toLowerCase();
    const isSearchQuery = searchQuery && searchQuery !== undefined && searchQuery !== 'undefined' && searchQuery !== ''
    if (isSearchQuery) {
        tempData = userTreatments.filter((treatment) => {
            return (treatment.treatmentInformation.toLowerCase().includes(searchQuery)
                || treatment.treatmentNumber.includes(searchQuery)
                || treatment.date.toString().includes(searchQuery)
                || treatment.carNumber.toString().includes(searchQuery))
        });
    } else {
        tempData = userTreatments;
    }
    const page = isNaN(req.query.page) || req.query.page === '' || isSearchQuery ? 1 : req.query.page;
    const startIndex = (page - 1) * 10;
    const endIndex = page * 10;
    const paginatedTreatments = tempData.slice(startIndex, endIndex);
    res.json(paginatedTreatments);
});



// request to Create a new treatment
router.post('/dashboard/createTreatment', async (req, res) => {
    var sessionId = req.body.sessionId;

    const users = await User.find();

    // validate the given e-mail is a signed user
    const user = users.find(x => x.sessionId === sessionId)
    if (user === null || user === undefined) {
        return res.json({ message: 'Unable to find user' })
    }

    // valiate the given car number
    if (req.body.carNumber.length != 8 || isNaN(req.body.carNumber)) {
        return res.json({ message: 'Car number is not valid' })
    }

    const treatments = await Treatment.find();

    let maxTreatmentNumber = "0";

    treatments.forEach((treatment) => {
        if (parseInt(treatment.treatmentNumber, 10) > parseInt(maxTreatmentNumber, 10)) {
            maxTreatmentNumber = treatment.treatmentNumber;
        }
    })

    const treatment = new Treatment({
        treatmentNumber: `${(parseInt(maxTreatmentNumber, 10) + 1)}`,           // environmental variable to serve as an auto increment
        treatmentInformation: req.body.treatmentInformation,
        workerEmail: req.body.workerEmail,
        carNumber: req.body.carNumber
    })


    try {
        const newTreatment = await treatment.save();
        res.status(200).json({ message: "True" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})



// request to update a treatment 
router.patch('/dashboard/updates', async (req, res) => {
    if (req.body.treatmentNumber == null) {
        return resjson({ message: 'False' })
    }

    try {
        const treatment = await Treatment.find({ treatmentNumber: req.body.treatmentNumber })
        if (treatment.length == 0) {
            return res.json({ message: 'False' })
        }
        // validate the given car number
        if (req.body.carNumber.length != 8 || isNaN(req.body.carNumber)) {
            return res.json({ message: 'Car number is not valid' });
        }

        var myquery = { treatmentNumber: req.body.treatmentNumber };
        var newvalues = { $set: { treatmentInformation: req.body.treatmentInformation, carNumber: req.body.carNumber, date: req.body.date } };
        const options = { upsert: true };

        await Treatment.updateOne(myquery, newvalues, options);
        res.status(200).json(treatment);
    } catch (err) {
        res.status(500).json({ message: err.message });

    }
})


// request to delete a treatment
router.delete('/dashboard/delete/:id', async (req, res) => {
    try {
        const validation = await Treatment.find({ treatmentNumber: req.params.id });
        if (validation.length == 0) {
            return res.json({ message: 'False' })
        }
        const treatment = await Treatment.deleteOne({ treatmentNumber: req.params.id });
        return res.json({ message: 'True' });
    } catch (err) {
        res.status(500).json({ message: err.mesage }
        )
    }
});

module.exports = router;