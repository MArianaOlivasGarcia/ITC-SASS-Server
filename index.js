const express = require('express');
const path = require('path');
require('dotenv').config();
const morgan = require('morgan')
const cors = require('cors')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

//DB Config
require('./database/config').dbConnection();

// App de Express
const app = express();

// Configuracion cors
app.use(cors())

// Swagger
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Sistema Automatizacion Servicio Social API',
            contact: {
                name: 'Mariana Olivas'
            },
            servers: ['http://localhost:3000'],
        }
    },
    apis: [
        './routes/test.routes.js',
        './routes/alumno.routes.js'
    ]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Morgan
app.use(morgan('dev'));


// Lectura y parseo de Body
app.use(express.json());


// Node Server
const server = require('http').createServer(app);
module.exports.io = require('socket.io')(server);
require('./sockets/socket');




// Path público
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));



// Mis rutas
app.use('/api', require('./routes/test.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuario', require('./routes/usuario.routes'));
app.use('/api/alumno', require('./routes/alumno.routes'));
app.use('/api/dependencia', require('./routes/dependencia.routes'));
app.use('/api/proyecto', require('./routes/proyecto.routes'));
app.use('/api/carrera', require('./routes/carrera.routes'));
app.use('/api/expediente', require('./routes/expediente.routes'));
app.use('/api/item', require('./routes/item-expediente.routes'));
app.use('/api/busqueda', require('./routes/busqueda.routes'));
app.use('/api/upload', require('./routes/uploads.routes'));


server.listen(process.env.PORT, (err) => {

    if (err) throw new Error(err);

    console.log('Servidor corriendo en puerto', process.env.PORT);

});