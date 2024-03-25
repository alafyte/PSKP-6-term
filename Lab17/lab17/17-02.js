const app = require('express')();
const bodyParser = require('body-parser');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Sequelize = require("sequelize");
const sequelize = new Sequelize.Sequelize({
    username: 'User1',
    password: 'user1',
    database: 'Nodejs',
    host: 'localhost',
    dialect: 'mssql',
    logging: false,
    pool:
        {
            max: 10,
            min: 0,
            idle: 10000
        }
});

const User = require('./models')(sequelize, Sequelize);
const port = 3000;
const authService = require('./services');


const client = redis.createClient({url: 'redis://localhost:6379'});
(async () => {
    await client.connect();
})();


app.use(cookieParser('token_key'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
    if (req.cookies.accessToken) {
        jwt.verify(req.cookies.accessToken, authService.config.jwt.tokens.access.secret, (err, payload) => {
            if (err) {
                next();
            } else if (payload) {
                req.payload = payload;
                next();
            }
        });
    } else next();
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', async (req, res) => {
    const candidate = await User.findOne(
        {
            where: {
                login: req.body.username
            }
        }).catch(e => console.log(e));
    if (!candidate || !(req.body.password === candidate.password)) {
        return res.sendStatus(403);
    }
    if (candidate) {
        const accessToken = authService.generateAccessToken(candidate.id, candidate.login);
        const refreshToken = authService.generateRefreshToken(candidate.id, candidate.login);

        res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'strict'
            });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict'
        });
        res.redirect('/resource');
    } else {
        res.redirect('/login');
    }
});

app.get('/refresh-token', async (req, res) => {
        if (req.cookies.refreshToken) {
            let isToken = await client.get(req.cookies.refreshToken);
            if (isToken === null) {
                jwt.verify(req.cookies.refreshToken, authService.config.jwt.tokens.refresh.secret, async (err, payload) => {
                    if (err) {
                        console.log(err.message);
                    } else if (payload) {
                        client.on('error', (err) => console.log(`error: ${err}`));

                        await client.set(req.cookies.refreshToken.toString(), "blocked");

                        const candidate = await User.findOne({
                            where: {
                                id: payload.id
                            }
                        });
                        const newAccessToken = authService.generateAccessToken(candidate.id, candidate.login);
                        const newRefreshToken = authService.generateRefreshToken(candidate.id, candidate.login);

                        res.cookie('accessToken', newAccessToken,
                            {
                                httpOnly: true,
                                sameSite: 'strict'
                            });
                        res.cookie('refreshToken', newRefreshToken, {
                            httpOnly: true,
                            sameSite: 'strict'
                        });
                        res.redirect('/resource');
                    }
                });
            } else {
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
                res.status(401).send('Please, authorize');
            }
        }
    }
);

app.get('/resource', (req, res) => {
    if (req.payload) {
        res.status(200).send(`Resource ${req.payload.id}-${req.payload.login}`);
    } else {
        res.status(401).send('401: Unauthorized');
    }
});

app.get('/logout', async (req, res) => {
    await client.set(req.cookies.refreshToken.toString(), "blocked");

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

app.post('/register', async (req, res) => {
    const candidate = await User.findOne({where: {login: req.body.username}}).catch(e => console.log(e));

    if (candidate) {
        return res.status(400).send('The user exists');
    }

    await User.create(
        {
            login: req.body.username,
            password: req.body.password
        }).catch(e => console.log(e));

    res.redirect('/login');
});

sequelize.authenticate()
    .then(() => {
        app.listen(port, () => console.log(`http://localhost:${port}/login`));
    })
    .catch(error => console.log(error));