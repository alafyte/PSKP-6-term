const path = require('path');

const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

import('webdav').then(webdav => {
    const {createClient} = webdav;

    const client = createClient('https://webdav.yandex.ru', {
        username: process.env.WEBDAV_USERNAME,
        password: process.env.PASSWORD
    });

    app.post('/md/:dirname', (req, res) => {
        let dir = `/${req.params.dirname}`;
        client.exists(dir).then(async result => {
            if (!result) {
                await client.createDirectory(dir);
                return res.status(200).end(`Directory ${dir} successfully created.`);
            } else
                return res.status(408).end(`408: Failed to create directory with name = ${dir}.`);
        });
    });

    app.post('/rd/:dirname', (req, res) => {
        let dir = `/${req.params.dirname}`;
        client.exists(dir).then(async result => {
            if (result) {
                await client.deleteFile(dir);
                return res.status(200).end(`Directory ${dir} successfully deleted.`);
            } else
                return res.status(404).end(`404: Failed to delete directory with name = ${dir}.`);
        });
    });

    app.post('/up/:filename', (req, res) => {
        let filename = path.join(__dirname, 'uploads', req.params.filename);
        try {
            if (!fs.existsSync(filename)) {
                return res.status(404).end(`404: There is no file with name = ${req.params.filename}.`);
            }

            let rs = fs.createReadStream(filename);
            let ws = client.createWriteStream(req.params.filename);
            rs.pipe(ws);
            return res.status(200).end(`File ${req.params.filename} uploaded successfully`);
        } catch (err) {
            return res.status(408).end(`408: Failed to upload file with name = ${req.params.filename}.`);
        }
    });

    app.post('/down/:filename', (req, res) => {
        const filename =  req.params.filename;
        client
            .exists(filename)
            .then(result => {
                if (result) {
                    let rs = client.createReadStream(filename);
                    let ws = fs.createWriteStream(path.join(__dirname, 'downloads', Date.now() + filename));
                    rs.pipe(ws);
                    rs.pipe(res);
                    return res.status(200).end(`File ${filename} downloaded successfully`);
                }
                else
                    return res.status(404).end(`404: There is no file with name = ${filename}.`);
            })
    });


    app.post('/del/:filename', (req, res) => {
        let filename = req.params.filename;
        client.exists(filename).then(async result => {
            if (result) {
                await client.deleteFile(filename);
                return res.status(200).end(`File ${filename} successfully deleted.`);
            } else
                return res.status(404).end(`404: There's no file with name = ${filename}.`);
        });
    });

    app.post('/copy/:from/:to',  (req, res) => {
        const nameFrom = req.params.from;
        const nameTo = req.params.to;
        client
            .exists(nameFrom)
            .then(async result => {
                if (result) {
                    await client.copyFile(nameFrom, nameTo);
                    return res.status(200).end('File copied successfully.');
                }
                else
                    return res.status(404).end(`404: There is no file with name = ${nameFrom}.`);
            })
            .catch(() => res.status(408).end(`408: Failed to copy file with name = ${nameFrom}.`));
    });

    app.post('/move/:from/:to',  (req, res) => {
        const nameFrom =  req.params.from;
        const nameTo = req.params.to;
        client
            .exists(nameFrom)
            .then(async result => {
                if (result) {
                    await client.moveFile(nameFrom, nameTo);
                    res.status(200).end('File moved successfully.');
                }
                else
                    return res.status(404).end(`404: There is no file with name = ${nameFrom}.`);
            })
            .catch(() => res.status(408).end(`408: Failed to move file with name = ${nameFrom}.`));
    });
});

module.exports = app;
