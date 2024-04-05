const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {Ability, AbilityBuilder} = require('casl');
const cookieParser = require('cookie-parser');
const authRouter = require('./routers/authRouter');
const expressLayouts = require('express-ejs-layouts');
const apiRouter = require('./routers/index');
const sequelize = require("./db");
const path = require("path");
const config = require("./config/config");

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.set('layout', path.join('layouts', 'layout'));
app.use(expressLayouts);

app.use(cookieParser('my cookie key'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((request, response, next) => {
    const {rules, can} = AbilityBuilder.extract();
    if (request.cookies.accessToken) {
        jwt.verify(request.cookies.accessToken, config.jwt.tokens.access.secret, (err, payload) => {
            if (err) {
                next();
            } else if (payload) {
                request.payload = payload;
                if (request.payload.role === 'admin') {
                    can(['read', 'create', 'update'], ['Repos', 'Commits'], {authorId: request.payload.id});
                    can('read', 'Users', {id: request.payload.id});
                    can('manage', 'all');
                }
                if (request.payload.role === 'user') {
                    can(['read', 'create', 'update'], ['Repos', 'Commits'], {authorId: request.payload.id});
                    can('read', 'Users', {id: request.payload.id});
                }

            }
        });
    } else {
        request.payload = {id: 0};
        can('read', ['Repos', 'Commits'], 'all');
    }
    request.ability = new Ability(rules);
    next();
});

app.use('/', authRouter)
app.use('/api', apiRouter)

app.get('*', (req, res) => res.status(404).end('Not Found'));

sequelize.sync({force: false})
    .then(() => {
        app.listen(3000, () => console.log("http://localhost:3000"));
    })
    .catch(error => console.log(error));
