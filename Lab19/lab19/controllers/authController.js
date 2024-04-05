const {Users} = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
let oldRefreshKeyCount = 0;
const redis = require('redis');
const redisConfig = {
    "host": "localhost",
    "port": 6379,
    "no_ready_check": true,
};
const client = redis.createClient(redisConfig);


const getLoginPage = (request, response) => {
    response.render('login', {title: 'Login'});
}

const getRegisterPage = (request, response) => {
    response.render('register', {title: 'Register'});
}

const refreshToken = (request, response) => {
    if (request.cookies.refreshToken) {
        jwt.verify(request.cookies.refreshToken, config.jwt.tokens.refresh.secret, async (err, payload) => {
            if (err) {
                console.log(err.message);
            } else if (payload) {
                client.on('ready', () => console.log('ready'));
                client.on('error', (err) => console.log(`error: ${err}`));
                client.on('connect', () => console.log('connect'));
                client.on('end', () => console.log('end'));
                client.set(oldRefreshKeyCount, request.cookies.refreshToken, () => console.log('set old refresh token'));
                client.get(oldRefreshKeyCount, (err, result) => console.log('added old refresh token:', result));
                oldRefreshKeyCount++;
                client.quit();
                const candidate = await Users.findOne({
                    where: {
                        id: payload.id
                    }
                });
                const newAccessToken = jwt.sign({
                    id: candidate.id,
                    username: candidate.username,
                    role: candidate.role
                }, config.jwt.tokens.access.secret, {expiresIn: config.jwt.tokens.access.expiresIn});
                const newRefreshToken = jwt.sign({
                    id: candidate.id,
                    username: candidate.username,
                    role: candidate.role
                }, config.jwt.tokens.refresh.secret, {expiresIn: config.jwt.tokens.refresh.expiresIn});
                response.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    sameSite: 'strict'
                });
                response.cookie('refreshToken', newRefreshToken, {
                    path: '/refresh-token'
                });
                return response.redirect('/api/ability');
            }
        });
    } else {
        return response.status(401).send('Please, authorize');
    }
}

const logout = (request, response) => {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return response.redirect('/login');
}

const login = async (request, response) => {
    const candidate = await Users.findOne(
        {
            where:
                {
                    username: request.body.username,
                    password: request.body.password
                }
        });
    if (candidate) {
        const accessToken = jwt.sign(
            {
                id: candidate.id,
                username: candidate.username,
                role: candidate.role
            }
            , config.jwt.tokens.access.secret, {expiresIn: config.jwt.tokens.access.expiresIn});

        const refreshToken = jwt.sign(
            {
                id: candidate.id,
                username: candidate.username,
                role: candidate.role
            },
            config.jwt.tokens.refresh.secret, {expiresIn: config.jwt.tokens.refresh.expiresIn});
        response.cookie('accessToken', accessToken,
            {
                httpOnly: true,
                sameSite: 'strict'
            });
        response.cookie('refreshToken', refreshToken,
            {
                httpOnly: true,
                sameSite: 'strict'
            });
        return response.redirect('/api/ability');
    } else {
        return response.redirect('/login');
    }
}

const register = async (request, response) => {
    const candidate = await Users.findOne({
        where: {username: request.body.username}
    });
    if (candidate) {
        return response.status(409).end('User with such username already exists')
    } else {
        await Users.create({
            username: request.body.username,
            email: request.body.email,
            password: request.body.password,
            role: request.body.role
        });
        return response.redirect('/login');
    }
}


module.exports = {
    getLoginPage: getLoginPage,
    getRegisterPage: getRegisterPage,
    refreshToken: refreshToken,
    logout: logout,
    login: login,
    register: register
};