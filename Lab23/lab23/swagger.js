const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Lab23',
        description: 'Lab23 Node js Swagger'
    },
    host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./23-01.js'];


swaggerAutogen(outputFile, routes, doc);