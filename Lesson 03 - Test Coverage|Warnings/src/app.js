const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const db = require('./utils/database');
const users = require('./lib/users');
const auth = require('./lib/auth');

const app = express();
const port = 8180;

// connects to mongo database using mongoose
mongoose.connect(db());

app.set('view engine', 'ejs') // tells express which template engine is in use
app.set('views', 'views') // tells express where our template files

// here we load files statically from the public folder
// it gives read access to the files in this folder
app.use(express.static(path.join(__dirname, 'public')));

// body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// allows for methods like PUT and DELETE in forms
app.use(methodOverride('_method'));

//--------------------------------------> routes
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'Foo Fooing Bar'
    });
});

app.post('/user', function (req, res) {
    users.create(req.body).then((result) => {
        res.json(result);
    }).catch((err) => {
        handleError(res, err);
    });
});

app.get('/user/:id', function (req, res) {
    users.get(req.params.id, function (err, result) {
        if (err) {
            return handleError(err);
        }

        res.json(result);
    });
});

app.put('/user/:id', function (req, res) {
    // res.send('User route')
    users.update(req.params.id, req.body).then((result) => {
        res.json(result);
    }).catch((err) => {
        handleError(res, err);
    });
});

app.delete('/user/:id', auth.isAuthorized, function (req, res) {
    users.deleteUser({id: req.params.id, name: 'foo'}).then((result) => {
        res.json(result);
    }).catch((err) => {
        handleError(res, err);
    });
});

app.get('/reset/:email', function (req, res) {
    users.resetPassword(req.params.email).then((result) => {
        res.json({
            message: 'Password reset email has been sent.'
        });
    }).catch((err) => {
        handleError(res, err);
    });
});

const handleError = (res, err) => {
    if (err instanceof Error) {
        return res.status(400).json({
            error: err.message
        });
    }

    return res.status(400).json(err);
}

//--------------------------------------> misc
//404
app.use((req, res, next) => {
    return res.status(404).send('404 - Page Not Found.');
});

//500
app.use((err, req, res) => {
    res.status = err.status || 500;
    return res.send(res.status + '. An unknown error has occured.');
});

module.exports = app;