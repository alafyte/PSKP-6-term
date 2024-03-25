const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    users = require('./users');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'super secret key'}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new localStrategy((username, password, done) => {
    for (let user of users) {
        if (username === user.login && password === user.password)
            return done(null, user);
    }
    return done(null, false, {message: 'wrong login or password'});
}));

app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', passport.authenticate('local', {successRedirect: '/resource', failureRedirect: '/login'}));
app.get('/resource', (req, res, next) => {
    if (req.user)
        next();
    else
        return res.status(401).send('<h2>401: Unauthorized</h2>');
}, (req, res) => {
    res.send(`RESOURCE. Username: ${req.user.login} Age: ${req.user.age}`);
});

app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err)
            next(err);
        res.redirect('/login');
    });
});

app.get('*', (req, res) => {
    res.status(404).send('404: Not Found');
});


app.listen(3000, function () {
    console.log('Start server http://localhost:3000');
})