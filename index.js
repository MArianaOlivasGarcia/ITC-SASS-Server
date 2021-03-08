const express = require('express');
require('dotenv').config();
const morgan = require('morgan')
const cors = require('cors')
const serverIndex = require('serve-index')
const moment = require('moment-timezone');
const { CLIENT_RENEG_LIMIT } = require('tls');
// TimeZone de nuestro servidor
/*  momen.tz('America/Mexico_City').format();
 */
moment.locale('es-mx');
moment.tz('America/Cancun');

//DB Config
require('./database/config').dbConnection();

// App de Express
const app = express();

// Node Server
const server = require('http').createServer(app);
module.exports.io = require('socket.io')(server);
require('./sockets/socket');

// Configuracion cors
app.use( cors({ origin: true, credentials: true  }) )

// Morgan
app.use(morgan('dev'));


// Lectura y parseo de Body
app.use(express.json());


// Path público
/* const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));
 */

app.use( express.static(__dirname + '/' ))
app.use('/uploads', serverIndex( __dirname + '/uploads'))


// Mis rutas
app.use('/api',             require('./routes/test.routes'));
app.use('/api/alumno',      require('./routes/alumno.routes'));
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/aviso',       require('./routes/aviso.routes'));
app.use('/api/busqueda',    require('./routes/busqueda.routes'));
app.use('/api/carrera',     require('./routes/carrera.routes'));
app.use('/api/dependencia', require('./routes/dependencia.routes'));
app.use('/api/expediente',  require('./routes/expediente.routes'));
app.use('/api/file',        require('./routes/file.routes'));
app.use('/api/item',        require('./routes/item-expediente.routes'));
app.use('/api/periodo',     require('./routes/periodo.routes'));
app.use('/api/proyecto',    require('./routes/proyecto.routes'));
app.use('/api/solicitud',   require('./routes/solicitud.routes'));
app.use('/api/upload',      require('./routes/uploads.routes'));
app.use('/api/usuario',     require('./routes/usuario.routes'));


server.listen(process.env.PORT, (err) => {

    if (err) throw new Error(err);

    console.log('Servidor corriendo en puerto', process.env.PORT);

    setTimeout(()=>{
        console.log('3segundos')
    },10000)

});