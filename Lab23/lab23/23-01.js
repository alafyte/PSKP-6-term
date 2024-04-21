const express = require('express');
const database = require('./db');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerDocument));


app.get('/TS', (req, res) => {
    let phones = database.getAll();
    if (phones !== []) {
        res.status(200).json(phones);
    } else {
        res.status(404).end('Contacts are not found')
    }
});

app.post('/TS', (req, res) => {
    let phone = database.addPhone(req.body.lastname, req.body.phone);
    if (phone !== null) {
        res.status(200).json(phone);
    } else {
        res.status(404).end('Contact with this name already exists');
    }
});

app.put('/TS/', (req, res) => {
    let phone = database.updatePhone(req.body.lastname, req.body.phone);
    if (phone !== null) {
        res.status(200).json(phone);
    } else {
        res.status(404).end('Contact with this name does not exists');
    }
});

app.delete('/TS/', (req, res) => {
    let phone = database.deletePhone(req.body.lastname);
    if (phone !== null) {
        res.status(200).json(phone);
    } else {
        res.status(404).end('Contact with this name does not exists');
    }
});

app.get('*', (req, res) => res.status(404).end('Not found'));

app.listen(3000, () => console.log('Server is running at http://localhost:3000'));